// src/shared/utils/sanitize.js — Input sanitization & validation
// Protects against XSS, SQL injection, and malformed input

// ── HTML/XSS Sanitization ─────────────────────────────────────
// Strips all HTML tags and encodes dangerous characters
const HTML_ENTITY_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
};

/**
 * Escape HTML entities to prevent XSS in user-generated content.
 * @param {string} str — raw user input
 * @returns {string} — safe string with HTML entities escaped
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'`/]/g, (char) => HTML_ENTITY_MAP[char]);
}

/**
 * Strip all HTML tags from a string.
 * @param {string} str — raw input possibly containing HTML
 * @returns {string} — plain text
 */
export function stripHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize user input: strip HTML, trim whitespace, enforce length.
 * Use this for all form fields before saving to Firestore.
 * @param {string} str — raw user input
 * @param {number} [maxLength=500] — maximum allowed length
 * @returns {string} — clean, safe string
 */
export function sanitizeInput(str, maxLength = 500) {
  if (typeof str !== 'string') return '';
  return stripHtml(str).trim().slice(0, maxLength);
}

// ── Phone Number Validation ───────────────────────────────────

/**
 * Validate and normalize an Indian phone number.
 * Accepts: 10 digits, optionally with +91 or 0 prefix.
 * @param {string} phone — raw phone input
 * @returns {{ valid: boolean, normalized: string, error?: string }}
 */
export function validatePhone(phone) {
  if (typeof phone !== 'string') {
    return { valid: false, normalized: '', error: 'Phone number must be a string' };
  }

  // Remove spaces, dashes, dots
  const cleaned = phone.replace(/[\s\-().]/g, '');

  // Remove country code prefix
  let digits = cleaned;
  if (digits.startsWith('+91')) digits = digits.slice(3);
  else if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = digits.slice(1);

  // Must be exactly 10 digits
  if (!/^\d{10}$/.test(digits)) {
    return { valid: false, normalized: '', error: 'Phone number must be 10 digits' };
  }

  // Must start with 6, 7, 8, or 9 (Indian mobile numbers)
  if (!/^[6-9]/.test(digits)) {
    return { valid: false, normalized: '', error: 'Invalid Indian mobile number' };
  }

  return { valid: true, normalized: digits };
}

// ── Aadhaar Validation ────────────────────────────────────────

/**
 * Validate Aadhaar last 4 digits (partial for privacy).
 * @param {string} last4 — last 4 digits of Aadhaar
 * @returns {boolean}
 */
export function validateAadhaarLast4(last4) {
  return typeof last4 === 'string' && /^\d{4}$/.test(last4.trim());
}

// ── General Validators ────────────────────────────────────────

/**
 * Validate a name (Hindi or English).
 * Allows letters, spaces, dots, hyphens, and Devanagari script.
 * @param {string} name
 * @param {number} [maxLength=100]
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateName(name, maxLength = 100) {
  if (typeof name !== 'string' || name.trim().length === 0) {
    return { valid: false, error: 'Name is required' };
  }
  if (name.length > maxLength) {
    return { valid: false, error: `Name must be under ${maxLength} characters` };
  }
  // Allow Latin, Devanagari, spaces, dots, hyphens
  if (!/^[\p{L}\p{M}\s.\-']+$/u.test(name.trim())) {
    return { valid: false, error: 'Name contains invalid characters' };
  }
  return { valid: true };
}

/**
 * Validate a positive number (price, quantity, wage, etc.)
 * @param {*} value — the value to check
 * @param {string} fieldName — for error messages
 * @param {number} [max=Infinity] — optional upper bound
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePositiveNumber(value, fieldName, max = Infinity) {
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: `${fieldName} must be a positive number` };
  }
  if (num > max) {
    return { valid: false, error: `${fieldName} must be less than ${max}` };
  }
  return { valid: true };
}

/**
 * Sanitize an entire object's string fields (for Firestore writes).
 * @param {Object} data — object with string fields
 * @param {Object} [fieldLimits={}] — { fieldName: maxLength } overrides
 * @returns {Object} — sanitized copy
 */
export function sanitizeObject(data, fieldLimits = {}) {
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value, fieldLimits[key] || 500);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeInput(item, fieldLimits[key] || 500) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
