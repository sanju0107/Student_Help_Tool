/**
 * Rate Limiting & Throttling Utilities
 * Production-ready rate limiting for APIs and heavy operations
 * Prevents abuse and ensures fair resource usage
 */

/**
 * Token bucket algorithm implementation
 * Simple and effective for rate limiting
 */
export class RateLimiter {
  private tokens: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second
  private lastRefill: number;

  /**
   * Create a rate limiter
   */
  constructor(maxTokens: number = 10, refillRatePerSecond: number = 1) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRate = refillRatePerSecond;
    this.lastRefill = Date.now();
  }

  /**
   * Refill tokens based on time elapsed
   */
  private refill(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000; // convert to seconds
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(tokensNeeded: number = 1): boolean {
    this.refill();
    return this.tokens >= tokensNeeded;
  }

  /**
   * Consume tokens
   * Returns true if successful, false if rate limited
   */
  consume(tokensNeeded: number = 1): boolean {
    if (this.isAllowed(tokensNeeded)) {
      this.tokens -= tokensNeeded;
      return true;
    }
    return false;
  }

  /**
   * Get current token count
   */
  getTokens(): number {
    this.refill();
    return this.tokens;
  }

  /**
   * Get time until next token is available (in milliseconds)
   */
  getWaitTime(): number {
    this.refill();
    if (this.tokens >= 1) {
      return 0;
    }
    return (1 / this.refillRate) * 1000;
  }

  /**
   * Reset the limiter
   */
  reset(): void {
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }
}

/**
 * Throttle function decorator
 * Execute function at most once per specified interval
 */
export function createThrottle<T extends (...args: any[]) => any>(
  func: T,
  delayMs: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let lastRun = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;
  let lastReturnValue: ReturnType<T> | undefined = undefined;

  function internalThrottle(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    const now = Date.now();
    lastThis = this;
    lastArgs = args;

    if (now - lastRun >= delayMs) {
      lastRun = now;
      lastReturnValue = func.apply(this, args);

      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      return lastReturnValue;
    } else {
      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          lastRun = Date.now();
          lastReturnValue = func.apply(lastThis, lastArgs!);
          timeoutId = null;
        }, delayMs - (now - lastRun));
      }
      return lastReturnValue;
    }
  }

  return internalThrottle as any;
}

/**
 * Debounce function decorator
 * Execute function after specified delay without further calls
 */
export function createDebounce<T extends (...args: any[]) => any>(
  func: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  function internalDebounce(this: any, ...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delayMs);
  }

  return internalDebounce as any;
}

/**
 * Operation throttler
 * Limits concurrent operations
 */
export class OperationThrottler {
  private active: number = 0;
  private readonly maxConcurrent: number;
  private readonly queue: Array<() => void> = [];

  constructor(maxConcurrent: number = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Execute function with concurrency limit
   */
  async execute<T>(
    func: () => Promise<T>,
    label?: string
  ): Promise<T> {
    while (this.active >= this.maxConcurrent) {
      // Wait for a slot to open
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.active++;

    try {
      return await func();
    } finally {
      this.active--;
    }
  }

  /**
   * Get current concurrency level
   */
  getActive(): number {
    return this.active;
  }

  /**
   * Get max concurrency
   */
  getMax(): number {
    return this.maxConcurrent;
  }
}

/**
 * Request deduplicator
 * Prevents duplicate simultaneous requests
 */
export class RequestDeduplicator {
  private pending: Map<string, Promise<any>> = new Map();

  /**
   * Execute request with deduplication
   * If the same key is requested while pending, returns the existing promise
   */
  async execute<T>(key: string, func: () => Promise<T>): Promise<T> {
    // If request with this key is already pending, return existing promise
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }

    // Create new request
    const promise = func()
      .finally(() => {
        // Remove from pending when complete
        this.pending.delete(key);
      });

    this.pending.set(key, promise);
    return promise;
  }

  /**
   * Get count of pending requests
   */
  getPendingCount(): number {
    return this.pending.size;
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    this.pending.clear();
  }
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  // File uploads: max 5 per 10 seconds
  fileUpload: new RateLimiter(5, 0.5),

  // API calls: max 20 per 10 seconds
  apiCall: new RateLimiter(20, 2),

  // Processing operations: max 3 concurrent
  processing: new OperationThrottler(3),

  // AI operations: max 2 per minute (strict limit)
  aiOperation: new RateLimiter(2, 0.03),
};
