/**
 * Performance Monitoring & Profiling Utilities
 * Track performance metrics and identify bottlenecks
 */

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  tags?: Record<string, string | number>;
  success: boolean;
  error?: Error;
}

export interface PerformanceReport {
  name: string;
  count: number;
  totalDuration: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  errorCount: number;
  successRate: number;
}

/**
 * Performance profiler for tracking operations
 */
export class PerformanceProfiler {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics: number = 1000;
  private marks: Map<string, number> = new Map();

  /**
   * Mark the start of an operation
   */
  mark(label: string): void {
    this.marks.set(label, performance.now());
  }

  /**
   * Measure duration since mark
   */
  measure(label: string, markLabel?: string): number {
    const startLabel = markLabel || label;
    const startTime = this.marks.get(startLabel);

    if (startTime === undefined) {
      console.warn(`Mark "${startLabel}" not found`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(startLabel);
    return duration;
  }

  /**
   * Record a metric
   */
  recordMetric(
    name: string,
    duration: number,
    tags?: Record<string, string | number>,
    success: boolean = true,
    error?: Error
  ): void {
    if (this.metrics.length >= this.maxMetrics) {
      this.metrics.splice(0, Math.floor(this.maxMetrics * 0.2)); // Remove oldest 20%
    }

    this.metrics.push({
      name,
      duration,
      timestamp: Date.now(),
      tags,
      success,
      error,
    });
  }

  /**
   * Profile a function execution
   */
  async profileAsync<T>(
    label: string,
    fn: () => Promise<T>,
    tags?: Record<string, string | number>
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      this.recordMetric(label, duration, tags, true);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(label, duration, tags, false, error as Error);
      throw error;
    }
  }

  /**
   * Profile synchronous function execution
   */
  profileSync<T>(
    label: string,
    fn: () => T,
    tags?: Record<string, string | number>
  ): T {
    const startTime = performance.now();

    try {
      const result = fn();
      const duration = performance.now() - startTime;
      this.recordMetric(label, duration, tags, true);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(label, duration, tags, false, error as Error);
      throw error;
    }
  }

  /**
   * Get report for specific metric
   */
  getMetricReport(name: string): PerformanceReport | null {
    const matching = this.metrics.filter(m => m.name === name);

    if (matching.length === 0) {
      return null;
    }

    const durations = matching.map(m => m.duration);
    const successCount = matching.filter(m => m.success).length;

    return {
      name,
      count: matching.length,
      totalDuration: durations.reduce((a, b) => a + b, 0),
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      errorCount: matching.length - successCount,
      successRate: (successCount / matching.length) * 100,
    };
  }

  /**
   * Get all metric reports
   */
  getAllReports(): PerformanceReport[] {
    const names = new Set(this.metrics.map(m => m.name));
    return Array.from(names)
      .map(name => this.getMetricReport(name))
      .filter((r): r is PerformanceReport => r !== null);
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get filtered metrics
   */
  getMetricsByTag(key: string, value: string | number): PerformanceMetric[] {
    return this.metrics.filter(
      m => m.tags && m.tags[key] === value
    );
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.marks.clear();
  }

  /**
   * Get metrics summary
   */
  getSummary(): {
    totalMetrics: number;
    totalOperations: number;
    averageDuration: number;
    totalErrors: number;
    successRate: number;
  } {
    if (this.metrics.length === 0) {
      return {
        totalMetrics: 0,
        totalOperations: 0,
        averageDuration: 0,
        totalErrors: 0,
        successRate: 100,
      };
    }

    const durations = this.metrics.map(m => m.duration);
    const errors = this.metrics.filter(m => !m.success).length;

    return {
      totalMetrics: this.metrics.length,
      totalOperations: new Set(this.metrics.map(m => m.name)).size,
      averageDuration: durations.reduce((a, b) => a + b) / durations.length,
      totalErrors: errors,
      successRate: ((this.metrics.length - errors) / this.metrics.length) * 100,
    };
  }
}

/**
 * Real-time performance observer for Web APIs
 */
export class PerformanceObserver {
  private observer: PerformanceObserverEntryList[] = [];

  /**
   * Get paint entries (FCP, LCP metrics)
   */
  getPaintEntries(): PerformanceEntryList {
    return performance.getEntriesByType('paint');
  }

  /**
   * Get navigation timing
   */
  getNavigationTiming(): PerformanceTiming | null {
    const timing = performance.timing;
    if (!timing) return null;
    return timing;
  }

  /**
   * Get memory usage
   */
  getMemoryUsage(): {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  } | null {
    if (typeof (performance as any).memory === 'undefined') {
      return null;
    }

    return (performance as any).memory;
  }

  /**
   * Get resource timing
   */
  getResourceTimings(filter?: string): PerformanceResourceTiming[] {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    if (!filter) return resources;

    return resources.filter(r => r.name.includes(filter));
  }

  /**
   * Get Core Web Vitals (if available)
   */
  async getCoreWebVitals(): Promise<{
    FCP?: number;
    LCP?: number;
    CLS?: number;
    INP?: number;
    TTFB?: number;
  }> {
    const vitals: any = {};

    // FCP - First Contentful Paint
    const fpEntries = performance.getEntriesByType('paint') as PerformancePaintTiming[];
    const fcp = fpEntries.find(e => e.name === 'first-contentful-paint');
    if (fcp) vitals.FCP = fcp.startTime;

    // TTFB - Time to First Byte
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      vitals.TTFB = navigation.responseStart - navigation.fetchStart;
    }

    return vitals;
  }
}

/**
 * Global profiler instance
 */
export const defaultProfiler = new PerformanceProfiler();

/**
 * Helper to profile a function
 */
export async function profileAsync<T>(
  label: string,
  fn: () => Promise<T>,
  tags?: Record<string, string | number>
): Promise<T> {
  return defaultProfiler.profileAsync(label, fn, tags);
}

/**
 * Helper to profile synchronous function
 */
export function profileSync<T>(
  label: string,
  fn: () => T,
  tags?: Record<string, string | number>
): T {
  return defaultProfiler.profileSync(label, fn, tags);
}

/**
 * Decorator for profiling async methods
 */
export function AsyncProfiled(label?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const profilerLabel = label || `${target.constructor.name}.${propertyKey}`;
      return defaultProfiler.profileAsync(profilerLabel, () =>
        originalMethod.apply(this, args)
      );
    };

    return descriptor;
  };
}

/**
 * Decorator for profiling sync methods
 */
export function SyncProfiled(label?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const profilerLabel = label || `${target.constructor.name}.${propertyKey}`;
      return defaultProfiler.profileSync(profilerLabel, () =>
        originalMethod.apply(this, args)
      );
    };

    return descriptor;
  };
}
