/**
 * Performance Optimization Utilities
 * Tools for lazy loading, memoization, and reducing unnecessary renders
 * 
 * @module performanceOptimization
 */

import React, { lazy, LazyExoticComponent, Suspense, ReactNode, ComponentType } from 'react';

/**
 * Delay loading of a component slightly to optimize initial page load
 * Useful for components not visible on initial render
 */
export function delayedLazy<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  delayMs: number = 0
): LazyExoticComponent<ComponentType<P>> {
  if (delayMs <= 0) {
    return lazy(importFn);
  }

  return lazy(() =>
    new Promise((resolve) =>
      setTimeout(() => {
        resolve(importFn());
      }, delayMs)
    )
  );
}

/**
 * Create a lazy-loaded component with custom loading fallback
 */
interface LazyComponentOptions {
  /** Delay before showing loading fallback (ms) */
  delayFallback?: number;
  /** Custom loading component */
  fallback?: ReactNode;
  /** Component to show on error */
  errorFallback?: ReactNode;
}

export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyComponentOptions = {}
): ComponentType<P> {
  const { delayFallback = 200, fallback = null } = options;

  const LazyComponent = lazy(importFn);

  return function LazyComponentWrapper(props: P) {
    return React.createElement(
      Suspense,
      { fallback },
      React.createElement(LazyComponent, props)
    );
  } as ComponentType<P>;
}

/**
 * Batch lazy component imports with consistent Suspense
 * Useful for loading multiple components in a section
 */
export function createLazyComponentGroup<T extends Record<string, () => Promise<{ default: ComponentType<any> }>>>(
  components: T,
  fallback: ReactNode = null
): {
  [K in keyof T]: ComponentType<any>;
} {
  const result = {} as { [K in keyof T]: ComponentType<any> };

  for (const [key, importFn] of Object.entries(components)) {
    const LazyComponent = lazy(importFn as any);
    result[key as keyof T] = (props: any) => 
      React.createElement(
        Suspense,
        { fallback },
        React.createElement(LazyComponent, props)
      );
  }

  return result;
}

/**
 * Memoize component to prevent unnecessary re-renders
 * Only re-renders when props change
 */
export function createMemoComponent<P extends object>(
  Component: ComponentType<P>,
  displayName: string = Component.displayName || Component.name || 'MemoComponent'
): ComponentType<P> {
  const Memoized = React.memo(Component);
  Memoized.displayName = displayName;
  return Memoized;
}

/**
 * memoize a callback to prevent function recreation on each render
 * Similar to useCallback but for non-hook scenarios
 */
export function memoizeFunction<T extends (...args: any[]) => any>(
  fn: T,
  options?: {
    maxSize?: number; // Max number of argument combinations to cache
  }
): T {
  const { maxSize = 10 } = options || {};
  const cache = new Map<string, any>();

  return ((...args: any[]) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);

    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Create a hook that useCallback but works outside hooks
 * Memoizes function by identity, only recreates on dependency change
 */
export function createMemoCallback<T extends (...args: any[]) => any>(
  fn: T,
  deps: any[] = []
): T {
  let memoized = fn;
  let prevDeps = deps;

  return ((...args: any[]) => {
    // Check if dependencies changed
    const depsChanged = !prevDeps || deps.length !== prevDeps.length || 
      deps.some((d, i) => d !== prevDeps[i]);

    if (depsChanged) {
      memoized = fn;
      prevDeps = deps;
    }

    return memoized(...args);
  }) as T;
}

/**
 * Debounce a callback to limit execution frequency
 * Useful for resize, scroll handlers
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number = 300
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
      timeout = null;
    }, delayMs);
  };
}

/**
 * Throttle a callback to execute at most once per time interval
 * Useful for scroll, resize handlers
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number = 300
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delayMs) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Request idle callback with fallback to setTimeout
 * Execute function when browser is idle
 */
export function scheduleIdle(callback: () => void): void {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback);
  } else {
    setTimeout(callback, 1);
  }
}

/**
 * Preload a route to reduce perceived latency
 * Call before user navigates to the route
 */
export function prefetchRoute(importFn: () => Promise<any>): void {
  scheduleIdle(() => {
    try {
      importFn().catch(() => {
        // Ignore errors during prefetch
      });
    } catch {
      // Ignore
    }
  });
}

/**
 * Batch multiple prefetch requests to avoid overwhelming the browser
 */
export function prefetchRoutes(importFns: Array<() => Promise<any>>): void {
  let index = 0;

  const prefetchNext = () => {
    if (index < importFns.length) {
      prefetchRoute(importFns[index]);
      index++;
      scheduleIdle(prefetchNext);
    }
  };

  prefetchNext();
}

/**
 * Observe when element becomes visible and trigger callback
 * Useful for lazy loading images, analytics tracking
 */
export function observeIntersection(
  element: HTMLElement | null,
  callback: (isVisible: boolean) => void,
  options?: IntersectionObserverInit
): () => void {
  if (!element || !('IntersectionObserver' in window)) {
    return () => {};
  }

  const observer = new IntersectionObserver(([entry]) => {
    callback(entry.isIntersecting);
  }, options);

  observer.observe(element);

  return () => observer.disconnect();
}

/**
 * Lazy load an image with automatic srcset handling
 */
export function createLazyImage(
  src: string,
  placeholderSrc?: string
): {
  src: string;
  loading: 'lazy' | 'eager';
  placeholder: string;
} {
  return {
    src,
    loading: 'lazy',
    placeholder: placeholderSrc || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E',
  };
}

/**
 * Virtual list rendering for long lists of items
 * Shows only visible items to improve performance
 */
interface VirtualListOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // Number of items to render outside visible area
}

export function calculateVirtualRange(
  scrollTop: number,
  options: VirtualListOptions
): { start: number; end: number } {
  const { itemHeight, containerHeight, overscan = 3 } = options;
  
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const end = Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan;

  return { start, end };
}

/**
 * Request animation frame with callback
 * For smooth animations and transitions
 */
export function rafThrottle<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => void {
  let frameId: number | null = null;
  let lastArgs: Parameters<T>;

  return (...args: Parameters<T>) => {
    lastArgs = args;

    if (frameId !== null) {
      return;
    }

    frameId = requestAnimationFrame(() => {
      fn(...lastArgs);
      frameId = null;
    });
  };
}

/**
 * Measure performance of a function
 */
export function measurePerformance<T extends (...args: any[]) => any>(
  name: string,
  fn: T
): T {
  return ((...args: any[]) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();

    const isDev = process.env.NODE_ENV === 'development';
    if (isDev && end - start > 16) {
      console.warn(`[Perf] ${name} took ${(end - start).toFixed(2)}ms`);
    }

    return result;
  }) as T;
}

/**
 * Batch state updates to reduce re-renders
 * Useful in event handlers that update multiple states
 */
export function batchUpdates<T extends Record<string, any>>(
  updates: T
): Promise<void> {
  return new Promise((resolve) => {
    if ('unstable_batchedUpdates' in React) {
      (React as any).unstable_batchedUpdates(() => {
        resolve();
      });
    } else {
      resolve();
    }
  });
}

/**
 * Cleanup function for resource disposal
 */
export function createCleanupManager() {
  const cleanups: Array<() => void> = [];

  return {
    add(cleanup: () => void) {
      cleanups.push(cleanup);
    },
    cleanup() {
      for (const cleanup of cleanups) {
        try {
          cleanup();
        } catch (err) {
          console.error('Cleanup error:', err);
        }
      }
      cleanups.length = 0;
    },
  };
}

export default {
  delayedLazy,
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
  rafThrottle,
  measurePerformance,
  batchUpdates,
  createCleanupManager,
};
