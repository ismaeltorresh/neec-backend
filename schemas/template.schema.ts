/**
 * Template validation schema using Zod
 * Define validation rules for CRUD operations with TypeScript type inference
 * 
 * @module schemas/template.schema
 */

import { z } from 'zod';

/**
 * Data source enum
 */
export const DataSourceEnum = z.enum(['sql', 'nosql', 'both', 'fake']);

/**
 * Record status enum
 */
export const RecordStatusEnum = z.union([z.literal(0), z.literal(1)]);

/**
 * Base field schemas
 */
export const baseSchemas = {
  // ** Start recommended mandatory schema **
  createdAt: z.coerce.date(), // Date and time of creation (coerce from string/number)
  dataSource: DataSourceEnum, // The origin or destination of the data
  id: z.string().uuid(), // Unique identifier
  recordStatus: RecordStatusEnum, // Indicates if the record can be displayed or not
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, 'Must be in format YYYY-MM-DD HH:MM:SS'), // Date and time of update
  updatedBy: z.string().uuid(), // ID of the user who modified
  useAs: z.string(), // The use you will give e.g. contact | ...
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be a valid slug'), // Slug for URL-friendly representation
  // ** Ends recommended mandatory schema **
};

/**
 * Schema for DELETE operations
 */
export const deleteSchema = z.object({
  dataSource: baseSchemas.dataSource,
  id: baseSchemas.id,
  recordStatus: RecordStatusEnum,
  updatedAt: baseSchemas.updatedAt,
  updatedBy: baseSchemas.updatedBy,
});

/**
 * Schema for GET/LIST operations
 */
export const getSchema = z.object({
  dataSource: baseSchemas.dataSource.optional(),
  recordStatus: RecordStatusEnum.optional(),
  // optional pagination for list endpoints
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(10).optional(),
  // allow id if requesting a single item
  id: baseSchemas.id.optional(),
  // optional query filters
  brand: z.string().optional(),
  categoryId: z.coerce.number().int().optional(),
  sku: z.string().optional(),
  code: z.string().optional(),
  q: z.string().optional(), // search query
  sortBy: z.string().optional(), // column to sort by
  sortDir: z.enum(['ASC', 'DESC']).optional(), // sort direction
});

/**
 * Schema for UPDATE operations
 */
export const updateSchema = z.object({
  dataSource: baseSchemas.dataSource,
  id: baseSchemas.id,
  updatedAt: baseSchemas.updatedAt,
  updatedBy: baseSchemas.updatedBy,
  recordStatus: RecordStatusEnum,
});

/**
 * Schema for POST/CREATE operations
 */
export const postSchema = z.object({
  createdAt: baseSchemas.createdAt,
  dataSource: baseSchemas.dataSource,
  id: baseSchemas.id,
  recordStatus: RecordStatusEnum,
  updatedAt: baseSchemas.updatedAt,
  updatedBy: baseSchemas.updatedBy,
  useAs: baseSchemas.useAs,
});

/**
 * Schema for route params validation
 */
export const paramsSchema = z.object({
  id: baseSchemas.id,
});

// Export TypeScript types inferred from Zod schemas
export type DeleteInput = z.infer<typeof deleteSchema>;
export type GetInput = z.infer<typeof getSchema>;
export type UpdateInput = z.infer<typeof updateSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type ParamsInput = z.infer<typeof paramsSchema>;
export type DataSource = z.infer<typeof DataSourceEnum>;
export type RecordStatus = z.infer<typeof RecordStatusEnum>;

// Legacy exports for backward compatibility
export const del = deleteSchema;
export const get = getSchema;
export const update = updateSchema;
export const post = postSchema;
export const schema = baseSchemas;
