/**
 * Async handler wrapper que captura errores automáticamente.
 * 
 * @module middlewares/async.handler
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import boom from '@hapi/boom';
import logger from '../utils/logger.js';

/**
 * Tipo para handlers asíncronos
 */
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

/**
 * Async handler wrapper que captura errores automáticamente.
 * Elimina la necesidad de try-catch en cada ruta.
 * 
 * @param fn - Función async del handler
 * @returns Middleware wrapper con manejo de errores
 * 
 * @example
 * router.get('/', asyncHandler(async (req, res) => {
 *   const data = await someAsyncOperation();
 *   res.json(data);
 * }));
 */
export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error: unknown) => {
      // Si el error ya es un Boom error, pasarlo directamente
      if (boom.isBoom(error)) {
        return next(error);
      }
      
      // Para otros errores, crear un Boom error interno con contexto
      const err = error as Error;
      logger.error('Unhandled error in async handler', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
      });
      
      // En desarrollo, incluir más detalles del error
      const isDev = process.env.NODE_ENV === 'development';
      const errorMessage = isDev 
        ? `Unexpected error: ${err.message}` 
        : 'An unexpected error occurred';
      
      next(boom.internal(errorMessage, { originalError: err.message }));
    });
  };
};

/**
 * Wrapper específico para validación + async handler.
 * Combina validación y manejo de errores en una sola función.
 * 
 * @param validatorMiddleware - Middleware de validación ya configurado
 * @param handler - Handler async
 * @returns Array de middlewares [validator, asyncHandler]
 * 
 * @example
 * import validatorHandler from '../middlewares/validator.handler.js';
 * router.post('/', ...validateAsync(validatorHandler(postSchema, 'body'), async (req, res) => {
 *   const created = await service.create(req.body);
 *   res.status(201).json(created);
 * }));
 */
export const validateAsync = (validatorMiddleware: RequestHandler, handler: AsyncRequestHandler): RequestHandler[] => {
  return [
    validatorMiddleware,
    asyncHandler(handler)
  ];
};

/**
 * Wrapper para operaciones de base de datos con retry automático.
 * Útil para operaciones que pueden fallar temporalmente.
 * 
 * @param operation - Operación async a ejecutar
 * @param maxRetries - Número máximo de reintentos (default: 3)
 * @param delay - Delay entre reintentos en ms (default: 1000)
 * @returns Resultado de la operación
 * 
 * @example
 * const result = await withRetry(async () => {
 *   return await db.query('SELECT * FROM records');
 * }, 3, 1000);
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // No reintentar para errores Boom 4xx (errores del cliente)
      if (boom.isBoom(error) && error.output.statusCode < 500) {
        throw error;
      }
      
      // Si es el último intento, lanzar el error
      if (attempt === maxRetries) {
        break;
      }
      
      // Log del reintento
      logger.warn(`Operation failed, retrying (${attempt}/${maxRetries})`, {
        attempt,
        maxRetries,
        delay,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Esperar antes del próximo intento
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Si llegamos aquí, todos los intentos fallaron
  logger.error('Operation failed after all retries', {
    maxRetries,
    error: lastError instanceof Error ? lastError.message : 'Unknown error'
  });
  
  throw lastError;
};

/**
 * Wrapper para agregar timeout a una operación.
 * Lanza un error si la operación tarda más del tiempo especificado.
 * 
 * @param promise - Promesa a ejecutar
 * @param timeoutMs - Timeout en milisegundos
 * @returns Resultado de la promesa
 * 
 * @example
 * const result = await withTimeout(
 *   fetchDataFromAPI(),
 *   5000
 * );
 */
export const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => {
        logger.error('Operation timeout', { timeoutMs });
        reject(boom.gatewayTimeout('Operation timeout'));
      }, timeoutMs)
    )
  ]);
};

export default { asyncHandler, validateAsync, withRetry, withTimeout };
