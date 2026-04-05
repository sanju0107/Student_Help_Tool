/**
 * Production React Hooks for Validation, Rate Limiting & Error Handling
 * Ready-to-use hooks for all common patterns
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { validateFile, validateFileSize, validateFileExtension, FILE_SIZE_LIMITS } from '../lib/security/fileValidation';
import { sanitizeText, validateText, validateEmail } from '../lib/security/validation';
import { rateLimiters, createDebounce, createThrottle } from '../lib/performance';
import { categorizeError, retryWithBackoff, safeAsync, CircuitBreaker, withTimeout, logError } from '../lib/errorHandler';

/**
 * Hook for file upload with automatic validation
 */
export function useSecureFileUpload(options?: {
  maxSize?: number;
  allowedExtensions?: string[];
  allowedMimes?: string[];
  onValidationError?: (error: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      setError(null);
      setIsLoading(true);

      try {
        // Check rate limit
        if (!rateLimiters.fileUpload.consume()) {
          throw new Error(
            'File upload rate limit reached. Please wait before uploading again.'
          );
        }

        // Validate file
        const validation = validateFile(selectedFile, {
          allowedExtensions: options?.allowedExtensions || ['pdf', 'docx', 'txt'],
          allowedMimes: options?.allowedMimes || [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
          ],
          maxSize: options?.maxSize || FILE_SIZE_LIMITS.pdf,
        });

        if (!validation.valid) {
          const errorMsg = validation.errors[0];
          setError(errorMsg);
          options?.onValidationError?.(errorMsg);
          return;
        }

        setFile(selectedFile);
      } catch (err: any) {
        const errorMsg = err?.message || 'File validation failed';
        setError(errorMsg);
        options?.onValidationError?.(errorMsg);
        logError(err, 'useSecureFileUpload');
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const clearFile = useCallback(() => {
    setFile(null);
    setError(null);
  }, []);

  return {
    file,
    error,
    isLoading,
    handleFileSelect,
    clearFile,
  };
}

/**
 * Hook for form input validation with debouncing
 */
export function useValidatedInput(
  initialValue: string = '',
  options?: {
    minLength?: number;
    maxLength?: number;
    validator?: (value: string) => { valid: boolean; error?: string };
    debounceMs?: number;
    onValidationChange?: (isValid: boolean, error?: string) => void;
  }
) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(
    (inputValue: string) => {
      if (!inputValue.trim() && options?.minLength === 0) {
        setError(null);
        setIsValid(true);
        return;
      }

      // Min/max length validation
      if (options?.minLength && inputValue.length < options.minLength) {
        const err = `Minimum ${options.minLength} characters required`;
        setError(err);
        setIsValid(false);
        options?.onValidationChange?.(false, err);
        return;
      }

      if (options?.maxLength && inputValue.length > options.maxLength) {
        const err = `Maximum ${options.maxLength} characters allowed`;
        setError(err);
        setIsValid(false);
        options?.onValidationChange?.(false, err);
        return;
      }

      // Custom validator
      if (options?.validator) {
        const result = options.validator(inputValue);
        if (!result.valid) {
          setError(result.error || 'Invalid input');
          setIsValid(false);
          options?.onValidationChange?.(false, result.error);
          return;
        }
      }

      setError(null);
      setIsValid(true);
      options?.onValidationChange?.(true);
    },
    [options]
  );

  const debouncedValidate = useRef(
    createDebounce(validate, options?.debounceMs || 300)
  ).current;

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      setIsValidating(true);
      debouncedValidate(newValue);
      setIsValidating(false);
    },
    [debouncedValidate]
  );

  return {
    value,
    setValue,
    error,
    isValid,
    isValidating,
    handleChange,
  };
}

/**
 * Hook for async operations with automatic retrying and error handling
 */
export function useAsyncOperation<T>(
  asyncFn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    timeout?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    immediate?: boolean;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await retryWithBackoff(asyncFn, {
        maxRetries: options?.maxRetries || 2,
        initialDelay: 1000,
      });

      if (options?.timeout) {
        await withTimeout(Promise.resolve(result), options.timeout);
      }

      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err: any) {
      const { userMessage } = categorizeError(err);
      setError(userMessage);
      options?.onError?.(err);
      logError(err, 'useAsyncOperation');
    } finally {
      setIsLoading(false);
    }
  }, [asyncFn, options]);

  const retry = useCallback(() => {
    setAttempt(a => a + 1);
    return execute();
  }, [execute]);

  useEffect(() => {
    if (options?.immediate) {
      execute();
    }
  }, [execute, options?.immediate]);

  return { data, error, isLoading, execute, retry, attempt };
}

/**
 * Hook for rate-limited operations
 */
export function useRateLimitedCallback<T extends (...args: any[]) => any>(
  callback: T,
  options?: {
    type?: 'api' | 'file' | 'ai' | 'processing';
    onRateLimited?: () => void;
  }
): (...args: Parameters<T>) => ReturnType<T> | void {
  return useCallback(
    (...args: Parameters<T>) => {
      const limiter = (options?.type && rateLimiters[options.type as keyof typeof rateLimiters]) || rateLimiters.apiCall;

      // Check if it's a RateLimiter with consume method
      const rateLimiter = limiter as any;
      if (rateLimiter.consume && !rateLimiter.consume()) {
        options?.onRateLimited?.();
        return;
      }

      return callback(...args);
    },
    [callback, options]
  );
}

/**
 * Hook for debounced operations (with rate limiting)
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delayMs: number = 500
) {
  const debouncedFn = useRef(createDebounce(callback, delayMs)).current;

  return useCallback(
    (...args: Parameters<T>) => {
      debouncedFn(...args);
    },
    [debouncedFn]
  );
}

/**
 * Hook for throttled operations (with rate limiting)
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delayMs: number = 1000
) {
  const throttledFn = useRef(createThrottle(callback, delayMs)).current;

  return useCallback(
    (...args: Parameters<T>) => {
      return throttledFn(...args);
    },
    [throttledFn]
  );
}

/**
 * Hook for email validation
 */
export function useEmailInput(initialValue: string = '') {
  const [email, setEmail] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((newEmail: string) => {
    setEmail(newEmail);

    if (newEmail.trim()) {
      const { valid, error: validationError } = validateEmail(newEmail);
      setError(valid ? null : validationError);
    } else {
      setError(null);
    }
  }, []);

  const isValid = email.trim() ? validateEmail(email).valid : false;

  return {
    email,
    setEmail,
    error,
    isValid,
    handleChange,
  };
}

/**
 * Hook for text input with sanitization
 */
export function useSanitizedInput(initialValue: string = '') {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((newValue: string) => {
    const sanitized = sanitizeText(newValue);
    setValue(sanitized);
  }, []);

  const sanitizedValue = sanitizeText(value);

  return {
    value: sanitizedValue,
    setValue: (newValue: string) => setValue(sanitizeText(newValue)),
    handleChange,
    original: value,
  };
}

/**
 * Hook for circuit breaker pattern (for unstable services)
 */
export function useCircuitBreaker<T>(
  asyncFn: () => Promise<T>,
  options?: {
    failureThreshold?: number;
    resetTimeout?: number;
    onStateChange?: (state: string) => void;
  }
) {
  const breaker = useRef(
    new CircuitBreaker(options?.failureThreshold, options?.resetTimeout)
  ).current;
  const [state, setState] = useState(breaker.getState());

  const execute = useCallback(async () => {
    try {
      const result = await breaker.execute(asyncFn);
      const newState = breaker.getState();
      if (newState !== state) {
        setState(newState);
        options?.onStateChange?.(newState);
      }
      return result;
    } catch (error) {
      const newState = breaker.getState();
      if (newState !== state) {
        setState(newState);
        options?.onStateChange?.(newState);
      }
      throw error;
    }
  }, [asyncFn, breaker, state, options]);

  const reset = useCallback(() => {
    breaker.reset();
    setState(breaker.getState());
  }, [breaker]);

  return { execute, reset, state };
}

/**
 * Hook for optimistic updates with rollback
 */
export function useOptimisticUpdate<T>(
  initialData: T,
  updateFn: (newData: T) => Promise<T>,
  options?: {
    onError?: (error: Error, previousData: T) => void;
  }
) {
  const [data, setData] = useState(initialData);
  const [isPending, setIsPending] = useState(false);

  const updateOptimistically = useCallback(
    async (newData: T) => {
      const previousData = data;
      setData(newData);
      setIsPending(true);

      try {
        const result = await updateFn(newData);
        setData(result);
      } catch (error: any) {
        setData(previousData);
        options?.onError?.(error, previousData);
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    [data, updateFn, options]
  );

  return { data, updateOptimistically, isPending };
}

/**
 * Hook for progressive enhancement (fallback for unsupported features)
 */
export function useFeatureDetection(features: Record<string, () => boolean>) {
  const [supported, setSupported] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const detected: Record<string, boolean> = {};
    Object.entries(features).forEach(([name, detector]) => {
      detected[name] = detector();
    });
    setSupported(detected);
  }, [features]);

  return supported;
}

/**
 * Hook for abort-able async operations
 */
export function useAbortableAsync<T>(
  asyncFn: (signal: AbortSignal) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      const result = await asyncFn(abortControllerRef.current.signal);
      setData(result);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [asyncFn]);

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  useEffect(() => {
    return () => {
      abort();
    };
  }, [abort]);

  return { data, error, isLoading, execute, abort };
}

// Re-export helper functions for convenience
export { withTimeout, logError } from '../lib/errorHandler';
