/**
 * Centralized Error Handling System
 * Production-ready error handling with structured logging
 * Enables graceful degradation and proper error recovery
 */

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  FILE_UPLOAD = 'FILE_UPLOAD',
  PROCESSING = 'PROCESSING',
  API = 'API',
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
  SECURITY = 'SECURITY',
  RATE_LIMIT = 'RATE_LIMIT',
}

/**
 * Application error with structured metadata
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly timestamp: number;
  public readonly context: Record<string, any>;
  public readonly userMessage: string;
  public readonly canRetry: boolean;

  constructor(options: {
    message: string;
    userMessage?: string;
    code: string;
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    context?: Record<string, any>;
    canRetry?: boolean;
    originalError?: Error;
  }) {
    super(options.message);
    this.name = 'AppError';
    this.code = options.code;
    this.category = options.category || ErrorCategory.UNKNOWN;
    this.severity = options.severity || ErrorSeverity.MEDIUM;
    this.timestamp = Date.now();
    this.context = options.context || {};
    this.userMessage = options.userMessage || options.message;
    this.canRetry = options.canRetry !== false; // Default to true

    // Preserve original error if provided
    if (options.originalError) {
      this.context.originalError = {
        message: options.originalError.message,
        stack: options.originalError.stack,
      };
    }

    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Convert to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      userMessage: this.userMessage,
      code: this.code,
      category: this.category,
      severity: this.severity,
      timestamp: this.timestamp,
      context: this.context,
      canRetry: this.canRetry,
      stack: this.stack,
    };
  }
}

/**
 * Common error factory functions
 */
export const ErrorFactory = {
  validation: (message: string, context?: Record<string, any>): AppError =>
    new AppError({
      message,
      userMessage: message,
      code: 'VALIDATION_ERROR',
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
      context,
    }),

  fileUpload: (message: string, context?: Record<string, any>): AppError =>
    new AppError({
      message,
      userMessage: message,
      code: 'FILE_UPLOAD_ERROR',
      category: ErrorCategory.FILE_UPLOAD,
      severity: ErrorSeverity.MEDIUM,
      context,
      canRetry: true,
    }),

  fileSize: (maxSizeMB: number, actualSizeMB: number): AppError =>
    new AppError({
      message: `File size (${actualSizeMB}MB) exceeds limit (${maxSizeMB}MB)`,
      userMessage: `File is too large. Maximum size is ${maxSizeMB}MB.`,
      code: 'FILE_TOO_LARGE',
      category: ErrorCategory.FILE_UPLOAD,
      severity: ErrorSeverity.LOW,
      context: { maxSizeMB, actualSizeMB },
    }),

  fileType: (filename: string, allowed: string[]): AppError =>
    new AppError({
      message: `File type not allowed: ${filename}`,
      userMessage: `File type not supported. Allowed types: ${allowed.join(', ')}`,
      code: 'FILE_TYPE_NOT_ALLOWED',
      category: ErrorCategory.FILE_UPLOAD,
      severity: ErrorSeverity.LOW,
      context: { filename, allowedTypes: allowed },
    }),

  processing: (toolName: string, message: string, context?: Record<string, any>): AppError =>
    new AppError({
      message: `${toolName}: ${message}`,
      userMessage: `Failed to process file. ${message}. Please try another file or contact support.`,
      code: 'PROCESSING_ERROR',
      category: ErrorCategory.PROCESSING,
      severity: ErrorSeverity.MEDIUM,
      context: { toolName, ...context },
      canRetry: true,
    }),

  network: (message: string, context?: Record<string, any>): AppError =>
    new AppError({
      message,
      userMessage: 'Network error. Please check your connection and try again.',
      code: 'NETWORK_ERROR',
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      context,
      canRetry: true,
    }),

  timeout: (operation: string, timeoutMs: number): AppError =>
    new AppError({
      message: `Operation timeout after ${timeoutMs}ms: ${operation}`,
      userMessage: 'This operation took too long. Please try again or with a smaller file.',
      code: 'TIMEOUT',
      category: ErrorCategory.TIMEOUT,
      severity: ErrorSeverity.HIGH,
      context: { operation, timeoutMs },
      canRetry: true,
    }),

  api: (endpoint: string, statusCode: number, message?: string): AppError =>
    new AppError({
      message: `API Error: ${endpoint} (${statusCode}) - ${message || ''}`,
      userMessage: 'Service temporarily unavailable. Please try again soon.',
      code: 'API_ERROR',
      category: ErrorCategory.API,
      severity: ErrorSeverity.HIGH,
      context: { endpoint, statusCode, message },
      canRetry: statusCode >= 500,
    }),

  rateLimit: (retryAfterSeconds?: number): AppError =>
    new AppError({
      message: `Rate limit exceeded`,
      userMessage: `Too many requests. Please wait and try again.${retryAfterSeconds ? ` Try again in ${retryAfterSeconds} seconds.` : ''}`,
      code: 'RATE_LIMIT_EXCEEDED',
      category: ErrorCategory.RATE_LIMIT,
      severity: ErrorSeverity.MEDIUM,
      context: { retryAfterSeconds },
      canRetry: true,
    }),

  security: (message: string, context?: Record<string, any>): AppError =>
    new AppError({
      message,
      userMessage: 'Invalid input detected. Please check your data and try again.',
      code: 'SECURITY_ERROR',
      category: ErrorCategory.SECURITY,
      severity: ErrorSeverity.HIGH,
      context,
      canRetry: false,
    }),

  unknown: (originalError: Error, context?: Record<string, any>): AppError =>
    new AppError({
      message: originalError.message,
      userMessage: 'An unexpected error occurred. Please try again.',
      code: 'UNKNOWN_ERROR',
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.HIGH,
      context,
      canRetry: true,
      originalError,
    }),
};

/**
 * Safe error message handler
 * Returns user-friendly message, never exposes internal details
 */
export function getUserErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Map common errors to user-friendly messages
    if (message.includes('network')) {
      return 'Network error. Please check your connection.';
    }

    if (message.includes('timeout') || message.includes('abort')) {
      return 'Operation took too long. Please try again with a smaller file.';
    }

    if (message.includes('memory') || message.includes('out of memory')) {
      return 'Operation failed: file too large for your device. Try a smaller file.';
    }

    if (message.includes('cors')) {
      return 'Service unavailable. Please try again.';
    }
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Error recovery suggestions
 */
export function getErrorRecoverySuggestion(error: AppError): string {
  switch (error.category) {
    case ErrorCategory.FILE_UPLOAD:
      return 'Try uploading a different file or check the file format.';
    case ErrorCategory.PROCESSING:
      return 'Try with a smaller or simpler file.';
    case ErrorCategory.NETWORK:
      return 'Check your internet connection and try again.';
    case ErrorCategory.TIMEOUT:
      return 'Try with a smaller file or try again later.';
    case ErrorCategory.RATE_LIMIT:
      return 'Please wait a moment and try again.';
    case ErrorCategory.API:
      return 'Our service is experiencing issues. Please try again later.';
    default:
      return 'Please refresh the page and try again.';
  }
}
