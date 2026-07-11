import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import LoadingState from '../shared/components/feedback/LoadingState';

// ── Lazy-loaded pages ────────────────────────
const Login              = lazy(() => import('../pages/Login'));
const HomeDashboard      = lazy(() => import('../pages/farmer/HomeDashboard'));
const CropDoctor         = lazy(() => import('../pages/farmer/CropDoctor'));
const MarketplaceSell    = lazy(() => import('../pages/farmer/MarketplaceSell'));
const LabourHire         = lazy(() => import('../pages/farmer/LabourHire'));
const EquipmentRental    = lazy(() => import('../pages/farmer/EquipmentRental'));
const ExpertConnect      = lazy(() => import('../pages/farmer/ExpertConnect'));
const FinTech            = lazy(() => import('../pages/farmer/FinTech'));
const FarmProfile        = lazy(() => import('../pages/farmer/FarmProfile'));

const ExpertDashboard    = lazy(() => import('../pages/expert/ExpertDashboard'));
const MarketplaceBrowse  = lazy(() => import('../pages/buyer/MarketplaceBrowse'));
const AdminDashboard     = lazy(() => import('../pages/admin/AdminDashboard'));
const WorkerRegistration = lazy(() => import('../pages/WorkerRegistration'));
const WorkerDashboard    = lazy(() => import('../pages/WorkerDashboard'));
const SystemOverview     = lazy(() => import('../pages/SystemOverview'));

export default function AppRouter() {
  const { authStep, demoRole, setActiveRoute } = useApp();
  const location = useLocation();

  // Keep old context in sync with actual route for backwards compatibility with Sidebar/Navbar
  useEffect(() => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    setActiveRoute(path);
  }, [location, setActiveRoute]);

  if (authStep === 'login' || authStep === 'otp' || authStep === 'onboarding') {
    return (
      <Suspense fallback={<LoadingState />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <Routes>
        {/* Redirect Root based on Role */}
        <Route path="/" element={
          <Navigate to={
            demoRole === 'farmer' ? '/dashboard' :
            demoRole === 'expert' ? '/expert-home' :
            demoRole === 'buyer'  ? '/marketplace-browse' :
            demoRole === 'worker' ? '/worker-dashboard' :
            demoRole === 'owner'  ? '/equipment-rent' :
            '/admin'
          } replace />
        } />

        <Route element={<ProtectedRoute />}>
          {/* Farmer Routes */}
          <Route path="/dashboard" element={<RoleRoute allowedRoles={['farmer']}><HomeDashboard /></RoleRoute>} />
          <Route path="/crop-doctor" element={<RoleRoute allowedRoles={['farmer']}><CropDoctor /></RoleRoute>} />
          <Route path="/marketplace-sell" element={<RoleRoute allowedRoles={['farmer']}><MarketplaceSell /></RoleRoute>} />
          <Route path="/labour-hire" element={<RoleRoute allowedRoles={['farmer']}><LabourHire /></RoleRoute>} />
          <Route path="/expert-connect" element={<RoleRoute allowedRoles={['farmer']}><ExpertConnect /></RoleRoute>} />
          <Route path="/fintech" element={<RoleRoute allowedRoles={['farmer']}><FinTech /></RoleRoute>} />

          {/* Expert Routes */}
          <Route path="/expert-home" element={<RoleRoute allowedRoles={['expert']}><ExpertDashboard /></RoleRoute>} />
          <Route path="/sessions" element={<RoleRoute allowedRoles={['expert']}><ExpertDashboard /></RoleRoute>} />
          <Route path="/earnings" element={<RoleRoute allowedRoles={['expert']}><ExpertDashboard /></RoleRoute>} />

          {/* Buyer Routes */}
          <Route path="/marketplace-browse" element={<RoleRoute allowedRoles={['buyer']}><MarketplaceBrowse /></RoleRoute>} />
          <Route path="/orders" element={<RoleRoute allowedRoles={['buyer']}><MarketplaceBrowse /></RoleRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<RoleRoute allowedRoles={['admin']}><AdminDashboard /></RoleRoute>} />

          {/* Worker Routes */}
          <Route path="/worker-dashboard" element={<RoleRoute allowedRoles={['worker']}><WorkerDashboard /></RoleRoute>} />
          <Route path="/worker-register" element={<RoleRoute allowedRoles={['worker', 'farmer']}><WorkerRegistration /></RoleRoute>} />

          {/* Owner & Shared Routes */}
          <Route path="/equipment-rent" element={<RoleRoute allowedRoles={['farmer', 'owner']}><EquipmentRental /></RoleRoute>} />
          <Route path="/system-overview" element={<RoleRoute allowedRoles={['farmer', 'worker', 'owner', 'admin']}><SystemOverview /></RoleRoute>} />
          <Route path="/farm-profile" element={<FarmProfile />} /> {/* Assuming all roles can have a profile */}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
