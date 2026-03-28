/**
 * Google Analytics Configuration
 * This file contains the configuration for Google Analytics
 */

// Google Analytics Measurement ID
// Update this ID in your .env file with: VITE_GA_MEASUREMENT_ID
export const GA_MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string) || 'G-MY48Y5CKC6';

// Analytics configuration
export const ANALYTICS_CONFIG = {
  measurement_id: GA_MEASUREMENT_ID,
  anonymize_ip: true,
  cookie_prefix: 'ga_',
};

// Event categories for tracking
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  AI_FEATURE: 'ai_feature',
  TOOL_USAGE: 'tool_usage',
  DOWNLOAD: 'download',
  COPY: 'copy',
  UPLOAD: 'upload',
  ERROR: 'error',
};
