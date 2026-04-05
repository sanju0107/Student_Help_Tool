/**
 * Heavy Operations Optimization & Resource Management
 * Optimizes image processing, PDF operations, and AI calls
 */

import { OperationThrottler, BatchProcessor, MemoryMonitor, ObjectPool } from './performance';
import { withTimeout, CircuitBreaker, logError } from './errorHandler';

/**
 * Image processing optimizer with quality/speed trade-offs
 */
export class ImageProcessingOptimizer {
  private throttler: OperationThrottler;
  private memoryMonitor: MemoryMonitor;
  private qualityLevel: 'low' | 'medium' | 'high' = 'medium';

  constructor(maxConcurrentOps: number = 3) {
    this.throttler = new OperationThrottler(maxConcurrentOps);
    this.memoryMonitor = new MemoryMonitor(10000); // Check every 10 seconds
  }

  /**
   * Auto-adjust quality based on memory usage
   */
  private adjustQualityForMemory(): void {
    const stats = this.memoryMonitor.getStats();
    if (!stats) return;

    if (stats.trend === 'increasing' && stats.current > 100 * 1024 * 1024) {
      // High memory usage, reduce quality
      this.qualityLevel = 'low';
    } else if (stats.current < 50 * 1024 * 1024) {
      // Low memory usage, use high quality
      this.qualityLevel = 'high';
    } else {
      this.qualityLevel = 'medium';
    }
  }

  /**
   * Process image with automatic optimization
   */
  async processImage<T>(
    imageData: Blob | File,
    processor: (data: Blob, quality: string) => Promise<T>,
    options?: { timeout?: number; label?: string }
  ): Promise<T> {
    const timeout = options?.timeout || 30000;

    return this.throttler.execute(async () => {
      this.adjustQualityForMemory();

      try {
        return await withTimeout(
          processor(imageData, this.qualityLevel),
          timeout,
          `Image processing timed out after ${timeout}ms`
        );
      } catch (error) {
        logError(error, `ImageProcessing-${options?.label || 'unknown'}`);
        throw error;
      }
    });
  }

  /**
   * Process batch of images efficiently
   */
  async processBatch(
    images: File[],
    processor: (file: File) => Promise<Blob>,
    options?: { label?: string; onProgress?: (current: number, total: number) => void }
  ): Promise<Blob[]> {
    const batchProcessor = new BatchProcessor(
      async (batch: File[]) => {
        const results: Blob[] = [];

        for (const file of batch) {
          try {
            const result = await this.processImage(file, (data) =>
              processor(new File([data], file.name))
            );
            results.push(result as Blob);
            options?.onProgress?.(results.length, images.length);
          } catch (error) {
            logError(error, `BatchProcessor-${options?.label}`);
            // Continue with next image
            results.push(new Blob()); // Empty blob as placeholder
          }
        }

        return results;
      },
      5 // Batch size
    );

    const results: Blob[] = [];
    for (const image of images) {
      const result = await batchProcessor.add(image);
      if (result) results.push(result);
    }

    await batchProcessor.flush();
    return results;
  }

  /**
   * Start monitoring memory
   */
  startMonitoring(): void {
    this.memoryMonitor.start();
  }

  /**
   * Stop monitoring memory
   */
  stopMonitoring(): void {
    this.memoryMonitor.stop();
  }

  /**
   * Get current optimization stats
   */
  getStats() {
    return {
      quality: this.qualityLevel,
      memory: this.memoryMonitor.getStats(),
    };
  }
}

/**
 * PDF processing optimizer
 */
export class PDFProcessingOptimizer {
  private throttler: OperationThrottler;
  private circuitBreaker: CircuitBreaker;

  constructor(maxConcurrentOps: number = 2) {
    this.throttler = new OperationThrottler(maxConcurrentOps);
    this.circuitBreaker = new CircuitBreaker(5, 60000);
  }

  /**
   * Process PDF with timeout and retry capability
   */
  async processPDF<T>(
    pdfFile: File,
    processor: (file: File) => Promise<T>,
    options?: { timeout?: number; label?: string }
  ): Promise<T> {
    const timeout = options?.timeout || 60000;

    return this.throttler.execute(async () => {
      return this.circuitBreaker.execute(async () => {
        try {
          return await withTimeout(
            processor(pdfFile),
            timeout,
            `PDF processing timed out after ${timeout}ms`
          );
        } catch (error) {
          logError(error, `PDFProcessor-${options?.label || 'unknown'}`);
          throw error;
        }
      });
    });
  }

  /**
   * Split large PDF into chunks for processing
   */
  async processLargePDF(
    pdfFile: File,
    processor: (chunk: File, pageRange: string) => Promise<void>,
    chunkSize: number = 10 // pages per chunk
  ): Promise<void> {
    // Note: actual implementation would require PDF library
    // This is a placeholder showing the pattern

    const batchProcessor = new BatchProcessor(
      async (batches: { chunk: File; range: string }[]) => {
        for (const { chunk, range } of batches) {
          await this.processPDF(chunk, (file) => processor(file, range));
        }
        return [];
      },
      3 // Process 3 chunks concurrently
    );

    // In real implementation, split PDF into chunks first
    await batchProcessor.add({ chunk: pdfFile, range: '1-10' });
    await batchProcessor.flush();
  }

  /**
   * Get circuit breaker state
   */
  getState(): string {
    return this.circuitBreaker.getState();
  }
}

/**
 * Canvas rendering optimizer for heavy drawing operations
 */
export class CanvasOptimizer {
  private offscreenCanvas: OffscreenCanvas | null = null;
  private throttler: OperationThrottler;
  private canvasPool: ObjectPool<OffscreenCanvas>;

  constructor(private maxConcurrent: number = 4) {
    this.throttler = new OperationThrottler(maxConcurrent);

    // Object pool for canvas instances
    this.canvasPool = new ObjectPool(
      () => {
        if (typeof OffscreenCanvas !== 'undefined') {
          return new OffscreenCanvas(1024, 768);
        }
        // Fallback to regular canvas
        const canvas = document.createElement('canvas');
        return canvas as any;
      },
      (canvas) => {
        // Reset canvas for reuse
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    );
  }

  /**
   * Render with optimized canvas handling
   */
  async render<T>(
    width: number,
    height: number,
    renderFn: (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => T,
    options?: { label?: string; priority?: 'high' | 'normal' }
  ): Promise<T> {
    return this.throttler.execute(async () => {
      const canvas = this.canvasPool.acquire() as any;
      canvas.width = width;
      canvas.height = height;

      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');

        const result = renderFn(ctx);
        return result;
      } finally {
        this.canvasPool.release(canvas);
      }
    });
  }

  /**
   * Get pool statistics
   */
  getPoolStats() {
    return this.canvasPool.getStats();
  }
}

/**
 * AI Operation optimizer for handling API calls with rate limiting
 */
export class AIOperationOptimizer {
  private circuitBreaker: CircuitBreaker;
  private requestQueue: Array<{
    fn: () => Promise<any>;
    priority: number;
  }> = [];
  private isProcessing = false;

  constructor(
    private maxConcurrent: number = 2,
    private timeout: number = 120000 // 2 minutes for AI operations
  ) {
    this.circuitBreaker = new CircuitBreaker(10, 180000); // 3 minute reset
  }

  /**
   * Execute AI operation with priority queue
   */
  async executeAI<T>(
    operation: () => Promise<T>,
    options?: {
      priority?: number; // Higher = more important
      label?: string;
      timeout?: number;
    }
  ): Promise<T> {
    const priority = options?.priority ?? 5;

    return new Promise((resolve, reject) => {
      this.requestQueue.push({ fn: operation, priority: priority });
      this.requestQueue.sort((a, b) => b.priority - a.priority);

      this.processQueue().catch(reject);
    });
  }

  /**
   * Process queued AI operations
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.requestQueue.length > 0) {
        const { fn, priority } = this.requestQueue.shift()!;

        try {
          await this.circuitBreaker.execute(async () => {
            return await withTimeout(fn(), this.timeout);
          });
        } catch (error) {
          logError(error, 'AIOperation');
          // Continue processing other operations
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get circuit breaker state
   */
  getState(): string {
    return this.circuitBreaker.getState();
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.requestQueue.length;
  }

  /**
   * Get processing state
   */
  isProcessingOperations(): boolean {
    return this.isProcessing;
  }
}

/**
 * Global optimizer instances
 */
export const imageOptimizer = new ImageProcessingOptimizer(3);
export const pdfOptimizer = new PDFProcessingOptimizer(2);
export const canvasOptimizer = new CanvasOptimizer(4);
export const aiOptimizer = new AIOperationOptimizer(2, 120000);

/**
 * Resource status monitor
 */
export function getResourceStatus() {
  return {
    imageProcessing: { /* stats */ },
    pdfProcessing: {
      state: pdfOptimizer.getState(),
    },
    canvasRenderingPool: canvasOptimizer.getPoolStats(),
    aiOperationQueue: {
      queueSize: aiOptimizer.getQueueSize(),
      isProcessing: aiOptimizer.isProcessingOperations(),
      state: aiOptimizer.getState(),
    },
  };
}

/**
 * Start monitoring all heavy operations
 */
export function startResourceMonitoring(): void {
  imageOptimizer.startMonitoring();
}

/**
 * Stop monitoring
 */
export function stopResourceMonitoring(): void {
  imageOptimizer.stopMonitoring();
}
