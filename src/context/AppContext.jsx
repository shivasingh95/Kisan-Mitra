import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile, createUserProfile } from '../services/db';
import { firebaseSignOut } from '../services/auth';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authStep, setAuthStep] = useState('login');
  const [demoRole, setDemoRole] = useState('farmer');

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          const profile = await getUserProfile(fbUser.uid);
          if (profile) {
            setCurrentUser(profile);
            setRole(profile.role || 'farmer');
            setDemoRole(profile.role || 'farmer');
            setAuthStep('app');
          } else {
            setAuthStep('onboarding');
          }
        } catch (e) {
          console.error('Failed to load profile:', e);
          setAuthStep('login');
        }
      } else {
        setFirebaseUser(null);
        setCurrentUser(null);
        setRole(null);
        setAuthStep('login');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = useCallback(async (fbUser, onboardingData = null) => {
    setFirebaseUser(fbUser);
    try {
      let profile = await getUserProfile(fbUser.uid);
      if (!profile) {
        const newProfile = {
          phone: fbUser.phoneNumber,
          role: onboardingData?.role || 'farmer',
          name: onboardingData?.name || '',
          village: onboardingData?.village || '',
          state: onboardingData?.state || '',
        };
        await createUserProfile(fbUser.uid, newProfile);
        profile = { id: fbUser.uid, ...newProfile };
        setAuthStep('onboarding');
      } else {
        setAuthStep('app');
      }
      setCurrentUser(profile);
      setRole(profile.role || 'farmer');
      setDemoRole(profile.role || 'farmer');
    } catch (e) {
      console.error('Profile load failed:', e);
      showToast('Profile load failed. Please retry.', 'error');
    }
  }, []);

  const loginWithOTP = useCallback((phone, userData) => {
    const mockProfile = { phone, ...userData, id: 'demo' };
    setCurrentUser(mockProfile);
    setRole(userData.role || 'farmer');
    setDemoRole(userData.role || 'farmer');
    setAuthStep('app');
  }, []);

  const completeOnboarding = useCallback(async (data) => {
    if (firebaseUser && firebaseUser.uid !== 'demo') {
      try {
        await createUserProfile(firebaseUser.uid, {
          phone: firebaseUser.phoneNumber,
          ...data,
        });
        setCurrentUser({ id: firebaseUser.uid, ...data });
        setRole(data.role || 'farmer');
        setDemoRole(data.role || 'farmer');
      } catch (e) {
        console.error('Onboarding save failed:', e);
      }
    }
    setAuthStep('app');
  }, [firebaseUser]);

  const logout = useCallback(async () => {
    try {
      await firebaseSignOut();
    } catch (e) {}
    setCurrentUser(null);
    setFirebaseUser(null);
    setRole(null);
    setAuthStep('login');
    setActiveRoute('dashboard');
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    setToast({ message, type, id: Date.now() });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), duration);
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

  const contextValue = useMemo(() => ({
    currentUser, setCurrentUser,
    firebaseUser,
    role, setRole,
    authStep, setAuthStep,
    handleAuthSuccess,
    completeOnboarding,
    loginWithOTP,
    logout,
    demoRole, setDemoRole,
    sidebarOpen, setSidebarOpen,
    activeRoute, navigate,
    toast, showToast,
  }), [
    currentUser, firebaseUser, role, authStep, demoRole,
    sidebarOpen, activeRoute, toast,
    handleAuthSuccess, completeOnboarding, loginWithOTP,
    logout, navigate, showToast
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
