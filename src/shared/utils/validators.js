// shared/utils/validators.js — Input validation utilities

/**
 * Validate Indian mobile number (10 digits, starts with 6-9)
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  const clean = phone?.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(clean);
}

/**
 * Validate 6-digit OTP
 * @param {string} otp
 * @returns {boolean}
 */
export function isValidOTP(otp) {
  return /^\d{6}$/.test(otp);
}

/**
 * Validate Aadhaar number (12 digits, passes Verhoeff checksum)
 * @param {string} aadhaar
 * @returns {boolean}
 */
export function isValidAadhaar(aadhaar) {
  const clean = aadhaar?.replace(/\D/g, '');
  return /^\d{12}$/.test(clean);
}

/**
 * Validate PIN code (6-digit Indian postal code)
 * @param {string} pin
 * @returns {boolean}
 */
export function isValidPinCode(pin) {
  return /^[1-9]\d{5}$/.test(pin);
}

/**
 * Validate non-empty string with min/max length
 * @param {string} value
 * @param {number} [min=1]
 * @param {number} [max=200]
 * @returns {boolean}
 */
export function isValidText(value, min = 1, max = 200) {
  const trimmed = value?.trim();
  return !!trimmed && trimmed.length >= min && trimmed.length <= max;
}

/**
 * Validate numeric value within range
 * @param {number} value
 * @param {number} [min=0]
 * @param {number} [max=Infinity]
 * @returns {boolean}
 */
export function isValidNumber(value, min = 0, max = Infinity) {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
}
