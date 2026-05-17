// src/context/AppContext.jsx — Krishi Mitra global state + Firebase integration
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile, createUserProfile } from '../services/db';
import { firebaseSignOut } from '../services/auth';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Auth state
  const [currentUser, setCurrentUser] = useState(null);   // Firestore profile object
  const [firebaseUser, setFirebaseUser] = useState(null); // Firebase User object
  const [role, setRole] = useState(null);                 // 'farmer' | 'expert' | 'buyer' | 'admin'
  const [authStep, setAuthStep] = useState('login');      // 'login' | 'otp' | 'loading' | 'onboarding' | 'app'

  // For quick role switch in demo/presentation
  const [demoRole, setDemoRole] = useState('farmer');

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('dashboard');
  const [toast, setToast] = useState(null);

  // ── Firebase Auth listener ─────────────────────────────────
  // This fires whenever the user's auth state changes (login/logout/refresh)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // User is signed in — load their Firestore profile
        setFirebaseUser(fbUser);
        try {
          const profile = await getUserProfile(fbUser.uid);
          if (profile) {
            setCurrentUser(profile);
            setRole(profile.role || 'farmer');
            setDemoRole(profile.role || 'farmer');
            setAuthStep('app');
          } else {
            // New user — go to onboarding to collect name, village, role
            setAuthStep('onboarding');
          }
        } catch (e) {
          console.error('Failed to load profile:', e);
          setAuthStep('login');
        }
      } else {
        // User is signed out
        setFirebaseUser(null);
        setCurrentUser(null);
        setRole(null);
        setAuthStep('login');
      }
    });
    return () => unsubscribe();
  }, []);

  // ── Called after OTP is verified successfully ──────────────
  // fbUser: Firebase User object returned by verifyPhoneOTP()
  const handleAuthSuccess = async (fbUser, onboardingData = null) => {
    setFirebaseUser(fbUser);
    try {
      let profile = await getUserProfile(fbUser.uid);

      if (!profile) {
        // Brand new user — create profile in Firestore
        const newProfile = {
          phone: fbUser.phoneNumber,
          role: onboardingData?.role || 'farmer',
          name: onboardingData?.name || '',
          village: onboardingData?.village || '',
          state: onboardingData?.state || '',
        };
        await createUserProfile(fbUser.uid, newProfile);
        profile = { id: fbUser.uid, ...newProfile };
        setAuthStep('onboarding'); // ask for name/village etc.
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
  };

  // ── Demo mode — skip real auth (for presentations) ─────────
  const loginWithOTP = (phone, userData) => {
    const mockProfile = { phone, ...userData, id: 'demo' };
    setCurrentUser(mockProfile);
    setRole(userData.role || 'farmer');
    setDemoRole(userData.role || 'farmer');
    setAuthStep('app');
  };

  // ── Complete onboarding (save extra profile info) ──────────
  const completeOnboarding = async (data) => {
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
  };

  // ── Sign out ───────────────────────────────────────────────
  const logout = async () => {
    try {
      await firebaseSignOut();
    } catch (e) {
      // even if signout fails, clear local state
    }
    setCurrentUser(null);
    setFirebaseUser(null);
    setRole(null);
    setAuthStep('login');
    setActiveRoute('dashboard');
  };

  // ── Toast notifications ────────────────────────────────────
  const showToast = (message, type = 'success', duration = 3500) => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), duration);
  };

  const navigate = (route) => {
    setActiveRoute(route);
    setSidebarOpen(false);
  };

  return (
    <AppContext.Provider value={{
      // Auth
      currentUser, setCurrentUser,
      firebaseUser,
      role, setRole,
      authStep, setAuthStep,
      handleAuthSuccess,
      completeOnboarding,
      loginWithOTP,
      logout,
      // Demo role switch
      demoRole, setDemoRole,
      // UI
      sidebarOpen, setSidebarOpen,
      activeRoute, navigate,
      toast, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
