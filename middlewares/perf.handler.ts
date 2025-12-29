/**
 * Middleware de timeout para requests
 * 
 * @module middlewares/perf.handler
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import env from '../environments/index.js';
import logger from '../utils/logger.js';

/**
 * Middleware que aplica timeout a los requests
 * 
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
const perfTimeout: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const timeoutMs = env.requestTimeout;
  
  // Set a timer to abort the request
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      // Log timeout for monitoring
      logger.perf('Request timeout exceeded', { 
        method: req.method, 
        path: req.path, 
        timeout: timeoutMs 
      });
      
      res.status(408).json({ 
        error: 'Request Timeout',
        message: 'The request took too long to complete'
      });
    }
  }, timeoutMs);

  // Clear timer when response finishes
  res.on('finish', () => {
    clearTimeout(timer);
  });

  next();
};

export default perfTimeout;
