/**
 * Performance Utilities Package
 * Export all performance-related utilities for easy access
 */

// Rate limiting
export {
  RateLimiter,
  createThrottle,
  createDebounce,
  OperationThrottler,
  RequestDeduplicator,
  rateLimiters,
} from './rateLimit';

// Caching
export {
  Cache,
  LRUCache,
  createMemoize,
  createAsyncMemoize,
  caches,
  type CacheEntry,
} from './cache';

// Memory management
export {
  DisposableGroup,
  WeakHolder,
  ObjectPool,
  BatchProcessor,
  MemoryMonitor,
  ResourceManager,
  type IDisposable,
} from './memory';

// Profiling
export {
  PerformanceProfiler,
  PerformanceObserver,
  defaultProfiler,
  profileAsync,
  profileSync,
  AsyncProfiled,
  SyncProfiled,
  type PerformanceMetric,
  type PerformanceReport,
} from './profiling';

// Lazy Loading & Optimization
export {
  createLazyComponent,
  createLazyComponentGroup,
  createMemoComponent,
  memoizeFunction,
  createMemoCallback,
  debounce,
  throttle,
  scheduleIdle,
  prefetchRoute,
  prefetchRoutes,
  observeIntersection,
  createLazyImage,
  calculateVirtualRange,
  delayedLazy,
} from './performanceOptimization';
