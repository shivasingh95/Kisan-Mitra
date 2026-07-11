import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { auth } from '../services/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile, createUserProfile } from '../services/firebase/firestore.service';
import { firebaseSignOut } from '../services/firebase/auth.service';

const AppContext = createContext(null);

// Initial State
const initialState = {
  currentUser: null,
  firebaseUser: null,
  role: null,
  authStep: 'login',
  demoRole: 'farmer',
  sidebarOpen: false,
  activeRoute: 'dashboard',
  toast: null,
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_FIREBASE_USER':
      return { ...state, firebaseUser: action.payload };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_ROLE':
      return { ...state, role: action.payload };
    case 'SET_AUTH_STEP':
      return { ...state, authStep: action.payload };
    case 'SET_DEMO_ROLE':
      return { ...state, demoRole: action.payload };
    case 'SET_SIDEBAR_OPEN':
      return { ...state, sidebarOpen: action.payload };
    case 'SET_ACTIVE_ROUTE':
      return { ...state, activeRoute: action.payload };
    case 'SET_TOAST':
      return { ...state, toast: action.payload };
    case 'CLEAR_TOAST':
      return { ...state, toast: null };
    case 'LOGOUT':
      return {
        ...state,
        currentUser: null,
        firebaseUser: null,
        role: null,
        authStep: 'login',
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        dispatch({ type: 'SET_FIREBASE_USER', payload: fbUser });
        try {
          const profile = await getUserProfile(fbUser.uid);
          if (profile) {
            dispatch({ type: 'SET_CURRENT_USER', payload: profile });
            dispatch({ type: 'SET_ROLE', payload: profile.role || 'farmer' });
            dispatch({ type: 'SET_DEMO_ROLE', payload: profile.role || 'farmer' });
            dispatch({ type: 'SET_AUTH_STEP', payload: 'app' });
          } else {
            dispatch({ type: 'SET_AUTH_STEP', payload: 'onboarding' });
          }
        } catch (e) {
          console.error('Failed to load profile:', e);
          dispatch({ type: 'SET_AUTH_STEP', payload: 'login' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = useCallback(async (fbUser, onboardingData = null) => {
    dispatch({ type: 'SET_FIREBASE_USER', payload: fbUser });
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
        dispatch({ type: 'SET_AUTH_STEP', payload: 'onboarding' });
      } else {
        dispatch({ type: 'SET_AUTH_STEP', payload: 'app' });
      }
      dispatch({ type: 'SET_CURRENT_USER', payload: profile });
      dispatch({ type: 'SET_ROLE', payload: profile.role || 'farmer' });
      dispatch({ type: 'SET_DEMO_ROLE', payload: profile.role || 'farmer' });
    } catch (e) {
      console.error('Profile load failed:', e);
    }
  }, []);

  const loginWithOTP = useCallback((phone, userData) => {
    const mockProfile = { phone, ...userData, id: 'demo' };
    dispatch({ type: 'SET_CURRENT_USER', payload: mockProfile });
    dispatch({ type: 'SET_ROLE', payload: userData.role || 'farmer' });
    dispatch({ type: 'SET_DEMO_ROLE', payload: userData.role || 'farmer' });
    dispatch({ type: 'SET_AUTH_STEP', payload: 'app' });
  }, []);

  const completeOnboarding = useCallback(async (data) => {
    if (state.firebaseUser && state.firebaseUser.uid !== 'demo') {
      try {
        await createUserProfile(state.firebaseUser.uid, {
          phone: state.firebaseUser.phoneNumber,
          ...data,
        });
        dispatch({ type: 'SET_CURRENT_USER', payload: { id: state.firebaseUser.uid, ...data } });
        dispatch({ type: 'SET_ROLE', payload: data.role || 'farmer' });
        dispatch({ type: 'SET_DEMO_ROLE', payload: data.role || 'farmer' });
      } catch (e) {
        console.error('Onboarding save failed:', e);
      }
    }
    dispatch({ type: 'SET_AUTH_STEP', payload: 'app' });
  }, [state.firebaseUser]);

  const logout = useCallback(async () => {
    try {
      await firebaseSignOut();
    } catch (e) { /* ignore */ }
    dispatch({ type: 'LOGOUT' });
  }, []);

  // UI Actions
  const setSidebarOpen = useCallback((isOpen) => dispatch({ type: 'SET_SIDEBAR_OPEN', payload: isOpen }), []);
  const setDemoRole = useCallback((role) => dispatch({ type: 'SET_DEMO_ROLE', payload: role }), []);
  const setActiveRoute = useCallback((route) => dispatch({ type: 'SET_ACTIVE_ROUTE', payload: route }), []);
  const setAuthStep = useCallback((step) => dispatch({ type: 'SET_AUTH_STEP', payload: step }), []);
  
  // NOTE: navigate will be handled by react-router soon, keeping this for temporary backward compatibility
  const navigate = useCallback((route) => {
    dispatch({ type: 'SET_ACTIVE_ROUTE', payload: route });
    dispatch({ type: 'SET_SIDEBAR_OPEN', payload: false });
  }, []);

  let toastTimeoutRef = React.useRef(null);
  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    dispatch({ type: 'SET_TOAST', payload: { message, type, duration, id: Date.now() } });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      dispatch({ type: 'CLEAR_TOAST' });
    }, duration + 400);
  }, []);

  const clearToast = useCallback(() => {
    dispatch({ type: 'CLEAR_TOAST' });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  }, []);

  // Ensure backwards compatibility with old useApp
  const value = useMemo(() => ({
    ...state,
    dispatch,
    handleAuthSuccess,
    loginWithOTP,
    completeOnboarding,
    logout,
    setSidebarOpen,
    setDemoRole,
    setActiveRoute,
    setAuthStep,
    navigate,
    showToast,
    clearToast
  }), [state, handleAuthSuccess, loginWithOTP, completeOnboarding, logout, setSidebarOpen, setDemoRole, setActiveRoute, setAuthStep, navigate, showToast, clearToast]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
