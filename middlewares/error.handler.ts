/**
 * [ES] Middlewares de manejo de errores
 * [EN] Error handling middlewares
 * 
 * @module middlewares/error.handler
 */

import type { Request, Response, NextFunction, ErrorRequestHandler, RequestHandler } from 'express';
import '../instrument.js';
import env from '../environments/index.js';
import * as Sentry from '@sentry/node';
import logger from '../utils/logger.js';

/**
 * [ES] Middleware para rutas no encontradas (404)
 * [EN] Middleware for not found routes (404)
 */
export const errorNotFound: RequestHandler = (_req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({ error: 'The requested route was not found' });
};

/**
 * [ES] Middleware para logging de errores
 * [EN] Middleware for error logging
 */
export const errorLog: ErrorRequestHandler = (err: any, req: Request, _res: Response, next: NextFunction): void => {
  // [ES] Logging estructurado
  // [EN] Structured logging
  const errorContext = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    errorMessage: err.message,
    errorName: err.name,
    statusCode: err.statusCode || err.status || 500
  };

  if (env.execution === 'development') {
    logger.error('Request error', { ...errorContext, stack: err.stack });
  } else {
    // [ES] En producción, registrar sin stack trace
    // [EN] In production, log without stack trace
    logger.error('[ES] Error de solicitud / [EN] Request error', errorContext);
  }

  next(err);
};

/**
 * [ES] Middleware principal de manejo de errores
 * [EN] Main error handling middleware
 */
export const errorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, _next: NextFunction): void => {
  // [ES] Determinar código de estado
  // [EN] Determine status code
  const statusCode = err.statusCode || err.status || 500;
  
  // [ES] Enviar a Sentry en producción (solo errores 5xx)
  // [EN] Send to Sentry in production (only for 5xx errors)
  if (env.execution === 'production' && statusCode >= 500) {
    Sentry.captureException(err, {
      tags: {
        path: req.path,
        method: req.method
      },
      user: {
        ip_address: req.ip
      }
    });
  }

  // Prepare safe error response
  const errorResponse: any = {
    error: statusCode >= 500 ? 'Internal Server Error' : err.name || 'Error',
    message: statusCode >= 500 
      ? 'An unexpected error occurred' // Generic message for 5xx
      : (err.message || 'An error occurred'), // Client errors can show message
  };

  // In development, add debugging info
  if (env.execution === 'development') {
    errorResponse.debug = {
      message: err.message,
      stack: err.stack,
      statusCode
    };
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware para errores de Boom
 */
export const errorBoom: ErrorRequestHandler = (err: any, _req: Request, res: Response, next: NextFunction): void => {
  if (err.isBoom) {
    const { output } = err;
    res.status(output.statusCode).json(output.payload);
  } else {
    next(err);
  }
};
