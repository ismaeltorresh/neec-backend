/**
 * Logger centralizado para reemplazar console.log/warn/error
 * Provee logging estructurado con niveles y contexto
 * 
 * @module utils/logger
 */

import type { LogLevel, LogContext } from '../types/index.js';

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Formatea mensaje con timestamp y nivel
 */
const formatMessage = (level: LogLevel, message: string, context: LogContext = {}): string => {
  const timestamp = new Date().toISOString();
  const contextStr = Object.keys(context).length > 0 
    ? ` | ${JSON.stringify(context)}` 
    : '';
  
  return `[${timestamp}] [${level}] ${message}${contextStr}`;
};

/**
 * Logger con niveles de severidad
 */
export const logger = {
  /**
   * Log informativo (solo desarrollo)
   */
  info: (message: string, context: LogContext = {}): void => {
    if (isDevelopment) {
      console.log(formatMessage('INFO', message, context));
    }
  },

  /**
   * Warning (desarrollo y producción)
   */
  warn: (message: string, context: LogContext = {}): void => {
    console.warn(formatMessage('WARN', message, context));
  },

  /**
   * Error (siempre)
   */
  error: (message: string, context: LogContext = {}): void => {
    console.error(formatMessage('ERROR', message, context));
  },

  /**
   * Debug (solo desarrollo)
   */
  debug: (message: string, context: LogContext = {}): void => {
    if (isDevelopment) {
      console.log(formatMessage('DEBUG', message, context));
    }
  },

  /**
   * Log de conexión DB (desarrollo)
   */
  db: (message: string, context: LogContext = {}): void => {
    if (isDevelopment) {
      console.log(formatMessage('DB', message, context));
    }
  },

  /**
   * Log de performance (desarrollo)
   */
  perf: (message: string, context: LogContext = {}): void => {
    if (isDevelopment) {
      console.log(formatMessage('PERF', message, context));
    }
  }
};

export default logger;
