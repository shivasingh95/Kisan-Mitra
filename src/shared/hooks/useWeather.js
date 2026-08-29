// src/hooks/useWeather.js — Shared weather data hook with offline caching
// Replaces duplicate getWeather() calls in Navbar + HomeDashboard
// Falls back to localStorage-cached data when offline
import { useState, useEffect } from 'react';
import { getWeather } from '@/services/api/weather.service';

const STORAGE_KEY = 'krishi-mitra-weather-cache';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

const FALLBACK = {
  temp: '--', feelsLike: '--', humidity: '--', windSpeed: '--',
  rain: '--', uv: '--', condition: 'Fetching location...',
  icon: '⛅', city: '…', region: '', country: '',
  alerts: [], forecast: [],
};

/**
 * Read cached weather from localStorage (offline-safe).
 */
function getCachedWeather() {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    // Only return if within TTL
    if (Date.now() - timestamp < CACHE_TTL_MS) return data;
    return data; // Return stale data as fallback even if expired
  } catch {
    return null;
  }
}

/**
 * Write weather to localStorage cache.
 */
function setCachedWeather(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch { /* quota exceeded or unavailable */ }
}

let _cachedWeather = null;
let _fetchPromise = null;

/**
 * Hook that provides weather data with dual-layer caching:
 * 1. In-memory cache (shared across component instances in same session)
 * 2. localStorage cache (persists across sessions, works offline)
 *
 * @param {string} [cityFallback='Bhopal'] — fallback city if geolocation fails
 */
export function useWeather(cityFallback = 'Bhopal') {
  const [weather, setWeather] = useState(() => {
    return _cachedWeather || getCachedWeather() || FALLBACK;
  });
  const [loading, setLoading] = useState(!_cachedWeather);
  const [error, setError] = useState(null);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    // If already cached in memory, use it immediately
    if (_cachedWeather) {
      setWeather(_cachedWeather);
      setLoading(false);
      return;
    }

    // If a fetch is already in progress, share its promise
    if (!_fetchPromise) {
      _fetchPromise = getWeather(cityFallback);
    }

    let cancelled = false;

    _fetchPromise
      .then((data) => {
        if (!cancelled && data) {
          _cachedWeather = data;
          setCachedWeather(data); // Persist to localStorage for offline use
          setWeather(data);
          setIsStale(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          // If network fails, try localStorage fallback
          const cached = getCachedWeather();
          if (cached) {
            setWeather(cached);
            setIsStale(true); // Mark as stale so UI can show indicator
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
        _fetchPromise = null;
      });

    return () => { cancelled = true; };
  }, [cityFallback]);

  return { weather, loading, error, isStale };
}
