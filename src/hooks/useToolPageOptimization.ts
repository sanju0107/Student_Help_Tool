/**
 * Performance Hooks for Tool Pages
 * Utilities to prevent unnecessary renders and optimize tool page performance
 * 
 * @module useToolPageOptimization
 */

import { useRef, useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Hook to prevent callback recreation unless dependencies change
 * Memoizes the callback identity
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const ref = useRef(callback);

  useEffect(() => {
    ref.current = callback;
  }, deps);

  return useCallback((...args: any[]) => ref.current(...args), []) as T;
}

/**
 * Hook for debounced value updates
 * Useful for search inputs, filters
 */
export function useDebouncedValue<T>(value: T, delayMs: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(handler);
  }, [value, delayMs]);

  return debouncedValue;
}

/**
 * Hook for throttled function calls
 * Useful for resize, scroll handlers
 */
export function useThrottledFunction<T extends (...args: any[]) => void>(
  callback: T,
  delayMs: number = 300
): T {
  const lastCallRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      const executeCallback = () => {
        lastCallRef.current = Date.now();
        callback(...args);
      };

      if (timeSinceLastCall >= delayMs) {
        executeCallback();
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(executeCallback, delayMs - timeSinceLastCall);
      }
    },
    [callback, delayMs]
  ) as T;
}

/**
 * Hook to safely handle async operations
 * Prevents memory leaks from stale updates
 */
export function useAsyncOperation<T>(
  asyncFn: () => Promise<T>,
  deps?: React.DependencyList
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
} {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const execute = async () => {
      try {
        const result = await asyncFn();
        if (isMountedRef.current) {
          setState({ data: result, loading: false, error: null });
        }
      } catch (err) {
        if (isMountedRef.current) {
          setState({ data: null, loading: false, error: err as Error });
        }
      }
    };

    execute();

    return () => {
      isMountedRef.current = false;
    };
  }, deps);

  return state;
}

/**
 * Hook to track if component is visible in viewport
 * Useful for lazy loading content
 */
export function useIsVisible(
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref, options]);

  return isVisible;
}

/**
 * Hook to batch multiple state updates
 * Reduces number of renders
 */
export function useBatchedState<T extends Record<string, any>>(
  initialState: T
): [T, (updates: Partial<T>) => void] {
  const [state, setState] = useState<T>(initialState);
  const batchRef = useRef<Partial<T>>({});

  const updateBatched = useCallback((updates: Partial<T>) => {
    batchRef.current = { ...batchRef.current, ...updates };

    if (!batchRef.current.__scheduled) {
      (batchRef.current as any).__scheduled = true;

      requestAnimationFrame(() => {
        const batch = batchRef.current;
        const { __scheduled, ...actualUpdates } = batch as any;

        setState((prev) => ({ ...prev, ...actualUpdates }));
        batchRef.current = {};
      });
    }
  }, []);

  return [state, updateBatched];
}

/**
 * Hook to memoize expensive calculations with deps
 * Similar to useMemo but with better debugging
 */
export function useExpensiveValue<T>(
  computeFn: () => T,
  deps: React.DependencyList,
  shouldUpdate?: (prevValue: T, nextValue: T) => boolean
): T {
  const ref = useRef<{ value: T; deps: React.DependencyList }>({
    value: computeFn(),
    deps,
  });

  if (
    !ref.current.deps ||
    ref.current.deps.length !== deps.length ||
    ref.current.deps.some((dep, i) => dep !== deps[i])
  ) {
    const nextValue = computeFn();
    const prevValue = ref.current.value;

    if (!shouldUpdate || shouldUpdate(prevValue, nextValue)) {
      ref.current = { value: nextValue, deps };
    }
  }

  return ref.current.value;
}

/**
 * Hook to manage render performance
 * Tracks number of renders and warns if too many
 */
export function useRenderCount(componentName: string = 'Component'): number {
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current++;
    if (renderCountRef.current > 10) {
      console.warn(`[Performance] ${componentName} rendered ${renderCountRef.current} times`);
    }
  });

  return renderCountRef.current;
}

/**
 * Hook to prevent rapid state updates
 * Useful for form inputs to avoid excessive re-renders
 */
export function useTransition<T>(
  value: T,
  delayMs: number = 50
): [T, boolean] {
  const [displayValue, setDisplayValue] = useState(value);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsPending(true);
    const timeout = setTimeout(() => {
      setDisplayValue(value);
      setIsPending(false);
    }, delayMs);

    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return [displayValue, isPending];
}

/**
 * Hook to manage component lifecycle cleanup
 * Ensures all cleanups are called on unmount
 */
export function useCleanup() {
  const cleanupFnsRef = useRef<Array<() => void>>([]);

  const addCleanup = useCallback((fn: () => void) => {
    cleanupFnsRef.current.push(fn);
  }, []);

  useEffect(() => {
    return () => {
      for (const cleanup of cleanupFnsRef.current) {
        try {
          cleanup();
        } catch (err) {
          console.error('Cleanup error:', err);
        }
      }
      cleanupFnsRef.current = [];
    };
  }, []);

  return { addCleanup };
}

/**
 * Hook to track previous value
 * Useful for comparing old and new values
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Hook to execute callback only on prop changes, not on initial render
 */
export function useUpdateEffect(effect: React.EffectCallback, deps?: React.DependencyList) {
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    return effect();
  }, deps);
}

/**
 * Hook to memoize callback while allowing updates from closure
 */
export function useLatestCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const ref = useRef(callback);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  return useCallback((...args: any[]) => ref.current(...args), []) as T;
}

/**
 * Hook to manage form state efficiently
 * Batches updates to reduce re-renders
 */
export function useFormState<T extends Record<string, any>>(initialState: T) {
  const [state, setState] = useState(initialState);
  const batchRef = useRef<Partial<T>>({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateField = useCallback(
    (field: keyof T, value: any) => {
      batchRef.current[field] = value;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, ...batchRef.current }));
        batchRef.current = {};
      }, 50);
    },
    []
  );

  const updateFields = useCallback((updates: Partial<T>) => {
    Object.assign(batchRef.current, updates);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, ...batchRef.current }));
      batchRef.current = {};
    }, 50);
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    batchRef.current = {};
  }, [initialState]);

  return { state, updateField, updateFields, reset };
}

export default {
  useStableCallback,
  useDebouncedValue,
  useThrottledFunction,
  useAsyncOperation,
  useIsVisible,
  useBatchedState,
  useExpensiveValue,
  useRenderCount,
  useTransition,
  useCleanup,
  usePrevious,
  useUpdateEffect,
  useLatestCallback,
  useFormState,
};
