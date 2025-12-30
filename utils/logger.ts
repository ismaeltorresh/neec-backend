/**
 * [ES] Logger centralizado para reemplazar console.log/warn/error
 * [EN] Centralized logger to replace console.log/warn/error
 * [ES] Provee logging estructurado con niveles y contexto
 * [EN] Provides structured logging with levels and context
 * 
 * @module utils/logger
 */

import type { LogLevel, LogContext } from '../types/index.js';

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * [ES] Formatea mensaje con timestamp y nivel
 * [EN] Formats message with timestamp and level
 */
const formatMessage = (level: LogLevel, message: string, context: LogContext = {}): string => {
  const timestamp = new Date().toISOString();
  const contextStr = Object.keys(context).length > 0 
    ? ` | ${JSON.stringify(context)}` 
    : '';
  
  return `[${timestamp}] [${level}] ${message}${contextStr}`;
};

/**
 * [ES] Logger con niveles de severidad
 * [EN] Logger with severity levels
 */
export const logger = {
  /**
   * [ES] Log informativo (solo desarrollo)
   * [EN] Informational log (development only)
   */
  info: (message: string, context: LogContext = {}): void => {
    if (isDevelopment) {
      console.log(formatMessage('INFO', message, context));
    }
  },

  /**
   * [ES] Warning (desarrollo y producción)
   * [EN] Warning (development and production)
   */
  warn: (message: string, context: LogContext = {}): void => {
    console.warn(formatMessage('WARN', message, context));
  },

  /**
   * [ES] Error (siempre)
   * [EN] Error (always)
   */
  error: (message: string, context: LogContext = {}): void => {
    console.error(formatMessage('ERROR', message, context));
  },

  /**
   * [ES] Debug (solo desarrollo)
   * [EN] Debug (development only)
   */
  debug: (message: string, context: LogContext = {}): void => {
    if (isDevelopment) {
      console.log(formatMessage('DEBUG', message, context));
    }
  },

  /**
   * [ES] Log de conexión DB (desarrollo)
   * [EN] Database connection log (development)
   */
  db: (message: string, context: LogContext = {}): void => {
    if (isDevelopment) {
      console.log(formatMessage('DB', message, context));
    }
  },

  /**
   * [ES] Log de performance (desarrollo)
   * [EN] Performance log (development)
   */
  perf: (message: string, context: LogContext = {}): void => {
    if (isDevelopment) {
      console.log(formatMessage('PERF', message, context));
    }
  }
};

export default logger;
