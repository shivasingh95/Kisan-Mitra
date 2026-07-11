import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * ProtectedRoute — guards authenticated routes.
 * Used as a layout route: <Route element={<ProtectedRoute />}>
 * Renders an <Outlet /> for child routes when authenticated.
 */
export default function ProtectedRoute() {
  const { authStep } = useApp();

  if (authStep === 'login' || authStep === 'otp') {
    return <Navigate to="/login" replace />;
  }

  if (authStep === 'onboarding') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
