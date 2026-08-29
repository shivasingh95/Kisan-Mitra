// src/components/Layout/Navbar.jsx — Upgraded with custom hooks + ARIA landmarks + i18n
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useWeather } from '@/shared/hooks/useWeather';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { useOnlineStatus } from '@/shared/hooks/useNetworkStatus';
import { useTranslation } from '@/i18n/useTranslation';
import './Navbar.css';

const PAGE_TITLES = {
  dashboard:           { en: 'Home Dashboard',    hi: 'होम डैशबोर्ड' },
  'crop-doctor':       { en: 'Crop Doctor AI',    hi: 'फ़सल डॉक्टर AI' },
  'marketplace-sell':  { en: 'Marketplace',       hi: 'मंडी / बेचो' },
  'marketplace-browse':{ en: 'Browse Market',     hi: 'बाज़ार देखो' },
  'labour-hire':       { en: 'Labour & Equipment',hi: 'मज़दूर व उपकरण' },
  'equipment-rent':    { en: 'Equipment Rent',    hi: 'उपकरण किराया' },
  'expert-connect':    { en: 'Expert Connect',    hi: 'विशेषज्ञ से जुड़ें' },
  fintech:             { en: 'Loans & Schemes',   hi: 'ऋण व योजनाएं' },
  'farm-profile':      { en: 'My Profile',        hi: 'मेरी प्रोफ़ाइल' },
  'expert-home':       { en: 'Expert Dashboard',  hi: 'विशेषज्ञ डैशबोर्ड' },
  sessions:            { en: 'Session Management',hi: 'सत्र प्रबंधन' },
  earnings:            { en: 'Earnings & Payouts',hi: 'कमाई' },
  orders:              { en: 'My Orders',         hi: 'मेरे ऑर्डर' },
  admin:               { en: 'Admin Panel',       hi: 'एडमिन पैनल' },
  'worker-dashboard':  { en: 'Worker Dashboard',  hi: 'श्रमिक डैशबोर्ड' },
  'worker-register':   { en: 'Worker Registration',hi: 'श्रमिक पंजीकरण' },
  'system-overview':   { en: 'System Overview',   hi: 'सिस्टम अवलोकन' },
};

const NOTIF_ICONS = {
  new_job:              '🆕',
  application_accepted: '✅',
  payment_released:     '💸',
  job_reminder:         '⏰',
};

export default function Navbar() {
  const { activeRoute, setSidebarOpen, sidebarOpen, demoRole, firebaseUser } = useApp();
  const { t, isHindi } = useTranslation();
  const [showNotifs, setShowNotifs] = useState(false);

  // ── Custom hooks ───────────────────────────────────────────
  const { weather: weatherData, isStale } = useWeather('Bhopal');
  const { notifications, unreadCount, dismissNotification } = useNotifications(firebaseUser);
  const { isOnline } = useOnlineStatus();

  const notifRef = useRef(null);

  // ── Outside Click for Notifs ───────────────────────────────
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ── Keyboard support for notification dropdown ─────────────
  const handleNotifKeyDown = (e) => {
    if (e.key === 'Escape') setShowNotifs(false);
  };

  const title = PAGE_TITLES[activeRoute] || { en: 'Krishi Mitra', hi: 'कृषि Mitra' };

  return (
    <header className="navbar" role="banner">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="offline-banner" role="alert" aria-live="assertive">
          <span>📡</span>
          <span>{t('common.offline')}</span>
        </div>
      )}

      {/* Hamburger */}
      <button
        className="navbar-hamburger"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={sidebarOpen}
        aria-controls="main-sidebar"
      >
        <span /><span /><span />
      </button>

      {/* Page Title */}
      <div className="navbar-title">
        <h2 className="navbar-page-name">{isHindi ? title.hi : title.en}</h2>
        <span className="navbar-page-hi hindi">{isHindi ? title.en : title.hi}</span>
      </div>

      {/* Right actions */}
      <div className="navbar-actions">
        {/* Weather pill */}
        <div 
          className="weather-pill" 
          aria-label={`Weather: ${weatherData?.temp || '--'}°C in ${weatherData?.city || 'loading'}${isStale ? ' (cached)' : ''}`}
          title={isStale ? (isHindi ? 'ऑफ़लाइन कैश डेटा' : 'Cached offline data') : undefined}
        >
          <span>{weatherData ? weatherData.icon : '⛅'}</span>
          <span>{weatherData ? `${weatherData.temp}°C` : '--'}</span>
          <span className="weather-loc">
            {weatherData ? weatherData.city : t('weather.loading')}
            {isStale && <span style={{ opacity: 0.7, fontSize: 10, marginLeft: 4 }}>📴</span>}
          </span>
        </div>

        {/* Notifications */}
        <div className="notif-wrap" ref={notifRef} onKeyDown={handleNotifKeyDown}>
          <button
            className="icon-action-btn"
            onClick={() => setShowNotifs(!showNotifs)}
            aria-label={`${t('common.notifications')}${unreadCount > 0 ? ` — ${unreadCount}` : ''}`}
            aria-expanded={showNotifs}
            aria-haspopup="true"
          >
            🔔
            {unreadCount > 0 && (
              <span className="notif-count-badge" aria-hidden="true">{unreadCount}</span>
            )}
            {unreadCount === 0 && <span className="notif-dot" aria-hidden="true" />}
          </button>
          {showNotifs && (
            <div className="notif-dropdown" role="menu" aria-label="Notifications list">
              <div className="notif-header">
                <span>{t('common.notifications')}</span>
                {unreadCount > 0 && <span className="badge badge-red">{unreadCount}</span>}
              </div>
              {notifications.length === 0 ? (
                <div className="notif-empty">
                  <span>🔕</span>
                  <p>{t('common.noNotifications')}</p>
                </div>
              ) : notifications.map(n => (
                <div
                  key={n.id}
                  className="notif-item notif-info"
                  onClick={() => dismissNotification(n)}
                  onKeyDown={(e) => e.key === 'Enter' && dismissNotification(n)}
                  role="menuitem"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="notif-dot-type" aria-hidden="true">{NOTIF_ICONS[n.type] || '🔔'}</span>
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: 2 }}>{n.title}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{n.body}</p>
                    <span className="notif-time">
                      {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile avatar pill */}
        <div className="navbar-profile" aria-label={`Profile: ${demoRole} account`}>
          <div className="avatar avatar-sm" aria-hidden="true">
            {demoRole === 'farmer' ? '👨‍🌾' : demoRole === 'expert' ? '👨‍🏫' : demoRole === 'buyer' ? '🏪' : demoRole === 'worker' ? '👷' : '⚙️'}
          </div>
          <div className="navbar-profile-text">
            <span className="navbar-profile-name">Demo User</span>
            <span className="navbar-profile-role">{t(`common.${demoRole}`)}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
