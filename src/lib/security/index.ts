/**
 * Security Module - Complete Security Suite
 * Exports all security utilities in one place
 * 
 * Includes:
 * - Sanitization utilities (text, HTML, URLs, attributes)
 * - Safe rendering components (SafeHtml, SafeText, SafeLink, etc.)
 * - Validation and input safety
 * - File upload validation
 */

// Re-export validation utilities
export { sanitizeText, validateText, validateEmail, validatePhone } from './validation';

// Re-export file validation
export {
  isFileValid,
  validatePDFFileUpload,
  validateImageFileUpload,
  validateWordFileUpload,
  validateResumeFileUpload,
  getFirstError,
  formatFileSize,
  getMaxFileSizeInfo,
  getAllowedFileTypes,
  type ValidationResult,
} from './fileUploadValidation';

// Safe rendering utilities
export type { SanitizationContext } from './sanitization';
export {
  sanitize,
  sanitizeForDisplay,
  sanitizeForHtml,
  sanitizeForUrl,
  sanitizeForEmail,
  sanitizeForCss,
  sanitizeForAttribute,
  sanitizeForMarkdown,
  sanitizeJson,
  sanitizeDataUrl,
  sanitizeFilename,
  sanitizeSearchInput,
  sanitizeQueryParam,
  sanitizeForLog,
  createCustomSanitizer,
} from './sanitization';

// HTML rendering
export {
  sanitizeHtml,
  safeHtml,
  escapeHtml,
  unescapeHtml,
  sanitizeUrl,
  sanitizeCssValue,
  sanitizeAttribute,
  sanitizeObject,
  createSafeInnerHTML,
  sanitizeEmail as sanitizeEmailAddress,
  html,
} from './safeRendering';

// React components
export {
  SafeHtml,
  SafeText,
  SafeLink,
  SafeImage,
  SafeIframe,
  SafeDiv,
  sanitizeStyles,
  SecurityProvider,
} from '../../components/SafeRender';

// Security context (imported from .tsx file)
export {
  useSecurityContext,
  SecurityContextProvider,
  useIsAllowedIframeSource,
  useIsAllowedScriptSource,
  useReportSecurityViolation,
} from './securityContext.tsx';