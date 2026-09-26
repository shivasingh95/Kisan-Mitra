import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useTranslation } from '@/i18n/useTranslation';
import './MobileNav.css';

export default function MobileNav() {
  const { authStep, demoRole, setSidebarOpen, sidebarOpen } = useApp();
  const { isHindi } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  if (authStep !== 'app') return null;

  const currentPath = location.pathname.replace('/', '') || 'dashboard';

  // Mobile navigation tabs mapped per role
  const farmerTabs = [
    { id: 'dashboard', path: '/dashboard', label: 'Home', labelHi: 'होम', icon: '🏠' },
    { id: 'crop-doctor', path: '/crop-doctor', label: 'Doctor', labelHi: 'डॉक्टर', icon: '🔬' },
    { id: 'marketplace-sell', path: '/marketplace-sell', label: 'Mandi', labelHi: 'मंडी', icon: '📈' },
    { id: 'equipment-rent', path: '/equipment-rent', label: 'Services', labelHi: 'सेवाएं', icon: '🚜' },
    { id: 'farm-profile', path: '/farm-profile', label: 'Profile', labelHi: 'प्रोफ़ाइल', icon: '👤' },
  ];

  const expertTabs = [
    { id: 'expert-home', path: '/expert-home', label: 'Dashboard', labelHi: 'डैशबोर्ड', icon: '📊' },
    { id: 'sessions', path: '/sessions', label: 'Sessions', labelHi: 'सत्र', icon: '📅' },
    { id: 'earnings', path: '/earnings', label: 'Earnings', labelHi: 'कमाई', icon: '💰' },
    { id: 'farm-profile', path: '/farm-profile', label: 'Profile', labelHi: 'प्रोफ़ाइल', icon: '👤' },
  ];

  const buyerTabs = [
    { id: 'marketplace-browse', path: '/marketplace-browse', label: 'Browse', labelHi: 'बाज़ार', icon: '🛍️' },
    { id: 'orders', path: '/orders', label: 'Orders', labelHi: 'ऑर्डर', icon: '📦' },
    { id: 'farm-profile', path: '/farm-profile', label: 'Account', labelHi: 'खाता', icon: '👤' },
  ];

  const workerTabs = [
    { id: 'worker-dashboard', path: '/worker-dashboard', label: 'Dashboard', labelHi: 'डैशबोर्ड', icon: '📊' },
    { id: 'worker-register', path: '/worker-register', label: 'Register', labelHi: 'पंजीकरण', icon: '📝' },
    { id: 'farm-profile', path: '/farm-profile', label: 'Profile', labelHi: 'प्रोफ़ाइल', icon: '👤' },
  ];

  const tabs = 
    demoRole === 'expert' ? expertTabs :
    demoRole === 'buyer'  ? buyerTabs :
    demoRole === 'worker' ? workerTabs :
    farmerTabs;

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <div className="mobile-nav-items">
        {tabs.map(tab => {
          const isActive = currentPath === tab.id;
          return (
            <button
              key={tab.id}
              className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                navigate(tab.path);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="mobile-nav-icon">{tab.icon}</span>
              <span className="mobile-nav-label">{isHindi ? tab.labelHi : tab.label}</span>
              {isActive && <span className="mobile-nav-active-pill" />}
            </button>
          );
        })}

        {/* Menu Toggle for opening full sidebar */}
        <button
          className={`mobile-nav-btn menu-toggle-btn ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle Full Menu"
        >
          <span className="mobile-nav-icon">☰</span>
          <span className="mobile-nav-label">{isHindi ? 'मेनू' : 'Menu'}</span>
        </button>
      </div>
    </nav>
  );
}
