# Tool Development Checklist

Use this checklist when building or updating tools to ensure consistent error handling and user experience.

## Pre-Development

- [ ] Review related tool implementations
- [ ] Identify required file types/inputs
- [ ] Determine expected processing time
- [ ] Plan error scenarios specific to this tool
- [ ] Choose state management: Simple (`useToolOperation`) or Complex (`useCentralToolState`)

## File Input Handling

- [ ] Implement file validation (type, size, dimensions)
- [ ] Use built-in validators from `src/lib/security/fileUploadValidation`
- [ ] Show validation errors immediately (category: `VALIDATION`)
- [ ] Prevent file processing if validation fails
- [ ] Handle file selection UX (accept attribute, drag-drop, paste)
- [ ] Show file preview or confirmation before processing
- [ ] Validate again before actual processing (belt-and-suspenders)

## Processing Logic

- [ ] Break processing into 3-5 steps for progress tracking
- [ ] Update progress at each step (0%, 25%, 50%, 75%, 100%)
- [ ] Show meaningful loading message ("Uploading...", "Processing...", "Finalizing...")
- [ ] Set timeouts for long-running operations
- [ ] Handle operation cancellation (user navigates away)
- [ ] Clean up resources (revoke URLs, abort requests, clear timers)

## Error Handling

- [ ] Wrap all try-catch blocks with proper error handling
- [ ] Use `categorizeError()` to determine error category
- [ ] Show user-friendly error messages (not technical details)
- [ ] Implement appropriate retry strategies:
  - [ ] Validation errors: No automatic retry
  - [ ] Network errors: Manual retry with suggestion to check internet
  - [ ] API errors: Auto-retry with exponential backoff
  - [ ] Rate limiting: Auto-retry with 2+ second delay
  - [ ] Processing errors: Manual retry or no retry
  - [ ] Browser limitations: No retry (different browser)
  - [ ] Auth errors: No retry (need credentials)

## State Management

### Using `useToolOperation`:
- [ ] Define operation action
- [ ] Set maxRetries (typically 2-3)
- [ ] Implement onSuccess callback
- [ ] Implement onError callback
- [ ] Handle loading state with progress/spinner
- [ ] Handle error state with message and retry button
- [ ] Handle success state with confirmation
- [ ] Show reset/try-again option

### Using `useCentralToolState`:
- [ ] Call `toolState.startProcessing()` when operation begins
- [ ] Call `toolState.setProgress(percentage)` at each step
- [ ] Call `toolState.setError(message, category)` on error
- [ ] Call `toolState.setResult(blob, url, name, size)` on success
- [ ] Call `toolState.resetAll()` when user wants to start over
- [ ] Map toolState to appropriate UI state
- [ ] Show progress in UI during processing
- [ ] Show result download/preview options on success

## UI/UX

- [ ] Show clear instructions for file input
- [ ] Display file size limits
- [ ] Show accepted file formats
- [ ] Provide visual feedback during processing
- [ ] Show progress percentage or steps completed
- [ ] Display helpful error messages (not technical jargon)
- [ ] Provide retry button for transient errors
- [ ] Provide reset button to try again with different file
- [ ] Show success confirmation with download option
- [ ] Disable inputs during processing (prevent double-submit)

## Error Boundary

- [ ] Wrap tool page in `<ToolErrorBoundary toolName="Tool Name">`
- [ ] Catches unexpected runtime errors
- [ ] Prevents entire app crash
- [ ] Shows fallback UI with error details

## Testing

- [ ] Test with valid file
- [ ] Test file type validation (wrong type)
- [ ] Test file size validation (too large)
- [ ] Test file dimensions validation (too small/large)
- [ ] Test corrupted/invalid file content
- [ ] Test network disconnection mid-operation
- [ ] Simulate API timeout
- [ ] Simulate API rate limiting (429)
- [ ] Simulate API server error (500)
- [ ] Test missing/invalid API key (401)
- [ ] Test rapid consecutive operations
- [ ] Test navigation away during processing
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on different devices (desktop, tablet, mobile)
- [ ] Test with slow network (DevTools throttling)
- [ ] Test browser storage quota exceeded
- [ ] Test browser memory limits (very large files)

## Performance

- [ ] File operations don't block UI (use workers if possible)
- [ ] Progress updates at reasonable frequency (not too many)
- [ ] Memory is cleaned up after operation completes
- [ ] Object URLs are revoked (`URL.revokeObjectURL`)
- [ ] Event listeners are removed on unmount
- [ ] No memory leaks on repeated use
- [ ] Large file operations are handled efficiently

## Accessibility

- [ ] Error messages are read by screen readers
- [ ] Retry/cancel buttons are keyboard accessible
- [ ] Color alone isn't used to convey error state (use text too)
- [ ] Loading spinner has aria-label
- [ ] File input has proper label
- [ ] Success message is announced to screen readers

## Documentation

- [ ] Code comments explain complex logic
- [ ] Error messages are clear and specific
- [ ] User instructions are in English, clear language
- [ ] Support contact info is provided for persistent errors
- [ ] Tool usage guide is in README or tool component

## Deployment

- [ ] All tests pass
- [ ] No console errors
- [ ] API keys are not exposed in client code
- [ ] Sensitive errors are logged server-side, not shown to user
- [ ] Tool works in production environment
- [ ] Error reporting is working (Sentry, etc.)
- [ ] Performance monitoring is set up

## Post-Launch Monitoring

- [ ] Monitor error logs for common issues
- [ ] Track error rates by category
- [ ] Look for patterns in user-reported issues
- [ ] Update error messages based on user feedback
- [ ] Improve retry logic based on success rates
- [ ] Optimize performance based on usage patterns

---

## Quick Reference

**File Validation:**
```tsx
import { validateImageFileUpload } from '@/lib/security/fileUploadValidation';

const result = validateImageFileUpload(file);
if (!result.valid) {
  toolState.setError(result.errors[0].message, 'VALIDATION');
}
```

**Error Categorization:**
```tsx
import { categorizeError } from '@/lib/errorHandler';

const { category, userMessage, canRetry } = categorizeError(error);
toolState.setError(userMessage, category);
```

**Simple Tool (useToolOperation):**
```tsx
const operation = useToolOperation(async () => {
  // Your operation
}, { maxRetries: 2 });
```

**Complex Tool (useCentralToolState):**
```tsx
toolState.startProcessing();
toolState.setProgress(25);
// ... process ...
toolState.setResult(blob, url, name, size);
```

**Error Boundary:**
```tsx
<ToolErrorBoundary toolName="My Tool">
  <MyTool />
</ToolErrorBoundary>
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Error doesn't display | Check that `toolState.setError()` is called with correct category |
| Retry button doesn't appear | Ensure error category allows retry (check `errorHandlingGuide.ts`) |
| Progress doesn't update | Call `toolState.setProgress(n)` during processing |
| Operation never completes | Ensure `toolState.setResult()` is called on success |
| File selection loops | Validate before calling `toolState.setFile()` |
| Memory leaks | Revoke URLs: `URL.revokeObjectURL(url)` |
| Timeout too short | Increase timeout for slower operations |
| Misleading error messages | Use `categorizeError()` for consistent messaging |

---

## Related Documentation

- Patterns: `TOOL_OPERATION_PATTERNS.md`
- Error Handling Guide: `ERROR_HANDLING_GUIDE.md`
- Error Scenarios: `ERROR_SCENARIOS_REFERENCE.md`
- Implementation Guide: `TOOL_IMPLEMENTATION_GUIDE.md`
- Validation Patterns: `src/lib/validationPatterns.ts`
- Hooks Reference: `src/hooks/`
- Components Reference: `src/components/ToolFallbacks.tsx`

---

## Tool Examples

Refer to these well-implemented tools as examples:
- Image Compressor (`src/pages/ImageCompressor.tsx`)
- Background Remover (`src/pages/BackgroundRemover.tsx`)
- Merge PDF (`src/pages/MergePDF.tsx`)
- OCR Tool (`src/pages/OCRTool.tsx`)
