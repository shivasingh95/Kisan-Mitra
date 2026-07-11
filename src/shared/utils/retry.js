// src/utils/retry.js — Generic async retry with exponential backoff
// Used by cropDoctor, weather, and Firestore service calls

/**
 * Retry an async function with exponential backoff.
 *
 * @param {Function} fn           — async function to retry
 * @param {Object}   [options]
 * @param {number}   [options.retries=3]      — max retry attempts
 * @param {number}   [options.baseDelay=500]  — initial delay in ms
 * @param {number}   [options.maxDelay=5000]  — max delay cap in ms
 * @param {Function} [options.shouldRetry]    — predicate(error) → boolean
 * @returns {Promise<*>}
 */
export async function retry(fn, options = {}) {
  const {
    retries = 3,
    baseDelay = 500,
    maxDelay = 5000,
    shouldRetry = () => true,
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === retries || !shouldRetry(error)) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      const jitter = delay * (0.5 + Math.random() * 0.5);
      await new Promise((resolve) => setTimeout(resolve, jitter));
    }
  }

  throw lastError;
}

/**
 * Check if an error is likely a transient network issue worth retrying.
 */
export function isRetryableError(error) {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) return true;
  if (error.name === 'AbortError') return false; // user-cancelled, don't retry

  // HTTP status codes that are retryable
  if (error.status) {
    return [408, 429, 500, 502, 503, 504].includes(error.status);
  }

  // Firebase errors that are retryable
  if (error.code) {
    return ['unavailable', 'deadline-exceeded', 'resource-exhausted'].includes(error.code);
  }

  return false;
}
