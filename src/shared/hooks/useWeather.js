// src/hooks/useWeather.js — Shared weather data hook
// Replaces duplicate getWeather() calls in Navbar + HomeDashboard
import { useState, useEffect } from 'react';
import { getWeather } from '@/services/api/weather.service';

const FALLBACK = {
  temp: '--', feelsLike: '--', humidity: '--', windSpeed: '--',
  rain: '--', uv: '--', condition: 'Fetching location...',
  icon: '⛅', city: '…', region: '', country: '',
  alerts: [], forecast: [],
};

let _cachedWeather = null;
let _fetchPromise = null;

/**
 * Hook that provides weather data with caching across component instances.
 * @param {string} [cityFallback='Bhopal'] — fallback city if geolocation fails
 */
export function useWeather(cityFallback = 'Bhopal') {
  const [weather, setWeather] = useState(_cachedWeather || FALLBACK);
  const [loading, setLoading] = useState(!_cachedWeather);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If already cached, use it immediately
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
          setWeather(data);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
        _fetchPromise = null;
      });

    return () => { cancelled = true; };
  }, [cityFallback]);

  return { weather, loading, error };
}

