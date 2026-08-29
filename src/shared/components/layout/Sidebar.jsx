// src/components/Layout/Sidebar.jsx — Upgraded with ARIA + keyboard navigation + i18n
import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useTranslation } from '@/i18n/useTranslation';
import './Sidebar.css';

/* Route config per role */
const FARMER_ROUTES = [
  { id: 'dashboard',       label: 'Home Dashboard',  labelHi: 'होम डैशबोर्ड',  icon: '🏠' },
  { id: 'crop-doctor',     label: 'Crop Doctor AI',  labelHi: 'फ़सल डॉक्टर',   icon: '🔬' },
  { id: 'marketplace-sell',label: 'Marketplace',     labelHi: 'मंडी / बेचो',   icon: '🛒' },
  { id: 'labour-hire',     label: 'Labour Hire',     labelHi: 'मज़दूर भाड़े',   icon: '👷' },
  { id: 'equipment-rent',  label: 'Equipment Rent',  labelHi: 'उपकरण किराया',  icon: '🚜' },
  { id: 'expert-connect',  label: 'Expert Connect',  labelHi: 'विशेषज्ञ',      icon: '👨‍💼' },
  { id: 'fintech',         label: 'Loans & Schemes',  labelHi: 'ऋण व योजनाएं', icon: '💳' },
  { id: 'farm-profile',    label: 'My Farm Profile', labelHi: 'मेरी प्रोफ़ाइल', icon: '👤' },
  { id: 'system-overview', label: 'System Overview', labelHi: 'सिस्टम',           icon: '🗻️' },
];
const EXPERT_ROUTES = [
  { id: 'expert-home',     label: 'Dashboard',      labelHi: 'डैशबोर्ड',      icon: '📊' },
  { id: 'sessions',        label: 'Sessions',       labelHi: 'सत्र',           icon: '📅' },
  { id: 'earnings',        label: 'Earnings',       labelHi: 'कमाई',           icon: '💰' },
  { id: 'farm-profile',    label: 'My Profile',     labelHi: 'प्रोफ़ाइल',      icon: '👤' },
];
const BUYER_ROUTES = [
  { id: 'marketplace-browse', label: 'Browse Market', labelHi: 'बाज़ार देखो', icon: '🛍️' },
  { id: 'orders',             label: 'My Orders',     labelHi: 'मेरे ऑर्डर',  icon: '📦' },
  { id: 'farm-profile',       label: 'My Account',    labelHi: 'खाता',         icon: '👤' },
];
const ADMIN_ROUTES = [
  { id: 'admin',             label: 'Admin Panel',      labelHi: 'एडमिन',          icon: '⚙️' },
];
const WORKER_ROUTES = [
  { id: 'worker-dashboard',  label: 'Worker Dashboard', labelHi: 'श्रमिक डैशबोर्ड', icon: '📊' },
  { id: 'worker-register',   label: 'Register Worker',  labelHi: 'पंजीकरण',         icon: '📝' },
  { id: 'system-overview',   label: 'System Overview',  labelHi: 'सिस्टम',           icon: '🗻️' },
  { id: 'farm-profile',      label: 'My Profile',       labelHi: 'प्रोफ़ाइल',        icon: '👤' },
];
const OWNER_ROUTES = [
  { id: 'equipment-rent',   label: 'Equipment Rental', labelHi: 'उपकरण किराया', icon: '🚜' },
  { id: 'system-overview',  label: 'System Overview',  labelHi: 'सिस्टम',          icon: '🗻️' },
  { id: 'farm-profile',     label: 'My Profile',       labelHi: 'प्रोफ़ाइल',       icon: '👤' },
];

const ROUTE_MAP = { farmer: FARMER_ROUTES, expert: EXPERT_ROUTES, buyer: BUYER_ROUTES, admin: ADMIN_ROUTES, worker: WORKER_ROUTES, owner: OWNER_ROUTES };

export default function Sidebar() {
  const { activeRoute, logout, demoRole, setDemoRole, setSidebarOpen, sidebarOpen } = useApp();
  const { t, toggleLang, isHindi } = useTranslation();
  const routerNavigate = useNavigate();
  const routes = ROUTE_MAP[demoRole] || FARMER_ROUTES;
  const navRef = useRef(null);

  // Navigate using react-router (actually changes URL) + close sidebar
  const navigateTo = (routeId) => {
    routerNavigate(`/${routeId}`);
    setSidebarOpen(false);
  };

  // ── Focus trap: close sidebar on Escape ─────────────────────
  useEffect(() => {
    if (!sidebarOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [sidebarOpen, setSidebarOpen]);

  // ── Arrow key navigation within sidebar nav ─────────────────
  const handleNavKeyDown = (e) => {
    const links = navRef.current?.querySelectorAll('.sidebar-link');
    if (!links || links.length === 0) return;

    const currentIndex = Array.from(links).findIndex(l => l === document.activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (currentIndex + 1) % links.length;
      links[next].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = currentIndex <= 0 ? links.length - 1 : currentIndex - 1;
      links[prev].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      links[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      links[links.length - 1].focus();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}
        id="main-sidebar"
        role="complementary"
        aria-label="Sidebar navigation"
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon" aria-hidden="true">🌿</span>
          <div>
            <span className="sidebar-logo-text">कृषि Mitra</span>
            <span className="sidebar-logo-sub">Kisan ka saathi</span>
          </div>
        </div>

        {/* Role Switcher (demo) */}
        <div className="role-switcher" role="group" aria-label="Demo role switcher">
          <span className="role-label" id="role-switcher-label">Role Switch (Demo)</span>
          <div className="role-btns" role="radiogroup" aria-labelledby="role-switcher-label">
            {['farmer','expert','buyer','admin','worker','owner'].map(r => (
            <button
              key={r}
              className={`role-btn ${demoRole === r ? 'active' : ''}`}
              onClick={() => { setDemoRole(r); navigateTo(ROUTE_MAP[r][0].id); }}
              role="radio"
              aria-checked={demoRole === r}
              aria-label={`Switch to ${r} role`}
            >
              {r === 'farmer' ? '👨‍🌾' : r === 'expert' ? '👨‍🏫' : r === 'buyer' ? '🏪' : r === 'worker' ? '👷' : r === 'owner' ? '🚜' : '⚙️'}
              <span>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
            </button>
          ))}
          </div>
        </div>

        <div className="sidebar-divider" role="separator" />

        {/* Navigation */}
        <nav
          className="sidebar-nav"
          ref={navRef}
          onKeyDown={handleNavKeyDown}
          aria-label="Main navigation"
        >
          <span className="sidebar-nav-label" id="sidebar-nav-heading">Navigation</span>
          {routes.map(route => (
            <button
              key={route.id}
              className={`sidebar-link ${activeRoute === route.id ? 'active' : ''}`}
              onClick={() => navigateTo(route.id)}
              aria-current={activeRoute === route.id ? 'page' : undefined}
              aria-label={`${route.label} — ${route.labelHi}`}
            >
              <span className="sidebar-link-icon" aria-hidden="true">{route.icon}</span>
              <div className="sidebar-link-text">
                <span className="sidebar-link-label">{route.label}</span>
                <span className="sidebar-link-hi hindi">{route.labelHi}</span>
              </div>
              {activeRoute === route.id && <span className="active-dot" aria-hidden="true" />}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* Language Toggle */}
          <button
            className="lang-toggle-btn"
            onClick={toggleLang}
            aria-label={isHindi ? 'Switch to English' : 'हिंदी में बदलें'}
            title={isHindi ? 'Switch to English' : 'हिंदी में बदलें'}
          >
            <span aria-hidden="true">🌐</span>
            <span>{isHindi ? 'English' : 'हिंदी'}</span>
            <span className="lang-badge">{isHindi ? 'EN' : 'हि'}</span>
          </button>

          <div className="sidebar-user-card">
            <div className="avatar avatar-sm" style={{ background: 'var(--primary-pale)', color: 'var(--primary)' }} aria-hidden="true">
              {demoRole === 'farmer' ? '👨‍🌾' : demoRole === 'expert' ? '👨‍🏫' : demoRole === 'buyer' ? '🏪' : demoRole === 'worker' ? '👷' : demoRole === 'owner' ? '🚜' : '⚙️'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-900)' }}>Demo User</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-light)' }}>
                {t(`common.${demoRole}`)} Account
              </div>
            </div>
            <button
              className="btn btn-ghost btn-sm btn-icon"
              onClick={logout}
              title={t('common.logout')}
              aria-label={t('common.logout')}
              style={{ padding: 6 }}
            >
              🚪
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

