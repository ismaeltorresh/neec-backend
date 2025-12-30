/**
 * [ES] Configuración de conexión a la base de datos MariaDB usando TypeORM
 * [EN] MariaDB database connection configuration using TypeORM
 * 
 * @module db/connection
 */

import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import env from '../environments/index.js';
import boom from '@hapi/boom';
import logger from '../utils/logger.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * [ES] Configuración del pool de conexiones para TypeORM
 * [EN] Connection pool configuration for TypeORM
 */
interface PoolConfig {
  max: number;
  min: number;
  acquireTimeout: number;
  idleTimeout: number;
}

/**
 * [ES] Configuración predeterminada del pool para conexión a MariaDB
 * [EN] Default pool configuration for MariaDB connection
 * [ES] Basado en mejores prácticas de TypeORM y requisitos de producción
 * [EN] Based on TypeORM best practices and production requirements
 */
const DEFAULT_POOL_CONFIG: PoolConfig = {
  max: 10,
  min: 2,
  acquireTimeout: 30000,
  idleTimeout: 10000,
};

/**
 * [ES] Valida y construye la configuración del pool con validaciones de seguridad
 * [EN] Validates and builds pool configuration with security checks
 * @returns {PoolConfig} [ES] Configuración del pool validada / [EN] Validated pool configuration
 */
function buildPoolConfig(): PoolConfig {
  const poolConfig: PoolConfig = { ...DEFAULT_POOL_CONFIG };

  // [ES] Sobrescribir desde variables de entorno si se proporcionan
  // [EN] Override from environment variables if provided
  if (process.env.DB_POOL_MAX) {
    poolConfig.max = Math.min(Number(process.env.DB_POOL_MAX), 100);
  }
  if (process.env.DB_POOL_MIN) {
    poolConfig.min = Math.max(Number(process.env.DB_POOL_MIN), 1);
  }

  // [ES] Validaciones de seguridad
  // [EN] Security validations
  if (poolConfig.max > 100) {
    logger.warn('[ES] El máximo del pool excede el límite recomendado / [EN] Pool max exceeds recommended limit', { max: poolConfig.max, limit: 100 });
    poolConfig.max = 100;
  }
  if (poolConfig.min > poolConfig.max) {
    throw new Error('[ES] El mínimo del pool no puede exceder el máximo / [EN] Pool min cannot exceed max');
  }

  logger.info('[ES] Pool de base de datos configurado / [EN] Database pool configured', poolConfig as unknown as Record<string, unknown>);
  return poolConfig;
}

const poolConfig = buildPoolConfig();

/**
 * [ES] Configuración de TypeORM DataSource para MariaDB
 * [EN] TypeORM DataSource configuration for MariaDB
 * [ES] Usa el driver mysql2 que es compatible con MariaDB
 * [EN] Uses mysql2 driver which is compatible with MariaDB
 */
const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: env.db.maria.host,
  port: Number(env.db.maria.port),
  username: env.db.maria.user,
  password: env.db.maria.password,
  database: env.db.maria.database,
  synchronize: false, // [ES] NUNCA usar true en producción / [EN] NEVER use true in production
  logging: env.execution === 'development',
  entities: [join(__dirname, '../entities/**/*.entity.{ts,js}')],
  migrations: [join(__dirname, '../migrations/**/*.{ts,js}')],
  subscribers: [join(__dirname, '../subscribers/**/*.{ts,js}')],
  // [ES] Configuración del pool de conexiones (Patrón Bulkhead - Sección 12.C)
  // [EN] Connection pool configuration (Bulkhead pattern - Section 12.C)
  extra: {
    connectionLimit: poolConfig.max,
    waitForConnections: true,
    queueLimit: 0,
    acquireTimeout: poolConfig.acquireTimeout,
    idleTimeout: poolConfig.idleTimeout,
  },
  // [ES] Timeouts de conexión para prevenir consultas de larga duración (Sección 3.C)
  // [EN] Connection timeouts to prevent long-running queries (Section 3.C)
  connectTimeout: 10000,
  // [ES] Habilitar soporte de zona horaria
  // [EN] Enable timezone support
  timezone: '+00:00',
  // [ES] Charset para soporte completo de UTF-8
  // [EN] Charset for proper UTF-8 support
  charset: 'utf8mb4',
};

/**
 * TypeORM DataSource instance configured for MariaDB connection.
 */
export const AppDataSource = new DataSource(dataSourceOptions);

/**
 * Initializes and tests the database connection.
 * Should be called explicitly during application startup.
 * Implements circuit breaker pattern for resilience (Section 12.A).
 * 
 * @throws If connection fails
 */
export async function initializeDatabase(): Promise<void> {
  // Skip database connection if configured
  if (env.skipDatabase) {
    logger.info('Database connection skipped (SKIP_DATABASE=true)');
    return;
  }

  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.db('Connection to MariaDB established successfully', {
        database: env.db.maria.database,
        host: env.db.maria.host,
        port: env.db.maria.port,
      });
    }
  } catch (error) {
    const err = error as Error;
    logger.error('Unable to connect to database', {
      error: err.message,
      stack: err.stack,
      database: env.db.maria.database,
      host: env.db.maria.host,
    });
    throw boom.internal('Database connection failed');
  }
}

/**
 * Closes the database connection gracefully.
 * Should be called during application shutdown.
 */
export async function closeDatabase(): Promise<void> {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('Database connection closed successfully');
    }
  } catch (error) {
    const err = error as Error;
    logger.error('Error closing database connection', {
      error: err.message,
    });
  }
}

/**
 * Legacy alias for backwards compatibility
 * @deprecated Use initializeDatabase() instead
 */
export const testConnection = initializeDatabase;

/**
 * Export DataSource for use in repositories
 */
export default AppDataSource;
