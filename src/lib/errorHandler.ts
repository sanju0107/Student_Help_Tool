/**
 * Error Handling & Recovery Utilities
 * Production-ready fault tolerance and error recovery
 */

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public retryable: boolean = true,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Error classification and handling strategy
 */
export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  SECURITY = 'SECURITY',
  NETWORK = 'NETWORK',
  PROCESSING = 'PROCESSING',
  STORAGE = 'STORAGE',
  UNKNOWN = 'UNKNOWN',
}

interface ErrorRecoveryStrategy {
  canRetry: boolean;
  retryDelay: number;
  maxRetries: number;
  action: 'retry' | 'fallback' | 'fail';
}

/**
 * Categorize errors and determine recovery strategy
 */
export function categorizeError(error: any): {
  category: ErrorCategory;
  message: string;
  strategy: ErrorRecoveryStrategy;
  userMessage: string;
} {
  const message = error?.message?.toLowerCase() || '';
  let category = ErrorCategory.UNKNOWN;
  let strategy: ErrorRecoveryStrategy = {
    canRetry: false,
    retryDelay: 1000,
    maxRetries: 0,
    action: 'fail',
  };
  let userMessage = 'An unexpected error occurred. Please try again.';

  // Validation errors - don't retry
  if (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('required') ||
    message.includes('empty')
  ) {
    category = ErrorCategory.VALIDATION;
    strategy = { canRetry: false, retryDelay: 0, maxRetries: 0, action: 'fail' };
    userMessage = error?.message || 'Please check your input and try again.';
  }
  // Security errors - don't retry
  else if (
    message.includes('unauthorized') ||
    message.includes('forbidden') ||
    message.includes('security') ||
    message.includes('api key') ||
    message.includes('permission')
  ) {
    category = ErrorCategory.SECURITY;
    strategy = { canRetry: false, retryDelay: 0, maxRetries: 0, action: 'fail' };
    userMessage = 'Security check failed. Please verify your credentials and try again.';
  }
  // Network errors - retry with exponential backoff
  else if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('timeout') ||
    message.includes('connection') ||
    message.includes('429') ||
    error?.code === 'ECONNREFUSED' ||
    error?.code === 'ETIMEDOUT'
  ) {
    category = ErrorCategory.NETWORK;
    strategy = {
      canRetry: true,
      retryDelay: 2000,
      maxRetries: 3,
      action: 'retry',
    };
    userMessage =
      'Connection issue. We are retrying automatically. Please wait or try again.';
  }
  // Processing/Worker errors - retry
  else if (
    message.includes('worker') ||
    message.includes('processing') ||
    message.includes('parse')
  ) {
    category = ErrorCategory.PROCESSING;
    strategy = {
      canRetry: true,
      retryDelay: 1500,
      maxRetries: 2,
      action: 'retry',
    };
    userMessage =
      'Processing error. Retrying automatically. If problems persist, try a different file.';
  }
  // Storage errors - may retry
  else if (
    message.includes('storage') ||
    message.includes('quota') ||
    message.includes('out of memory')
  ) {
    category = ErrorCategory.STORAGE;
    strategy = {
      canRetry: true,
      retryDelay: 2000,
      maxRetries: 1,
      action: 'fallback',
    };
    userMessage = 'Storage issue. Try clearing browser cache and retry.';
  }

  return {
    category,
    message,
    strategy,
    userMessage,
  };
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; initialDelay?: number } = {}
): Promise<T> {
  const { maxRetries = 3, initialDelay = 1000 } = options;
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delay = initialDelay * Math.pow(2, attempt);

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Safe async operation wrapper
 * Catches errors and returns result with error
 */
export async function safeAsync<T>(
  fn: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: AppError }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (err: any) {
    const { category, userMessage, strategy } = categorizeError(err);

    const appError = new AppError(
      category,
      userMessage,
      err?.statusCode || 500,
      strategy.canRetry,
      { originalError: err?.message, category }
    );

    return { success: false, error: appError };
  }
}

/**
 * Safe sync operation wrapper
 */
export function safeSync<T>(
  fn: () => T
): { success: boolean; data?: T; error?: AppError } {
  try {
    const data = fn();
    return { success: true, data };
  } catch (err: any) {
    const { category, userMessage } = categorizeError(err);

    const appError = new AppError(
      category,
      userMessage,
      500,
      false,
      { originalError: err?.message, category }
    );

    return { success: false, error: appError };
  }
}

/**
 * Circuit breaker for failing services
 */
export class CircuitBreaker {
  private failureCount = 0;
  private successCount = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private lastFailureTime = 0;

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly resetTimeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new AppError(
          'CIRCUIT_BREAKER',
          'Service temporarily unavailable. Please try again in a moment.',
          503,
          true
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= 2) {
        this.state = 'CLOSED';
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
  }
}

/**
 * Timeout wrapper for operations
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage?: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new AppError(
              'TIMEOUT',
              timeoutMessage || `Operation timed out after ${timeoutMs}ms`,
              504,
              true
            )
          ),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Fallback wrapper - try primary operation, fall back to secondary
 */
export async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  options?: { logFallback?: boolean }
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    if (options?.logFallback) {
      console.warn('Primary operation failed, attempting fallback:', error);
    }
    return fallback();
  }
}

/**
 * Batch error collection and reporting
 */
export class ErrorBatch {
  private errors: Array<{ error: Error; timestamp: number }> = [];
  private maxErrors: number;

  constructor(maxErrors: number = 100) {
    this.maxErrors = maxErrors;
  }

  add(error: Error): void {
    this.errors.push({ error, timestamp: Date.now() });
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
  }

  getRecent(count: number = 10): Error[] {
    return this.errors.slice(-count).map(e => e.error);
  }

  getErrorTypes(): Record<string, number> {
    const types: Record<string, number> = {};
    this.errors.forEach(({ error }) => {
      const type = error.name || 'Unknown';
      types[type] = (types[type] || 0) + 1;
    });
    return types;
  }

  clear(): void {
    this.errors = [];
  }

  getSummary(): {
    totalErrors: number;
    errorTypes: Record<string, number>;
    recentErrors: string[];
  } {
    return {
      totalErrors: this.errors.length,
      errorTypes: this.getErrorTypes(),
      recentErrors: this.getRecent(5).map(e => e.message),
    };
  }
}

/**
 * Global error tracking
 */
export const globalErrorBatch = new ErrorBatch();

/**
 * Log error safely
 */
export function logError(error: any, context?: string): void {
  const appError = error instanceof AppError ? error : categorizeError(error);
  globalErrorBatch.add(new Error(`[${context || 'Unknown'}] ${appError.message}`));

  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context || 'Error'}]`, error);
  }
}
