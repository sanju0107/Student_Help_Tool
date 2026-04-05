/**
 * Comprehensive Sanitization Module
 * Provides centralized sanitization for different data types
 * Prevents injection attacks, XSS, and data leakage
 * 
 * @module sanitization
 */

import { sanitizeText } from './validation';
import {
  escapeHtml,
  sanitizeHtml,
  sanitizeUrl,
  sanitizeEmail,
  sanitizeAttribute,
} from './safeRendering';

/**
 * Sanitization context for different use cases
 */
export type SanitizationContext = 'display' | 'html' | 'url' | 'email' | 'css' | 'attribute';

/**
 * Centralized sanitization dispatcher
 * Routes sanitization based on context
 * 
 * @example
 * sanitize('user_input', 'display')  // Safe for text display
 * sanitize('<b>text</b>', 'html')    // Safe for HTML rendering
 * sanitize('https://example.com', 'url') // Safe for href
 */
export function sanitize(
  value: any,
  context: SanitizationContext = 'display',
  options?: Record<string, any>
): string {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'string') return String(value);

  switch (context) {
    case 'display':
      return sanitizeForDisplay(value);
    case 'html':
      return sanitizeForHtml(value, options);
    case 'url':
      return sanitizeForUrl(value);
    case 'email':
      return sanitizeForEmail(value);
    case 'css':
      return sanitizeForCss(value);
    case 'attribute':
      return sanitizeForAttribute(value);
    default:
      return sanitizeForDisplay(value);
  }
}

/**
 * Sanitize for safe text display
 * Encodes all HTML special characters
 */
export function sanitizeForDisplay(text: string): string {
  return escapeHtml(text.trim());
}

/**
 * Sanitize for HTML rendering
 * Allows safe HTML tags, blocks dangerous patterns
 */
export function sanitizeForHtml(text: string, options?: { level?: 'strict' | 'moderate' | 'permissive' }): string {
  return sanitizeHtml(text, options?.level || 'moderate');
}

/**
 * Sanitize for URL contexts (href, src)
 * Blocks javascript: and data: protocols
 */
export function sanitizeForUrl(url: string): string {
  return sanitizeUrl(url) || '';
}

/**
 * Sanitize for email contexts
 * Validates format and prevents injection
 */
export function sanitizeForEmail(email: string): string {
  const sanitized = sanitizeEmail(email);
  return sanitized;
}

/**
 * Sanitize for CSS contexts
 * Prevents CSS injection and expression evaluation
 */
export function sanitizeForCss(cssValue: string): string {
  if (!cssValue || typeof cssValue !== 'string') return '';

  const value = cssValue.trim();

  // Block dangerous CSS patterns
  if (
    /expression|import|url\s*\(|javascript:|behavior:/i.test(value) ||
    value.includes('<') ||
    value.includes('>') ||
    value.includes('"') ||
    value.includes("'")
  ) {
    return '';
  }

  return value;
}

/**
 * Sanitize for attribute contexts
 * Validates attribute syntax and values
 */
export function sanitizeForAttribute(attr: string): string {
  if (!attr || typeof attr !== 'string') return '';

  // Block attribute injection patterns
  if (attr.includes('=') || attr.includes('"') || attr.includes("'") || attr.includes('>')) {
    return '';
  }

  return escapeHtml(attr.trim());
}

/**
 * Sanitize user-generated content for display in markdown-like contexts
 * Converts user input to safe markdown-compatible text
 */
export function sanitizeForMarkdown(text: string): string {
  if (!text || typeof text !== 'string') return '';

  return text
    // Escape markdown special characters
    .replace(/([\\`*_{}\[\]()#+\-.!])/g, '\\$1')
    // Remove potentially dangerous characters
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Sanitize JSON string to prevent injection
 * Parses and re-stringifies to ensure validity
 */
export function sanitizeJson(jsonString: string): string {
  if (!jsonString || typeof jsonString !== 'string') return '{}';

  try {
    // Parse to validate JSON structure
    const parsed = JSON.parse(jsonString);
    // Re-stringify to normalize
    return JSON.stringify(parsed);
  } catch {
    return '{}';
  }
}

/**
 * Sanitize data URLs (for images, etc.)
 * Validates MIME type and size
 */
export function sanitizeDataUrl(
  dataUrl: string,
  options?: {
    allowedMimes?: string[];
    maxSize?: number; // bytes
  }
): string {
  if (!dataUrl || typeof dataUrl !== 'string') return '';

  const { allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'], maxSize = 5242880 } = options || {};

  try {
    const [header, data] = dataUrl.split(',');

    // Validate data URL format
    if (!header || !data) return '';

    // Extract MIME type
    const mimeMatch = header.match(/data:([^;]+)/);
    if (!mimeMatch) return '';

    const mime = mimeMatch[1].toLowerCase();

    // Check if MIME is allowed
    if (!allowedMimes.includes(mime)) return '';

    // Check size
    const sizeBytes = Math.ceil((data.length * 3) / 4);
    if (sizeBytes > maxSize) return '';

    return dataUrl;
  } catch {
    return '';
  }
}

/**
 * Sanitize filename to prevent path traversal
 * Removes dangerous characters from upload filenames
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') return 'file';

  return (
    filename
      // Remove path traversal attempts
      .replace(/\.\./g, '')
      .replace(/[\/\\]/g, '_')
      // Remove null bytes
      .replace(/\0/g, '')
      // Remove control characters
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
      // Limit length
      .slice(0, 255)
      // Ensure valid filename
      .trim() || 'file'
  );
}

/**
 * Sanitize search/filter input
 * Prevents search injection and query attacks
 */
export function sanitizeSearchInput(query: string): string {
  if (!query || typeof query !== 'string') return '';

  return query
    .trim()
    // Remove SQL-like patterns (basic protection, not complete)
    .replace(/['";\\]/g, '')
    // Limit length
    .slice(0, 100);
}

/**
 * Sanitize query parameters
 * Validates and escapes query string values
 */
export function sanitizeQueryParam(key: string, value: string): Record<string, string> {
  if (!key || !value) return {};

  return {
    [sanitizeForAttribute(key)]: escapeHtml(value),
  };
}

/**
 * Sanitize console logs (prevents sensitive data leaks)
 * Redacts common sensitive patterns
 */
export function sanitizeForLog(value: any): any {
  if (typeof value === 'string') {
    return value
      .replace(/token['":\s]*([^\s'"]+)/gi, 'token: [REDACTED]')
      .replace(/password['":\s]*([^\s'"]+)/gi, 'password: [REDACTED]')
      .replace(/key['":\s]*([^\s'"]+)/gi, 'key: [REDACTED]')
      .replace(/secret['":\s]*([^\s'"]+)/gi, 'secret: [REDACTED]')
      .replace(/bearer\s+([^\s]+)/gi, 'bearer [REDACTED]');
  }

  if (typeof value === 'object' && value !== null) {
    try {
      const redacted = { ...value };
      const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization', 'accessToken'];
      
      sensitiveKeys.forEach(key => {
        if (key in redacted) {
          redacted[key] = '[REDACTED]';
        }
      });

      return redacted;
    } catch {
      return '[REDACTED]';
    }
  }

  return value;
}

/**
 * Create a sanitization function with custom rules
 * Useful for domain-specific sanitization
 */
export function createCustomSanitizer(rules: {
  allowHtml?: boolean;
  allowUrls?: boolean;
  maxLength?: number;
  pattern?: RegExp;
  deniedPatterns?: RegExp[];
}): (value: string) => string {
  return (value: string) => {
    let result = value.trim();

    // Check denied patterns
    if (rules.deniedPatterns) {
      for (const pattern of rules.deniedPatterns) {
        if (pattern.test(result)) {
          return '';
        }
      }
    }

    // Check custom pattern
    if (rules.pattern && !rules.pattern.test(result)) {
      return '';
    }

    // Enforce length
    if (rules.maxLength) {
      result = result.slice(0, rules.maxLength);
    }

    // Apply formatting
    if (rules.allowHtml) {
      result = sanitizeForHtml(result);
    } else if (rules.allowUrls) {
      result = sanitizeForUrl(result);
    } else {
      result = sanitizeForDisplay(result);
    }

    return result;
  };
}

export default {
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
};
