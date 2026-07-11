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
    callback: () => {}, // reCAPTCHA solved automatically
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

// ── Sign out ──────────────────────────────────────────────────
export async function firebaseSignOut() {
  authLog.info('User signing out');
  confirmationResult = null;
  await signOut(auth);
}

