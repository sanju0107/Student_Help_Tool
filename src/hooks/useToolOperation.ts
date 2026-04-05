/**
 * useToolOperation Hook
 * Centralized state management for tool operations with built-in retry logic and error handling
 * Provides retry-safe states and automatic error recovery
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { categorizeError, retryWithBackoff, AppError } from '../lib/errorHandler';

export enum OperationState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  RETRYING = 'RETRYING',
}

export interface OperationError {
  message: string;
  category: string;
  canRetry: boolean;
  retryCount: number;
  originalError?: Error;
}

export interface ToolOperationState<T> {
  state: OperationState;
  data: T | null;
  error: OperationError | null;
  isProcessing: boolean;
  isRetrying: boolean;
  retryCount: number;
  progress: number; // 0-100
}

export interface UseToolOperationOptions {
  maxRetries?: number;
  initialDelay?: number;
  onRetry?: (attempt: number) => void;
  onSuccess?: () => void;
  onError?: (error: OperationError) => void;
  autoReset?: boolean; // Auto-reset to IDLE after success
  resetDelay?: number; // Delay before resetting to IDLE
}

/**
 * Hook for managing tool operations with built-in retry logic
 * @param operation - The async operation to perform
 * @param options - Configuration for retries and callbacks
 */
export function useToolOperation<T>(
  operation: () => Promise<T>,
  options: UseToolOperationOptions = {}
) {
  const {
    maxRetries = 2,
    initialDelay = 1000,
    onRetry,
    onSuccess,
    onError: onErrorCallback,
    autoReset = true,
    resetDelay = 2000,
  } = options;

  const [operationState, setOperationState] = useState<ToolOperationState<T>>({
    state: OperationState.IDLE,
    data: null,
    error: null,
    isProcessing: false,
    isRetrying: false,
    retryCount: 0,
    progress: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Execute operation with retry logic
  const execute = useCallback(
    async (progressCallback?: (progress: number) => void) => {
      // Prevent overlapping operations
      if (operationState.isProcessing || operationState.isRetrying) {
        return;
      }

      // Clear any pending reset
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }

      // Create abort controller for this operation
      abortControllerRef.current = new AbortController();

      setOperationState(prev => ({
        ...prev,
        state: OperationState.LOADING,
        isProcessing: true,
        error: null,
        progress: 0,
        retryCount: 0,
      }));

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          // Check if operation was aborted
          if (abortControllerRef.current?.signal.aborted) {
            throw new Error('Operation cancelled');
          }

          // Update progress
          const attemptProgress = Math.min(50 + (attempt * 10), 90);
          setOperationState(prev => ({ ...prev, progress: attemptProgress }));
          progressCallback?.(attemptProgress);

          // Execute operation
          const result = await operation();

          // Success
          setOperationState(prev => ({
            ...prev,
            state: OperationState.SUCCESS,
            data: result,
            error: null,
            isProcessing: false,
            progress: 100,
            retryCount: 0,
          }));

          onSuccess?.();

          // Auto-reset to IDLE
          if (autoReset) {
            resetTimeoutRef.current = setTimeout(() => {
              setOperationState(prev => ({
                ...prev,
                state: OperationState.IDLE,
                progress: 0,
              }));
            }, resetDelay);
          }

          return result;
        } catch (error: any) {
          // Check if aborted
          if (error.message === 'Operation cancelled') {
            setOperationState(prev => ({
              ...prev,
              state: OperationState.IDLE,
              isProcessing: false,
              isRetrying: false,
            }));
            return;
          }

          const { category, userMessage, strategy } = categorizeError(error);
          const canRetry = strategy.canRetry && attempt < maxRetries;

          if (canRetry) {
            // Retrying
            onRetry?.(attempt + 1);
            setOperationState(prev => ({
              ...prev,
              state: OperationState.RETRYING,
              isRetrying: true,
              retryCount: attempt + 1,
            }));

            // Wait before next retry
            const delay = initialDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            // Final error
            const operationError: OperationError = {
              message: userMessage,
              category,
              canRetry: strategy.canRetry && attempt < maxRetries,
              retryCount: attempt,
              originalError: error,
            };

            setOperationState(prev => ({
              ...prev,
              state: OperationState.ERROR,
              error: operationError,
              isProcessing: false,
              isRetrying: false,
            }));

            onErrorCallback?.(operationError);
            throw error;
          }
        }
      }

      // Max retries exceeded
      throw new Error('Operation failed after maximum retries');
    },
    [operation, maxRetries, initialDelay, onRetry, onSuccess, onErrorCallback, autoReset, resetDelay, operationState.isProcessing, operationState.isRetrying]
  );

  // Retry failed operation
  const retry = useCallback(
    async (progressCallback?: (progress: number) => void) => {
      if (operationState.state !== OperationState.ERROR) {
        return;
      }
      await execute(progressCallback);
    },
    [operationState.state, execute]
  );

  // Cancel operation
  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setOperationState(prev => ({
      ...prev,
      state: OperationState.IDLE,
      isProcessing: false,
      isRetrying: false,
      progress: 0,
    }));
  }, []);

  // Reset state
  const reset = useCallback(() => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
    setOperationState({
      state: OperationState.IDLE,
      data: null,
      error: null,
      isProcessing: false,
      isRetrying: false,
      retryCount: 0,
      progress: 0,
    });
  }, []);

  // Update progress
  const setProgress = useCallback((progress: number) => {
    setOperationState(prev => ({
      ...prev,
      progress: Math.min(Math.max(progress, 0), 100),
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, [cancel]);

  return {
    // State
    state: operationState.state,
    data: operationState.data,
    error: operationState.error,
    isProcessing: operationState.isProcessing,
    isRetrying: operationState.isRetrying,
    retryCount: operationState.retryCount,
    progress: operationState.progress,

    // Helper flags
    isLoading: operationState.isProcessing,
    isIdle: operationState.state === OperationState.IDLE,
    isSuccess: operationState.state === OperationState.SUCCESS,
    isError: operationState.state === OperationState.ERROR,

    // Actions
    execute,
    retry,
    cancel,
    reset,
    setProgress,
  };
}

/**
 * Hook for tool operations that need to be abortable
 */
export function useAbortableToolOperation<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  options: UseToolOperationOptions = {}
) {
  return useToolOperation(
    () => {
      const controller = new AbortController();
      return operation(controller.signal);
    },
    options
  );
}

/**
 * Hook for operations with progress tracking
 */
export function useToolOperationWithProgress<T>(
  operation: (onProgress: (progress: number) => void) => Promise<T>,
  options: UseToolOperationOptions = {}
) {
  const hook = useToolOperation(
    () => {
      return new Promise((resolve, reject) => {
        operation(newProgress => {
          hook.setProgress(newProgress);
        })
          .then(resolve)
          .catch(reject);
      });
    },
    options
  );

  return hook;
}

export default useToolOperation;
