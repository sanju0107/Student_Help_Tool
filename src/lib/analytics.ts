/**
 * Analytics tracking functions for the Student Help Tool
 * Tracks AI features and tool usage for analytics purposes
 */

/**
 * Track AI feature usage
 * @param featureName - Name of the AI feature being tracked
 * @param success - Whether the feature execution was successful
 */
export const trackAiFeature = (featureName: string, success: boolean): void => {
  try {
    const timestamp = new Date().toISOString();
    const analyticsData = {
      type: 'ai_feature',
      feature: featureName,
      success,
      timestamp,
      userAgent: navigator.userAgent,
    };
    
    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Analytics]', analyticsData);
    }
    
    // Send to analytics service if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', featureName, {
        'success': success,
      });
    }
  } catch (error) {
    console.error('Error tracking AI feature:', error);
  }
};

/**
 * Track tool usage
 * @param toolName - Name of the tool being used
 * @param action - Action performed on the tool (e.g., 'download', 'copy', 'generate')
 */
export const trackToolUsage = (toolName: string, action: string): void => {
  try {
    const timestamp = new Date().toISOString();
    const analyticsData = {
      type: 'tool_usage',
      tool: toolName,
      action,
      timestamp,
      userAgent: navigator.userAgent,
    };
    
    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Analytics]', analyticsData);
    }
    
    // Send to analytics service if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', `${toolName}_${action}`, {
        'tool': toolName,
        'action': action,
      });
    }
  } catch (error) {
    console.error('Error tracking tool usage:', error);
  }
};
