import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function RoleRoute({ children, allowedRoles }) {
  const { demoRole } = useApp();

  if (!allowedRoles.includes(demoRole)) {
    // If user is not authorized for this role, redirect them to a safe default
    // We could use a Not Authorized page instead
    return <Navigate to="/" replace />;
  }

  return children;
}
