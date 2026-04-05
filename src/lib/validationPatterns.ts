/**
 * Validation Patterns & Best Practices
 * Comprehensive guide for input validation strategies
 */

// ============================================================================
// PATTERN 1: File-Based Validation
// ============================================================================
export const FileValidationPattern = `
import { validateImageFileUpload, validatePDFFile } from '@/lib/security/fileUploadValidation';

// Single file validation
const validateSingleFile = (file: File) => {
  const validation = validateImageFileUpload(file);
  
  if (!validation.valid) {
    const error = validation.errors[0];
    return { 
      error: true, 
      message: \`File validation failed: \${error.message}\`
    };
  }
  
  return { error: false, file };
};

// Multiple validations
const validateFileWithMultipleChecks = (file: File) => {
  // Check 1: File type
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return { error: 'File type not supported' };
  }
  
  // Check 2: File size
  if (file.size > 10 * 1024 * 1024) {
    return { error: 'File exceeds 10MB limit' };
  }
  
  // Check 3: File name (no special chars that cause issues)
  if (!/^[\\w\\s.-]+$/.test(file.name)) {
    return { error: 'File name contains invalid characters' };
  }
  
  return { error: null };
};
`;

// ============================================================================
// PATTERN 2: Form Input Validation
// ============================================================================
export const FormValidationPattern = `
import { validateEmail, validateURL, validateText } from '@/lib/validation';

// Email validation
const validateContactEmail = (email: string) => {
  if (!email) return 'Email is required';
  if (!validateEmail(email)) return 'Invalid email format';
  return null;
};

// URL validation
const validateDownloadURL = (url: string) => {
  if (!url) return 'URL is required';
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return 'URL must use HTTP or HTTPS';
    }
  } catch {
    return 'Invalid URL format';
  }
  return null;
};

// Text length validation
const validatePageTitle = (title: string) => {
  if (!title?.trim()) return 'Title is required';
  if (title.length < 3) return 'Title must be at least 3 characters';
  if (title.length > 100) return 'Title must be under 100 characters';
  return null;
};

// Combined form validation
const validateProfileForm = (data: any) => {
  const errors: Record<string, string> = {};
  
  if (emailError = validateContactEmail(data.email)) {
    errors.email = emailError;
  }
  
  if (titleError = validatePageTitle(data.title)) {
    errors.title = titleError;
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};
`;

// ============================================================================
// PATTERN 3: Dimensions & Size Validation
// ============================================================================
export const DimensionsValidationPattern = `
// Image dimensions
const validateImageDimensions = (file: File, minWidth: number, minHeight: number) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < minWidth || img.height < minHeight) {
          resolve({
            valid: false,
            error: \`Image must be at least \${minWidth}x\${minHeight}px. Yours is \${img.width}x\${img.height}px\`,
            actual: { width: img.width, height: img.height }
          });
        } else {
          resolve({ valid: true });
        }
      };
      img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
  });
};

// File size formatting for display
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
`;

// ============================================================================
// PATTERN 4: Validation Error Collection
// ============================================================================
export const ValidationErrorCollectionPattern = `
// Collect all validation errors
interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  canRetry: boolean;
}

class ValidationResult {
  errors: ValidationError[] = [];
  
  addError(field: string, message: string, canRetry = false) {
    this.errors.push({
      field,
      message,
      severity: 'error',
      canRetry
    });
    return this;
  }
  
  addWarning(field: string, message: string) {
    this.errors.push({
      field,
      message,
      severity: 'warning',
      canRetry: false
    });
    return this;
  }
  
  isValid(): boolean {
    return this.errors.filter(e => e.severity === 'error').length === 0;
  }
  
  getFirstError(): ValidationError | null {
    return this.errors.find(e => e.severity === 'error') || null;
  }
}

// Usage
const validate = (data: any) => {
  const result = new ValidationResult();
  
  if (!data.file) {
    result.addError('file', 'File is required');
  }
  
  if (data.file?.size > 10 * 1024 * 1024) {
    result.addError('file', 'File exceeds 10MB limit', true);
  }
  
  if (!data.email) {
    result.addError('email', 'Email is required');
  }
  
  return result;
};
`;

// ============================================================================
// PATTERN 5: Real-time Validation Feedback
// ============================================================================
export const RealtimeValidationPattern = `
import { useState, useEffect } from 'react';

const useFieldValidation = (value: string, validator: (v: string) => string | null) => {
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const validationError = validator(value);
      setError(validationError);
    }, 500); // Debounce validation
    
    return () => clearTimeout(timer);
  }, [value, validator]);
  
  return error;
};

// Usage in component
const ContactForm = () => {
  const [email, setEmail] = useState('');
  const emailError = useFieldValidation(email, validateContactEmail);
  
  return (
    <div>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={emailError ? 'input-error' : ''}
      />
      {emailError && <span className="error-message">{emailError}</span>}
    </div>
  );
};
`;

// ============================================================================
// PATTERN 6: Progressive Validation
// ============================================================================
export const ProgressiveValidationPattern = `
/**
 * Fast checks first, expensive checks later
 * This keeps UI responsive
 */

const validateFileProgressively = async (file: File) => {
  // Phase 1: Fast validation (< 1ms)
  const fastValidation = validateFileType(file);
  if (!fastValidation.valid) {
    return { valid: false, error: fastValidation.error };
  }
  
  // Phase 2: Medium validation (1-100ms)
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) {
    return { valid: false, error: sizeValidation.error };
  }
  
  // Phase 3: Slow validation (100ms+)
  // Only run if fast checks pass
  const dimensionValidation = await validateImageDimensions(file);
  if (!dimensionValidation.valid) {
    return { valid: false, error: dimensionValidation.error };
  }
  
  // Phase 4: External validation (API calls)
  // Only if everything else passes
  const apiValidation = await verifyWithBackend(file);
  if (!apiValidation.valid) {
    return { valid: false, error: apiValidation.error };
  }
  
  return { valid: true };
};
`;

// ============================================================================
// COMMON VALIDATORS
// ============================================================================
export const CommonValidators = {
  /**
   * File type validators
   */
  isImageFile: (file: File): boolean => {
    return /^image\/(jpeg|jpg|png|webp|gif|bmp)$/.test(file.type);
  },

  isPDFFile: (file: File): boolean => {
    return file.type === 'application/pdf';
  },

  isDocumentFile: (file: File): boolean => {
    const docTypes = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    return docTypes.includes(file.type);
  },

  /**
   * String validators
   */
  isValidEmail: (email: string): boolean => {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+\$/.test(email);
  },

  isValidURL: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  isNonEmpty: (str: string): boolean => {
    return Boolean(str?.trim());
  },

  /**
   * Number validators
   */
  isPositive: (num: number): boolean => {
    return num > 0;
  },

  inRange: (num: number, min: number, max: number): boolean => {
    return num >= min && num <= max;
  },

  /**
   * Array validators
   */
  isArrayNonEmpty: (arr: any[]): boolean => {
    return Array.isArray(arr) && arr.length > 0;
  },

  /**
   * Batch validation
   */
  validateAll: (validators: Array<() => string | null>): string[] => {
    return validators
      .map(v => v())
      .filter((err): err is string => err !== null);
  },
};

export default {
  FileValidationPattern,
  FormValidationPattern,
  DimensionsValidationPattern,
  ValidationErrorCollectionPattern,
  RealtimeValidationPattern,
  ProgressiveValidationPattern,
  CommonValidators,
};
