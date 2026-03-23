/**
 * Google Analytics helper functions
 * Uses the gtag global object injected via index.html
 */

// Type declaration for gtag
declare let gtag: Function;

/**
 * Track a page view event
 * @param path - The page path
 * @param title - The page title
 */
export const trackPageView = (path: string, title: string) => {
  if (typeof window !== 'undefined' && typeof gtag !== 'undefined') {
    gtag('config', 'G-VKC0SEVP7T', {
      page_path: path,
      page_title: title,
    });
  }
};

/**
 * Track a custom event
 * @param eventName - The event name
 * @param eventData - Optional event data
 */
export const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window !== 'undefined' && typeof gtag !== 'undefined') {
    gtag('event', eventName, eventData || {});
  }
};

/**
 * Track tool usage
 * @param toolName - Name of the tool used
 * @param action - Action performed (e.g., 'generate', 'download')
 */
export const trackToolUsage = (toolName: string, action: string) => {
  trackEvent('tool_usage', {
    tool_name: toolName,
    action: action,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track AI feature usage
 * @param featureName - Name of the AI feature
 * @param success - Whether the action was successful
 */
export const trackAiFeature = (featureName: string, success: boolean) => {
  trackEvent('ai_feature_usage', {
    feature_name: featureName,
    success: success,
    timestamp: new Date().toISOString(),
  });
};
