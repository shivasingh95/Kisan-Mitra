// src/services/auth.js — Firebase Phone OTP Authentication
import { auth } from './firebase';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
} from 'firebase/auth';

// ── Setup invisible reCAPTCHA (call once before sendOTP) ──────
export function setupRecaptcha() {
  // Destroy old one if it exists (handles hot-reload / re-render)
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }
  window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
    size: 'invisible',
    callback: () => {}, // reCAPTCHA solved automatically
  });
}

// ── Send OTP to phone number ──────────────────────────────────
// phone: 10-digit number without country code (e.g. "9876543210")
export async function sendPhoneOTP(phone) {
  const appVerifier = window.recaptchaVerifier;
  const result = await signInWithPhoneNumber(auth, `+91${phone}`, appVerifier);
  window.confirmationResult = result; // store for later verification
  return result;
}

// ── Verify the 6-digit OTP entered by user ────────────────────
export async function verifyPhoneOTP(otpCode) {
  if (!window.confirmationResult) {
    throw new Error('No OTP was sent. Please request OTP first.');
  }
  const result = await window.confirmationResult.confirm(otpCode);
  return result.user; // Firebase User object: { uid, phoneNumber, ... }
}

// ── Sign out ──────────────────────────────────────────────────
export async function firebaseSignOut() {
  await signOut(auth);
}
