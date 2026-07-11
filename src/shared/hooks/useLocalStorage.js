// shared/hooks/useLocalStorage.js — Persistent local storage hook
import { useState, useCallback } from 'react';

/**
 * useState synced with localStorage.
 * @param {string} key — localStorage key
 * @param {*} initialValue — fallback if key not found
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (err) {
      console.warn(`[useLocalStorage] Error reading "${key}":`, err);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      console.warn(`[useLocalStorage] Error writing "${key}":`, err);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (err) {
      console.warn(`[useLocalStorage] Error removing "${key}":`, err);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
