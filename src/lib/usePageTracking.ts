import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from './analytics';

/**
 * Hook to automatically track page views using Google Analytics
 * Call this hook in your App component or main layout
 * It will automatically send page view events when the route changes
 */
export const usePageTracking = (): void => {
  const location = useLocation();

  useEffect(() => {
    // Get page name from pathname
    const pageName = location.pathname
      .split('/')
      .filter(Boolean)
      .join(' / ') || 'Home';

    // Track the page view
    trackPageView(pageName);

    // Also send pageview event to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_path: location.pathname,
        page_title: document.title,
      });
    }
  }, [location.pathname, location.search]);
};
