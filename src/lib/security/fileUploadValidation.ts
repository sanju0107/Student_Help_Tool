/**
 * File Upload Validation Wrapper
 * Provides easy-to-use validation functions for all file upload tools
 * Validates MIME type, extension, and file size with user-friendly error messages
 */

import {
  validateFile,
  validatePDFFile,
  validateImageFile,
  validateDocxFile,
  validateFileSize,
  validateFileExtension,
  validateMimeType,
  FILE_SIZE_LIMITS,
  getAllowedMimes,
} from './fileValidation';

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sizeInfo?: { bytes: number; mb: number };
}

/**
 * Get allowed MIME types for PDF files
 */
export const PDF_ALLOWED_MIMES = ['application/pdf'];

/**
 * Get allowed extensions for PDF files
 */
export const PDF_ALLOWED_EXTENSIONS = ['pdf'];

/**
 * Get allowed MIME types for image files
 */
export const IMAGE_ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
];

/**
 * Get allowed extensions for image files
 */
export const IMAGE_ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'];

/**
 * Get allowed MIME types for Word documents (resume/cover letter)
 */
export const WORD_ALLOWED_MIMES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

/**
 * Get allowed extensions for Word documents
 */
export const WORD_ALLOWED_EXTENSIONS = ['docx', 'doc'];

/**
 * Get allowed MIME types for resume files (PDF, DOCX, or TXT)
 */
export const RESUME_ALLOWED_MIMES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
];

/**
 * Get allowed extensions for resume files
 */
export const RESUME_ALLOWED_EXTENSIONS = ['pdf', 'docx', 'doc', 'txt'];

/**
 * Validate a single PDF file
 * @param file - File to validate
 * @returns Validation result with errors if invalid
 */
export function validatePDFFileUpload(file: File): ValidationResult {
  const errors: string[] = [];

  // Check if file exists
  if (!file) {
    errors.push('No file selected. Please select a PDF file.');
    return { valid: false, errors };
  }

  // Validate extension
  const extValidation = validateFileExtension(file.name, PDF_ALLOWED_EXTENSIONS);
  if (!extValidation.valid) {
    errors.push(extValidation.error || 'Invalid file extension. Please upload a PDF file.');
  }

  // Validate MIME type
  const mimeValidation = validateMimeType(file, PDF_ALLOWED_MIMES);
  if (!mimeValidation.valid) {
    errors.push('Invalid file type. Please upload a PDF file.');
  }

  // Validate file size
  const sizeValidation = validateFileSize(file, FILE_SIZE_LIMITS.pdf);
  if (!sizeValidation.valid) {
    errors.push(sizeValidation.error || 'File is too large.');
  }

  return {
    valid: errors.length === 0,
    errors,
    sizeInfo: sizeValidation.sizeInfo,
  };
}

/**
 * Validate multiple PDF files
 * @param files - FileList of files to validate
 * @returns Array of validation results, one per file
 */
export function validateMultiplePDFFiles(files: FileList): ValidationResult[] {
  return Array.from(files).map((file) => validatePDFFileUpload(file));
}

/**
 * Validate a single image file
 * @param file - File to validate
 * @returns Validation result with errors if invalid
 */
export function validateImageFileUpload(file: File): ValidationResult {
  const errors: string[] = [];

  // Check if file exists
  if (!file) {
    errors.push('No file selected. Please select an image file.');
    return { valid: false, errors };
  }

  // Validate extension
  const extValidation = validateFileExtension(file.name, IMAGE_ALLOWED_EXTENSIONS);
  if (!extValidation.valid) {
    errors.push(
      extValidation.error || 'Invalid file extension. Please upload a supported image format.'
    );
  }

  // Validate MIME type
  const mimeValidation = validateMimeType(file, IMAGE_ALLOWED_MIMES);
  if (!mimeValidation.valid) {
    errors.push('Invalid file type. Please upload a supported image format.');
  }

  // Validate file size
  const sizeValidation = validateFileSize(file, FILE_SIZE_LIMITS.image);
  if (!sizeValidation.valid) {
    errors.push(sizeValidation.error || 'File is too large.');
  }

  return {
    valid: errors.length === 0,
    errors,
    sizeInfo: sizeValidation.sizeInfo,
  };
}

/**
 * Validate multiple image files
 * @param files - FileList of files to validate
 * @returns Array of validation results, one per file
 */
export function validateMultipleImageFiles(files: FileList): ValidationResult[] {
  return Array.from(files).map((file) => validateImageFileUpload(file));
}

/**
 * Validate a Word document file (for resume/cover letter)
 * @param file - File to validate
 * @returns Validation result with errors if invalid
 */
export function validateWordFileUpload(file: File): ValidationResult {
  const errors: string[] = [];

  // Check if file exists
  if (!file) {
    errors.push('No file selected. Please select a Word document (.docx or .doc).');
    return { valid: false, errors };
  }

  // Validate extension
  const extValidation = validateFileExtension(file.name, WORD_ALLOWED_EXTENSIONS);
  if (!extValidation.valid) {
    errors.push(extValidation.error || 'Invalid file extension. Please upload a .docx or .doc file.');
  }

  // Validate MIME type
  const mimeValidation = validateMimeType(file, WORD_ALLOWED_MIMES);
  if (!mimeValidation.valid) {
    errors.push('Invalid file type. Please upload a Word document (.docx or .doc).');
  }

  // Validate file size
  const sizeValidation = validateFileSize(file, FILE_SIZE_LIMITS.docx);
  if (!sizeValidation.valid) {
    errors.push(sizeValidation.error || 'File is too large.');
  }

  return {
    valid: errors.length === 0,
    errors,
    sizeInfo: sizeValidation.sizeInfo,
  };
}

/**
 * Validate a resume file (PDF, DOCX, DOC, or TXT)
 * @param file - File to validate
 * @returns Validation result with errors if invalid
 */
export function validateResumeFileUpload(file: File): ValidationResult {
  const errors: string[] = [];

  // Check if file exists
  if (!file) {
    errors.push('No file selected. Please select a resume file (PDF, DOCX, DOC, or TXT).');
    return { valid: false, errors };
  }

  // Validate extension
  const extValidation = validateFileExtension(file.name, RESUME_ALLOWED_EXTENSIONS);
  if (!extValidation.valid) {
    errors.push(
      extValidation.error || 'Invalid file extension. Please upload a PDF, DOCX, DOC, or TXT file.'
    );
  }

  // Validate MIME type
  const mimeValidation = validateMimeType(file, RESUME_ALLOWED_MIMES);
  if (!mimeValidation.valid) {
    errors.push('Invalid file type. Please upload a PDF, DOCX, DOC, or TXT file.');
  }

  // Validate file size
  const sizeValidation = validateFileSize(file, FILE_SIZE_LIMITS.docx);
  if (!sizeValidation.valid) {
    errors.push(sizeValidation.error || 'File is too large.');
  }

  return {
    valid: errors.length === 0,
    errors,
    sizeInfo: sizeValidation.sizeInfo,
  };
}

/**
 * Check if file passes validation
 * Useful for inline validation checks
 * @param file - File to check
 * @param fileType - Type of file ('pdf' | 'image' | 'word' | 'resume')
 * @returns true if valid, false otherwise
 */
export function isFileValid(file: File | null, fileType: 'pdf' | 'image' | 'word' | 'resume'): boolean {
  if (!file) return false;

  let result: ValidationResult;

  switch (fileType) {
    case 'pdf':
      result = validatePDFFileUpload(file);
      break;
    case 'image':
      result = validateImageFileUpload(file);
      break;
    case 'word':
      result = validateWordFileUpload(file);
      break;
    case 'resume':
      result = validateResumeFileUpload(file);
      break;
    default:
      return false;
  }

  return result.valid;
}

/**
 * Get first error message from validation result
 * Useful for displaying single error to user
 * @param result - Validation result
 * @returns First error message or null
 */
export function getFirstError(result: ValidationResult): string | null {
  return result.errors.length > 0 ? result.errors[0] : null;
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const rounded = parseFloat((bytes / Math.pow(1024, i)).toFixed(2));
  return `${rounded} ${sizes[i]}`;
}

/**
 * Get max file size info for a file type
 * @param fileType - Type of file ('pdf' | 'image' | 'word' | 'resume')
 * @returns Object with max size in bytes and formatted string
 */
export function getMaxFileSizeInfo(
  fileType: 'pdf' | 'image' | 'word' | 'resume'
): { bytes: number; formatted: string } {
  let bytes: number;

  switch (fileType) {
    case 'pdf':
      bytes = FILE_SIZE_LIMITS.pdf;
      break;
    case 'image':
      bytes = FILE_SIZE_LIMITS.image;
      break;
    case 'word':
      bytes = FILE_SIZE_LIMITS.docx;
      break;
    case 'resume':
      bytes = FILE_SIZE_LIMITS.docx;
      break;
    default:
      bytes = FILE_SIZE_LIMITS.default;
  }

  return { bytes, formatted: formatFileSize(bytes) };
}

/**
 * Get all allowed file types for a file type category
 * @param fileType - Type of file ('pdf' | 'image' | 'word' | 'resume')
 * @returns Object with mimes and extensions
 */
export function getAllowedFileTypes(
  fileType: 'pdf' | 'image' | 'word' | 'resume'
): { mimes: string[]; extensions: string[] } {
  switch (fileType) {
    case 'pdf':
      return { mimes: PDF_ALLOWED_MIMES, extensions: PDF_ALLOWED_EXTENSIONS };
    case 'image':
      return { mimes: IMAGE_ALLOWED_MIMES, extensions: IMAGE_ALLOWED_EXTENSIONS };
    case 'word':
      return { mimes: WORD_ALLOWED_MIMES, extensions: WORD_ALLOWED_EXTENSIONS };
    case 'resume':
      return { mimes: RESUME_ALLOWED_MIMES, extensions: RESUME_ALLOWED_EXTENSIONS };
    default:
      return { mimes: [], extensions: [] };
  }
}

export default {
  validatePDFFileUpload,
  validateMultiplePDFFiles,
  validateImageFileUpload,
  validateMultipleImageFiles,
  validateWordFileUpload,
  isFileValid,
  getFirstError,
  formatFileSize,
  getMaxFileSizeInfo,
  getAllowedFileTypes,
};
