/**
 * Schemas de validación Zod para la entidad Example
 * 
 * ⚠️ SINCRONIZACIÓN:
 * 1. Este archivo (FUENTE DE VERDAD)
 * 2. interfaces/example.interface.ts (DTOs)
 * 3. entities/example.entity.ts (Persistencia)
 * 
 * @module schemas/example.schema
 */

import { z } from 'zod';

/**
 * Schema base para campos comunes (BaseEntity)
 * Estos campos son gestionados automáticamente por TypeORM
 */
export const baseEntitySchema = z.object({
  id: z.number().int().positive().optional(),
  recordStatus: z.boolean().default(true),
  dataSource: z.enum(['sql', 'nosql', 'both', 'fake']).default('sql'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Schema completo de Example para validación de entrada (CREATE)
 * Excluye campos auto-generados (id, timestamps)
 */
export const createExampleSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres')
    .trim(),
  
  email: z.string()
    .email('Email inválido')
    .max(255, 'El email no puede exceder 255 caracteres')
    .toLowerCase()
    .trim(),
  
  description: z.string()
    .max(5000, 'La descripción no puede exceder 5000 caracteres')
    .trim()
    .optional()
    .nullable(),
  
  isActive: z.boolean().default(true),
});

/**
 * Schema para actualización (UPDATE)
 * Todos los campos son opcionales excepto validaciones
 */
export const updateExampleSchema = createExampleSchema.partial();

/**
 * Schema para respuestas (incluye campos auto-generados)
 */
export const exampleResponseSchema = createExampleSchema.merge(
  z.object({
    id: z.number().int().positive(),
    recordStatus: z.boolean(),
    dataSource: z.enum(['sql', 'nosql', 'both', 'fake']),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
);

/**
 * Schema para query parameters (listado con filtros)
 */
export const exampleQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

/**
 * Schema para búsqueda por email
 */
export const findByEmailSchema = z.object({
  email: z.string().email('Email inválido'),
});

/**
 * Tipos TypeScript inferidos desde Zod (Single Source of Truth)
 */
export type CreateExampleInput = z.infer<typeof createExampleSchema>;
export type UpdateExampleInput = z.infer<typeof updateExampleSchema>;
export type ExampleResponse = z.infer<typeof exampleResponseSchema>;
export type ExampleQueryParams = z.infer<typeof exampleQuerySchema>;
export type FindByEmailInput = z.infer<typeof findByEmailSchema>;

/**
 * Helper para validar y transformar datos de entrada
 */
export function validateCreateExample(data: unknown): CreateExampleInput {
  return createExampleSchema.parse(data);
}

export function validateUpdateExample(data: unknown): UpdateExampleInput {
  return updateExampleSchema.parse(data);
}

export function validateExampleQuery(data: unknown): ExampleQueryParams {
  return exampleQuerySchema.parse(data);
}
