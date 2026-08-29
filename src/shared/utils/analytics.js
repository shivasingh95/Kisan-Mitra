// src/shared/utils/analytics.js — Firebase Analytics event helpers
// Provides typed, consistent event tracking for KrishiMitra features.
// All events are no-ops if analytics is unavailable (e.g., blocked by ad-blocker).
import { logEvent } from 'firebase/analytics';
import { analytics } from '@/services/firebase/config';

/**
 * Safely log a Firebase Analytics event.
 * No-ops gracefully if analytics is null (not initialized or unsupported).
 */
function track(eventName, params = {}) {
  if (!analytics) return;
  try {
    logEvent(analytics, eventName, params);
  } catch {
    // Silently fail — analytics should never break the app
  }
}

// ── Page View Tracking ───────────────────────────────────────
export function trackPageView(pageName, role) {
  track('page_view', {
    page_title: pageName,
    user_role: role,
  });
}

// ── Crop Doctor ──────────────────────────────────────────────
export function trackScanStart() {
  track('crop_scan_start');
}

export function trackScanSuccess(plantName, confidence) {
  track('crop_scan_success', {
    plant_name: plantName,
    confidence_percent: Math.round(confidence * 100),
  });
}

export function trackScanError(errorType) {
  track('crop_scan_error', { error_type: errorType });
}

// ── Marketplace ──────────────────────────────────────────────
export function trackListingCreated(cropType, pricePerQuintal) {
  track('listing_created', {
    crop_type: cropType,
    price_inr: pricePerQuintal,
  });
}

export function trackMandiPriceView(mandiName) {
  track('mandi_price_view', { mandi_name: mandiName });
}

// ── Expert Connect ───────────────────────────────────────────
export function trackExpertBooking(expertId, specialization) {
  track('expert_booking', {
    expert_id: expertId,
    specialization,
  });
}

// ── Labour & Equipment ───────────────────────────────────────
export function trackJobPost(skillType) {
  track('job_posted', { skill_type: skillType });
}

export function trackEquipmentBooking(equipmentType) {
  track('equipment_booked', { equipment_type: equipmentType });
}

// ── Auth ─────────────────────────────────────────────────────
export function trackLogin(method) {
  track('login', { method }); // 'phone_otp' or 'demo'
}

export function trackSignup(role) {
  track('sign_up', { user_role: role });
}

// ── Language ─────────────────────────────────────────────────
export function trackLanguageSwitch(fromLang, toLang) {
  track('language_switch', { from: fromLang, to: toLang });
}

// ── Feature Discovery ────────────────────────────────────────
export function trackFeatureClick(featureName) {
  track('feature_click', { feature_name: featureName });
}
