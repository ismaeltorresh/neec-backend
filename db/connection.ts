/**
 * Configuración de conexión a la base de datos MariaDB usando Sequelize
 * 
 * @module db/connection
 */

import { Sequelize } from 'sequelize';
import env from '../environments/index.js';
import boom from '@hapi/boom';
import logger from '../utils/logger.js';

/**
 * Configuración del pool de conexiones
 */
interface PoolConfig {
  max: number;
  min: number;
  acquire: number;
  idle: number;
  evict: number;
  maxUses: number;
}

/**
 * Default pool configuration for MariaDB connection.
 * Based on Sequelize best practices and production requirements.
 */
const DEFAULT_POOL_CONFIG: PoolConfig = {
  max: 10,
  min: 2,
  acquire: 30000,
  idle: 10000,
  evict: 1000,
  maxUses: 10000,
};

/**
 * Validates and builds pool configuration with security checks.
 * @returns Validated pool configuration
 */
function buildPoolConfig(): PoolConfig {
  const poolConfig: PoolConfig = { ...DEFAULT_POOL_CONFIG };

  // Override from environment variables if provided
  if (process.env.DB_POOL_MAX) {
    poolConfig.max = Math.min(Number(process.env.DB_POOL_MAX), 100);
  }
  if (process.env.DB_POOL_MIN) {
    poolConfig.min = Math.max(Number(process.env.DB_POOL_MIN), 1);
  }

  // Security validations
  if (poolConfig.max > 100) {
    logger.warn('Pool max exceeds recommended limit', { max: poolConfig.max, limit: 100 });
    poolConfig.max = 100;
  }
  if (poolConfig.min > poolConfig.max) {
    throw new Error('Pool min cannot exceed max');
  }

  logger.info('Database pool configured', poolConfig as unknown as Record<string, unknown>);
  return poolConfig;
}

/**
 * Sequelize instance configured for MariaDB connection.
 */
const sequelize = new Sequelize(
  env.db.maria.database,
  env.db.maria.user,
  env.db.maria.password!,
  {
    host: env.db.maria.host,
    port: Number(env.db.maria.port),
    dialect: env.db.maria.dialect,
    logging: env.execution === 'development' ? (msg: string) => logger.info(msg) : false,
    pool: buildPoolConfig(),
  }
);

/**
 * Tests the database connection.
 * Should be called explicitly during application startup.
 * 
 * @throws If connection fails
 */
async function testConnection(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.db('Connection to MariaDB established successfully', {
      database: env.db.maria.database,
      host: env.db.maria.host,
    });
  } catch (error) {
    const err = error as Error;
    logger.error('Unable to connect to database', {
      error: err.message,
      database: env.db.maria.database,
      host: env.db.maria.host,
    });
    throw boom.internal('Database connection failed');
  }
}

export { sequelize, testConnection };
