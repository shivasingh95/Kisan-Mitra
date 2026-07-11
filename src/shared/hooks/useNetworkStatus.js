// src/hooks/useOnlineStatus.js — Network connectivity detection
import { useState, useEffect } from 'react';

/**
 * Hook that tracks browser online/offline status.
 * @returns {{ isOnline: boolean, wasOffline: boolean }}
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      // Mark that we recovered from offline — useful for showing "Back online!" toast
      setWasOffline(true);
      // Auto-clear the flag after 5 seconds
      setTimeout(() => setWasOffline(false), 5000);
    };
    const goOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}
