// src/components/ui/Toast.jsx — Glassmorphism toast notification component
import { useState, useEffect, useRef } from 'react';
import './Toast.css';

const ICONS = {
  success: '✅',
  error:   '❌',
  info:    'ℹ️',
  warning: '⚠️',
};

export default function Toast({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (!toast) {
      setVisible(false);
      return;
    }

    setVisible(true);
    setProgress(100);
    startRef.current = Date.now();

    const duration = toast.duration || 3500;

    // Progress bar countdown
    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 50);

    // Auto-dismiss
    timerRef.current = setTimeout(() => {
      setVisible(false);
      clearInterval(interval);
      setTimeout(() => onDismiss?.(), 350); // wait for exit animation
    }, duration);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(interval);
    };
  }, [toast?.id]); // re-trigger on new toast (keyed by id)

  const handleDismiss = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
    setTimeout(() => onDismiss?.(), 350);
  };

  if (!toast) return null;

  const type = toast.type || 'success';

  return (
    <div
      className={`toast-container ${visible ? 'toast-enter' : 'toast-exit'}`}
      role="alert"
      aria-live="assertive"
      data-type={type}
    >
      <div className="toast-body">
        <span className="toast-icon">{ICONS[type] || ICONS.success}</span>
        <span className="toast-message">{toast.message}</span>
        <button
          className="toast-dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
      <div className="toast-progress">
        <div
          className="toast-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
