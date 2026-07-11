// src/context/AuthContext.jsx — Authentication state & actions
// Split from monolithic AppContext for reduced re-renders
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { auth } from '@/services/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile, createUserProfile } from '@/services/firebase/firestore.service';
import { firebaseSignOut } from '@/services/firebase/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authStep, setAuthStep] = useState('login');
  const [demoRole, setDemoRole] = useState('farmer');

  // Listen for Firebase auth state changes
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
    } catch (e) { /* ignore */ }
    setCurrentUser(null);
    setFirebaseUser(null);
    setRole(null);
    setAuthStep('login');
  }, []);

  const value = useMemo(() => ({
    currentUser, setCurrentUser,
    firebaseUser,
    role, setRole,
    authStep, setAuthStep,
    demoRole, setDemoRole,
    handleAuthSuccess,
    completeOnboarding,
    loginWithOTP,
    logout,
  }), [
    currentUser, firebaseUser, role, authStep, demoRole,
    handleAuthSuccess, completeOnboarding, loginWithOTP, logout,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

