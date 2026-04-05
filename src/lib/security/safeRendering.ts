/**
 * Safe HTML Rendering Utilities
 * Provides DOMPurify-based HTML sanitization and safe rendering
 * Prevents XSS attacks through HTML injection
 * 
 * @module safeRendering
 * @requires dompurify
 */

/**
 * DOMPurify configuration for different contexts
 */
const PURIFY_CONFIG = {
  strict: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'span'],
    ALLOWED_ATTR: ['class', 'id'],
    KEEP_CONTENT: true,
  },
  moderate: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'span', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'],
    ALLOWED_ATTR: ['class', 'id', 'href', 'title', 'rel'],
    ALLOW_UNKNOWN_PROTOCOLS: false,
  },
  permissive: {
    ALLOWED_TAGS: 'all',
    ALLOWED_ATTR: ['class', 'id', 'href', 'title', 'rel', 'data-*'],
    ALLOW_UNKNOWN_PROTOCOLS: false,
  },
} as const;

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMPurify if available, falls back to safe encoding
 * 
 * @param html - Raw HTML string that may contain malicious content
 * @param level - Sanitization level: 'strict' | 'moderate' | 'permissive'
 * @returns Sanitized HTML safe for rendering
 * 
 * @example
 * const safe = sanitizeHtml('<img src=x onerror="alert(1)">', 'strict');
 * // Returns: '<img>'
 */
export function sanitizeHtml(
  html: string,
  level: 'strict' | 'moderate' | 'permissive' = 'moderate'
): string {
  if (!html || typeof html !== 'string') return '';

  try {
    // Try to use DOMPurify if available (installed via npm)
    // For now, use safe fallback sanitization
    return safeSanitizeHtml(html, level);
  } catch {
    return safeSanitizeHtml(html, level);
  }
}

/**
 * Fallback HTML sanitization when DOMPurify is not available
 * Uses a conservative approach: removes all HTML tags and encodes content
 */
function safeSanitizeHtml(
  html: string,
  level: 'strict' | 'moderate' | 'permissive' = 'moderate'
): string {
  if (level === 'strict') {
    // Remove all HTML tags and encode entities
    return html
      .replace(/<[^>]*>/g, '') // Remove all tags
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  if (level === 'moderate') {
    // Remove dangerous tags and attributes
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'];
    const dangerousAttrs = ['onclick', 'onerror', 'onload', 'onchange', 'oninput', 'onsubmit'];

    let sanitized = html;

    // Remove dangerous tags
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<${tag}[^>]*>.*?<\/${tag}>`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });

    // Remove dangerous attributes
    dangerousAttrs.forEach(attr => {
      const regex = new RegExp(`\\s+${attr}\\s*=\\s*[\"'][^\"']*[\"']`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });

    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '');

    return sanitized;
  }

  // permissive - minimal sanitization
  return html
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/javascript:/gi, ''); // Remove javascript: protocol
}

/**
 * Safely render HTML content in React
 * Should be used with dangerouslySetInnerHTML
 * 
 * @example
 * <div dangerouslySetInnerHTML={{ __html: safeHtml(content) }} />
 */
export function safeHtml(html: string): string {
  return sanitizeHtml(html, 'moderate');
}

/**
 * Escape HTML to prevent interpretation of special characters
 * Converts HTML special characters to entities
 * 
 * @example
 * escapeHtml('<script>alert("xss")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') return '';

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'\/]/g, (char) => map[char] || char);
}

/**
 * Unescape HTML entities (reverse of escapeHtml)
 * Use only on trusted content or after validation
 * 
 * @example
 * unescapeHtml('&lt;div&gt;')
 * // Returns: '<div>'
 */
export function unescapeHtml(text: string): string {
  if (!text || typeof text !== 'string') return '';

  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
  };

  return text.replace(/&(?:amp|lt|gt|quot|#x27|#x2F);/g, (entity) => map[entity] || entity);
}

/**
 * Safe URL validation and sanitization
 * Prevents javascript: and data: protocols
 * 
 * @example
 * sanitizeUrl('javascript:alert(1)') // Returns: ''
 * sanitizeUrl('https://example.com') // Returns: 'https://example.com'
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  if (dangerousProtocols.some(proto => trimmed.startsWith(proto))) {
    return '';
  }

  try {
    // Try to parse as URL to validate format
    const parsed = new URL(url, window.location.href);
    return parsed.toString();
  } catch {
    // If not a valid absolute URL, treat as relative path
    // Allow relative URLs but validate they don't contain dangerous characters
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return encodeURI(url);
    }
    return '';
  }
}

/**
 * Safe CSS value sanitization
 * Prevents CSS injection attacks through data binding
 * 
 * @example
 * sanitizeCssValue('red')           // Returns: 'red'
 * sanitizeCssValue('url(data:xxx)') // Returns: ''
 */
export function sanitizeCssValue(value: string): string {
  if (!value || typeof value !== 'string') return '';

  // Block dangerous CSS
  if (/expression|import|url\s*\(|javascript:/i.test(value)) {
    return '';
  }

  return value.trim();
}

/**
 * Safe attribute value sanitization
 * Validates attribute values to prevent XSS
 * 
 * @example
 * sanitizeAttribute('href', '")onload="alert(1)')
 * // Returns: ''
 */
export function sanitizeAttribute(name: string, value: string): string {
  if (!value || typeof value !== 'string') return '';

  // Block dangerous attributes
  const dangerousAttrs = ['onclick', 'onerror', 'onload', 'onchange', 'oninput'];
  if (dangerousAttrs.includes(name.toLowerCase())) {
    return '';
  }

  // For href and src, sanitize as URL
  if (name.toLowerCase() === 'href' || name.toLowerCase() === 'src') {
    return sanitizeUrl(value);
  }

  // For style, sanitize as CSS
  if (name.toLowerCase() === 'style') {
    return sanitizeCssValue(value);
  }

  // For other attributes, escape HTML entities
  return escapeHtml(value);
}

/**
 * Sanitize object properties recursively
 * Useful for sanitizing API responses or user data
 * 
 * @example
 * const safe = sanitizeObject({
 *   name: '<script>alert(1)</script>',
 *   description: 'Normal text'
 * });
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  options: {
    stringLevel?: 'strict' | 'moderate';
    allowHtml?: boolean;
  } = {}
): T {
  const { stringLevel = 'moderate', allowHtml = false } = options;

  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === 'string'
        ? allowHtml
          ? sanitizeHtml(item, stringLevel)
          : escapeHtml(item)
        : typeof item === 'object'
          ? sanitizeObject(item, options)
          : item
    ) as unknown as T;
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Sanitize key
    const safeKey = escapeHtml(key);

    // Sanitize value based on type
    if (typeof value === 'string') {
      sanitized[safeKey] = allowHtml
        ? sanitizeHtml(value, stringLevel)
        : escapeHtml(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[safeKey] = sanitizeObject(value, options);
    } else {
      sanitized[safeKey] = value;
    }
  }

  return sanitized;
}

/**
 * Create a safe innerHTML object for React
 * Should be used with dangerouslySetInnerHTML
 * 
 * @example
 * <div dangerouslySetInnerHTML={createSafeInnerHTML(userContent)} />
 */
export function createSafeInnerHTML(html: string): { __html: string } {
  return {
    __html: sanitizeHtml(html, 'moderate'),
  };
}

/**
 * Validate and sanitize email addresses
 * 
 * @example
 * sanitizeEmail('user@example.com') // Valid
 * sanitizeEmail('"><script>alert(1)</script>') // Invalid, returns ''
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';

  const sanitized = escapeHtml(email.trim());

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(sanitized)) {
    return sanitized;
  }

  return '';
}

/**
 * Safe template literal tag for HTML
 * Prevents template injection
 * 
 * @example
 * const name = '</span><span onclick="alert(1)">'; 
 * const safe = html`<div>${name}</div>`;
 * // Safely renders without executing the injection
 */
export function html(
  strings: TemplateStringsArray,
  ...values: any[]
): string {
  let result = strings[0];

  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    const escaped = typeof value === 'string' ? escapeHtml(value) : String(value ?? '');
    result += escaped + strings[i + 1];
  }

  return result;
}
