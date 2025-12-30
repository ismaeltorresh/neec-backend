/**
 * [ES] Configuración de rate limiter para endpoints de API
 * [EN] Rate limiter configuration for API endpoints
 * [ES] Protege contra ataques de fuerza bruta y DoS
 * [EN] Protects against brute-force attacks and DoS
 * 
 * @module middlewares/rate-limit.handler
 */

import type { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import env from '../environments/index.js';
import logger from '../utils/logger.js';

/**
 * [ES] Configuración de rate limiter para endpoints de API
 * [EN] Rate limiter configuration for API endpoints
 * [ES] Protege contra ataques de fuerza bruta e intentos de DoS
 * [EN] Protects against brute-force attacks and DoS attempts
 * 
 * @description
 * - [ES] Desarrollo: Más permisivo (200 solicitudes por 15 minutos)
 * - [EN] Development: More permissive (200 requests per 15 minutes)
 * - [ES] Producción: Más estricto (100 solicitudes por 15 minutos)
 * - [EN] Production: Stricter (100 requests per 15 minutes)
 */
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // [ES] 15 minutos / [EN] 15 minutes
  max: env.execution === 'production' ? 100 : 200, // [ES] Límite por IP / [EN] Limit per IP
  standardHeaders: true, // [ES] Retornar info de rate limit en headers `RateLimit-*` / [EN] Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // [ES] Deshabilitar headers `X-RateLimit-*` / [EN] Disable `X-RateLimit-*` headers
  
  // [ES] Handler personalizado para cuando se excede el límite de rate
  // [EN] Custom handler for rate limit exceeded
  handler: (req: Request, res: Response): void => {
    logger.warn('[ES] Límite de tasa excedido / [EN] Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    res.status(429).json({
      error: '[ES] Demasiadas Solicitudes / [EN] Too Many Requests',
      message: '[ES] Has excedido el límite de tasa. Por favor intenta de nuevo más tarde / [EN] You have exceeded the rate limit. Please try again later.',
      retryAfter: (req as any).rateLimit?.resetTime || 'unknown'
    });
  },
  
  // [ES] Omitir rate limiting para ciertas condiciones
  // [EN] Skip rate limiting for certain conditions
  skip: (req: Request): boolean => {
    // [ES] Omitir para endpoint de health check
    // [EN] Skip for health check endpoint
    if (req.path === '/health') return true;
    // [ES] Omitir en entorno de test
    // [EN] Skip in test environment
    if (env.execution === 'test') return true;
    return false;
  }
});

/**
 * [ES] Rate limiter más estricto para endpoints de autenticación
 * [EN] Stricter rate limiter for authentication endpoints
 * [ES] Protege contra credential stuffing y ataques de fuerza bruta
 * [EN] Protects against credential stuffing and brute-force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // [ES] 15 minutos / [EN] 15 minutes
  max: 5, // [ES] Solo 5 intentos fallidos por 15 minutos / [EN] Only 5 failed attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req: Request, res: Response): void => {
    logger.warn('[ES] Límite de tasa de autenticación excedido / [EN] Auth rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    
    res.status(429).json({
      error: '[ES] Demasiados Intentos de Autenticación / [EN] Too Many Authentication Attempts',
      message: '[ES] Demasiados intentos de autenticación. Por favor intenta de nuevo más tarde / [EN] Too many authentication attempts. Please try again later.',
      retryAfter: (req as any).rateLimit?.resetTime || 'unknown'
    });
  },
  
  skip: (_req: Request): boolean => {
    return env.execution === 'test';
  }
});

export default { limiter, authLimiter };
