/**
 * Error Categorization & Handling Guide
 * Comprehensive reference for all error types and their handling strategies
 */

// ============================================================================
// ERROR CATEGORIES
// ============================================================================
/**
 * VALIDATION - Input validation failed
 * - User provided bad input (wrong file type, too large, etc.)
 * - Action: Reject immediately, show specific validation error
 * - Retry: Manual (user must fix input)
 * - Example: "File must be under 10MB"
 */
export const ErrorCategory_VALIDATION = `
Scenarios:
- File type mismatch
- File size exceeds limit
- Dimensions out of range
- Required field missing
- Invalid format

Handler response:
- Clear, specific error message
- Show what's required (e.g., "JPG, PNG, WebP up to 10MB")
- Don't auto-retry
`;

/**
 * API_ERROR - External API call failed
 * - API server error (5xx), rate limiting, auth failure
 * - Action: User can retry after a delay
 * - Retry: Yes, with exponential backoff
 * - Example: "API rate limit exceeded, please wait..."
 */
export const ErrorCategory_API_ERROR = `
Scenarios:
- Server returning 5xx errors
- Rate limiting (429)
- Auth token expired
- API timeout
- Invalid API response

Handler response:
- Show temporary error message
- Offer retry with exponential backoff
- Don't immediately show technical details
- Optionally suggest waiting or checking API status
`;

/**
 * NETWORK - Network connectivity issue
 * - User offline, connection unstable, timeout
 * - Action: User can retry after reconnecting
 * - Retry: Yes, manual or automatic once connection restored
 * - Example: "Connection lost, please check internet..."
 */
export const ErrorCategory_NETWORK = `
Scenarios:
- User is offline
- Request timeout
- Connection interrupted mid-operation
- DNS resolution failure
- TLS handshake failure

Handler response:
- Suggest checking internet connection
- Show retry button
- Can offer to queue operation for later
- Don't blame the user
`;

/**
 * PROCESSING - Operation processing failed
 * - Tool-specific processing error (image decode, PDF corruption, etc.)
 * - Action: Can retry if transient, reject if permanent
 * - Retry: Maybe (depends on error)
 * - Example: "Could not decode image file..."
 */
export const ErrorCategory_PROCESSING = `
Scenarios:
- Image decode failure
- PDF structure corruption
- Format conversion unsupported
- OCR engine error
- Encoding mismatch

Handler response:
- Specific processing error
- Suggest alternative formats
- Show retry if applicable
- Offer file repair suggestions
`;

/**
 * BROWSER - Browser/environment limitation
 * - Feature not available (WebGL, SharedArrayBuffer, etc.)
 * - Insufficient memory
 * - Storage quota exceeded
 * - Action: User must use different browser/device
 * - Retry: No, not available for this user
 * - Example: "This tool requires WebGL support"
 */
export const ErrorCategory_BROWSER = `
Scenarios:
- WebGL not available
- Browser storage quota full
- Insufficient memory
- SharedArrayBuffer unavailable
- Feature unsupported in this browser

Handler response:
- Suggest compatible browser
- Show alternatives (e.g., "Try Chrome, Firefox, Safari")
- Clear explanation of requirement
- No retry option
`;

/**
 * AUTH - Authentication/Authorization failure
 * - API key missing, invalid, or insufficient permissions
 * - User not authenticated
 * - Action: Request proper credentials
 * - Retry: No (need credentials first)
 * - Example: "Invalid API key. Please check settings..."
 */
export const ErrorCategory_AUTH = `
Scenarios:
- Missing API key
- Invalid API key format
- API key expired
- Insufficient permissions
- Auth token invalid

Handler response:
- Clear instruction to provide/fix credentials
- Show where to get credentials
- Don't retry without credentials
- Warn about storing sensitive data
`;

/**
 * UNKNOWN - Unexpected error
 * - Unclassified error, likely a bug
 * - Action: Log for debugging, offer to contact support
 * - Retry: Maybe, but likely won't help
 * - Example: "Unexpected error: [details]"
 */
export const ErrorCategory_UNKNOWN = `
Scenarios:
- Unhandled exception
- Unexpected return value
- Corrupted state
- Browser crash/restart
- Out of memory

Handler response:
- Log error details
- Show user-friendly message
- Offer to contact support
- Can offer retry if it might be transient
- Collect error context for debugging
`;

// ============================================================================
// ERROR HANDLING DECISION TREE
// ============================================================================
export const ErrorHandlingDecisionTree = `
1. VALIDATION ERROR?
   ├─ Yes → Show specific error, no retry
   └─ No → Continue

2. API ERROR (service unavailable)?
   ├─ Yes → Show "Service temporarily unavailable", offer retry with backoff
   └─ No → Continue

3. NETWORK ERROR (offline/timeout)?
   ├─ Yes → Show "Connection lost", check internet suggestion, offer retry
   └─ No → Continue

4. PROCESSING ERROR (file corruption, unsupported format)?
   ├─ Yes → Show specific error, suggest alternatives
   ├─ Transient? → Offer retry
   └─ Permanent? → No retry
   
5. BROWSER LIMITATION?
   ├─ Yes → Show browser requirement, suggest alternatives
   └─ No → Continue

6. AUTH ERROR (missing/invalid credentials)?
   ├─ Yes → Show credential error, guide to fix
   └─ No → Continue

7. UNKNOWN ERROR
   ├─ Log all context
   ├─ Show generic friendly message
   ├─ Offer support contact
   └─ Can offer retry as fallback
`;

// ============================================================================
// RETRY STRATEGIES
// ============================================================================
export const RetryStrategies = `
IMMEDIATE RETRY (No delay)
└─ For quick, deterministic operations
└─ Use when: Input validation fixes, formatting issues
└─ Max attempts: 2-3

EXPONENTIAL BACKOFF (1s, 2s, 4s, 8s...)
└─ For transient network/API errors
└─ Use when: API rate limiting, temporary service issues
└─ Max attempts: 3-4
└─ Base delay: 1000ms, multiplier: 2

LINEAR BACKOFF (1s, 2s, 3s, 4s...)
└─ For resource contention
└─ Use when: Browser memory, processing queue
└─ Max attempts: 3

MANUAL RETRY (User initiated)
└─ For complex operations
└─ Use when: User wants control over retries
└─ Max attempts: Unlimited (user decides)
└─ Feedback: Show retry count
`;

// ============================================================================
// ERROR MESSAGING EXAMPLES
// ============================================================================
export const ErrorMessagingExamples = {
  validation: {
    fileTooLarge: "File is too large. Maximum size is 10MB. Your file is {size}MB.",
    wrongType: "File type not supported. Accepted formats: JPG, PNG, WebP",
    dimensionsTooSmall: "Image must be at least 400x300 pixels. Yours is {width}x{height}.",
  },
  api: {
    rateLimited: "Request limit exceeded. Please wait a moment before trying again.",
    serverError: "Service temporarily unavailable. Please try again in a moment.",
    authInvalid: "API authentication failed. Please check your API key in settings.",
  },
  network: {
    offline: "You appear to be offline. Please check your internet connection.",
    timeout: "Request took too long. Please check your connection and try again.",
  },
  processing: {
    corruptImage: "Image file appears to be corrupted. Please try a different file.",
    unsupportedFormat: "This image format is not supported. Try converting it first.",
  },
  browser: {
    noWebGL: "This tool requires WebGL support. Please use Chrome, Firefox, or Safari.",
    quotaExceeded: "Browser storage is full. Please clear some data and try again.",
  },
};

// ============================================================================
// COMMON PATTERNS
// ============================================================================
export const CommonPatterns = {
  /**
   * Transient vs Permanent Error Detection
   */
  isTransientError: (error: any): boolean => {
    const status = error.status || error.statusCode;
    // 429 (rate limit), 500+ (server error), network timeouts
    return status === 429 || (status >= 500 && status < 600) || error.name === 'TimeoutError';
  },

  /**
   * Retry-safe operations (idempotent)
   * - Same result on repeated execution
   * - No side effects from retries
   * - OK to retry automatically
   */
  isRetrySafe: (operationType: string): boolean => {
    const safeOps = ['image_process', 'pdf_read', 'convert', 'analyze'];
    return safeOps.includes(operationType);
  },

  /**
   * User-facing error message construction
   */
  buildUserMessage: (category: string, context: any): string => {
    const messages: Record<string, string> = {
      VALIDATION: `Invalid input: ${context.field} - ${context.reason}`,
      API_ERROR: `Service error: ${context.service}. Please try again.`,
      NETWORK: 'Network interrupted. Please check your connection.',
      PROCESSING: `Could not process file: ${context.reason}`,
      BROWSER: `Your browser doesn't support this feature.`,
      AUTH: 'Authentication failed. Please check your credentials.',
      UNKNOWN: 'An unexpected error occurred. Please try again.',
    };
    return messages[category] || 'An error occurred.';
  },
};

export default {
  ErrorCategory_VALIDATION,
  ErrorCategory_API_ERROR,
  ErrorCategory_NETWORK,
  ErrorCategory_PROCESSING,
  ErrorCategory_BROWSER,
  ErrorCategory_AUTH,
  ErrorCategory_UNKNOWN,
  ErrorHandlingDecisionTree,
  RetryStrategies,
  ErrorMessagingExamples,
  CommonPatterns,
};
