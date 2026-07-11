// shared/utils/formatters.js — Common formatting utilities for Indian agriculture context

/**
 * Format Indian currency (₹)
 * @param {number} amount
 * @param {boolean} [compact=false] — use compact notation (1.2L, 50K)
 */
export function formatINR(amount, compact = false) {
  if (amount == null || isNaN(amount)) return '₹--';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    ...(compact ? { notation: 'compact', compactDisplay: 'short' } : {}),
  }).format(amount);
}

/**
 * Format weight in quintals / tonnes
 * @param {number} kgs
 */
export function formatWeight(kgs) {
  if (kgs >= 1000) return `${(kgs / 1000).toFixed(1)} tonnes`;
  if (kgs >= 100) return `${(kgs / 100).toFixed(1)} quintals`;
  return `${kgs} kg`;
}

/**
 * Format area in acres / hectares
 * @param {number} acres
 */
export function formatArea(acres) {
  if (acres >= 2.47) return `${(acres / 2.47).toFixed(1)} hectares`;
  return `${acres} acres`;
}

/**
 * Format Indian phone number
 * @param {string} phone — 10-digit number or with +91
 */
export function formatPhone(phone) {
  const clean = phone?.replace(/\D/g, '').slice(-10);
  if (!clean || clean.length !== 10) return phone;
  return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
}

/**
 * Relative time (e.g., "2 hours ago", "3 days ago")
 * @param {Date|string|number} date
 */
export function timeAgo(date) {
  const now = Date.now();
  const then = new Date(date).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString('en-IN');
}
