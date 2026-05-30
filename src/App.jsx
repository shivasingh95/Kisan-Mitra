// src/App.jsx — Krishi Mitra Root Router
import React from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';

// Styles
import './styles/variables.css';
import './styles/animations.css';
import './styles/components.css';

// Layout
import Sidebar  from './components/Layout/Sidebar.jsx';
import Navbar   from './components/Layout/Navbar.jsx';

// Pages — Farmer
import Login           from './pages/Login.jsx';
import HomeDashboard   from './pages/farmer/HomeDashboard.jsx';
import CropDoctor      from './pages/farmer/CropDoctor.jsx';
import MarketplaceSell from './pages/farmer/MarketplaceSell.jsx';
import LabourHire      from './pages/farmer/LabourHire.jsx';
import ExpertConnect   from './pages/farmer/ExpertConnect.jsx';
import FinTech         from './pages/farmer/FinTech.jsx';
import FarmProfile     from './pages/farmer/FarmProfile.jsx';

// Pages — Expert
import ExpertDashboard from './pages/expert/ExpertDashboard.jsx';

// Pages — Buyer
import MarketplaceBrowse from './pages/buyer/MarketplaceBrowse.jsx';

// Pages — Admin
import AdminDashboard from './pages/admin/AdminDashboard.jsx';

// Pages — Worker
import WorkerRegistration from './pages/WorkerRegistration.jsx';
import WorkerDashboard   from './pages/WorkerDashboard.jsx';

// ── Toast Component ───────────────────────────────────────────
function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  const colors = { success: '#16A34A', error: '#DC2626', info: '#2563EB', warning: '#D97706' };
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: colors[toast.type] || colors.success,
      color: '#fff', padding: '14px 22px', borderRadius: 14,
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      animation: 'toastIn 0.35s var(--ease-spring)',
      maxWidth: 340, fontSize: 14, fontWeight: 600, lineHeight: 1.4,
    }}>
      {toast.message}
    </div>
  );
}

// ── Page Router ───────────────────────────────────────────────
function PageRouter() {
  const { activeRoute, navigate, demoRole } = useApp();

  // Farmer pages
  if (demoRole === 'farmer' || demoRole === undefined) {
    switch (activeRoute) {
      case 'dashboard':        return <HomeDashboard navigate={navigate} />;
      case 'crop-doctor':      return <CropDoctor />;
      case 'marketplace-sell': return <MarketplaceSell navigate={navigate} />;
      case 'labour-hire':      return <LabourHire />;
      case 'equipment-rent':   return <LabourHire />;
      case 'expert-connect':   return <ExpertConnect navigate={navigate} />;
      case 'fintech':          return <FinTech />;
      case 'farm-profile':     return <FarmProfile />;
      case 'worker-register':  return <WorkerRegistration />;
      case 'worker-dashboard': return <WorkerDashboard />;
      default:                 return <HomeDashboard navigate={navigate} />;
    }
  }

  // Expert pages
  if (demoRole === 'expert') {
    switch (activeRoute) {
      case 'expert-home':      return <ExpertDashboard />;
      case 'sessions':         return <ExpertDashboard />;
      case 'earnings':         return <ExpertDashboard />;
      case 'farm-profile':     return <FarmProfile />;
      default:                 return <ExpertDashboard />;
    }
  }

  // Buyer pages
  if (demoRole === 'buyer') {
    switch (activeRoute) {
      case 'marketplace-browse': return <MarketplaceBrowse />;
      case 'orders':             return <MarketplaceBrowse />;
      case 'farm-profile':       return <FarmProfile />;
      default:                   return <MarketplaceBrowse />;
    }
  }

  // Admin
  if (demoRole === 'admin') {
    return <AdminDashboard />;
  }

  // Worker
  if (demoRole === 'worker') {
    switch (activeRoute) {
      case 'worker-dashboard':  return <WorkerDashboard />;
      case 'worker-register':   return <WorkerRegistration />;
      case 'farm-profile':      return <FarmProfile />;
      default:                  return <WorkerDashboard />;
    }
  }

  return <HomeDashboard navigate={navigate} />;
}

// ── Authenticated App Shell ───────────────────────────────────
function AuthenticatedApp() {
  return (
    <div className="app-layout">
      <div className="app-sidebar">
        <Sidebar />
      </div>
      <div className="app-main">
        <div className="app-navbar">
          <Navbar />
        </div>
        <div className="app-content">
          <PageRouter />
        </div>
      </div>
      <Toast />
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────
function AppInner() {
  const { authStep } = useApp();

  if (authStep === 'login' || authStep === 'otp' || authStep === 'onboarding') {
    return <Login />;
  }

  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}