// src/utils/constants.js — Centralized magic strings and route definitions
// Prevents typos and enables find-all-references across the codebase

// ── Route IDs ─────────────────────────────────────────────────
export const ROUTES = {
  // Farmer
  DASHBOARD:        'dashboard',
  CROP_DOCTOR:      'crop-doctor',
  MARKETPLACE_SELL: 'marketplace-sell',
  LABOUR_HIRE:      'labour-hire',
  EQUIPMENT_RENT:   'equipment-rent',
  EXPERT_CONNECT:   'expert-connect',
  FINTECH:          'fintech',
  FARM_PROFILE:     'farm-profile',
  SYSTEM_OVERVIEW:  'system-overview',

  // Expert
  EXPERT_HOME:      'expert-home',
  SESSIONS:         'sessions',
  EARNINGS:         'earnings',

  // Buyer
  MARKETPLACE_BROWSE: 'marketplace-browse',
  ORDERS:             'orders',

  // Admin
  ADMIN:            'admin',

  // Worker
  WORKER_DASHBOARD: 'worker-dashboard',
  WORKER_REGISTER:  'worker-register',
};

// ── Roles ─────────────────────────────────────────────────────
export const ROLES = {
  FARMER:  'farmer',
  EXPERT:  'expert',
  BUYER:   'buyer',
  ADMIN:   'admin',
  WORKER:  'worker',
  OWNER:   'owner',
};

export const ALL_ROLES = Object.values(ROLES);

// ── Role display config ───────────────────────────────────────
export const ROLE_CONFIG = {
  [ROLES.FARMER]: { emoji: '👨‍🌾', label: 'Farmer',  labelHi: 'किसान',    defaultRoute: ROUTES.DASHBOARD },
  [ROLES.EXPERT]: { emoji: '👨‍🏫', label: 'Expert',  labelHi: 'विशेषज्ञ', defaultRoute: ROUTES.EXPERT_HOME },
  [ROLES.BUYER]:  { emoji: '🏪', label: 'Buyer',   labelHi: 'खरीददार',  defaultRoute: ROUTES.MARKETPLACE_BROWSE },
  [ROLES.ADMIN]:  { emoji: '⚙️', label: 'Admin',   labelHi: 'एडमिन',    defaultRoute: ROUTES.ADMIN },
  [ROLES.WORKER]: { emoji: '👷', label: 'Worker',  labelHi: 'श्रमिक',   defaultRoute: ROUTES.WORKER_DASHBOARD },
  [ROLES.OWNER]:  { emoji: '🚜', label: 'Owner',   labelHi: 'मालिक',    defaultRoute: ROUTES.EQUIPMENT_RENT },
};

// ── Toast types ───────────────────────────────────────────────
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR:   'error',
  INFO:    'info',
  WARNING: 'warning',
};

// ── API Cache TTLs ────────────────────────────────────────────
export const CACHE_TTL = {
  WEATHER: 15 * 60 * 1000,   // 15 minutes
  MANDI:   30 * 60 * 1000,   // 30 minutes
};

// ── Severity levels (Crop Doctor) ─────────────────────────────
export const SEVERITY = {
  NONE:     { label: 'None',     color: '#22C55E' },
  LOW:      { label: 'Low',      color: '#84CC16' },
  MEDIUM:   { label: 'Medium',   color: '#F59E0B' },
  HIGH:     { label: 'High',     color: '#D97706' },
  CRITICAL: { label: 'Critical', color: '#DC2626' },
};
