/**
 * Main Library Exports
 * Central access point for all utility libraries
 */

// Core utilities
export * from './utils';
export * from './apiKeyUtils';
export * from './analytics';
export * from './atsScoring';
export * from './experienceAnalyzer';
export * from './textExtraction';
export * from './useSEO';
export * from './pdfUtils';

// Image processing
export * from './imagePreprocessor';
export * from './backgroundRemovalService';
export * from './ocrService';

// Security & Validation
export * from './security';
export * from './security/fileValidation';
export * from './security/validation';
export * from './security/sanitization';
export * from './security/safeRendering';
export * from './errorHandler';
export * from './apiClient';

// Performance utilities
export * from './performance';

// Heavy operations
export * from './heavyOperations';

// Export namespaced access
export { SecureAPIClient, apiClient, callOpenAIAPI } from './apiClient';
export {
  imageOptimizer,
  pdfOptimizer,
  canvasOptimizer,
  aiOptimizer,
  getResourceStatus,
  startResourceMonitoring,
  stopResourceMonitoring,
} from './heavyOperations';
