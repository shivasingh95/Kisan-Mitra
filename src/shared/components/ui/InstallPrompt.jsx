// src/shared/components/ui/InstallPrompt.jsx
// Captures native beforeinstallprompt event to let farmers install KrishiMitra as an app
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import './InstallPrompt.css';

const DISMISS_KEY = 'krishi-pwa-dismiss-time';
const DISMISS_DAYS = 7;

export default function InstallPrompt() {
  const { isHindi } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user dismissed recently
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (dismissed && Date.now() - Number(dismissed) < DISMISS_DAYS * 24 * 60 * 60 * 1000) {
        return;
      }
    } catch { /* ignore */ }

    // Check if already in standalone (installed) mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch { /* ignore */ }
  };

  if (!showPrompt) return null;

  return (
    <aside className="pwa-install-banner" role="dialog" aria-labelledby="pwa-title" aria-describedby="pwa-desc">
      <div className="pwa-install-icon" aria-hidden="true">📲</div>
      <div className="pwa-install-info">
        <div className="pwa-install-title" id="pwa-title">
          {isHindi ? 'फ़ोन में ऐप जोड़ें' : 'Install Krishi Mitra'}
        </div>
        <div className="pwa-install-desc" id="pwa-desc">
          {isHindi ? 'बिना इंटरनेट भी चलेगा · 2MB से कम' : 'Works offline · Fast & lightweight'}
        </div>
      </div>
      <div className="pwa-install-actions">
        <button className="pwa-install-btn" onClick={handleInstall}>
          {isHindi ? 'इंस्टॉल करें' : 'Install'}
        </button>
        <button 
          className="pwa-install-close" 
          onClick={handleDismiss} 
          aria-label={isHindi ? 'बंद करें' : 'Dismiss'}
        >
          ✕
        </button>
      </div>
    </aside>
  );
}
