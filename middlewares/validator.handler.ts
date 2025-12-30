/**
 * [ES] Middleware de validación usando Zod
 * [EN] Validation middleware using Zod
 * 
 * @module middlewares/validator.handler
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ZodSchema, ZodError } from 'zod';
import boom from '@hapi/boom';
import logger from '../utils/logger.js';

/**
 * [ES] Tipos de propiedades que se pueden validar
 * [EN] Types of properties that can be validated
 */
type ValidationProperty = 'body' | 'params' | 'query' | 'headers';

/**
 * [ES] Formatea errores de Zod en un formato legible
 * [EN] Formats Zod errors in a readable format
 */
function formatZodErrors(error: ZodError): Array<{ field: string; message: string; code: string }> {
  return error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));
}

/**
 * [ES] Crea un middleware de validación para un schema de Zod
 * [EN] Creates a validation middleware for a Zod schema
 * 
 * @param {T} schema - [ES] Schema de Zod para validar / [EN] Zod schema to validate
 * @param {ValidationProperty} property - [ES] Propiedad del request a validar / [EN] Request property to validate
 * @returns {RequestHandler} [ES] Middleware de validación / [EN] Validation middleware
 * 
 * @example
 * router.post('/', validatorHandler(createSchema, 'body'), async (req, res) => {
 *   // [ES] req.body ya está validado y sanitizado con tipos inferidos
 *   // [EN] req.body is already validated and sanitized with inferred types
 * });
 */
function validatorHandler<T extends ZodSchema>(schema: T, property: ValidationProperty): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const data = req[property];
    const result = schema.safeParse(data);
    
    if (!result.success) {
      // [ES] Formatear errores de validación
      // [EN] Format validation errors
      const details = formatZodErrors(result.error);
      
      // [ES] Registrar falla de validación (sin datos sensibles)
      // [EN] Log validation failure (without sensitive data)
      logger.warn('[ES] Validación fallida / [EN] Validation failed', { 
        property, 
        fields: details.map(d => d.field).join(', ')
      });
      
      next(boom.badRequest('[ES] Validación fallida / [EN] Validation failed', { details }));
    } else {
      // [ES] Reemplazar datos del request con datos validados y parseados
      // [EN] Replace request data with validated and parsed data
      (req as any)[property] = result.data;
      next();
    }
  };
}

export default validatorHandler;
