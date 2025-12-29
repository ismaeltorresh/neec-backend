/**
 * Rate limiter configuration para API endpoints.
 * Protege contra ataques de fuerza bruta y DoS.
 * 
 * @module middlewares/rate-limit.handler
 */

import type { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import env from '../environments/index.js';
import logger from '../utils/logger.js';

/**
 * Rate limiter configuration for API endpoints.
 * Protects against brute-force attacks and DoS attempts.
 * 
 * @description
 * - Development: More permissive (200 requests per 15 minutes)
 * - Production: Stricter (100 requests per 15 minutes)
 */
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.execution === 'production' ? 100 : 200, // Limit per IP
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  
  // Custom handler for rate limit exceeded
  handler: (req: Request, res: Response): void => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: (req as any).rateLimit?.resetTime || 'unknown'
    });
  },
  
  // Skip rate limiting for certain conditions
  skip: (req: Request): boolean => {
    // Skip for health check endpoint
    if (req.path === '/health') return true;
    // Skip in test environment
    if (env.execution === 'test') return true;
    return false;
  }
});

/**
 * Stricter rate limiter for authentication endpoints.
 * Protects against credential stuffing and brute-force attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 failed attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req: Request, res: Response): void => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    
    res.status(429).json({
      error: 'Too Many Authentication Attempts',
      message: 'Too many authentication attempts. Please try again later.',
      retryAfter: (req as any).rateLimit?.resetTime || 'unknown'
    });
  },
  
  skip: (_req: Request): boolean => {
    return env.execution === 'test';
  }
});

export default { limiter, authLimiter };
