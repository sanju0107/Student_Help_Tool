/**
 * Caching & Memoization Utilities
 * Production-ready caching strategies for improved performance
 */

export type CacheEntry<T> = {
  value: T;
  timestamp: number;
  expiresAt?: number;
};

/**
 * Simple in-memory cache with expiration support
 */
export class Cache<T> {
  private store: Map<string, CacheEntry<T>> = new Map();
  private readonly defaultTTL: number | null; // milliseconds, null = no expiration

  constructor(defaultTTLMs: number | null = null) {
    this.defaultTTL = defaultTTLMs;
  }

  /**
   * Set cache value
   */
  set(key: string, value: T, ttlMs?: number): void {
    const expiresAt = ttlMs ? Date.now() + ttlMs : 
                      this.defaultTTL ? Date.now() + this.defaultTTL :
                      undefined;

    this.store.set(key, {
      value,
      timestamp: Date.now(),
      expiresAt,
    });
  }

  /**
   * Get cache value
   * Returns null if not found or expired
   */
  get(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.store.get(key);

    if (!entry) {
      return false;
    }

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get with fallback computation
   * If not found, compute value and cache it
   */
  async getOrCompute(
    key: string,
    compute: () => Promise<T>,
    ttlMs?: number
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await compute();
    this.set(key, value, ttlMs);
    return value;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.store.keys());
  }

  /**
   * Remove expired entries
   */
  prune(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.store.delete(key);
        removed++;
      }
    }

    return removed;
  }
}

/**
 * LRU (Least Recently Used) Cache
 * Automatically evicts least recently used items when capacity is reached
 */
export class LRUCache<T> {
  private cache: Map<string, { value: T; timestamp: number }> = new Map();
  private readonly maxSize: number;
  private readonly defaultTTL: number | null;

  constructor(maxSize: number = 100, defaultTTLMs: number | null = null) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTLMs;
  }

  /**
   * Set cache value
   */
  set(key: string, value: T): void {
    // Remove if already exists (to update position)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Get cache value
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check expiration
    if (this.defaultTTL && Date.now() - entry.timestamp > this.defaultTTL) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

/**
 * Memoization decorator for functions
 * Caches function results based on arguments
 */
export function createMemoize<T extends (...args: any[]) => any>(
  func: T,
  options?: {
    ttlMs?: number;
    maxSize?: number;
    keyGenerator?: (...args: Parameters<T>) => string;
  }
): T {
  const cache = new LRUCache(options?.maxSize ?? 100, options?.ttlMs);
  const keyGenerator = options?.keyGenerator ?? ((...args: any[]) =>
    JSON.stringify(args)
  );

  return (function memoized(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = keyGenerator(...args);
    const cached = cache.get(key);

    if (cached !== null) {
      return cached as ReturnType<T>;
    }

    const result = func.apply(this, args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Async memoization
 * For async functions with caching
 */
export function createAsyncMemoize<T extends (...args: any[]) => Promise<any>>(
  func: T,
  options?: {
    ttlMs?: number;
    maxSize?: number;
    keyGenerator?: (...args: Parameters<T>) => string;
  }
): T {
  const cache = new Cache(options?.ttlMs ?? 60000);
  const pendingPromises = new Map<string, Promise<any>>();
  const keyGenerator = options?.keyGenerator ?? ((...args: any[]) =>
    JSON.stringify(args)
  );

  return (async function memoized(this: any, ...args: Parameters<T>): Promise<any> {
    const key = keyGenerator(...args);

    // Return cached value if available
    const cached = cache.get(key);
    if (cached !== null) {
      return cached as ReturnType<T>;
    }

    // Return pending promise if already running
    if (pendingPromises.has(key)) {
      return pendingPromises.get(key)!;
    }

    // Execute function
    const promise = func.apply(this, args);
    pendingPromises.set(key, promise);

    try {
      const result = await promise;
      cache.set(key, result);
      return result;
    } finally {
      pendingPromises.delete(key);
    }
  }) as T;
}

/**
 * Pre-configured caches for common use cases
 */
export const caches = {
  // Short-term cache for API responses (5 minutes)
  apiResponses: new Cache(300000),

  // File metadata cache (10 minutes)
  fileMetadata: new Cache(600000),

  // User preferences (1 hour)
  userPreferences: new Cache(3600000),

  // Processing results (very short, 1 minute)
  processing: new Cache(60000),

  // LRU for images/media (max 50 items, 30 minutes TTL)
  mediaLRU: new LRUCache(50, 1800000),
};
