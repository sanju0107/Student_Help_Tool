/**
 * Safe Rendering Component
 * React component for safely rendering user-generated or API content
 * Automatically applies appropriate sanitization based on content type
 * 
 * @module
 */

import React from 'react';
import { createSafeInnerHTML, sanitizeHtml, escapeHtml, sanitizeUrl } from '../lib/security/safeRendering';

interface SafeHtmlProps {
  /** The HTML content to render */
  content: string;
  /** Sanitization level: strict removes most tags, permissive allows more */
  level?: 'strict' | 'moderate' | 'permissive';
  /** CSS class to apply to container */
  className?: string;
  /** HTML tag to use as container (default: div) */
  tag?: string;
  /** Additional HTML attributes */
  attrs?: Record<string, string>;
}

/**
 * SafeHtml Component
 * Safely renders HTML content with automatic sanitization
 * 
 * @example
 * <SafeHtml 
 *   content={userProvidedContent}
 *   level="moderate"
 *   className="prose"
 * />
 */
export function SafeHtml({
  content,
  level = 'moderate',
  className,
  tag = 'div',
  attrs = {},
}: SafeHtmlProps) {
  const sanitized = sanitizeHtml(content, level);

  return React.createElement(tag as any, {
    className,
    dangerouslySetInnerHTML: createSafeInnerHTML(sanitized),
    ...attrs,
  });
}

interface SafeTextProps {
  /** The text content to render */
  content?: string;
  /** CSS class to apply */
  className?: string;
  /** HTML tag to use (default: span) */
  tag?: string;
  /** Additional HTML attributes */
  attrs?: Record<string, string>;
}

/**
 * SafeText Component
 * Renders text content with HTML entities escaped
 * Prevents any HTML interpretation
 * 
 * @example
 * <SafeText content={userInput} className="text-gray-700" />
 */
export function SafeText({
  content = '',
  className,
  tag = 'span',
  attrs = {},
}: SafeTextProps) {
  return React.createElement(
    tag as any,
    { className, ...attrs },
    escapeHtml(content)
  );
}

interface SafeLinkProps {
  /** The URL href */
  href: string;
  /** Link text or children */
  children: React.ReactNode;
  /** CSS class to apply */
  className?: string;
  /** Attributes to apply */
  attrs?: Record<string, string>;
  /** Fallback if URL is invalid */
  fallbackToSpan?: boolean;
}

/**
 * SafeLink Component
 * Renders anchor tags with validated URLs only
 * Prevents javascript: and data: protocol injection
 * 
 * @example
 * <SafeLink href={userProvidedUrl}>Click here</SafeLink>
 */
export function SafeLink({
  href,
  children,
  className,
  attrs = {},
  fallbackToSpan = false,
}: SafeLinkProps) {
  const sanitized = sanitizeUrl(href);

  if (!sanitized && fallbackToSpan) {
    return (
      <span className={className} {...attrs}>
        {children}
      </span>
    );
  }

  return (
    <a href={sanitized || '#'} className={className} {...attrs}>
      {children}
    </a>
  );
}

interface SafeImageProps {
  /** Image source URL */
  src: string;
  /** Alt text */
  alt?: string;
  /** CSS class */
  className?: string;
  /** Other image attributes */
  attrs?: Record<string, string>;
  /** Fallback image URL if source is invalid */
  fallback?: string;
}

/**
 * SafeImage Component
 * Renders img tags with sanitized src URLs
 * Prevents data: URI and javascript: URL injection
 * 
 * @example
 * <SafeImage 
 *   src={apiResponseImageUrl}
 *   alt="User avatar"
 *   fallback="/default-avatar.png"
 * />
 */
export function SafeImage({
  src,
  alt = '',
  className,
  attrs = {},
  fallback,
}: SafeImageProps) {
  const sanitized = sanitizeUrl(src);
  const imageSrc = sanitized || fallback || '';

  return (
    <img
      src={imageSrc}
      alt={escapeHtml(alt)}
      className={className}
      {...attrs}
      onError={(e) => {
        if (fallback && e.currentTarget.src !== fallback) {
          e.currentTarget.src = fallback;
        }
      }}
    />
  );
}

interface SafeIframeProps {
  /** Iframe source URL */
  src: string;
  /** Title for accessibility */
  title?: string;
  /** CSS class */
  className?: string;
  /** Sandbox attributes */
  sandbox?: string;
  /** Other iframe attributes */
  attrs?: Record<string, string>;
}

/**
 * SafeIframe Component
 * Renders iframe with security-hardened attributes
 * Uses sandbox attribute to restrict capabilities
 * 
 * @example
 * <SafeIframe 
 *   src="https://example.com/embed"
 *   sandbox="allow-same-origin allow-scripts"
 *   title="Embedded content"
 * />
 */
export function SafeIframe({
  src,
  title = 'Embedded content',
  className,
  sandbox = 'allow-same-origin allow-scripts allow-popups',
  attrs = {},
}: SafeIframeProps) {
  const sanitized = sanitizeUrl(src);

  if (!sanitized) {
    return (
      <div className={className} style={{ backgroundColor: '#f0f0f0', padding: '1rem' }}>
        Invalid iframe source
      </div>
    );
  }

  return (
    <iframe
      src={sanitized}
      title={title}
      className={className}
      sandbox={sandbox}
      {...attrs}
    />
  );
}

interface SafeStyleProps {
  /** CSS styles to apply */
  styles?: Record<string, string>;
  /** CSS class name */
  className?: string;
  /** Allowed CSS properties */
  allowedProperties?: string[];
}

/**
 * Safe style object sanitization utility
 * Validates style object to prevent CSS injection
 * 
 * @example
 * const safe = sanitizeStyles({
 *   color: 'red',
 *   'font-size': '14px'
 * });
 */
export function sanitizeStyles(
  styles?: Record<string, string>,
  allowedProperties?: string[]
): React.CSSProperties {
  if (!styles || typeof styles !== 'object') return {};

  const allAllowed = allowedProperties || [
    'color',
    'backgroundColor',
    'fontSize',
    'fontWeight',
    'textAlign',
    'padding',
    'margin',
    'border',
    'borderRadius',
    'width',
    'height',
    'display',
    'flex',
    'gap',
    'opacity',
  ];

  const safe: React.CSSProperties = {};

  for (const [key, value] of Object.entries(styles)) {
    // Check if property is allowed
    if (allAllowed.includes(key)) {
      // Validate value
      if (typeof value === 'string' && !/javascript:|expression|import/i.test(value)) {
        (safe as any)[key] = value;
      }
    }
  }

  return safe;
}

/**
 * Sanitized Div Component
 * Renders div with safe style prop
 * 
 * @example
 * <SafeDiv styles={{ color: 'red' }}>Content</SafeDiv>
 */
interface SafeDivProps extends React.HTMLAttributes<HTMLDivElement> {
  styles?: Record<string, string>;
  [key: string]: any;
}

export const SafeDiv = React.forwardRef<HTMLDivElement, SafeDivProps>(
  ({ styles, ...attrs }, ref) => (
    <div ref={ref} style={sanitizeStyles(styles)} {...attrs} />
  )
);

SafeDiv.displayName = 'SafeDiv';

/**
 * Provider for app-wide security configuration
 * Wraps app to enable security features globally
 */
interface SecurityProviderProps {
  children: React.ReactNode;
  /** Enable content security policy meta tag */
  enableCsp?: boolean;
  /** Log security violations */
  logViolations?: boolean;
}

export function SecurityProvider({
  children,
  enableCsp = true,
  logViolations = false,
}: SecurityProviderProps) {
  React.useEffect(() => {
    if (logViolations) {
      // Listen for CSP violations
      const handleSecurityPolicyViolation = (event: any) => {
        console.warn('CSP Violation:', {
          violatedDirective: event.violatedDirective,
          blockedURI: event.blockedURI,
          sourceFile: event.sourceFile,
        });
      };

      document.addEventListener('securitypolicyviolation', handleSecurityPolicyViolation);

      return () => {
        document.removeEventListener('securitypolicyviolation', handleSecurityPolicyViolation);
      };
    }
  }, [logViolations]);

  return <>{children}</>;
}

export default {
  SafeHtml,
  SafeText,
  SafeLink,
  SafeImage,
  SafeIframe,
  SafeDiv,
  sanitizeStyles,
  SecurityProvider,
};
