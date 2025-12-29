/**
 * Interfaces TypeScript generadas desde schemas Zod
 * 
 * ⚠️ MANTENER SINCRONIZADO CON: schemas/example.schema.ts
 * 
 * Estas interfaces son útiles para:
 * - DTOs (Data Transfer Objects)
 * - Parámetros de funciones
 * - Respuestas de API
 * - Type guards
 * - Documentación
 * 
 * @module interfaces/example.interface
 */

/**
 * Interface base para campos comunes de todas las entidades
 * Corresponde a los campos de BaseEntity
 */
export interface IBaseEntity {
  id: number;
  recordStatus: boolean;
  dataSource: 'sql' | 'nosql' | 'both' | 'fake';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para crear un Example (sin campos auto-generados)
 * Sincronizada con: createExampleSchema
 */
export interface ICreateExample {
  name: string;
  email: string;
  description?: string | null;
  isActive: boolean;
}

/**
 * Interface para actualizar un Example (todos los campos opcionales)
 * Sincronizada con: updateExampleSchema
 */
export interface IUpdateExample {
  name?: string;
  email?: string;
  description?: string | null;
  isActive?: boolean;
}

/**
 * Interface completa de Example (incluye campos auto-generados)
 * Sincronizada con: exampleResponseSchema
 */
export interface IExample extends IBaseEntity {
  name: string;
  email: string;
  description: string | null;
  isActive: boolean;
}

/**
 * Interface para parámetros de query/filtrado
 * Sincronizada con: exampleQuerySchema
 */
export interface IExampleQuery {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  sortBy: 'name' | 'email' | 'createdAt' | 'updatedAt';
  sortOrder: 'ASC' | 'DESC';
}

/**
 * Interface para búsqueda por email
 * Sincronizada con: findByEmailSchema
 */
export interface IFindByEmail {
  email: string;
}

/**
 * Interface para respuesta paginada genérica
 */
export interface IPaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * Type helper: Example sin campos de auditoría
 */
export type ExampleData = Omit<IExample, keyof IBaseEntity>;

/**
 * Type helper: Campos requeridos para crear Example
 */
export type ExampleRequiredFields = Required<Pick<ICreateExample, 'name' | 'email'>>;

/**
 * Type helper: Campos opcionales de Example
 */
export type ExampleOptionalFields = Partial<Pick<ICreateExample, 'description' | 'isActive'>>;
