/**
 * Utilidad para generar interfaces TypeScript desde schemas Zod
 * 
 * Este helper facilita la sincronización entre Zod schemas e interfaces
 * 
 * @module utils/schema-to-interface
 */

import type { ZodTypeAny, ZodObject } from 'zod';

/**
 * Extrae el tipo TypeScript desde un schema Zod
 * Esta es una función tipo helper que aprovecha z.infer
 * 
 * @template T - Schema Zod
 * @example
 * ```typescript
 * const schema = z.object({ name: z.string() });
 * type MyType = ExtractSchemaType<typeof schema>;
 * // MyType = { name: string }
 * ```
 */
export type ExtractSchemaType<T extends ZodTypeAny> = T['_output'];

/**
 * Extrae el tipo de entrada (input) desde un schema Zod
 * Útil para schemas con transformaciones
 * 
 * @template T - Schema Zod
 * @example
 * ```typescript
 * const schema = z.object({ 
 *   email: z.string().toLowerCase() 
 * });
 * type Input = ExtractSchemaInput<typeof schema>;
 * // Input permite string sin transformar
 * ```
 */
export type ExtractSchemaInput<T extends ZodTypeAny> = T['_input'];

/**
 * Helper para crear una versión parcial de un tipo
 * Similar a Partial<T> pero más explícito
 * 
 * @example
 * ```typescript
 * interface User { name: string; email: string; }
 * type UpdateUser = PartialType<User>;
 * // UpdateUser = { name?: string; email?: string; }
 * ```
 */
export type PartialType<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Helper para hacer campos específicos requeridos
 * 
 * @example
 * ```typescript
 * interface User { name?: string; email?: string; age?: number; }
 * type RequiredUser = RequireFields<User, 'name' | 'email'>;
 * // RequiredUser = { name: string; email: string; age?: number; }
 * ```
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Helper para hacer campos específicos opcionales
 * 
 * @example
 * ```typescript
 * interface User { name: string; email: string; age: number; }
 * type UserWithOptionalAge = OptionalFields<User, 'age'>;
 * // UserWithOptionalAge = { name: string; email: string; age?: number; }
 * ```
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Helper para excluir campos null/undefined
 * 
 * @example
 * ```typescript
 * interface User { name: string; email: string | null; }
 * type NonNullUser = NonNullableFields<User>;
 * // NonNullUser = { name: string; email: string; }
 * ```
 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Metadata sobre un schema Zod
 */
export interface SchemaMetadata {
  name: string;
  fields: string[];
  requiredFields: string[];
  optionalFields: string[];
  description?: string;
}

/**
 * Extrae metadata desde un schema Zod
 * 
 * @param schema - Schema Zod
 * @param name - Nombre del schema
 * @returns Metadata del schema
 */
export function extractSchemaMetadata(
  schema: ZodObject<any>,
  name: string
): SchemaMetadata {
  const shape = schema.shape;
  const fields = Object.keys(shape);
  
  const requiredFields: string[] = [];
  const optionalFields: string[] = [];
  
  fields.forEach(field => {
    const fieldSchema = shape[field];
    if (fieldSchema.isOptional()) {
      optionalFields.push(field);
    } else {
      requiredFields.push(field);
    }
  });
  
  return {
    name,
    fields,
    requiredFields,
    optionalFields,
    description: schema.description,
  };
}

/**
 * Genera comentario JSDoc desde metadata de schema
 * 
 * @param metadata - Metadata del schema
 * @returns String con comentario JSDoc
 */
export function generateJSDocComment(metadata: SchemaMetadata): string {
  const lines = [
    '/**',
    ` * Interface ${metadata.name}`,
  ];
  
  if (metadata.description) {
    lines.push(` * ${metadata.description}`);
  }
  
  lines.push(' *');
  lines.push(` * Campos: ${metadata.fields.join(', ')}`);
  
  if (metadata.requiredFields.length > 0) {
    lines.push(` * Requeridos: ${metadata.requiredFields.join(', ')}`);
  }
  
  if (metadata.optionalFields.length > 0) {
    lines.push(` * Opcionales: ${metadata.optionalFields.join(', ')}`);
  }
  
  lines.push(' */');
  
  return lines.join('\n');
}

/**
 * Template para generar archivo de interfaces
 * 
 * @param entityName - Nombre de la entidad (PascalCase)
 * @param schemas - Object con los schemas
 * @returns String con el código TypeScript
 */
export function generateInterfaceFile(
  entityName: string,
  schemas: {
    create: ZodObject<any>;
    update: ZodObject<any>;
    response: ZodObject<any>;
  }
): string {
  const createMeta = extractSchemaMetadata(schemas.create, `ICreate${entityName}`);
  const updateMeta = extractSchemaMetadata(schemas.update, `IUpdate${entityName}`);
  const responseMeta = extractSchemaMetadata(schemas.response, `I${entityName}`);
  
  return `/**
 * Interfaces TypeScript generadas desde schemas Zod
 * 
 * ⚠️ MANTENER SINCRONIZADO CON: schemas/${entityName.toLowerCase()}.schema.ts
 * 
 * @module interfaces/${entityName.toLowerCase()}.interface
 */

${generateJSDocComment(createMeta)}
export interface ICreate${entityName} {
  // TODO: Agregar campos basados en createSchema
}

${generateJSDocComment(updateMeta)}
export interface IUpdate${entityName} {
  // TODO: Agregar campos basados en updateSchema
}

${generateJSDocComment(responseMeta)}
export interface I${entityName} extends IBaseEntity {
  // TODO: Agregar campos basados en responseSchema
}

/**
 * Interface base para campos comunes
 */
export interface IBaseEntity {
  id: number;
  recordStatus: boolean;
  dataSource: 'sql' | 'nosql' | 'both' | 'fake';
  createdAt: Date;
  updatedAt: Date;
}
`;
}

/**
 * Ejemplo de uso en scripts de generación
 * 
 * @example
 * ```typescript
 * import { generateInterfaceFile } from './utils/schema-to-interface.js';
 * import { createUserSchema, updateUserSchema, userResponseSchema } from './schemas/user.schema.js';
 * 
 * const interfaceCode = generateInterfaceFile('User', {
 *   create: createUserSchema,
 *   update: updateUserSchema,
 *   response: userResponseSchema
 * });
 * 
 * // Guardar en interfaces/user.interface.ts
 * ```
 */
