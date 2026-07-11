// src/context/UIContext.jsx — UI state: navigation, sidebar, toast
// Split from monolithic AppContext for reduced re-renders
import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    setToast({ message, type, duration, id: Date.now() });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), duration + 400);
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const navigate = useCallback((route) => {
    setActiveRoute(route);
    setSidebarOpen(false);
  }, []);

  const value = useMemo(() => ({
    sidebarOpen, setSidebarOpen,
    activeRoute, setActiveRoute, navigate,
    toast, showToast, clearToast,
  }), [sidebarOpen, activeRoute, toast, navigate, showToast, clearToast]);

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside UIProvider');
  return ctx;
};
