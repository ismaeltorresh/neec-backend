/**
 * [ES] Tipos e interfaces globales para el proyecto NEEC Backend
 * [EN] Global types and interfaces for NEEC Backend project
 * @module types
 */

/**
 * [ES] Configuración del entorno de ejecución
 * [EN] Runtime environment configuration
 */
export interface Environment {
  execution: 'development' | 'production' | 'test';
  service: string;
  server: string;
  port: number;
  bodyLimit: string;
  requestTimeout: number;
  whiteList: (string | undefined)[];
  audience?: string;
  issuerBaseURL?: string;
  issuer?: string;
  jwksUri?: string;
  oauth: boolean;
  sentry: boolean;
  algorithms: string[];
  docsToken?: string;
  skipDatabase?: boolean;
  db: {
    maria: {
      host: string;
      port: string;
      user: string;
      password?: string;
      database: string;
      logging: boolean;
    };
  };
}

/**
 * [ES] Parámetros de paginación
 * [EN] Pagination parameters
 */
export interface PaginationParams {
  page?: number | string;
  pageSize?: number | string;
}

/**
 * [ES] Resultado paginado
 * [EN] Paginated result
 */
export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * [ES] Opciones para paginación SQL
 * [EN] Options for SQL pagination
 */
export interface SqlPaginateOptions {
  table: string;
  recordStatus?: boolean | number | string;
  page?: number;
  pageSize?: number;
  columns?: string;
  whereClause?: string;
  replacements?: Record<string, unknown>;
  filters?: Record<string, unknown>;
  allowedFilters?: string[];
  search?: {
    q: string;
    columns: string[];
  };
  orderBy?: string;
  sortColumn?: string;
  sortOrder?: 'ASC' | 'DESC';
  allowedSortColumns?: string[];
}

/**
 * [ES] Niveles de log
 * [EN] Log levels
 */
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'DB' | 'PERF';

/**
 * [ES] Contexto de log
 * [EN] Log context
 */
export type LogContext = Record<string, unknown>;

/**
 * [ES] Schema base para entidades
 * [EN] Base schema for entities
 */
export interface BaseSchema {
  id: string;
  createdAt: string;
  dataSource: 'sql' | 'nosql' | 'both' | 'fake';
  recordStatus: boolean;
  updatedAt: string;
  updatedBy: string;
  useAs: string;
}

/**
 * Callback de CORS
 */
export interface CorsCallback {
  (err: Error | null, allow?: boolean): void;
}

/**
 * Respuesta de error estructurada
 */
export interface ErrorResponse {
  error: string;
  statusCode: number;
  message: string;
  details?: unknown;
}

/**
 * Respuesta exitosa estructurada
 */
export interface SuccessResponse<T = unknown> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}
