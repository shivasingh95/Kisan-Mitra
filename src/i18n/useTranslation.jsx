// src/i18n/useTranslation.js — Lightweight i18n hook for KrishiMitra
// No external dependencies — uses React context + JSON locale files
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import hi from './hi.json';
import en from './en.json';

const LOCALES = { hi, en };
const STORAGE_KEY = 'krishi-mitra-lang';

// ── Context ─────────────────────────────────────────────
const I18nContext = createContext(null);

/**
 * Get a nested value from an object using dot notation.
 * e.g., resolve(obj, 'nav.dashboard') → obj.nav.dashboard
 */
function resolve(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

/**
 * I18nProvider — wraps the app and provides language state.
 * Default language: Hindi (target audience is Indian farmers).
 */
export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'hi';
    } catch {
      return 'hi';
    }
  });

  const setLang = useCallback((newLang) => {
    const validLang = LOCALES[newLang] ? newLang : 'hi';
    setLangState(validLang);
    try {
      localStorage.setItem(STORAGE_KEY, validLang);
    } catch { /* localStorage unavailable */ }

    // Update document lang attribute for screen readers
    document.documentElement.lang = validLang === 'hi' ? 'hi' : 'en';
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'hi' ? 'en' : 'hi');
  }, [lang, setLang]);

  const value = useMemo(() => ({
    lang,
    setLang,
    toggleLang,
    isHindi: lang === 'hi',
    isEnglish: lang === 'en',
  }), [lang, setLang, toggleLang]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * useTranslation — the main hook.
 *
 * Usage:
 *   const { t, lang, toggleLang } = useTranslation();
 *   <h1>{t('nav.dashboard')}</h1>
 *   <button onClick={toggleLang}>{lang === 'hi' ? 'EN' : 'हि'}</button>
 */
export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used inside I18nProvider');

  const t = useCallback((key, fallback) => {
    const translation = resolve(LOCALES[ctx.lang], key);
    if (translation !== undefined) return translation;

    // Fallback to English if Hindi key is missing
    if (ctx.lang !== 'en') {
      const enFallback = resolve(LOCALES.en, key);
      if (enFallback !== undefined) return enFallback;
    }

    // Last resort: return fallback or the key itself
    return fallback || key;
  }, [ctx.lang]);

  return {
    t,
    lang: ctx.lang,
    setLang: ctx.setLang,
    toggleLang: ctx.toggleLang,
    isHindi: ctx.isHindi,
    isEnglish: ctx.isEnglish,
  };
}
