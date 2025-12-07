/**
 * Logger centralizado para reemplazar console.log/warn/error
 * Provee logging estructurado con niveles y contexto
 * 
 * @module utils/logger
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Formatea mensaje con timestamp y nivel
 */
const formatMessage = (level, message, context = {}) => {
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
  info: (message, context = {}) => {
    if (isDevelopment) {
      console.log(formatMessage('INFO', message, context));
    }
  },

  /**
   * Warning (desarrollo y producción)
   */
  warn: (message, context = {}) => {
    console.warn(formatMessage('WARN', message, context));
  },

  /**
   * Error (siempre)
   */
  error: (message, context = {}) => {
    console.error(formatMessage('ERROR', message, context));
  },

  /**
   * Debug (solo desarrollo)
   */
  debug: (message, context = {}) => {
    if (isDevelopment) {
      console.log(formatMessage('DEBUG', message, context));
    }
  },

  /**
   * Log de conexión DB (desarrollo)
   */
  db: (message, context = {}) => {
    if (isDevelopment) {
      console.log(formatMessage('DB', message, context));
    }
  },

  /**
   * Log de performance (desarrollo)
   */
  perf: (message, context = {}) => {
    if (isDevelopment) {
      console.log(formatMessage('PERF', message, context));
    }
  }
};

export default logger;
