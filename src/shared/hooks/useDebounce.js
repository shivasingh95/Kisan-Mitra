// shared/hooks/useDebounce.js — Debounce hook for search inputs, API calls
import { useState, useEffect } from 'react';

/**
 * Debounce a rapidly-changing value.
 * @param {*} value — the value to debounce
 * @param {number} delay — debounce delay in ms (default 300)
 * @returns {*} — the debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
