// src/utils/env.js — Environment variable validation
// Call validateEnv() on app startup to get early warnings for missing config

const REQUIRED_VARS = [];

const OPTIONAL_VARS = [
  {
    key: 'VITE_FIREBASE_API_KEY',
    desc: 'Firebase API Key — needed for Phone OTP auth',
    setupUrl: 'https://console.firebase.google.com',
  },
  {
    key: 'VITE_FIREBASE_AUTH_DOMAIN',
    desc: 'Firebase Auth Domain',
  },
  {
    key: 'VITE_FIREBASE_PROJECT_ID',
    desc: 'Firebase Project ID',
  },
  {
    key: 'VITE_FIREBASE_STORAGE_BUCKET',
    desc: 'Firebase Storage Bucket',
  },
  {
    key: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
    desc: 'Firebase Messaging Sender ID',
  },
  {
    key: 'VITE_FIREBASE_APP_ID',
    desc: 'Firebase App ID',
  },
  {
    key: 'VITE_PLANTNET_API_KEY',
    desc: 'Pl@ntNet API Key — needed for AI crop identification',
    setupUrl: 'https://my.plantnet.org/settings/api-key',
  },
  {
    key: 'VITE_WEATHER_API_KEY',
    desc: 'WeatherAPI.com Key — needed for live weather data',
    setupUrl: 'https://www.weatherapi.com/',
  },
];

export function validateEnv() {
  const missing = [];
  const warnings = [];

  // Check required vars (would block app startup)
  for (const v of REQUIRED_VARS) {
    if (!import.meta.env[v.key]) {
      missing.push(v);
    }
  }

  // Check optional vars (log warnings)
  for (const v of OPTIONAL_VARS) {
    if (!import.meta.env[v.key]) {
      warnings.push(v);
    }
  }

  if (warnings.length > 0) {
    console.group(
      '%c🌿 KrishiMitra — Missing Environment Variables',
      'color: #D97706; font-weight: bold; font-size: 13px'
    );
    for (const v of warnings) {
      console.warn(
        `%c⚠ ${v.key}%c — ${v.desc}${v.setupUrl ? `\n  Setup: ${v.setupUrl}` : ''}`,
        'color: #F59E0B; font-weight: bold',
        'color: inherit'
      );
    }
    console.log('Add these to your .env file in the project root.');
    console.groupEnd();
  }

  if (missing.length > 0) {
    console.error(
      `🚫 KrishiMitra: ${missing.length} required env variable(s) missing. App may not work correctly.`
    );
  }

  return { missing, warnings };
}
