/**
 * Service Hook
 * React hook for consuming services in components
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { ServiceResult, ProgressCallback, ProgressUpdate } from '../services/types';

export interface UseServiceOptions {
  onProgress?: ProgressCallback;
  autoInitialize?: boolean;
}

export interface UseServiceState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  progress: ProgressUpdate | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

/**
 * Hook to execute a service operation
 */
export function useService<T>(
  serviceOperation: (...args: any[]) => Promise<ServiceResult<T>>,
  options: UseServiceOptions = {}
): UseServiceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Setup progress callback
  const handleProgress = useCallback((update: ProgressUpdate) => {
    setProgress(update);
    options.onProgress?.(update);
  }, [options]);

  // Execute operation
  const execute = useCallback(async (...args: any[]) => {
    // Cancel previous operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);
    setProgress({ stage: 'starting', percentage: 0 });

    try {
      const result = await serviceOperation(...args);

      if (!result.success) {
        const err = new Error(result.error?.message || 'Operation failed');
        setError(err);
        setProgress({ stage: 'failed', percentage: 0, message: err.message });
        return;
      }

      setData(result.data || null);
      setProgress({ stage: 'completed', percentage: 100 });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setProgress({ stage: 'failed', percentage: 0, message: error.message });
    } finally {
      setLoading(false);
    }
  }, [serviceOperation]);

  // Reset state
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setData(null);
    setLoading(false);
    setError(null);
    setProgress(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    progress,
    execute,
    reset,
  };
}

/**
 * Hook for PDF compression service
 */
export function usePDFCompression(options: UseServiceOptions = {}): UseServiceState<any> {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!initialized && options.autoInitialize !== false) {
        const { pdfCompressionService } = await import('../services/pdf');
        if (mounted && !pdfCompressionService.isReady()) {
          await pdfCompressionService.initialize();
          setInitialized(true);
        }
      }
    };

    init().catch(console.error);
    return () => {
      mounted = false;
    };
  }, [initialized, options.autoInitialize]);

  const pdfCompressionOperation = useCallback(
    async (buffer: ArrayBuffer, quality?: 'low' | 'medium' | 'high') => {
      const { pdfCompressionService } = await import('../services/pdf');
      return pdfCompressionService.compress(buffer, { quality }, options.onProgress);
    },
    [options.onProgress]
  );

  return useService(pdfCompressionOperation, options);
}

/**
 * Hook for PDF to Word conversion
 */
export function usePDFToWord(options: UseServiceOptions = {}): UseServiceState<any> {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!initialized && options.autoInitialize !== false) {
        const { pdfConversionService } = await import('../services/pdf');
        if (mounted && !pdfConversionService.isReady()) {
          await pdfConversionService.initialize();
          setInitialized(true);
        }
      }
    };

    init().catch(console.error);
    return () => {
      mounted = false;
    };
  }, [initialized, options.autoInitialize]);

  const pdfToWordOperation = useCallback(
    async (buffer: ArrayBuffer) => {
      const { pdfConversionService } = await import('../services/pdf');
      return pdfConversionService.pdfToWord(buffer, {}, options.onProgress);
    },
    [options.onProgress]
  );

  return useService(pdfToWordOperation, options);
}

/**
 * Hook for Word to PDF conversion
 */
export function useWordToPDF(options: UseServiceOptions = {}): UseServiceState<any> {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!initialized && options.autoInitialize !== false) {
        const { pdfConversionService } = await import('../services/pdf');
        if (mounted && !pdfConversionService.isReady()) {
          await pdfConversionService.initialize();
          setInitialized(true);
        }
      }
    };

    init().catch(console.error);
    return () => {
      mounted = false;
    };
  }, [initialized, options.autoInitialize]);

  const wordToPdfOperation = useCallback(
    async (file: File) => {
      const { pdfConversionService } = await import('../services/pdf');
      return pdfConversionService.wordToPDF(file, {}, options.onProgress);
    },
    [options.onProgress]
  );

  return useService(wordToPdfOperation, options);
}

/**
 * Hook for Images to PDF conversion
 */
export function useImagesToPDF(options: UseServiceOptions = {}): UseServiceState<any> {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!initialized && options.autoInitialize !== false) {
        const { imageToPDFService } = await import('../services/pdf');
        if (mounted && !imageToPDFService.isReady()) {
          await imageToPDFService.initialize();
          setInitialized(true);
        }
      }
    };

    init().catch(console.error);
    return () => {
      mounted = false;
    };
  }, [initialized, options.autoInitialize]);

  const imagesToPdfOperation = useCallback(
    async (files: File[], pageSize?: 'A4' | 'Letter' | 'fit') => {
      const { imageToPDFService } = await import('../services/pdf');
      return imageToPDFService.imagesToPDF(files, { pageSize }, options.onProgress);
    },
    [options.onProgress]
  );

  return useService(imagesToPdfOperation, options);
}

export default useService;
