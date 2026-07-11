// src/hooks/useNotifications.js — Firestore real-time notifications hook
// Extracted from Navbar.jsx for reusability
import { useState, useEffect } from 'react';
import { subscribeToNotifications, markNotificationRead } from '@/services/firebase/firestore.service';

/**
 * Subscribe to Firestore notifications for the current user.
 * @param {object|null} firebaseUser — from AuthContext
 * @returns {{ notifications, unreadCount, dismissNotification }}
 */
export function useNotifications(firebaseUser) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const uid = firebaseUser?.uid;
    if (!uid || uid === 'demo') return;

    const unsub = subscribeToNotifications(uid, (notifs) => {
      setNotifications(notifs);
    });

    return unsub;
  }, [firebaseUser]);

  const dismissNotification = async (notif) => {
    if (firebaseUser?.uid && firebaseUser.uid !== 'demo') {
      try {
        await markNotificationRead(notif.id);
      } catch {
        /* ignore — will be retried on next load */
      }
    }
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
  };

  return {
    notifications,
    unreadCount: notifications.length,
    dismissNotification,
  };
}

