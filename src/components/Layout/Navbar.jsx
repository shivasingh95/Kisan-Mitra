import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import './Navbar.css';
import { getWeather } from '../../services/weather';

const PAGE_TITLES = {
  dashboard: { en: 'Home Dashboard', hi: 'होम डैशबोर्ड' },
  'crop-doctor': { en: 'Crop Doctor AI', hi: 'फ़सल डॉक्टर' },
  'marketplace-sell': { en: 'Marketplace', hi: 'मंडी / बेचो' },
  'marketplace-browse': { en: 'Browse Market', hi: 'बाज़ार देखो' },
  'labour-hire': { en: 'Labour Hire', hi: 'मज़दूर भाड़े' },
  'equipment-rent': { en: 'Equipment Rent', hi: 'उपकरण किराया' },
  'expert-connect': { en: 'Expert Connect', hi: 'विशेषज्ञ' },
  fintech: { en: 'Loans & Schemes', hi: 'ऋण व योजनाएं' },
  'farm-profile': { en: 'My Profile', hi: 'मेरी प्रोफ़ाइल' },
  'expert-home': { en: 'Expert Dashboard', hi: 'विशेषज्ञ डैशबोर्ड' },
  sessions: { en: 'Session Management', hi: 'सत्र' },
  earnings: { en: 'Earnings & Payouts', hi: 'कमाई' },
  orders: { en: 'My Orders', hi: 'मेरे ऑर्डर' },
  admin: { en: 'Admin Panel', hi: 'एडमिन पैनल' },
};

const MOCK_ALERTS = [
  { id: 1, text: 'Wheat Rust alert — Madhya Pradesh region', type: 'warning', time: '2h ago' },
  { id: 2, text: 'New expert Dr. Ramesh joined the platform', type: 'info', time: '4h ago' },
  { id: 3, text: 'Tomato prices up 18% today in Bhopal mandi', type: 'success', time: '6h ago' },
];

export default function Navbar() {
  const { activeRoute, setSidebarOpen, sidebarOpen, demoRole } = useApp();
  const [showAlerts, setShowAlerts] = useState(false);
  const [weatherData, setWeatherData] = useState(null);

  React.useEffect(() => {
    getWeather('Bhopal').then(data => {
      if (data) setWeatherData(data);
    });
  }, []);

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
        <div className="notif-wrap">
          <button
            className="icon-action-btn"
            onClick={() => setShowAlerts(!showAlerts)}
            aria-label="Notifications"
          >
            🔔
            <span className="notif-dot" />
          </button>
          {showAlerts && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <span>Alerts</span>
                <span className="badge badge-red">{MOCK_ALERTS.length}</span>
              </div>
              {MOCK_ALERTS.map(a => (
                <div key={a.id} className={`notif-item notif-${a.type}`}>
                  <span className="notif-dot-type">
                    {a.type === 'warning' ? '⚠️' : a.type === 'success' ? '✅' : 'ℹ️'}
                  </span>
                  <div>
                    <p>{a.text}</p>
                    <span className="notif-time">{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile avatar pill */}
        <div className="navbar-profile">
          <div className="avatar avatar-sm">
            {demoRole === 'farmer' ? '👨‍🌾' : demoRole === 'expert' ? '👨‍🏫' : demoRole === 'buyer' ? '🏪' : '⚙️'}
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
