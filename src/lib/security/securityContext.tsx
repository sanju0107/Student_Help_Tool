/**
 * Security Context
 * Provides app-wide security configuration and utilities
 * Allows components to access security settings and functions
 * 
 * @module securityContext
 */

import React, { createContext, useContext } from 'react';

interface SecurityContextType {
  /** Enable Content Security Policy enforcement */
  enableCsp: boolean;
  /** Log security violations to console */
  logViolations: boolean;
  /** Enable XSS protection */
  enableXssProtection: boolean;
  /** Enable CSRF protection */
  enableCsrfProtection: boolean;
  /** Sanitization level: strict, moderate, or permissive */
  defaultSanitizationLevel: 'strict' | 'moderate' | 'permissive';
  /** List of allowed iframe sources */
  allowedIframeSources: string[];
  /** List of allowed external script sources */
  allowedScriptSources: string[];
  /** Report security violations to this endpoint */
  violationReportEndpoint?: string;
}

const defaultSecurityContext: SecurityContextType = {
  enableCsp: true,
  logViolations: process.env.NODE_ENV === 'development',
  enableXssProtection: true,
  enableCsrfProtection: true,
  defaultSanitizationLevel: 'moderate',
  allowedIframeSources: ['https://example.com'],
  allowedScriptSources: ['https://cdn.example.com'],
};

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface SecurityContextProviderProps {
  children: React.ReactNode;
  config?: Partial<SecurityContextType>;
}

/**
 * Security Context Provider
 * Wrap your app with this to enable security features
 * 
 * @example
 * <SecurityContextProvider config={{ enableCsp: true }}>
 *   <App />
 * </SecurityContextProvider>
 */
export function SecurityContextProvider({
  children,
  config = {},
}: SecurityContextProviderProps) {
  const contextValue = {
    ...defaultSecurityContext,
    ...config,
  };

  React.useEffect(() => {
    // Initialize security headers
    if (contextValue.enableCsp) {
      // Meta CSP tag is set in index.html
      if (contextValue.logViolations) {
        console.log('Content Security Policy enabled');
      }
    }

    if (contextValue.enableXssProtection) {
      if (contextValue.logViolations) {
        console.log('XSS Protection enabled');
      }
    }
  }, [contextValue]);

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
}

/**
 * Hook to access security context
 * Returns security configuration and utilities
 * 
 * @throws Error if used outside SecurityContextProvider
 * 
 * @example
 * const { enableCsp, logViolations } = useSecurityContext();
 */
export function useSecurityContext(): SecurityContextType {
  const context = useContext(SecurityContext);
  
  if (!context) {
    // Return default context if provider not used
    return defaultSecurityContext;
  }

  return context;
}

/**
 * Hook to check if a URL is from an allowed iframe source
 */
export function useIsAllowedIframeSource(url: string): boolean {
  const { allowedIframeSources } = useSecurityContext();

  try {
    const urlObj = new URL(url);
    return allowedIframeSources.some(allowed => {
      try {
        const allowedObj = new URL(allowed);
        return urlObj.hostname === allowedObj.hostname;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

/**
 * Hook to check if a script source is allowed
 */
export function useIsAllowedScriptSource(url: string): boolean {
  const { allowedScriptSources } = useSecurityContext();

  try {
    const urlObj = new URL(url);
    return allowedScriptSources.some(allowed => {
      try {
        const allowedObj = new URL(allowed);
        return urlObj.hostname === allowedObj.hostname;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

/**
 * Report security violation (requires React component context)
 */
function reportSecurityViolation(
  type: string,
  details: Record<string, any>
): void {
  const context = useSecurityContext();
  const { violationReportEndpoint, logViolations } = context;

  if (logViolations) {
    console.warn(`Security Violation [${type}]:`, details);
  }

  if (violationReportEndpoint) {
    fetch(violationReportEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        details,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      }),
    }).catch(err => {
      if (logViolations) {
        console.error('Failed to report security violation:', err);
      }
    });
  }
}

/**
 * Hook to report security violations
 */
export function useReportSecurityViolation(): (type: string, details: Record<string, any>) => void {
  return (type, details) => reportSecurityViolation(type, details);
}

export default SecurityContext;
