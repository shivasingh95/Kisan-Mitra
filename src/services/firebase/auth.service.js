// src/services/firebase/auth.service.js — Firebase Phone OTP Authentication
// Security: module-scoped state (no window globals), phone validation, rate limiting
import { auth } from './config';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
} from 'firebase/auth';
import { validatePhone } from '@/shared/utils/sanitize';
import { otpLimiter } from '@/shared/utils/rateLimit';
import { authLog } from '@/shared/utils/logger';

// ── Module-scoped state (not on window) ───────────────────────
let recaptchaVerifier = null;
let confirmationResult = null;

// ── Setup invisible reCAPTCHA (call once before sendOTP) ──────
export function setupRecaptcha() {
  // Destroy old one if it exists (handles hot-reload / re-render)
  if (recaptchaVerifier) {
    try { recaptchaVerifier.clear(); } catch (_) { /* ignore */ }
    recaptchaVerifier = null;
  }
  recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
    size: 'invisible',
    callback: () => { }, // reCAPTCHA solved automatically
  });
  authLog.debug('reCAPTCHA initialized');
}

// ── Send OTP to phone number ──────────────────────────────────
// phone: 10-digit number without country code (e.g. "9876543210")
export async function sendPhoneOTP(phone) {
  // Validate phone number
  const { valid, normalized, error } = validatePhone(phone);
  if (!valid) {
    throw new Error(error || 'Invalid phone number');
  }

  // Rate limiting: max 3 OTP sends per ~10 minutes
  if (!otpLimiter.consume()) {
    throw new Error('Too many OTP requests. Please wait a few minutes.');
  }

  if (!recaptchaVerifier) {
    throw new Error('reCAPTCHA not initialized. Call setupRecaptcha() first.');
  }

  authLog.info('Sending OTP', { phone: `****${normalized.slice(-4)}` });

  const result = await signInWithPhoneNumber(auth, `+91${normalized}`, recaptchaVerifier);
  confirmationResult = result; // stored in module scope (not window)
  return result;
}

// ── Verify the 6-digit OTP entered by user ────────────────────
export async function verifyPhoneOTP(otpCode) {
  if (!confirmationResult) {
    throw new Error('No OTP was sent. Please request OTP first.');
  }

  // Basic OTP validation
  const cleanOTP = String(otpCode).replace(/\s/g, '');
  if (!/^\d{6}$/.test(cleanOTP)) {
    throw new Error('OTP must be exactly 6 digits.');
  }

  authLog.info('Verifying OTP');
  const result = await confirmationResult.confirm(cleanOTP);
  confirmationResult = null; // Clear after use
  authLog.info('OTP verified successfully');
  return result.user; // Firebase User object: { uid, phoneNumber, ... }
}

// ── Sign Out ──────────────────────────────────────────────────
export async function firebaseSignOut() {
  confirmationResult = null;
  return signOut(auth);
}

// ── Preloaded Demo Accounts per Role ─────────────────────────
export const DEMO_USERS = {
  farmer: {
    username: 'ramesh_kisan',
    password: 'kisan123',
    role: 'farmer',
    id: 'demo_farmer_01',
    name: 'Ramesh Kumar (रमेश कुमार)',
    phone: '9876543210',
    district: 'Sehore',
    village: 'Doraha',
    state: 'Madhya Pradesh',
    landAcres: '5.5',
    primaryCrops: 'Wheat, Soybean, Gram',
  },
  buyer: {
    username: 'sharma_traders',
    password: 'buyer123',
    role: 'buyer',
    id: 'demo_buyer_01',
    name: 'Suresh Sharma',
    businessName: 'Sharma Agro Traders (शर्मा एग्रो ट्रेडर्स)',
    phone: '9811122233',
    mandiCity: 'Bhopal Mandi',
    businessType: 'Wholesaler / Arhatiya',
    gstin: '23AABCS1429B1Z',
    state: 'Madhya Pradesh',
  },
  expert: {
    username: 'dr_arvind',
    password: 'expert123',
    role: 'expert',
    id: 'demo_expert_01',
    name: 'Dr. Arvind Shukla (डॉ. अरविन्द शुक्ला)',
    phone: '9822233344',
    qualification: 'Ph.D Agronomy & Plant Pathology',
    institution: 'ICAR - CIAE Bhopal / JNKVV',
    specialization: 'Crop Pathology & Diseases',
    experience: '12',
    state: 'Madhya Pradesh',
  },
  worker: {
    username: 'mohan_lal',
    password: 'worker123',
    role: 'worker',
    id: 'demo_worker_01',
    name: 'Mohan Lal (मोहन लाल)',
    phone: '9833344455',
    district: 'Vidisha',
    village: 'Ganj Basoda',
    dailyWage: 550,
    groupSize: 4,
    skills: ['Harvesting', 'Tractor Operation', 'Pesticide Spraying'],
    state: 'Madhya Pradesh',
  },
  admin: {
    username: 'krishi_admin',
    password: 'admin123',
    role: 'admin',
    id: 'demo_admin_01',
    name: 'Central Agri Administrator',
    district: 'Bhopal HQ',
    email: 'admin@krishimitra.in',
    state: 'Madhya Pradesh',
  }
};

// ── Local Storage Account Registry Helper ────────────────────
const USERS_STORAGE_KEY = 'krishimitra_registered_accounts';

export function getLocalAccounts() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalAccount(username, accountData) {
  try {
    const accounts = getLocalAccounts();
    accounts[username.toLowerCase().trim()] = accountData;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to persist local account:', err);
  }
}

// ── Authenticate with Username & Password ────────────────────
export async function authenticateWithPassword(username, password, selectedRole) {
  const cleanUser = String(username || '').toLowerCase().trim();
  const cleanPass = String(password || '').trim();

  if (!cleanUser || !cleanPass) {
    throw new Error('Please enter both username and password.');
  }

  // 1. Check if matching preloaded demo account for the role
  const demoAccount = Object.values(DEMO_USERS).find(
    acc => acc.username.toLowerCase() === cleanUser && acc.password === cleanPass
  );

  if (demoAccount) {
    if (selectedRole && demoAccount.role !== selectedRole) {
      throw new Error(`This account is registered as a ${demoAccount.role.toUpperCase()}, not ${selectedRole.toUpperCase()}. Please switch tabs.`);
    }
    return demoAccount;
  }

  // 2. Check local accounts registry
  const localAccounts = getLocalAccounts();
  const localAccount = localAccounts[cleanUser];

  if (localAccount) {
    if (localAccount.password !== cleanPass) {
      throw new Error('Incorrect password. Please try again.');
    }
    if (selectedRole && localAccount.role !== selectedRole) {
      throw new Error(`This account is registered as ${localAccount.role.toUpperCase()}. Please switch tabs.`);
    }
    return localAccount;
  }

  throw new Error('Account not found. Please check your credentials or register a new account.');
}

// ── Register New Account with Username & Password ────────────
export async function registerWithPassword(role, profileData) {
  const username = String(profileData.username || '').toLowerCase().trim();
  const password = String(profileData.password || '').trim();

  if (username.length < 3) {
    throw new Error('Username must be at least 3 characters.');
  }
  if (password.length < 4) {
    throw new Error('Password must be at least 4 characters.');
  }

  // Check if username is already in demo users
  if (Object.values(DEMO_USERS).some(u => u.username.toLowerCase() === username)) {
    throw new Error('This username is reserved. Please choose a different username.');
  }

  // Check if username already exists locally
  const localAccounts = getLocalAccounts();
  if (localAccounts[username]) {
    throw new Error('Username already exists. Please choose a different username or log in.');
  }

  const newAccount = {
    ...profileData,
    id: 'user_' + Date.now(),
    username,
    password,
    role: role || 'farmer',
    createdAt: new Date().toISOString(),
  };

  // Save to local registry
  saveLocalAccount(username, newAccount);

  return newAccount;
}

