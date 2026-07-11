// src/context/AppContext.jsx — Composed provider + backward-compatible useApp()
// Wraps AuthProvider + UIProvider so existing components using useApp() keep working
import React from 'react';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import { UIProvider, useUI } from './UIContext.jsx';

// ── Composed Provider ─────────────────────────────────────────
export function AppProvider({ children }) {
  return (
    <AuthProvider>
      <UIProvider>
        {children}
      </UIProvider>
    </AuthProvider>
  );
}

// ── Backward-compatible useApp() ──────────────────────────────
// Composes both contexts so existing components work unchanged.
// New components can import useAuth / useUI directly for better perf.
export const useApp = () => {
  const auth = useAuth();
  const ui = useUI();

  return {
    // Auth
    currentUser: auth.currentUser,
    setCurrentUser: auth.setCurrentUser,
    firebaseUser: auth.firebaseUser,
    role: auth.role,
    setRole: auth.setRole,
    authStep: auth.authStep,
    setAuthStep: auth.setAuthStep,
    demoRole: auth.demoRole,
    setDemoRole: auth.setDemoRole,
    handleAuthSuccess: auth.handleAuthSuccess,
    completeOnboarding: auth.completeOnboarding,
    loginWithOTP: auth.loginWithOTP,
    logout: auth.logout,

    // UI
    sidebarOpen: ui.sidebarOpen,
    setSidebarOpen: ui.setSidebarOpen,
    activeRoute: ui.activeRoute,
    setActiveRoute: ui.setActiveRoute,
    navigate: ui.navigate,
    toast: ui.toast,
    showToast: ui.showToast,
    clearToast: ui.clearToast,
  };
};

// Re-export split hooks for new code
export { useAuth } from './AuthContext.jsx';
export { useUI } from './UIContext.jsx';
