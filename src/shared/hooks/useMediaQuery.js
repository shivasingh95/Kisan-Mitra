// src/hooks/useMediaQuery.js — Responsive breakpoint detection
import { useState, useEffect } from 'react';

/**
 * Hook that returns true when the given CSS media query matches.
 * @param {string} query — e.g. '(max-width: 768px)'
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);

    // Modern browsers support addEventListener
    mql.addEventListener('change', handler);
    // Sync initial state
    setMatches(mql.matches);

    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * Convenience hook: returns true on mobile-sized viewports.
 */
export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)');
}
