// src/utils/ServiceError.js — Typed errors for service layer
// Provides structured error codes + Hindi messages for farmer-facing errors

export const ERROR_CODES = {
  NETWORK:    'NETWORK',
  AUTH:       'AUTH',
  FIRESTORE:  'FIRESTORE',
  API:        'API',
  VALIDATION: 'VALIDATION',
  TIMEOUT:    'TIMEOUT',
  UNKNOWN:    'UNKNOWN',
};

const HINDI_MESSAGES = {
  [ERROR_CODES.NETWORK]:    'Internet connection nahi hai. Kripya check karein.',
  [ERROR_CODES.AUTH]:       'Login mein dikkat hai. Dobara login karein.',
  [ERROR_CODES.FIRESTORE]:  'Data load nahi ho paya. Dobara try karein.',
  [ERROR_CODES.API]:        'Server se response nahi aaya. Thodi der mein try karein.',
  [ERROR_CODES.VALIDATION]: 'Galat data diya gaya hai. Kripya check karein.',
  [ERROR_CODES.TIMEOUT]:    'Request ka time khatam ho gaya. Dobara try karein.',
  [ERROR_CODES.UNKNOWN]:    'Kuch galat ho gaya. Kripya dobara try karein.',
};

export class ServiceError extends Error {
  /**
   * @param {string} code    — one of ERROR_CODES
   * @param {string} message — English technical message
   * @param {Error}  [cause] — original error for debugging
   */
  constructor(code, message, cause) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.hindiMessage = HINDI_MESSAGES[code] || HINDI_MESSAGES[ERROR_CODES.UNKNOWN];
    this.cause = cause;
    this.timestamp = Date.now();
  }

  /** User-friendly message based on code */
  get userMessage() {
    return this.hindiMessage;
  }

  /** Log structured error to console */
  log() {
    console.error(
      `[ServiceError] ${this.code}: ${this.message}`,
      this.cause ? { cause: this.cause } : ''
    );
  }
}

/**
 * Wrap any async function's error into a ServiceError
 * @param {string} code     — ERROR_CODES value
 * @param {string} context  — e.g. "loading weather data"
 */
export function wrapError(code, context) {
  return (error) => {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(code, `Failed ${context}: ${error.message}`, error);
  };
}
