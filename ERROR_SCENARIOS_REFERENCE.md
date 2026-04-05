# Error Handling Scenario Reference

## Common Error Scenarios & Solutions

This document provides ready-to-use solutions for common error scenarios.

---

## Scenario 1: File Upload Fails - Wrong Type

**When it happens:** User selects a .pdf but tool expects .jpg

**Code:**
```tsx
const handleFileSelect = (file: File) => {
  const validation = validateImageFileUpload(file);
  
  if (!validation.valid) {
    const error = validation.errors[0];
    // User sees: "File type not supported. Accepted: JPG, PNG, WebP"
    toolState.setError(error.message, 'VALIDATION');
    return;
  }
  
  processFile(file);
};
```

**User sees:**
- Error message: "File type not supported. Accepted: JPG, PNG, WebP"
- No retry button (can't retry with same file)
- Solution: Select a different file

---

## Scenario 2: File Upload Fails - Too Large

**When it happens:** User uploads 50MB image but limit is 10MB

**Code:**
```tsx
const validateFileSize = (file: File) => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `File is too large. Max: 10MB, Yours: ${(file.size / 1024 / 1024).toFixed(1)}MB`
    };
  }
  
  return { valid: true };
};
```

**User sees:**
- Error: "File is too large. Max: 10MB, Yours: 45.2MB"
- No retry button
- Solution: Compress file first or select different file

---

## Scenario 3: API Rate Limiting

**When it happens:** User or another user exceeded API quota

**Code:**
```tsx
const handleAPICall = async () => {
  toolState.startProcessing();
  
  try {
    const result = await api.process(file);
    toolState.setResult(result);
  } catch (error) {
    const { category, userMessage } = categorizeError(error);
    toolState.setError(userMessage, category);
    // categorizeError detects 429 status and returns:
    // category: 'API_ERROR'
    // userMessage: 'Too many requests. Please wait a moment and try again.'
  }
};
```

**User sees:**
- Error: "Too many requests. Please wait a moment and try again"
- Retry button appears
- If they click retry: auto-waits 1-2 seconds, then retries

---

## Scenario 4: Network Connection Lost Mid-Operation

**When it happens:** User's wifi drops during processing

**Code:**
```tsx
const handleNetworkError = async () => {
  try {
    const result = await uploadLargeFile(file);
  } catch (error) {
    if (error.name === 'TimeoutError' || navigator.onLine === false) {
      // categorizeError returns:
      // category: 'NETWORK'
      // userMessage: 'Connection lost. Please check your internet.'
      toolState.setError('Connection lost. Check internet and try again', 'NETWORK');
    }
  }
};
```

**User sees:**
- Error: "Connection lost. Check internet and try again"
- Retry button appears
- If they click retry after reconnecting: works!

---

## Scenario 5: Corrupted Image File

**When it happens:** File claims to be .jpg but is actually corrupted data

**Code:**
```tsx
const loadAndValidateImage = async (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onerror = () => {
        // categorizeError detects Image load error:
        // category: 'PROCESSING'
        // userMessage: 'Could not read image. File may be corrupted.'
        reject(new Error('Could not decode image'));
      };
      
      img.onload = () => resolve(img);
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(file);
  });
};
```

**User sees:**
- Error: "Could not read image. File may be corrupted"
- Can retry (maybe it's transient)
- Or select different file

---

## Scenario 6: Browser Doesn't Support WebGL (for image processing)

**When it happens:** User opens tool in older browser

**Code:**
```tsx
const checkWebGLSupport = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
  
  if (!gl) {
    // categorizeError returns:
    // category: 'BROWSER'
    // userMessage: 'This tool requires WebGL. Try Chrome, Firefox, or Safari.'
    throw new Error('WebGL not supported');
  }
};

const handleProcess = async () => {
  try {
    checkWebGLSupport();
    // Process with WebGL
  } catch (error) {
    const { category, userMessage } = categorizeError(error);
    toolState.setError(userMessage, category);
    // No retry button (browser limitation)
  }
};
```

**User sees:**
- Error: "This tool requires WebGL. Try Chrome, Firefox, or Safari"
- No retry button
- Solution: Use different browser

---

## Scenario 7: Missing or Invalid API Key

**When it happens:** API key was deleted or is malformed

**Code:**
```tsx
const handleAPIKeyError = async () => {
  try {
    const result = await api.callWithKey(apiKey);
  } catch (error) {
    if (error.status === 401 || error.message.includes('API key')) {
      // categorizeError returns:
      // category: 'AUTH'
      // userMessage: 'Invalid API key. Please check your settings.'
      toolState.setError('Please check your API key in settings', 'AUTH');
    }
  }
};
```

**User sees:**
- Error: "Please check your API key in settings"
- No retry button
- Solution: Go to settings, fix API key, try again

---

## Scenario 8: Unexpected Server Error (500)

**When it happens:** Server crashes while processing

**Code:**
```tsx
const handleUnexpectedError = async () => {
  try {
    const result = await api.process(file);
  } catch (error) {
    if (error.status === 500) {
      // categorizeError returns:
      // category: 'API_ERROR'
      // userMessage: 'Server error. Please try again.'
      // canRetry: true (might be transient)
      toolState.setError('Server error. Try again?', 'API_ERROR');
    }
  }
};
```

**User sees:**
- Error: "Server error. Try again?"
- Retry button appears (after 1 second backoff)
- If retries fail: suggest contacting support

---

## Scenario 9: Out of Memory

**When it happens:** Browser runs out of memory during processing

**Code:**
```tsx
const handleMemoryError = async () => {
  try {
    const largeArray = new Array(1000000000); // Too large!
  } catch (error) {
    if (error instanceof RangeError) {
      // categorizeError returns:
      // category: 'BROWSER'
      // userMessage: 'Browser memory limit reached. Try a smaller file.'
      toolState.setError('File too large for this browser. Try smaller file.', 'BROWSER');
    }
  }
};
```

**User sees:**
- Error: "File too large for this browser. Try smaller file"
- Can retry with smaller file
- Or switch to different browser

---

## Scenario 10: Timeout (Operation Takes Too Long)

**When it happens:** Network is slow or server is slow

**Code:**
```tsx
const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Operation timeout')), ms)
  );
  return Promise.race([promise, timeout]);
};

const handleSlowOperation = async () => {
  try {
    const result = await withTimeout(api.process(file), 30000); // 30s timeout
  } catch (error) {
    if (error.name === 'TimeoutError') {
      // categorizeError returns:
      // category: 'NETWORK' 
      // userMessage: 'Operation timed out. Check internet and try again.'
      toolState.setError('Taking too long. Check connection and retry?', 'NETWORK');
    }
  }
};
```

**User sees:**
- Error: "Taking too long. Check connection and retry?"
- Retry button appears
- Suggestion: check internet speed

---

## Error Categorization Flowchart

```
Error Occurred
    ↓
Is it a validation error?
├─ Yes → Show specific error, NO retry
└─ No ↓
Is it a network error? (timeout, offline)
├─ Yes → Show network error, offer MANUAL retry
└─ No ↓
Is it a 5xx API error?
├─ Yes → Show service error, AUTO-retry with backoff
└─ No ↓
Is it a rate limit (429)?
├─ Yes → Show rate limit error, AUTO-retry with 2s+ delay
└─ No ↓
Is it an auth error?
├─ Yes → Show auth error, NO retry (need new credentials)
└─ No ↓
Is it a processing error?
├─ Yes → Show processing error, maybe retry
└─ No ↓
Is it a browser limitation?
├─ Yes → Show browser requirement, NO retry
└─ No ↓
Unknown error → Log everything, show generic message, offer support
```

---

## Implementation Checklist

- [ ] Validate all inputs before processing
- [ ] Catch errors during API calls
- [ ] Use `categorizeError()` to classify errors
- [ ] Show user-friendly error messages (not technical details)
- [ ] Provide retry button for transient errors
- [ ] Show progress for long operations
- [ ] Clean up resources (revoke URLs, abort requests)
- [ ] Test with network disconnected
- [ ] Test with API key removed
- [ ] Test with very large files
- [ ] Test with corrupted files
- [ ] Test on different browsers
- [ ] Wrap pages in ErrorBoundary

---

## Error Message Template

**For validation errors:**
```
"[Field] is invalid. [Specific requirement]. Current: [actual value]"
Example: "File is too large. Max: 10MB. Yours: 45MB."
```

**For network errors:**
```
"[Operation] interrupted. [Suggestion]. Try again?"
Example: "Connection lost. Please check internet. Try again?"
```

**For API errors:**
```
"[Service] error. [Suggestion]. Try again?"
Example: "Server error. Please try again?"
```

**For browser limitations:**
```
"This tool requires [feature]. Try [browser options]."
Example: "Requires WebGL. Try Chrome, Firefox, or Safari."
```

---

## Resources

- Main error handler: `src/lib/errorHandler.ts`
- Categorization logic: `src/lib/errorHandler.ts` → `categorizeError()`
- State management: `src/hooks/useToolOperation.ts`, `useCentralToolState.ts`
- UI components: `src/components/ToolFallbacks.tsx`
