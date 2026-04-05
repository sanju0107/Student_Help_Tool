# Service Architecture Refactor Guide

**Date:** April 2, 2026  
**Status:** Ready for Implementation  
**Backwards Compatibility:** Yes - Can migrate incrementally

---

## Overview

The new service architecture provides:

✅ **Modular Services** - Separated concerns (compression, conversion, image-to-pdf)  
✅ **Background Processing** - Task queue for queuing operations  
✅ **Progress Tracking** - Real-time progress updates for long operations  
✅ **Error Handling** - Centralized error management with retry logic  
✅ **Resource Management** - Automatic cleanup and lifecycle management  
✅ **React Integration** - Hooks for easy component integration  
✅ **Ready for Workers** - Can be moved to Web Workers without code changes  

---

## Architecture

```
src/services/
├── types.ts                     # Core type definitions
├── BaseService.ts               # Base class for all services
├── TaskQueue.ts                 # Job queue for background processing
├── ServiceManager.ts            # Central manager
├── index.ts                     # Main exports
└── pdf/
    ├── PDFCompressionService.ts # PDF compression
    ├── PDFConversionService.ts  # PDF↔Word conversion
    ├── ImageToPDFService.ts     # Images→PDF conversion
    └── index.ts                 # PDF services exports

src/hooks/
└── useService.ts                # React hooks for services
    - useService()               # Generic hook
    - usePDFCompression()        # Specific hook
    - usePDFToWord()            # Specific hook
    - useWordToPDF()            # Specific hook
    - useImagesToPDF()          # Specific hook
```

---

## Migration Path

### Phase 1: Infrastructure (Complete ✅)
- [x] Create service base classes
- [x] Create PDF services
- [x] Create task queue
- [x] Create service manager
- [x] Create React hooks
- [x] Add type definitions

### Phase 2: Refactor Existing Pages (Next)
- [ ] ReducePDF.tsx → use pdfCompressionService
- [ ] PDFToWord.tsx → use pdfConversionService
- [ ] WordToPDF.tsx → use pdfConversionService
- [ ] ImageToPDF.tsx → use imageToPDFService

### Phase 3: Advanced Features (Later)
- [ ] Web Worker integration
- [ ] Service Worker integration
- [ ] Batch operations
- [ ] Operation scheduling
- [ ] Persistence layer

---

## How to Use

### Option 1: Direct Service Usage (For Advanced Cases)

```typescript
import { pdfCompressionService } from '@/services/pdf';

// Initialize once (optional, auto-initialized by hook)
await pdfCompressionService.initialize();

// Use service
const result = await pdfCompressionService.compress(
  pdfBuffer,
  { quality: 'high' },
  (progress) => console.log(`Progress: ${progress.percentage}%`)
);

if (result.success) {
  // Download or use blob
  const url = URL.createObjectURL(result.data!.blob);
  downloadFile(url, 'compressed.pdf');
} else {
  // Handle error
  console.error(result.error?.message);
}
```

### Option 2: React Hook (Recommended for Components)

```typescript
import { usePDFCompression } from '@/hooks/useService';

export function MyComponent() {
  const { data, loading, error, progress, execute } = usePDFCompression({
    onProgress: (update) => console.log(`${update.stage}: ${update.percentage}%`),
  });

  const handleCompress = async (buffer: ArrayBuffer) => {
    await execute(buffer, 'high');
  };

  return (
    <div>
      {loading && <div>Progress: {progress?.percentage}%</div>}
      {error && <div>Error: {error.message}</div>}
      {data && <button onClick={() => download(data.blob)}>Download</button>}
    </div>
  );
}
```

### Option 3: Background Task Queue

```typescript
import { globalTaskQueue } from '@/services';

// Queue a job for background processing
const jobId = await globalTaskQueue.queueJob(
  'pdf.compress',
  {
    buffer: pdfArrayBuffer,
    options: { quality: 'medium' },
  },
  { priority: 'high' }
);

// Wait for completion
const result = await globalTaskQueue.waitForJob(jobId);
console.log('Compression complete:', result);
```

---

## Before & After Examples

### Example 1: PDF Compression (ReducePDF.tsx)

#### BEFORE (Current Implementation)
```typescript
import { compressPDF, formatFileSize } from '../lib/pdfUtils';

function ReducePDF() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const processReduce = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const { blob, originalSize, compressedSize, ratio } = 
        await compressPDF(arrayBuffer, compressionLevel);
      
      const url = URL.createObjectURL(blob);
      setResult({ url, originalSize, compressedSize, ratio });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reduce PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {isProcessing && <div>Processing...</div>}
      {error && <div>{error}</div>}
      {result && <button onClick={() => download(result.url)}>Download</button>}
    </div>
  );
}
```

#### AFTER (Service Architecture)
```typescript
import { usePDFCompression } from '@/hooks/useService';

function ReducePDF() {
  const { data, loading, error, progress, execute } = usePDFCompression({
    onProgress: (update) => {
      console.log(`${update.stage}: ${update.percentage}%`);
    },
  });

  const processReduce = async () => {
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();
    await execute(arrayBuffer, compressionLevel);
  };

  return (
    <div>
      {loading && <div>Progress: {progress?.percentage}%</div>}
      {error && <div>{error.message}</div>}
      {data && <button onClick={() => download(data.blob)}>Download</button>}
    </div>
  );
}
```

**Benefits:**
- ✅ Less state management (hook handles it)
- ✅ Automatic progress tracking
- ✅ Built-in error handling
- ✅ Better type safety
- ✅ Reusable across components

### Example 2: Batch Processing (New Capability)

#### NEW with Services
```typescript
import { pdfCompressionService } from '@/services/pdf';

async function compressMultiplePDFs(files: File[]) {
  const result = await pdfCompressionService.compressBatch(files, 
    { quality: 'medium' },
    (progress) => {
      console.log(`${progress.stage}: ${progress.percentage}%`);
    }
  );

  if (result.success) {
    result.data?.forEach((compressed, index) => {
      downloadFile(compressed.blob, `compressed-${index}.pdf`);
    });
  }
}
```

---

## Implementation Steps for Each Page

### Step 1: Add Service Hook
```typescript
import { usePDFCompression } from '@/hooks/useService';

// Add at component start
const { data, loading, error, progress, execute, reset } = usePDFCompression({
  onProgress: (update) => updateUIWithProgress(update),
});
```

### Step 2: Replace Processing Logic
```typescript
// Old
const { blob } = await compressPDF(buffer, quality);

// New
await execute(buffer, quality);
// Result is in `data` state
```

### Step 3: Update UI to Use Hook State
```typescript
// Old
{isProcessing && <Spinner />}
{error && <ErrorMessage message={error} />}

// New
{loading && <ProgressBar percentage={progress?.percentage} />}
{error && <ErrorMessage message={error.message} />}
```

### Step 4: Update Result Handling
```typescript
// Old
setResult({ blob, size, ratio });

// New
// Automatically in `data` state
if (data) {
  downloadFile(data.blob, 'result.pdf');
}
```

---

## Available Hooks

### usePDFCompression()
```typescript
const { data, loading, error, progress, execute } = usePDFCompression();
await execute(pdfBuffer, 'high');
// data: CompressionResult | null
// data.blob - Compressed PDF
// data.ratio - Compression ratio
// data.originalSize, compressedSize
```

### usePDFToWord()
```typescript
const { data, loading, error, progress, execute } = usePDFToWord();
await execute(pdfBuffer);
// data: ConversionResult
// data.blob - DOCX file
// data.fileType - 'docx'
```

### useWordToPDF()
```typescript
const { data, loading, error, progress, execute } = useWordToPDF();
await execute(wordFile);
// data: ConversionResult
// data.blob - PDF file
// data.fileType - 'pdf'
```

### useImagesToPDF()
```typescript
const { data, loading, error, progress, execute } = useImagesToPDF();
await execute(imageFiles, 'A4');
// data: ImageToPDFResult
// data.blob - PDF file
// data.pageCount - Number of pages
```

---

## Service Features

### 1. Progress Tracking
```typescript
// Real-time progress updates
{
  stage: 'compressing',
  percentage: 45,
  message?: 'Compressing images...',
  estimatedRemaining?: 5000
}
```

### 2. Error Handling
```typescript
// Automatic retry with exponential backoff
{
  timeout: 300000,        // 5 minutes
  retryAttempts: 3,       // Number of retries
  retryDelay: 1000,       // Initial delay in ms
  priority: 'normal'      // 'low' | 'normal' | 'high'
}
```

### 3. Batch Operations
```typescript
// Compress multiple files
const result = await pdfCompressionService.compressBatch(files, options);
// Returns array of results with unified error handling
```

### 4. Operation Tracking
```typescript
// Check operation status
const status = pdfCompressionService.getOperationStatus(operationId);
// Returns: { id, type, status, progress, result, error }
```

---

## Configuration

### Task Queue Configuration
```typescript
const taskQueue = new TaskQueue({
  maxConcurrent: 3,       // Max parallel operations
  maxQueueSize: 1000,     // Max jobs in queue
  autoProcessQueue: true  // Auto-start processing
});
```

### Service Options
```typescript
const options = {
  quality: 'medium',      // For compression
  timeout: 300000,        // 5 minutes
  retryAttempts: 3,
  priority: 'high'
};
```

---

## Migration Checklist

### For Each Page:
- [ ] Import hook or service
- [ ] Remove old state management (isProcessing, error, result)
- [ ] Replace processing call with execute()
- [ ] Update loading UI to use hook state
- [ ] Update error UI to use hook error
- [ ] Update result UI to use hook data
- [ ] Add progress UI if applicable
- [ ] Test with normal file
- [ ] Test with large file
- [ ] Test error scenarios
- [ ] Verify no memory leaks

### Code Quality:
- [ ] No console errors
- [ ] TypeScript types correct
- [ ] Progress updates smooth
- [ ] Error messages user-friendly
- [ ] Resource cleanup on unmount
- [ ] No performance regression

---

## Advanced: Ready for Web Workers

The service architecture is designed to work with Web Workers:

```typescript
// Future: Move service to Web Worker without code changes
// const workerService = new WorkerPDFCompressionService();
// await workerService.initialize();
// const result = await workerService.compress(buffer);
```

benefits:
- ✅ Main thread stays responsive
- ✅ Same API, transparent to components
- ✅ No code changes needed
- ✅ Automatic fallback if Workers unavailable

---

## Common Patterns

### Pattern 1: Simple Processing
```typescript
const { data, loading, error, execute } = usePDFCompression();

const handleProcess = async () => {
  await execute(buffer, 'high');
};
```

### Pattern 2: With Progress Display
```typescript
const { data, loading, progress, error, execute } = usePDFCompression({
  onProgress: (update) => setProgress(update),
});

return loading ? <ProgressBar progress={progress?.percentage} /> : null;
```

### Pattern 3: Batch with Feedback
```typescript
const service = pdfCompressionService;
const result = await service.compressBatch(files, options, (progress) => {
  updateUI(`Processing: ${progress.stage} - ${progress.percentage}%`);
});
```

### Pattern 4: Error Recovery
```typescript
const { error, execute, reset } = usePDFCompression();

const handleRetry = async () => {
  reset(); // Clear error
  await execute(...);
};
```

---

## Performance Considerations

1. **Memory**: Services handle cleanup automatically
2. **Concurrency**: Task queue limits parallel operations (default: 3)
3. **Progress**: Updates batched for performance
4. **Caching**: Service caches operation results for 1 minute
5. **Cleanup**: Operations auto-removed after completion

---

## Troubleshooting

**Q: Hook doesn't seem to work?**
A: Ensure `autoInitialize: true` (default) or call initialize() manually

**Q: Progress updates not showing?**
A: Add `onProgress` callback to see updates in real-time

**Q: Service not defined?**
A: Import from `@/services` not `@/services/pdf` directly

**Q: Memory usage increasing?**
A: Call `reset()` to clear state, service cleans operation history

---

## Next Steps

1. **Test infrastructure** - Verify all services work correctly
2. **Refactor first page** - Start with ReducePDF.tsx
3. **Refactor remaining pages** - PDFToWord, WordToPDF, ImageToPDF
4. **Add tests** - Unit tests for services
5. **Document patterns** - Add examples for team
6. **Consider Web Workers** - For CPU-intensive operations

---

## Summary

The new service architecture provides a solid foundation for:
- ✅ Modular, testable PDF operations
- ✅ Easy React component integration
- ✅ Background processing capabilities
- ✅ Future Web Worker support
- ✅ Consistent error handling
- ✅ Progress tracking
- ✅ Batch operations
- ✅ Scalability

All while maintaining **backwards compatibility** with existing code.
