/**
 * Centralized Tool State Manager
 * Unified state management for all tool operations
 */

import { useState, useCallback } from 'react';

export interface FileUploadState {
  file: File | null;
  preview: string | null;
  fileName: string | null;
  fileSize: number | null;
}

export interface ProcessingState {
  isProcessing: boolean;
  isRetrying: boolean;
  progress: number; // 0-100
  retryCount: number;
}

export interface ResultState {
  result: any | null;
  resultUrl: string | null;
  resultFileName: string | null;
  resultSize: number | null;
}

export interface ErrorState {
  error: string | null;
  errorCategory?: string;
  hasError: boolean;
}

export interface SuccessState {
  success: boolean;
  successMessage?: string;
}

export interface CentralToolState {
  file: FileUploadState;
  processing: ProcessingState;
  result: ResultState;
  error: ErrorState;
  success: SuccessState;
}

/**
 * Hook for centralized tool state management
 */
export function useCentralToolState() {
  const [state, setState] = useState<CentralToolState>({
    file: {
      file: null,
      preview: null,
      fileName: null,
      fileSize: null,
    },
    processing: {
      isProcessing: false,
      isRetrying: false,
      progress: 0,
      retryCount: 0,
    },
    result: {
      result: null,
      resultUrl: null,
      resultFileName: null,
      resultSize: null,
    },
    error: {
      error: null,
      errorCategory: undefined,
      hasError: false,
    },
    success: {
      success: false,
      successMessage: undefined,
    },
  });

  // File management
  const setFile = useCallback((file: File | null, preview?: string) => {
    setState(prev => ({
      ...prev,
      file: {
        file,
        preview: preview || (file ? URL.createObjectURL(file) : null),
        fileName: file?.name || null,
        fileSize: file?.size || null,
      },
      error: { error: null, hasError: false },
      success: { success: false },
    }));
  }, []);

  const clearFile = useCallback(() => {
    setState(prev => ({
      ...prev,
      file: {
        file: null,
        preview: null,
        fileName: null,
        fileSize: null,
      },
    }));
  }, []);

  // Processing state
  const startProcessing = useCallback(() => {
    setState(prev => ({
      ...prev,
      processing: {
        isProcessing: true,
        isRetrying: false,
        progress: 0,
        retryCount: 0,
      },
      error: { error: null, hasError: false },
      success: { success: false },
    }));
  }, []);

  const setProcessing = useCallback((
    isProcessing: boolean,
    progress?: number,
    isRetrying?: boolean
  ) => {
    setState(prev => ({
      ...prev,
      processing: {
        ...prev.processing,
        isProcessing,
        progress: progress ?? prev.processing.progress,
        isRetrying: isRetrying ?? prev.processing.isRetrying,
      },
    }));
  }, []);

  const setProgress = useCallback((progress: number) => {
    setState(prev => ({
      ...prev,
      processing: {
        ...prev.processing,
        progress: Math.min(Math.max(progress, 0), 100),
      },
    }));
  }, []);

  const incrementRetry = useCallback(() => {
    setState(prev => ({
      ...prev,
      processing: {
        ...prev.processing,
        isRetrying: true,
        retryCount: prev.processing.retryCount + 1,
      },
    }));
  }, []);

  // Error handling
  const setError = useCallback((
    error: string | null,
    category?: string
  ) => {
    setState(prev => ({
      ...prev,
      error: {
        error,
        errorCategory: category,
        hasError: !!error,
      },
      processing: {
        ...prev.processing,
        isProcessing: false,
        isRetrying: false,
      },
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: {
        error: null,
        errorCategory: undefined,
        hasError: false,
      },
    }));
  }, []);

  // Result handling
  const setResult = useCallback((
    result: any,
    resultUrl?: string,
    resultFileName?: string,
    resultSize?: number
  ) => {
    setState(prev => ({
      ...prev,
      result: {
        result,
        resultUrl: resultUrl || null,
        resultFileName: resultFileName || null,
        resultSize: resultSize || null,
      },
      processing: {
        ...prev.processing,
        isProcessing: false,
        isRetrying: false,
        progress: 100,
      },
      success: { success: true },
      error: { error: null, hasError: false },
    }));
  }, []);

  const clearResult = useCallback(() => {
    setState(prev => ({
      ...prev,
      result: {
        result: null,
        resultUrl: null,
        resultFileName: null,
        resultSize: null,
      },
      success: { success: false },
    }));
  }, []);

  // Success handling
  const setSuccess = useCallback((message?: string) => {
    setState(prev => ({
      ...prev,
      success: {
        success: true,
        successMessage: message,
      },
      processing: {
        ...prev.processing,
        isProcessing: false,
        isRetrying: false,
        progress: 100,
      },
    }));
  }, []);

  // Overall reset
  const resetAll = useCallback(() => {
    setState({
      file: {
        file: null,
        preview: null,
        fileName: null,
        fileSize: null,
      },
      processing: {
        isProcessing: false,
        isRetrying: false,
        progress: 0,
        retryCount: 0,
      },
      result: {
        result: null,
        resultUrl: null,
        resultFileName: null,
        resultSize: null,
      },
      error: {
        error: null,
        errorCategory: undefined,
        hasError: false,
      },
      success: {
        success: false,
        successMessage: undefined,
      },
    });
  }, []);

  // Partial reset (keep file, clear result & error)
  const resetResult = useCallback(() => {
    setState(prev => ({
      ...prev,
      result: {
        result: null,
        resultUrl: null,
        resultFileName: null,
        resultSize: null,
      },
      error: { error: null, hasError: false },
      success: { success: false },
      processing: {
        ...prev.processing,
        isProcessing: false,
        isRetrying: false,
      },
    }));
  }, []);

  return {
    // State
    state,
    file: state.file,
    processing: state.processing,
    result: state.result,
    error: state.error,
    success: state.success,

    // File operations
    setFile,
    clearFile,

    // Processing operations
    startProcessing,
    setProcessing,
    setProgress,
    incrementRetry,

    // Error operations
    setError,
    clearError,

    // Result operations
    setResult,
    clearResult,

    // Success operations
    setSuccess,

    // Overall
    resetAll,
    resetResult,
  };
}

export default useCentralToolState;
