/**
 * Middleware de validación usando Zod
 * 
 * @module middlewares/validator.handler
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ZodSchema, ZodError } from 'zod';
import boom from '@hapi/boom';
import logger from '../utils/logger.js';

/**
 * Tipos de propiedades que se pueden validar
 */
type ValidationProperty = 'body' | 'params' | 'query' | 'headers';

/**
 * Formatea errores de Zod en un formato legible
 */
function formatZodErrors(error: ZodError): Array<{ field: string; message: string; code: string }> {
  return error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));
}

/**
 * Crea un middleware de validación para un schema de Zod
 * 
 * @param schema - Schema de Zod para validar
 * @param property - Propiedad del request a validar
 * @returns Middleware de validación
 * 
 * @example
 * router.post('/', validatorHandler(createSchema, 'body'), async (req, res) => {
 *   // req.body ya está validado y sanitizado con tipos inferidos
 * });
 */
function validatorHandler<T extends ZodSchema>(schema: T, property: ValidationProperty): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const data = req[property];
    const result = schema.safeParse(data);
    
    if (!result.success) {
      // Format validation errors
      const details = formatZodErrors(result.error);
      
      // Log validation failure (without sensitive data)
      logger.warn('Validation failed', { 
        property, 
        fields: details.map(d => d.field).join(', ')
      });
      
      next(boom.badRequest('Validation failed', { details }));
    } else {
      // Replace request data with validated and parsed data
      (req as any)[property] = result.data;
      next();
    }
  };
}

export default validatorHandler;
