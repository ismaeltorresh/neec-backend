import boom from '@hapi/boom';
import logger from '../utils/logger.js';

/**
 * Async handler wrapper que captura errores automáticamente.
 * Elimina la necesidad de try-catch en cada ruta.
 * 
 * @param {Function} fn - Función async del handler
 * @returns {Function} Middleware wrapper con manejo de errores
 * 
 * @example
 * router.get('/', asyncHandler(async (req, res) => {
 *   const data = await someAsyncOperation();
 *   res.json(data);
 * }));
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Si el error ya es un Boom error, pasarlo directamente
      if (error.isBoom) {
        return next(error);
      }
      
      // Para otros errores, crear un Boom error interno con contexto
      logger.error('Unhandled error in async handler', {
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
      });
      
      // En desarrollo, incluir más detalles del error
      const isDev = process.env.NODE_ENV === 'development';
      const errorMessage = isDev 
        ? `Unexpected error: ${error.message}` 
        : 'An unexpected error occurred';
      
      next(boom.internal(errorMessage, { originalError: error.message }));
    });
  };
};

/**
 * Wrapper específico para validación + async handler.
 * Combina validación y manejo de errores en una sola función.
 * NOTA: Por ahora, importa validatorHandler manualmente donde uses esta función.
 * 
 * @param {Function} validatorHandler - Middleware de validación ya configurado
 * @param {Function} handler - Handler async
 * @returns {Array} Array de middlewares [validator, asyncHandler]
 * 
 * @example
 * import validatorHandler from '../middlewares/validator.handler.js';
 * router.post('/', ...validateAsync(validatorHandler(postSchema, 'body'), async (req, res) => {
 *   const created = await service.create(req.body);
 *   res.status(201).json(created);
 * }));
 */
export const validateAsync = (validatorMiddleware, handler) => {
  return [
    validatorMiddleware,
    asyncHandler(handler)
  ];
};


/**
 * Wrapper para operaciones de base de datos con retry automático.
 * Útil para operaciones que pueden fallar temporalmente.
 * 
 * @param {Function} operation - Operación async a ejecutar
 * @param {number} maxRetries - Número máximo de reintentos (default: 3)
 * @param {number} delay - Delay entre reintentos en ms (default: 1000)
 * @returns {Promise} Resultado de la operación
 * 
 * @example
 * const result = await withRetry(async () => {
 *   return await db.query('SELECT * FROM users');
 * }, 3, 1000);
 */
export const withRetry = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // No reintentar para errores Boom 4xx (errores del cliente)
      if (error.isBoom && error.output.statusCode < 500) {
        throw error;
      }
      
      // Si es el último intento, lanzar el error
      if (attempt === maxRetries) {
        break;
      }
      
      // Esperar antes del siguiente intento
      logger.warn('Retry attempt failed', { attempt, maxRetries, error: error.message });
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

/**
 * Wrapper para timeout de operaciones async.
 * Previene operaciones que se cuelgan indefinidamente.
 * 
 * @param {Function|Promise} operation - Operación async/función o Promise ya creada
 * @param {number} timeoutMs - Timeout en milisegundos (default: 30000)
 * @returns {Promise} Resultado de la operación
 * @throws {Error} Si la operación excede el timeout
 * 
 * @example
 * // Con función
 * const result = await withTimeout(() => externalAPI.fetch(), 5000);
 * 
 * // Con Promise
 * const result = await withTimeout(db.query(...), 5000);
 */
export const withTimeout = async (operation, timeoutMs = 30000) => {
  const promise = typeof operation === 'function' ? operation() : operation;
  
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(boom.gatewayTimeout(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
};

export default asyncHandler;
