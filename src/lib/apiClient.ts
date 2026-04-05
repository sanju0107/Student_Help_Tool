/**
 * Secure API Client Middleware
 * Integrates rate limiting, validation, caching, and error handling
 */

import { rateLimiters, caches, RequestDeduplicator, defaultProfiler } from './performance';
import { categorizeError, CircuitBreaker, AppError, logError, retryWithBackoff } from './errorHandler';
import { sanitizeText } from './security/validation';

/**
 * API request options with built-in security and performance features
 */
export interface APIRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  cacheKey?: string; // Enables caching if provided
  cacheTTL?: number; // Time to live in milliseconds
  rateLimitType?: 'api' | 'file' | 'ai' | 'processing';
  retryable?: boolean;
  maxRetries?: number;
  sanitize?: boolean; // Auto-sanitize request body
  validateResponse?: (data: any) => boolean;
}

/**
 * API Client with built-in security and performance features
 */
export class SecureAPIClient {
  private circuitBreaker: CircuitBreaker;
  private deduplicator = new RequestDeduplicator();
  private baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  constructor(private baseURL: string = '') {
    this.circuitBreaker = new CircuitBreaker(10, 60000);
  }

  /**
   * Set default headers (for auth tokens, etc.)
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.baseHeaders = { ...this.baseHeaders, ...headers };
  }

  /**
   * Make a secure API request with automatic rate limiting, caching, and retries
   */
  async request<T>(
    path: string,
    options: APIRequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 30000,
      cacheKey,
      cacheTTL = 300000, // 5 minutes default
      rateLimitType = 'api',
      retryable = true,
      maxRetries = 2,
      sanitize = true,
      validateResponse,
    } = options;

    const url = this.buildURL(path);
    const requestKey = `${method}:${url}`;

    // Check rate limit
    const limiter = rateLimiters[rateLimitType as keyof typeof rateLimiters];
    if (limiter && 'consume' in limiter && !limiter.consume()) {
      throw new AppError(
        'RATE_LIMIT',
        `Rate limit reached for ${rateLimitType} operations. Please try again later.`,
        429,
        true
      );
    }

    // Check cache
    if (method === 'GET' && cacheKey) {
      const cached = caches.apiResponses.get(cacheKey);
      if (cached !== null) {
        return cached as T;
      }
    }

    // Deduplicate simultaneous requests
    return this.deduplicator.execute<T>(requestKey, async () => {
      return this.circuitBreaker.execute(async () => {
        const result = await defaultProfiler.profileAsync(
          `api_${method.toLowerCase()}_${path}`,
          async () => {
            return await this.executeRequest<T>(
              url,
              method,
              body,
              headers,
              timeout,
              sanitize,
              validateResponse,
              retryable,
              maxRetries
            );
          },
          { method, path }
        );

        // Cache successful GET requests
        if (method === 'GET' && cacheKey) {
          caches.apiResponses.set(cacheKey, result, cacheTTL);
        }

        return result;
      });
    });
  }

  /**
   * GET request
   */
  async get<T>(path: string, options?: APIRequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(path: string, body?: any, options?: APIRequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T>(path: string, body?: any, options?: APIRequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string, options?: APIRequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  /**
   * Execute the actual HTTP request with retries
   */
  private async executeRequest<T>(
    url: string,
    method: string,
    body: any,
    headers: Record<string, string>,
    timeout: number,
    sanitize: boolean,
    validateResponse?: (data: any) => boolean,
    retryable?: boolean,
    maxRetries?: number
  ): Promise<T> {
    if (retryable) {
      return this.executeWithRetry<T>(
        () =>
          this.fetchRequest<T>(
            url,
            method,
            body,
            headers,
            timeout,
            sanitize,
            validateResponse
          ),
        maxRetries
      );
    } else {
      return this.fetchRequest<T>(
        url,
        method,
        body,
        headers,
        timeout,
        sanitize,
        validateResponse
      );
    }
  }

  /**
   * Execute fetch with timeout and error handling
   */
  private async fetchRequest<T>(
    url: string,
    method: string,
    body: any,
    headers: Record<string, string>,
    timeout: number,
    sanitize: boolean,
    validateResponse?: (data: any) => boolean
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const requestBody = body
        ? sanitize
          ? this.sanitizeRequestBody(body)
          : body
        : undefined;

      const response = await fetch(url, {
        method,
        headers: { ...this.baseHeaders, ...headers },
        body: requestBody ? JSON.stringify(requestBody) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new AppError(
          `HTTP_${response.status}`,
          `API request failed: ${response.statusText}`,
          response.status,
          response.status >= 500 // Retryable if server error
        );
      }

      const data = await response.json();

      // Validate response
      if (validateResponse && !validateResponse(data)) {
        throw new AppError(
          'INVALID_RESPONSE',
          'API response validation failed',
          400,
          false
        );
      }

      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new AppError(
          'TIMEOUT',
          'Request timed out. Please try again.',
          504,
          true
        );
      }

      if (error instanceof AppError) {
        throw error;
      }

      const { category, userMessage, strategy } = categorizeError(error);
      throw new AppError(
        category,
        userMessage,
        500,
        strategy.canRetry
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Retry logic with exponential backoff
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 2,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        // Don't retry non-retryable errors
        if (error instanceof AppError && !error.retryable) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt < maxRetries) {
          const delay = delayMs * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Build full URL
   */
  private buildURL(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return this.baseURL + path;
  }

  /**
   * Sanitize request body to prevent injection attacks
   */
  private sanitizeRequestBody(body: any): any {
    if (typeof body === 'string') {
      return sanitizeText(body);
    }

    if (body === null || body === undefined) {
      return body;
    }

    if (Array.isArray(body)) {
      return body.map(item => this.sanitizeRequestBody(item));
    }

    if (typeof body === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(body)) {
        // Sanitize key names too
        const sanitizedKey = sanitizeText(key);
        if (typeof value === 'string') {
          sanitized[sanitizedKey] = sanitizeText(value);
        } else if (typeof value === 'object') {
          sanitized[sanitizedKey] = this.sanitizeRequestBody(value);
        } else {
          sanitized[sanitizedKey] = value;
        }
      }
      return sanitized;
    }

    return body;
  }

  /**
   * Clear cache for a specific key
   */
  clearCache(key: string): void {
    caches.apiResponses.delete(key);
  }

  /**
   * Get circuit breaker state
   */
  getCircuitBreakerState(): string {
    return this.circuitBreaker.getState();
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }

  /**
   * Get pending request count
   */
  getPendingRequests(): number {
    return this.deduplicator.getPendingCount();
  }
}

/**
 * Default API client instance
 */
export const apiClient = new SecureAPIClient();

/**
 * Helper for OpenAI API calls (special handling due to authentication)
 */
export async function callOpenAIAPI(
  endpoint: string,
  options: {
    messages?: any[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
    [key: string]: any;
  } = {},
  requestOptions?: Omit<APIRequestOptions, 'method' | 'body'>
) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new AppError(
      'MISSING_API_KEY',
      'OpenAI API key is not configured',
      401,
      false
    );
  }

  const url = `https://api.openai.com/v1/${endpoint}`;

  return apiClient.request(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: options,
    timeout: 60000, // 1 minute for AI operations
    rateLimitType: 'ai',
    maxRetries: 1, // Limited retries for AI
    ...requestOptions,
  });
}


