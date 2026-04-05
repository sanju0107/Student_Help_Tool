/**
 * Hooks Package
 * Central export point for all custom React hooks
 */

// Tool State Management
export {
  useCentralToolState,
  type FileUploadState,
  type ProcessingState,
  type ResultState,
  type ErrorState,
  type SuccessState,
  type CentralToolState,
} from './useCentralToolState';

// Service Integration
export {
  useService,
  usePDFCompression,
  usePDFToWord,
  useWordToPDF,
  useImagesToPDF,
  type UseServiceOptions,
  type UseServiceState,
} from './useService';

// Tool Operations
export {
  useToolOperation,
  useAbortableToolOperation,
  useToolOperationWithProgress,
  OperationState,
  type OperationError,
  type ToolOperationState,
  type UseToolOperationOptions,
} from './useToolOperation';

// Tool Page Optimization
export {
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
} from './useToolPageOptimization';

// Form Validation & Utilities
export {
  useSecureFileUpload,
  useValidatedInput,
  useRateLimitedCallback,
  useDebouncedCallback,
  useThrottledCallback,
  useEmailInput,
  useSanitizedInput,
  useCircuitBreaker,
  useOptimisticUpdate,
  useFeatureDetection,
  useAbortableAsync,
} from './useValidation';

