import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
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
  { id: 'farm-profile',      label: 'My Profile',       labelHi: 'प्रोफ़ाइल',        icon: '👤' },
];

const ROUTE_MAP = { farmer: FARMER_ROUTES, expert: EXPERT_ROUTES, buyer: BUYER_ROUTES, admin: ADMIN_ROUTES, worker: WORKER_ROUTES };

export default function Sidebar() {
  const { activeRoute, navigate, logout, demoRole, setDemoRole, setSidebarOpen, sidebarOpen } = useApp();
  const routes = ROUTE_MAP[demoRole] || FARMER_ROUTES;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">🌿</span>
          <div>
            <span className="sidebar-logo-text">कृषि Mitra</span>
            <span className="sidebar-logo-sub">Kisan ka saathi</span>
          </div>
        </div>

        {/* Role Switcher (demo) */}
        <div className="role-switcher">
          <span className="role-label">Role Switch (Demo)</span>
          <div className="role-btns">
            {['farmer','expert','buyer','admin','worker'].map(r => (
            <button
              key={r}
              className={`role-btn ${demoRole === r ? 'active' : ''}`}
              onClick={() => { setDemoRole(r); navigate(ROUTE_MAP[r][0].id); }}
            >
              {r === 'farmer' ? '👨‍🌾' : r === 'expert' ? '👨‍🏫' : r === 'buyer' ? '🏪' : r === 'worker' ? '👷' : '⚙️'}
              <span>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
            </button>
          ))}
          </div>
        </div>

        <div className="sidebar-divider" />

        {/* Navigation */}
        <nav className="sidebar-nav">
          <span className="sidebar-nav-label">Navigation</span>
          {routes.map(route => (
            <button
              key={route.id}
              className={`sidebar-link ${activeRoute === route.id ? 'active' : ''}`}
              onClick={() => navigate(route.id)}
            >
              <span className="sidebar-link-icon">{route.icon}</span>
              <div className="sidebar-link-text">
                <span className="sidebar-link-label">{route.label}</span>
                <span className="sidebar-link-hi hindi">{route.labelHi}</span>
              </div>
              {activeRoute === route.id && <span className="active-dot" />}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="avatar avatar-sm" style={{ background: 'var(--primary-pale)', color: 'var(--primary)' }}>
              {demoRole === 'farmer' ? '👨‍🌾' : demoRole === 'expert' ? '👨‍🏫' : demoRole === 'buyer' ? '🏪' : '⚙️'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-900)' }}>Demo User</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-light)' }}>
                {demoRole.charAt(0).toUpperCase() + demoRole.slice(1)} Account
              </div>
            </div>
            <button className="btn btn-ghost btn-sm btn-icon" onClick={logout} title="Logout" style={{ padding: 6 }}>
              🚪
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
