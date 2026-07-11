// src/shared/utils/logger.js — Structured logging service
// Replaces scattered console.log with leveled, structured logging
// Integration-ready for Sentry, LogRocket, or any error tracking service

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4,
};

// In production, suppress DEBUG and INFO
const CURRENT_LEVEL = import.meta.env.PROD ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;

/**
 * Format a log entry with timestamp, level, and context
 */
function formatEntry(level, context, message) {
  const timestamp = new Date().toISOString();
  return { timestamp, level, context, message };
}

/**
 * Structured logger with context tagging.
 *
 * @example
 * import { logger } from '@/shared/utils/logger';
 * const log = logger.create('CropDoctor');
 *
 * log.info('Scan started', { fileName: file.name });
 * log.error('PlantNet API failed', { status: 500 });
 */
export const logger = {
  /**
   * Create a context-scoped logger.
   * @param {string} context — module/component name (e.g. 'CropDoctor', 'Auth')
   */
  create(context) {
    return {
      debug(message, data) {
        if (CURRENT_LEVEL <= LOG_LEVELS.DEBUG) {
          console.debug(
            `%c[DEBUG] %c${context}%c ${message}`,
            'color: #6B7280',
            'color: #8B5CF6; font-weight: bold',
            'color: inherit',
            data ?? ''
          );
        }
      },

      info(message, data) {
        if (CURRENT_LEVEL <= LOG_LEVELS.INFO) {
          console.info(
            `%c[INFO] %c${context}%c ${message}`,
            'color: #3B82F6',
            'color: #2563EB; font-weight: bold',
            'color: inherit',
            data ?? ''
          );
        }
      },

      warn(message, data) {
        if (CURRENT_LEVEL <= LOG_LEVELS.WARN) {
          console.warn(
            `%c[WARN] %c${context}%c ${message}`,
            'color: #F59E0B',
            'color: #D97706; font-weight: bold',
            'color: inherit',
            data ?? ''
          );
        }
      },

      error(message, error, data) {
        if (CURRENT_LEVEL <= LOG_LEVELS.ERROR) {
          const entry = formatEntry('ERROR', context, message);
          console.error(
            `%c[ERROR] %c${context}%c ${message}`,
            'color: #EF4444',
            'color: #DC2626; font-weight: bold',
            'color: inherit',
            { ...entry, error, ...data }
          );

          // TODO: Send to external error tracking service
          // if (window.__SENTRY__) Sentry.captureException(error, { extra: { context, message, ...data } });
        }
      },

      /**
       * Measure execution time of an async operation.
       * @param {string} label — operation name
       * @param {Function} fn — async function to measure
       * @returns {Promise<*>} — result of fn()
       */
      async time(label, fn) {
        const start = performance.now();
        try {
          const result = await fn();
          const duration = (performance.now() - start).toFixed(1);
          this.info(`${label} completed`, { durationMs: duration });
          return result;
        } catch (error) {
          const duration = (performance.now() - start).toFixed(1);
          this.error(`${label} failed after ${duration}ms`, error);
          throw error;
        }
      },
    };
  },
};

// ── Pre-configured loggers for common modules ─────────────────
export const authLog = logger.create('Auth');
export const apiLog = logger.create('API');
export const firestoreLog = logger.create('Firestore');
export const weatherLog = logger.create('Weather');
export const cropDoctorLog = logger.create('CropDoctor');
export const uiLog = logger.create('UI');
