/**
 * Tool Operation Patterns & Best Practices
 * Comprehensive guide for implementing tool operations with error handling
 */

// ============================================================================
// PATTERN 1: Using useToolOperation Hook
// ============================================================================
/**
 * Best for: Simple operations that need retry logic
 * Example: File uploads, API calls, conversions
 */
export const ToolOperationPattern_Simple = `
import { useToolOperation, OperationState } from '@/hooks/useToolOperation';
import { LoadingState, ErrorDisplay, SuccessState } from '@/components/ToolFallbacks';

const MyTool = () => {
  const operation = useToolOperation(
    async () => {
      // Your operation logic
      const result = await processFile(file);
      return result;
    },
    {
      maxRetries: 2,
      onRetry: (attempt) => console.log(\`Attempt \${attempt}\`),
      onSuccess: () => console.log('Done!'),
      autoReset: true,
    }
  );

  return (
    <>
      {operation.state === OperationState.IDLE && (
        <button onClick={() => operation.execute()}>
          Process
        </button>
      )}
      {operation.state === OperationState.LOADING && (
        <LoadingState 
          message="Processing..."
          progress={operation.progress}
          showProgress={true}
        />
      )}
      {operation.state === OperationState.ERROR && (
        <ErrorDisplay
          error={operation.error?.message || 'Unknown error'}
          category={operation.error?.category as any}
          onRetry={() => operation.retry()}
          showRetry={operation.error?.canRetry}
        />
      )}
      {operation.state === OperationState.SUCCESS && (
        <SuccessState
          message="Success!"
          onReset={() => operation.reset()}
        />
      )}
    </>
  );
};
`;

// ============================================================================
// PATTERN 2: Using useCentralToolState Hook
// ============================================================================
/**
 * Best for: Complex tools with multiple states (file + processing + result)
 * Example: Image compression, PDF merging, format conversion
 */
export const ToolOperationPattern_Central = `
import { useCentralToolState } from '@/hooks/useCentralToolState';
import { ConditionalState } from '@/components/ToolFallbacks';

const ImageCompressor = () => {
  const toolState = useCentralToolState();

  const handleCompression = async () => {
    toolState.startProcessing();
    try {
      toolState.setProgress(25);
      
      const result = await compressImage(toolState.file.file);
      
      toolState.setProgress(100);
      toolState.setResult(result, resultUrl, 'compressed.jpg', resultSize);
    } catch (error) {
      toolState.setError(error.message, categorizeError(error).category);
    }
  };

  return (
    <ConditionalState
      state={
        toolState.success.success ? 'success' :
        toolState.error.hasError ? 'error' :
        toolState.processing.isProcessing ? 'loading' :
        !toolState.file.file ? 'empty' :
        'idle'
      }
      loadingMessage="Compressing..."
      loadingProgress={toolState.processing.progress}
      errorMessage={toolState.error.error}
      errorCategory={toolState.error.errorCategory}
      successMessage="Compression complete!"
      onRetry={() => handleCompression()}
      onReset={() => toolState.resetAll()}
    >
      {/* Idle state UI */}
      <button onClick={handleCompression}>
        Compress
      </button>
    </ConditionalState>
  );
};
`;

// ============================================================================
// PATTERN 3: Error Boundary Wrapper
// ============================================================================
/**
 * Best for: Tool page-level error protection
 * Wraps entire tool to catch unexpected errors
 */
export const ToolOperationPattern_ErrorBoundary = `
import { ToolErrorBoundary } from '@/components/ToolErrorBoundary';
import MyTool from './MyTool';

export default function ToolPage() {
  return (
    <ToolErrorBoundary toolName="My Tool">
      <MyTool />
    </ToolErrorBoundary>
  );
}
`;

// ============================================================================
// PATTERN 4: File Upload with Validation & Retry
// ============================================================================
/**
 * Best for: File-based tools (image, PDF, etc.)
 */
export const ToolOperationPattern_FileUpload = `
import { useCentralToolState } from '@/hooks/useCentralToolState';
import { validateImageFileUpload, getFirstError } from '@/lib';

const ImageTool = () => {
  const toolState = useCentralToolState();

  const handleFileSelect = async (file: File) => {
    // Validate file
    const validation = validateImageFileUpload(file);
    if (!validation.valid) {
      toolState.setError(getFirstError(validation), 'VALIDATION');
      return;
    }

    // Set file and auto-process
    toolState.setFile(file);
    await processFile(file);
  };

  const processFile = async (file: File) => {
    toolState.startProcessing();
    try {
      const result = await removeBackground(file);
      toolState.setResult(result);
    } catch (error) {
      const { category, userMessage } = categorizeError(error);
      toolState.setError(userMessage, category);
    }
  };

  return (
    <>
      {/* File upload UI */}
      {/* Processing UI */}
      {/* Result UI */}
    </>
  );
};
`;

// ============================================================================
// PATTERN 5: Operation with Manual Retry Control
// ============================================================================
/**
 * Best for: Long-running operations where user wants control
 */
export const ToolOperationPattern_ManualRetry = `
import { useToolOperation, OperationState } from '@/hooks/useToolOperation';
import { RetryPrompt } from '@/components/ToolFallbacks';

const LongOperation = () => {
  const operation = useToolOperation(
    async () => { /* long operation */ },
    { maxRetries: 3, autoReset: false }
  );

  return (
    <>
      {operation.state === OperationState.ERROR && operation.error && (
        <RetryPrompt
          error={operation.error.message}
          retryCount={operation.retryCount}
          maxRetries={3}
          onRetry={() => operation.retry()}
          onCancel={() => operation.reset()}
        />
      )}
    </>
  );
};
`;

// ============================================================================
// PATTERN 6: Progress Tracking
// ============================================================================
/**
 * Best for: Operations with known progress steps
 */
export const ToolOperationPattern_Progress = `
import { useCentralToolState } from '@/hooks/useCentralToolState';

const ProgressTool = () => {
  const toolState = useCentralToolState();

  const handleOperation = async () => {
    toolState.startProcessing();
    
    try {
      // Step 1: 25%
      toolState.setProgress(25);
      await step1();

      // Step 2: 50%
      toolState.setProgress(50);
      await step2();

      // Step 3: 75%
      toolState.setProgress(75);
      await step3();

      // Complete: 100%
      toolState.setProgress(100);
      toolState.setSuccess('Complete!');
    } catch (error) {
      toolState.setError(error.message);
    }
  };
};
`;

// ============================================================================
// ERROR HANDLING BEST PRACTICES
// ============================================================================
export const ErrorHandlingBestPractices = `
1. ALWAYS validate inputs before processing
   - Use validation functions from @/lib/security/fileUploadValidation
   - Show validation errors immediately with 'VALIDATION' category

2. CATEGORIZE errors appropriately
   - Use categorizeError() from @/lib/errorHandler
   - Different categories get different retry strategies

3. PROVIDE retry-safe operations
   - Use useToolOperation for automatic retry logic
   - Set maxRetries based on operation type
   - Exponential backoff is automatic

4. SHOW progress for long operations
   - Use setProgress() for step-by-step feedback
   - Target 0-100% range smoothly
   - Show estimates when possible

5. GRACEFUL degradation
   - Provide fallback options (e.g., paste text if upload fails)
   - Don't force users to retry forever
   - Offer help/support links

6. RESOURCE cleanup
   - Abort operations when user navigates away
   - Clear timeouts and intervals
   - Revoke object URLs to prevent memory leaks

7. TEST edge cases
   - Empty files
   - Very large files
   - Network interruptions
   - Concurrent operations
   - Rapid retry attempts
`;

export default {
  ToolOperationPattern_Simple,
  ToolOperationPattern_Central,
  ToolOperationPattern_ErrorBoundary,
  ToolOperationPattern_FileUpload,
  ToolOperationPattern_ManualRetry,
  ToolOperationPattern_Progress,
  ErrorHandlingBestPractices,
};
