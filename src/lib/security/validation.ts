/**
 * Input Validation & Sanitization Utilities
 * Prevents XSS, injection attacks, and invalid input
 * Production-ready validation for user input
 */

/**
 * Safe text sanitization - remove potential XSS vectors
 * This is a basic sanitizer for user-entered text
 * For rich content, use a library like DOMPurify
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    // Encode HTML special characters
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate text input
 */
export function validateText(
  input: string,
  options: {
    minLength?: number;
    maxLength?: number;
    allowEmpty?: boolean;
  } = {}
): { valid: boolean; error?: string } {
  const { minLength = 0, maxLength = 10000, allowEmpty = false } = options;

  if (typeof input !== 'string') {
    return { valid: false, error: 'Input must be text' };
  }

  const text = input.trim();

  if (!text && !allowEmpty) {
    return { valid: false, error: 'Input cannot be empty' };
  }

  if (text.length < minLength) {
    return { valid: false, error: `Input must be at least ${minLength} characters` };
  }

  if (text.length > maxLength) {
    return { valid: false, error: `Input cannot exceed ${maxLength} characters` };
  }

  return { valid: true };
}

/**
 * Validate email address
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = sanitizeText(email).trim();

  if (!sanitized) {
    return { valid: false, error: 'Email is required' };
  }

  if (sanitized.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }

  if (!emailRegex.test(sanitized)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

/**
 * Validate URL
 */
export function validateURL(url: string): { valid: boolean; error?: string } {
  if (typeof url !== 'string' || !url.trim()) {
    return { valid: true }; // URLs are optional
  }

  try {
    const urlObj = new URL(url);
    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'URL must use http:// or https://' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validate phone number (basic)
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (typeof phone !== 'string' || !phone.trim()) {
    return { valid: true }; // Phone is optional
  }

  const sanitized = sanitizeText(phone).trim();

  // Remove common separators
  const cleaned = sanitized.replace(/[\s\-\(\)\.]/g, '');

  // Must be 7-15 digits
  if (!/^\d{7,15}$/.test(cleaned)) {
    return { valid: false, error: 'Phone number must be 7-15 digits' };
  }

  return { valid: true };
}

/**
 * Validate CGPA/GPA
 */
export function validateGPA(gpa: string): { valid: boolean; error?: string } {
  if (typeof gpa !== 'string' || !gpa.trim()) {
    return { valid: true }; // GPA is optional
  }

  const sanitized = sanitizeText(gpa).trim();
  const gpaNum = parseFloat(sanitized);

  // Handle common formats like "7.5", "8.2/10", "3.5/4.0"
  if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 10) {
    return { valid: false, error: 'GPA must be between 0 and 10' };
  }

  return { valid: true };
}

/**
 * Validate year (for education, experience dates)
 */
export function validateYear(year: string): { valid: boolean; error?: string } {
  if (typeof year !== 'string' || !year.trim()) {
    return { valid: true }; // Year is optional
  }

  const sanitized = sanitizeText(year).trim();
  const currentYear = new Date().getFullYear();

  // Allow year ranges like "2020-2023" or "2020 - 2023"
  const yearRegex = /^(19|20)\d{2}(-|–|to|–|\s*-\s*|\s*to\s*)(19|20)\d{2}|Present|current|ongoing|now$/i;

  if (!yearRegex.test(sanitized)) {
    // If not a range, try single year
    if (!/^(19|20)\d{2}$/.test(sanitized)) {
      return { valid: false, error: 'Year must be valid (YYYY or YYYY-YYYY)' };
    }

    const yearNum = parseInt(sanitized, 10);
    if (yearNum > currentYear + 5) {
      return { valid: false, error: 'Year cannot be more than 5 years in the future' };
    }
  }

  return { valid: true };
}
