// src/shared/utils/rateLimit.js — Client-side rate limiter
// Token-bucket algorithm to prevent API abuse from the browser

/**
 * Creates a token-bucket rate limiter.
 *
 * @param {Object} options
 * @param {number} options.maxTokens    — bucket capacity (max burst)
 * @param {number} options.refillRate   — tokens added per second
 * @param {string} [options.name]       — identifier for logging
 * @returns {{ consume: (tokens?: number) => boolean, canConsume: (tokens?: number) => boolean, remaining: () => number, reset: () => void }}
 *
 * @example
 * const limiter = createRateLimiter({ maxTokens: 5, refillRate: 1, name: 'plantnet' });
 *
 * async function scanCrop(file) {
 *   if (!limiter.consume()) {
 *     showToast('Too many scans. Please wait a moment.', 'warning');
 *     return;
 *   }
 *   // proceed with API call...
 * }
 */
export function createRateLimiter({ maxTokens, refillRate, name = 'default' }) {
  let tokens = maxTokens;
  let lastRefill = Date.now();

  function refill() {
    const now = Date.now();
    const elapsed = (now - lastRefill) / 1000; // seconds
    tokens = Math.min(maxTokens, tokens + elapsed * refillRate);
    lastRefill = now;
  }

  return {
    /**
     * Try to consume tokens. Returns true if allowed, false if rate-limited.
     * @param {number} [count=1] — number of tokens to consume
     */
    consume(count = 1) {
      refill();
      if (tokens >= count) {
        tokens -= count;
        return true;
      }
      console.warn(`[RateLimit:${name}] Rate limited. ${tokens.toFixed(1)} tokens remaining.`);
      return false;
    },

    /**
     * Check if tokens are available without consuming them.
     * @param {number} [count=1]
     */
    canConsume(count = 1) {
      refill();
      return tokens >= count;
    },

    /** Get current token count */
    remaining() {
      refill();
      return Math.floor(tokens);
    },

    /** Reset to full capacity */
    reset() {
      tokens = maxTokens;
      lastRefill = Date.now();
    },
  };
}

// ── Pre-configured limiters for each API ──────────────────────

/** PlantNet: max 5 scans burst, refill 1/sec (allows ~60/min sustained) */
export const plantnetLimiter = createRateLimiter({
  maxTokens: 5,
  refillRate: 1,
  name: 'plantnet',
});

/** Weather API: max 3 burst, refill 0.1/sec (allows ~6/min) */
export const weatherLimiter = createRateLimiter({
  maxTokens: 3,
  refillRate: 0.1,
  name: 'weather',
});

/** Firestore writes: max 10 burst, refill 2/sec */
export const firestoreWriteLimiter = createRateLimiter({
  maxTokens: 10,
  refillRate: 2,
  name: 'firestore-write',
});

/** OTP sends: max 3 burst, refill 0.005/sec (~1 per 3 minutes) */
export const otpLimiter = createRateLimiter({
  maxTokens: 3,
  refillRate: 1 / 180, // 1 token per 3 minutes
  name: 'otp',
});
