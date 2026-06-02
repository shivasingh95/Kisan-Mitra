import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import './Navbar.css';
import { getWeather } from '../../services/weather';
import { subscribeToNotifications, markNotificationRead } from '../../services/db';

const PAGE_TITLES = {
  dashboard:           { en: 'Home Dashboard',    hi: 'होम डैशबोर्ड' },
  'crop-doctor':       { en: 'Crop Doctor AI',    hi: 'फ़सल डॉक्टर' },
  'marketplace-sell':  { en: 'Marketplace',       hi: 'मंडी / बेचो' },
  'marketplace-browse':{ en: 'Browse Market',     hi: 'बाज़ार देखो' },
  'labour-hire':       { en: 'Labour & Equipment',hi: 'मज़दूर व उपकरण' },
  'equipment-rent':    { en: 'Equipment Rent',    hi: 'उपकरण किराया' },
  'expert-connect':    { en: 'Expert Connect',    hi: 'विशेषज्ञ' },
  fintech:             { en: 'Loans & Schemes',   hi: 'ऋण व योजनाएं' },
  'farm-profile':      { en: 'My Profile',        hi: 'मेरी प्रोफ़ाइल' },
  'expert-home':       { en: 'Expert Dashboard',  hi: 'विशेषज्ञ डैशबोर्ड' },
  sessions:            { en: 'Session Management',hi: 'सत्र' },
  earnings:            { en: 'Earnings & Payouts',hi: 'कमाई' },
  orders:              { en: 'My Orders',         hi: 'मेरे ऑर्डर' },
  admin:               { en: 'Admin Panel',       hi: 'एडमिन पैनल' },
  'worker-dashboard':  { en: 'Worker Dashboard',  hi: 'श्रमिक डैशबोर्ड' },
  'worker-register':   { en: 'Worker Registration',hi: 'श्रमिक पंजीकरण' },
};

const NOTIF_ICONS = {
  new_job:              '🆕',
  application_accepted: '✅',
  payment_released:     '💸',
  job_reminder:         '⏰',
};

export default function Navbar() {
  const { activeRoute, setSidebarOpen, sidebarOpen, demoRole, firebaseUser } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [weatherData, setWeatherData] = useState(null);

  const notifRef = useRef(null);

  // ── Weather ────────────────────────────────────────────────
  useEffect(() => {
    getWeather('Bhopal').then(data => { if (data) setWeatherData(data); });
  }, []);

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

  // ── Live Firestore notifications ───────────────────────────
  useEffect(() => {
    const uid = firebaseUser?.uid;
    if (!uid || uid === 'demo') return;
    const unsub = subscribeToNotifications(uid, (notifs) => {
      setNotifications(notifs);
    });
    return unsub;
  }, [firebaseUser]);

  const unreadCount = notifications.length;

  const handleNotifClick = async (notif) => {
    if (firebaseUser?.uid && firebaseUser.uid !== 'demo') {
      try { await markNotificationRead(notif.id); } catch { /* ignore */ }
    }
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
  };

  const title = PAGE_TITLES[activeRoute] || { en: 'Krishi Mitra', hi: 'कृषि Mitra' };

  return (
    <header className="navbar">
      {/* Hamburger */}
      <button className="navbar-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <span /><span /><span />
      </button>

      {/* Page Title */}
      <div className="navbar-title">
        <h2 className="navbar-page-name">{title.en}</h2>
        <span className="navbar-page-hi hindi">{title.hi}</span>
      </div>

      {/* Right actions */}
      <div className="navbar-actions">
        {/* Weather pill */}
        <div className="weather-pill">
          <span>{weatherData ? weatherData.icon : '⛅'}</span>
          <span>{weatherData ? `${weatherData.temp}°C` : '--'}</span>
          <span className="weather-loc">{weatherData ? weatherData.city : 'Loading...'}</span>
        </div>

        {/* Notifications */}
        <div className="notif-wrap" ref={notifRef}>
          <button
            className="icon-action-btn"
            onClick={() => setShowNotifs(!showNotifs)}
            aria-label="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span className="notif-count-badge">{unreadCount}</span>
            )}
            {unreadCount === 0 && <span className="notif-dot" />}
          </button>
          {showNotifs && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <span>Notifications</span>
                {unreadCount > 0 && <span className="badge badge-red">{unreadCount}</span>}
              </div>
              {notifications.length === 0 ? (
                <div className="notif-empty">
                  <span>🔕</span>
                  <p>No new notifications</p>
                  <span className="hindi" style={{ fontSize: 11 }}>कोई नई सूचना नहीं</span>
                </div>
              ) : notifications.map(n => (
                <div
                  key={n.id}
                  className="notif-item notif-info"
                  onClick={() => handleNotifClick(n)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="notif-dot-type">{NOTIF_ICONS[n.type] || '🔔'}</span>
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
        <div className="navbar-profile">
          <div className="avatar avatar-sm">
            {demoRole === 'farmer' ? '👨‍🌾' : demoRole === 'expert' ? '👨‍🏫' : demoRole === 'buyer' ? '🏪' : demoRole === 'worker' ? '👷' : '⚙️'}
          </div>
          <div className="navbar-profile-text">
            <span className="navbar-profile-name">Demo User</span>
            <span className="navbar-profile-role">{demoRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
