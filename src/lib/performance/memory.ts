/**
 * Memory Management & Resource Cleanup Utilities
 * Prevent memory leaks and manage resources efficiently
 */

/**
 * Resource disposable interface
 * Anything that needs cleanup should implement this
 */
export interface IDisposable {
  dispose(): void;
}

/**
 * Dispose container for managing multiple disposables
 */
export class DisposableGroup implements IDisposable {
  private disposables: IDisposable[] = [];
  private isDisposed = false;

  /**
   * Add a disposable to the group
   */
  add<T extends IDisposable>(disposable: T): T {
    if (this.isDisposed) {
      throw new Error('Cannot add to disposed group');
    }
    this.disposables.push(disposable);
    return disposable;
  }

  /**
   * Add function to be called on dispose
   */
  addCallback(callback: () => void): void {
    if (this.isDisposed) {
      throw new Error('Cannot add to disposed group');
    }
    this.disposables.push({
      dispose: callback,
    });
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    // Dispose in reverse order
    for (let i = this.disposables.length - 1; i >= 0; i--) {
      try {
        this.disposables[i].dispose();
      } catch (error) {
        console.error('Error disposing resource:', error);
      }
    }

    this.disposables = [];
    this.isDisposed = true;
  }

  /**
   * Check if disposed
   */
  isDisposedValue(): boolean {
    return this.isDisposed;
  }
}

/**
 * Weak reference holder
 * Allows garbage collection of tracked object
 */
export class WeakHolder<T extends object = object> {
  private weakRef: WeakRef<T> | null = null;
  private finalizationRegistry: FinalizationRegistry<string> | null = null;

  constructor(object: T) {
    if (typeof WeakRef !== 'undefined') {
      this.weakRef = new WeakRef(object);
    }
  }

  /**
   * Get the held object
   * Returns null if garbage collected
   */
  get(): T | null {
    if (!this.weakRef) {
      return null;
    }
    return this.weakRef.deref() ?? null;
  }

  /**
   * Check if still alive
   */
  isAlive(): boolean {
    return this.get() !== null;
  }
}

/**
 * Memory pool for reusing objects
 * Reduces garbage collection pressure
 */
export class ObjectPool<T> {
  private available: T[] = [];
  private inUse: Set<T> = new Set();
  private readonly factory: () => T;
  private readonly reset: (obj: T) => void;
  private readonly maxSize: number;

  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    maxPoolSize: number = 50
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxPoolSize;
  }

  /**
   * Get an object from pool
   */
  acquire(): T {
    let obj: T;

    if (this.available.length > 0) {
      obj = this.available.pop()!;
    } else {
      obj = this.factory();
    }

    this.inUse.add(obj);
    return obj;
  }

  /**
   * Return object to pool
   */
  release(obj: T): void {
    if (!this.inUse.has(obj)) {
      return;
    }

    this.inUse.delete(obj);
    this.reset(obj);

    if (this.available.length < this.maxSize) {
      this.available.push(obj);
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): { available: number; inUse: number; total: number } {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size,
    };
  }

  /**
   * Clear all objects in pool
   */
  clear(): void {
    this.available = [];
    this.inUse.clear();
  }
}

/**
 * Batch processor for memory-efficient bulk operations
 */
export class BatchProcessor<T, R> {
  private readonly processor: (batch: T[]) => Promise<R[]>;
  private readonly batchSize: number;
  private queue: T[] = [];
  private processing = false;
  private timeout: NodeJS.Timeout | null = null;

  constructor(processor: (batch: T[]) => Promise<R[]>, batchSize: number = 100) {
    this.processor = processor;
    this.batchSize = batchSize;
  }

  /**
   * Add item to batch queue
   */
  async add(item: T): Promise<R | null> {
    this.queue.push(item);

    if (this.queue.length >= this.batchSize) {
      return this.processBatch();
    } else if (!this.timeout) {
      // Process remaining items after delay
      this.timeout = setTimeout(() => this.flush(), 100);
    }

    return null;
  }

  /**
   * Process current batch
   */
  private async processBatch(): Promise<R | null> {
    if (this.processing || this.queue.length === 0) {
      return null;
    }

    this.processing = true;
    const batch = this.queue.splice(0, this.batchSize);

    try {
      const results = await this.processor(batch);
      return results[results.length - 1] ?? null;
    } finally {
      this.processing = false;
    }
  }

  /**
   * Flush remaining items
   */
  async flush(): Promise<void> {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    while (this.queue.length > 0) {
      await this.processBatch();
    }
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }
}

/**
 * Monitor memory usage
 */
export class MemoryMonitor {
  private samples: number[] = [];
  private readonly sampleInterval: number;
  private intervalId: NodeJS.Timeout | null = null;
  private maxSamples: number = 100;

  constructor(sampleIntervalMs: number = 5000) {
    this.sampleInterval = sampleIntervalMs;
  }

  /**
   * Start monitoring
   */
  start(): void {
    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => {
      if (typeof performance !== 'undefined') {
        const memory = (performance as any).memory;
        if (memory && memory.usedJSHeapSize) {
          this.samples.push(memory.usedJSHeapSize);
          if (this.samples.length > this.maxSamples) {
            this.samples.shift();
          }
        }
      }
    }, this.sampleInterval);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Get memory statistics
   */
  getStats(): {
    current: number;
    average: number;
    min: number;
    max: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  } | null {
    if (this.samples.length === 0) {
      return null;
    }

    const current = this.samples[this.samples.length - 1];
    const average = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    const min = Math.min(...this.samples);
    const max = Math.max(...this.samples);

    // Calculate trend
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (this.samples.length >= 5) {
      const recent = this.samples.slice(-5);
      const older = this.samples.slice(-10, -5);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
      const change = ((recentAvg - olderAvg) / olderAvg) * 100;

      if (change > 5) trend = 'increasing';
      else if (change < -5) trend = 'decreasing';
    }

    return { current, average, min, max, trend };
  }

  /**
   * Clear samples
   */
  clear(): void {
    this.samples = [];
  }

  /**
   * Get all samples
   */
  getSamples(): number[] {
    return [...this.samples];
  }
}

/**
 * Global resource manager
 */
export class ResourceManager {
  private static instance: ResourceManager;
  private disposables = new DisposableGroup();
  private pools: Map<string, ObjectPool<any>> = new Map();

  private constructor() {}

  static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }

  /**
   * Register a disposable
   */
  register<T extends IDisposable>(disposable: T, id?: string): T {
    this.disposables.add(disposable);
    return disposable;
  }

  /**
   * Register object pool
   */
  registerPool<T>(name: string, pool: ObjectPool<T>): void {
    this.pools.set(name, pool);
  }

  /**
   * Get object pool
   */
  getPool<T>(name: string): ObjectPool<T> | undefined {
    return this.pools.get(name);
  }

  /**
   * Clean up all resources
   */
  cleanup(): void {
    this.disposables.dispose();
    this.pools.forEach(pool => pool.clear());
    this.pools.clear();
  }
}
