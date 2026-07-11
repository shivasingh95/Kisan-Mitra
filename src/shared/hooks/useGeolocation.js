// shared/hooks/useGeolocation.js — Browser geolocation hook
import { useState, useEffect } from 'react';

/**
 * Get user's geolocation coordinates.
 * Falls back gracefully if geolocation is denied or unavailable.
 * @param {object} [options] — { enableHighAccuracy, timeout, maximumAge }
 */
export function useGeolocation(options = {}) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError(new Error('Geolocation is not supported by this browser'));
      setLoading(false);
      return;
    }

    const onSuccess = (pos) => {
      setPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });
      setLoading(false);
    };

    const onError = (err) => {
      setError(err);
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: options.enableHighAccuracy ?? false,
      timeout: options.timeout ?? 10000,
      maximumAge: options.maximumAge ?? 5 * 60 * 1000, // 5 min cache
    });
  }, []);

  return { position, error, loading };
}
