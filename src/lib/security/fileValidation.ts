/**
 * File Upload Security Utilities
 * Validates and sanitizes file uploads for production safety
 * Prevents malicious files, oversized uploads, and mismatched content
 */

/**
 * Allowed MIME types by category
 * Maps user-friendly types to MIME types
 */
const ALLOWED_MIMES = {
  pdf: ['application/pdf'],
  image: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
  ],
  docx: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword', // older .doc files
  ],
  doc: ['application/msword'],
  text: ['text/plain', 'text/csv'],
  word: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ],
};

const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  pdf: ['pdf'],
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'],
  docx: ['docx'],
  doc: ['doc'],
  text: ['txt', 'csv'],
  word: ['docx', 'doc'],
};

/**
 * File size limits (in bytes)
 * Configure based on your infrastructure
 */
export const FILE_SIZE_LIMITS = {
  image: 50 * 1024 * 1024, // 50MB
  pdf: 100 * 1024 * 1024, // 100MB
  docx: 50 * 1024 * 1024, // 50MB
  doc: 50 * 1024 * 1024, // 50MB
  text: 10 * 1024 * 1024, // 10MB
  default: 100 * 1024 * 1024, // 100MB default
};

/**
 * Get MIME types for category
 */
export function getAllowedMimes(category: keyof typeof ALLOWED_MIMES): string[] {
  return ALLOWED_MIMES[category] || [];
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Validate file extension
 */
export function validateFileExtension(
  filename: string,
  allowedExtensions: string[]
): { valid: boolean; error?: string } {
  if (!filename) {
    return { valid: false, error: 'Filename is required' };
  }

  const ext = getFileExtension(filename);

  if (!ext) {
    return { valid: false, error: 'File must have an extension' };
  }

  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File type .${ext} is not allowed. Allowed types: ${allowedExtensions.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Validate MIME type
 * Note: MIME type can be spoofed, so always validate extension too
 */
export function validateMimeType(
  file: File,
  allowedMimes: string[]
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'File is required' };
  }

  if (!allowedMimes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed`,
    };
  }

  return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(
  file: File,
  maxSizeBytes: number
): { valid: boolean; error?: string; sizeInfo?: { bytes: number; mb: number } } {
  if (!file) {
    return { valid: false, error: 'File is required' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  if (file.size > maxSizeBytes) {
    const maxMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    const fileMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${fileMB}MB) exceeds maximum allowed size (${maxMB}MB)`,
      sizeInfo: { bytes: file.size, mb: parseFloat(fileMB) },
    };
  }

  return { valid: true, sizeInfo: { bytes: file.size, mb: file.size / (1024 * 1024) } };
}

/**
 * Comprehensive file validation
 * Checks extension, MIME type, and file size
 */
export function validateFile(
  file: File,
  options: {
    allowedExtensions: string[];
    allowedMimes: string[];
    maxSize: number;
  }
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate extension
  const extValidation = validateFileExtension(file.name, options.allowedExtensions);
  if (!extValidation.valid) {
    errors.push(extValidation.error || 'Invalid file extension');
  }

  // Validate MIME type
  const mimeValidation = validateMimeType(file, options.allowedMimes);
  if (!mimeValidation.valid) {
    errors.push(mimeValidation.error || 'Invalid file type');
  }

  // Validate file size
  const sizeValidation = validateFileSize(file, options.maxSize);
  if (!sizeValidation.valid) {
    errors.push(sizeValidation.error || 'File too large');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate PDF file specifically
 */
export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  const validation = validateFile(file, {
    allowedExtensions: ALLOWED_EXTENSIONS.pdf,
    allowedMimes: ALLOWED_MIMES.pdf,
    maxSize: FILE_SIZE_LIMITS.pdf,
  });

  return {
    valid: validation.valid,
    error: validation.errors[0],
  };
}

/**
 * Validate image file specifically
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validation = validateFile(file, {
    allowedExtensions: ALLOWED_EXTENSIONS.image,
    allowedMimes: ALLOWED_MIMES.image,
    maxSize: FILE_SIZE_LIMITS.image,
  });

  return {
    valid: validation.valid,
    error: validation.errors[0],
  };
}

/**
 * Validate DOCX file specifically
 */
export function validateDocxFile(file: File): { valid: boolean; error?: string } {
  const validation = validateFile(file, {
    allowedExtensions: ALLOWED_EXTENSIONS.docx,
    allowedMimes: ALLOWED_MIMES.docx,
    maxSize: FILE_SIZE_LIMITS.docx,
  });

  return {
    valid: validation.valid,
    error: validation.errors[0],
  };
}

/**
 * Get user-friendly error message for file upload failures
 */
export function getFileUploadErrorMessage(
  error: unknown,
  filename?: string
): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    if (msg.includes('size')) {
      return `File "${filename}" is too large. Please try a smaller file.`;
    }

    if (msg.includes('type') || msg.includes('extension') || msg.includes('mime')) {
      return `File type not supported. Please upload a valid file.`;
    }

    if (msg.includes('empty')) {
      return `File "${filename}" appears to be empty or corrupted.`;
    }

    if (msg.includes('corrupt')) {
      return `File "${filename}" appears to be corrupted. Try another file.`;
    }

    return `Unable to process "${filename}". ${error.message}`;
  }

  return 'An unknown error occurred while processing the file.';
}
