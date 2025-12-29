/**
 * Tipos e interfaces globales para el proyecto NEEC Backend
 * @module types
 */

/**
 * Configuración del entorno de ejecución
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
  db: {
    maria: {
      host: string;
      port: string;
      user: string;
      password?: string;
      database: string;
      dialect: 'mariadb';
      logging: boolean | ((sql: string) => void);
    };
  };
}

/**
 * Parámetros de paginación
 */
export interface PaginationParams {
  page?: number | string;
  pageSize?: number | string;
}

/**
 * Resultado paginado
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
 * Opciones para paginación SQL
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
 * Niveles de log
 */
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'DB' | 'PERF';

/**
 * Contexto de log
 */
export type LogContext = Record<string, unknown>;

/**
 * Schema base para entidades
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
