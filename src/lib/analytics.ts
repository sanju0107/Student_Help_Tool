/**
 * Analytics tracking functions for the Student Help Tool
 * Tracks page views, AI features, and tool usage for analytics purposes
 * Google Analytics Measurement ID: G-MY48Y5CKC6
 */

import { GA_MEASUREMENT_ID, ANALYTICS_EVENTS } from './gaConfig';

/**
 * Track page view
 * Call this function when users navigate to different pages
 * @param pageName - Name of the page for display purposes
 */
export const trackPageView = (pageName: string): void => {
  try {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', ANALYTICS_EVENTS.PAGE_VIEW, {
        'page_path': window.location.pathname,
        'page_title': pageName,
        'measurement_id': GA_MEASUREMENT_ID,
      });
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

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
