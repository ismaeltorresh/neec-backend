/**
 * [ES] Middleware de timeout para requests
 * [EN] Timeout middleware for requests
 * 
 * @module middlewares/perf.handler
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import env from '../environments/index.js';
import logger from '../utils/logger.js';

/**
 * [ES] Middleware que aplica timeout a los requests
 * [EN] Middleware that applies timeout to requests
 * 
 * @param {Request} req - [ES] Request de Express / [EN] Express Request
 * @param {Response} res - [ES] Response de Express / [EN] Express Response
 * @param {NextFunction} next - [ES] NextFunction de Express / [EN] Express NextFunction
 */
const perfTimeout: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const timeoutMs = env.requestTimeout;
  
  // [ES] Establecer un temporizador para abortar la solicitud
  // [EN] Set a timer to abort the request
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      // [ES] Registrar timeout para monitoreo
      // [EN] Log timeout for monitoring
      logger.perf('[ES] Timeout de solicitud excedido / [EN] Request timeout exceeded', { 
        method: req.method, 
        path: req.path, 
        timeout: timeoutMs 
      });
      
      res.status(408).json({ 
        error: '[ES] Timeout de Solicitud / [EN] Request Timeout',
        message: '[ES] La solicitud tardó demasiado en completarse / [EN] The request took too long to complete'
      });
    }
  }, timeoutMs);

  // [ES] Limpiar temporizador cuando la respuesta finaliza
  // [EN] Clear timer when response finishes
  res.on('finish', () => {
    clearTimeout(timer);
  });

  next();
};

export default perfTimeout;
