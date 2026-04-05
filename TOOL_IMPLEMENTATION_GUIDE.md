# Tool Operation Implementation Guide

## Quick Start

This guide shows you how to implement error handling, validation, and state management in your tools.

## Step 1: Choose Your State Management Approach

### Simple Operations (Recommended for Most Tools)
Use `useToolOperation` for single-step operations:
- File uploads
- Format conversions
- API calls
- Quick processing

**When to use:**
- Operation starts → processes → finishes
- Single file input
- Binary success/failure

### Complex Operations (Multi-Step)
Use `useCentralToolState` for multi-step workflows:
- Image compression (upload → process → download)
- PDF operations (upload → identify → process → output)
- Advanced conversions

**When to use:**
- Multiple processing stages
- Need to show progress
- File + results handling
- User might want to try another file

### Error Boundary (Always Wrap)
Wrap your tool page in `<ToolErrorBoundary>` to catch unexpected errors and prevent the entire app from crashing.

---

## Step 2: Validate Inputs

### File Validation Examples

**Image Upload:**
```tsx
import { validateImageFileUpload, getFirstError } from '@/lib';

const handleFileSelect = (file: File) => {
  const validation = validateImageFileUpload(file);
  
  if (!validation.valid) {
    const error = getFirstError(validation);
    toolState.setError(error, 'VALIDATION');
    return;
  }
  
  // Proceed with file processing...
};
```

**PDF Upload:**
```tsx
import { validatePDFFile } from '@/lib/security/fileUploadValidation';

const handlePDFSelect = (file: File) => {
  const validation = validatePDFFile(file);
  
  if (!validation.valid) {
    // Handle error
  }
};
```

**Multiple Custom Checks:**
```tsx
const validateCustomFile = (file: File) => {
  // Check 1: Type
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    return { valid: false, error: 'JPG or PNG only' };
  }
  
  // Check 2: Size
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'Max 5MB' };
  }
  
  // Check 3: Name
  if (!/^[\w\s.-]+$/.test(file.name)) {
    return { valid: false, error: 'File name has invalid characters' };
  }
  
  return { valid: true };
};
```

---

## Step 3: Implement Processing with Error Handling

```tsx
import { useCentralToolState } from '@/hooks/useCentralToolState';
import { categorizeError } from '@/lib';

const MyTool = () => {
  const toolState = useCentralToolState();

  const handleProcess = async () => {
    // Ensure file is selected
    if (!toolState.file.file) {
      toolState.setError('Please select a file first', 'VALIDATION');
      return;
    }

    // Start processing
    toolState.startProcessing();
    
    try {
      // Step 1 (25%)
      toolState.setProgress(25);
      const step1Result = await processStep1(toolState.file.file);

      // Step 2 (50%)
      toolState.setProgress(50);
      const step2Result = await processStep2(step1Result);

      // Step 3 (75%)
      toolState.setProgress(75);
      const step3Result = await processStep3(step2Result);

      // Complete (100%)
      toolState.setProgress(100);

      // Set result with output file/URL
      const outputUrl = URL.createObjectURL(step3Result.blob);
      const outputSize = step3Result.blob.size;
      const outputName = 'output.jpg';

      toolState.setResult(
        step3Result.blob,
        outputUrl,
        outputName,
        outputSize
      );

    } catch (error) {
      // Categorize the error for proper handling
      const { category, userMessage } = categorizeError(error);
      
      // Show error to user
      toolState.setError(userMessage, category);
    }
  };

  return (
    // UI with toolState...
  );
};
```

---

## Step 4: Handle Different Error Types

```tsx
import { categorizeError } from '@/lib';

const handleOperation = async () => {
  try {
    const result = await someOperation();
    // Success
  } catch (error) {
    const { category, userMessage, canRetry } = categorizeError(error);

    switch (category) {
      case 'VALIDATION':
        // Show validation error - no retry
        toolState.setError(userMessage, 'VALIDATION');
        break;

      case 'API_ERROR':
        // Show API error - can retry
        toolState.setError(userMessage, 'API_ERROR');
        // Retry logic is in useToolOperation hook
        break;

      case 'NETWORK':
        // Network error - check connection
        toolState.setError(userMessage, 'NETWORK');
        break;

      case 'PROCESSING':
        // Tool-specific error
        toolState.setError(userMessage, 'PROCESSING');
        break;

      case 'BROWSER':
        // Browser limitation - no retry
        toolState.setError(userMessage, 'BROWSER');
        break;

      case 'AUTH':
        // Authentication issue
        toolState.setError(userMessage, 'AUTH');
        break;

      default:
        toolState.setError('An unexpected error occurred', 'UNKNOWN');
    }
  }
};
```

---

## Step 5: Implement With Hooks

### For Simple Operations

```tsx
import { useToolOperation, OperationState } from '@/hooks/useToolOperation';

const SimpleTool = () => {
  const operation = useToolOperation(
    async () => {
      // Your operation
      return await processFile(file);
    },
    {
      maxRetries: 2,
      autoReset: true,
      onSuccess: () => console.log('Done!'),
    }
  );

  if (operation.state === OperationState.LOADING) {
    return <LoadingState message="Processing..." />;
  }

  if (operation.state === OperationState.ERROR) {
    return (
      <ErrorDisplay
        error={operation.error?.message}
        category={operation.error?.category}
        onRetry={() => operation.retry()}
      />
    );
  }

  if (operation.state === OperationState.SUCCESS) {
    return <SuccessState message="Complete!" />;
  }

  return (
    <button onClick={() => operation.execute()}>
      Start
    </button>
  );
};
```

### For Complex Operations

```tsx
import { useCentralToolState } from '@/hooks/useCentralToolState';
import { ConditionalState } from '@/components/ToolFallbacks';

const ComplexTool = () => {
  const toolState = useCentralToolState();

  const getState = () => {
    if (toolState.success.success) return 'success';
    if (toolState.error.hasError) return 'error';
    if (toolState.processing.isProcessing) return 'loading';
    if (!toolState.file.file) return 'empty';
    return 'idle';
  };

  return (
    <ConditionalState
      state={getState()}
      loadingMessage="Processing..."
      loadingProgress={toolState.processing.progress}
      errorMessage={toolState.error.error}
      errorCategory={toolState.error.errorCategory}
      errorCanRetry={toolState.error.canRetry}
      successMessage="Done!"
      onRetry={() => handleProcess()}
      onReset={() => toolState.resetAll()}
    >
      {/* Idle/empty state UI */}
    </ConditionalState>
  );
};
```

---

## Step 6: Build the UI

```tsx
export default function MyToolPage() {
  return (
    <ToolErrorBoundary toolName="My Tool">
      <MyTool />
    </ToolErrorBoundary>
  );
}
```

---

## Complete Real-World Example

Here's a complete image compression tool implementation:

```tsx
import { useCentralToolState } from '@/hooks/useCentralToolState';
import { categorizeError } from '@/lib';
import { validateImageFileUpload } from '@/lib/security/fileUploadValidation';
import { ConditionalState } from '@/components/ToolFallbacks';

const ImageCompressor = () => {
  const toolState = useCentralToolState();

  const handleFileSelect = async (file: File) => {
    // Validate
    const validation = validateImageFileUpload(file);
    if (!validation.valid) {
      toolState.setError(validation.errors[0].message, 'VALIDATION');
      return;
    }

    // Set file
    toolState.setFile(file);

    // Auto-start processing
    await handleCompress(file);
  };

  const handleCompress = async (file: File) => {
    toolState.startProcessing();
    
    try {
      // Step 1: Load image (25%)
      toolState.setProgress(25);
      const canvas = await loadImage(file);

      // Step 2: Compress (50%)
      toolState.setProgress(50);
      const compressed = await compressCanvas(canvas);

      // Step 3: Encode (75%)
      toolState.setProgress(75);
      const blob = await canvasToBlob(compressed);

      // Step 4: Complete (100%)
      toolState.setProgress(100);
      const url = URL.createObjectURL(blob);
      
      const originalSize = file.size;
      const compressedSize = blob.size;
      const reduction = Math.round((1 - compressedSize / originalSize) * 100);

      toolState.setResult(
        blob,
        url,
        'compressed.' + file.name.split('.').pop(),
        compressedSize,
        { reduction, original: originalSize }
      );

    } catch (error) {
      const { category, userMessage } = categorizeError(error);
      toolState.setError(userMessage, category);
    }
  };

  const getState = () => {
    if (toolState.success.success) return 'success';
    if (toolState.error.hasError) return 'error';
    if (toolState.processing.isProcessing) return 'loading';
    if (!toolState.file.file) return 'empty';
    return 'idle';
  };

  return (
    <ConditionalState
      state={getState()}
      loadingMessage="Compressing image..."
      loadingProgress={toolState.processing.progress}
      errorMessage={toolState.error.error}
      errorCategory={toolState.error.errorCategory}
      successMessage="Compression complete!"
      onRetry={() => toolState.file.file && handleCompress(toolState.file.file)}
      onReset={() => toolState.resetAll()}
    >
      <div className="file-upload">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />
      </div>
    </ConditionalState>
  );
};

export default ImageCompressor;
```

---

## Common Pitfalls & Solutions

| Problem | Solution |
|---------|----------|
| Error doesn't show to user | Ensure you're calling `toolState.setError()` or `operation.error` is set |
| Retry button doesn't work | Check that error has `category` set and `canRetry` is true |
| Progress doesn't update | Use `toolState.setProgress(percentage)` during processing |
| File selection loops | Validate file BEFORE setting it with `toolState.setFile()` |
| Memory leak from URLs | Always revoke with `URL.revokeObjectURL()` |
| Operation never completes | Ensure `toolState.setResult()` or `operation.success` is called |

---

## Key Takeaways

1. **Always validate inputs first** - Prevent bad data from entering processing
2. **Show progress for long operations** - Helps users understand what's happening
3. **Categorize errors properly** - Determines retry strategy and messaging
4. **Clean up resources** - Revoke object URLs and abort operations on unmount
5. **Test edge cases** - Empty files, timeouts, rapid retries
6. **Wrap pages in ErrorBoundary** - Catch unexpected errors before they crash
7. **Provide helpful messages** - Users should understand what went wrong

---

## Resources

- Pattern Examples: `src/lib/toolOperationPatterns.ts`
- Error Handling: `src/lib/errorHandlingGuide.ts`
- Validation Patterns: `src/lib/validationPatterns.ts`
- Hooks: `src/hooks/useToolOperation.ts`, `useCentralToolState.ts`
- Components: `src/components/ToolFallbacks.tsx`, `ToolErrorBoundary.tsx`
