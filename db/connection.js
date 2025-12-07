import { Sequelize } from 'sequelize';
import env from '../environments/index.js';
import boom from '@hapi/boom';
import logger from '../utils/logger.js';

/**
 * Default pool configuration for MariaDB connection.
 * Based on Sequelize best practices and production requirements.
 */
const DEFAULT_POOL_CONFIG = {
  max: 10,
  min: 2,
  acquire: 30000,
  idle: 10000,
  evict: 1000,
  maxUses: 10000,
};

/**
 * Validates and builds pool configuration with security checks.
 * @returns {Object} Validated pool configuration
 */
function buildPoolConfig() {
  const poolConfig = {
    max: env.db.maria.pool?.max ?? DEFAULT_POOL_CONFIG.max,
    min: env.db.maria.pool?.min ?? DEFAULT_POOL_CONFIG.min,
    acquire: env.db.maria.pool?.acquire ?? DEFAULT_POOL_CONFIG.acquire,
    idle: env.db.maria.pool?.idle ?? DEFAULT_POOL_CONFIG.idle,
    evict: env.db.maria.pool?.evict ?? DEFAULT_POOL_CONFIG.evict,
    maxUses: env.db.maria.pool?.maxUses ?? DEFAULT_POOL_CONFIG.maxUses,
  };

  // Security validations
  if (poolConfig.max > 100) {
    logger.warn('Pool max exceeds recommended limit', { max: poolConfig.max, limit: 100 });
    poolConfig.max = 100;
  }
  if (poolConfig.min > poolConfig.max) {
    throw new Error('Pool min cannot exceed max');
  }

  return poolConfig;
}

/**
 * Sequelize instance configured for MariaDB connection.
 * @type {Sequelize}
 */
const sequelize = new Sequelize(
  env.db.maria.database,
  env.db.maria.user,
  env.db.maria.password,
  {
    host: env.db.maria.host,
    port: env.db.maria.port,
    dialect: env.db.maria.dialect,
    logging: env.execution === 'development' ? console.log : false,
    pool: buildPoolConfig(),
  }
);

/**
 * Tests the database connection.
 * Should be called explicitly during application startup.
 * @async
 * @throws {Boom.Error} If connection fails
 * @returns {Promise<void>}
 */
async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.db('Connection to MariaDB established successfully');
  } catch (error) {
    if (env.execution === 'development') {
      console.error('Unable to connect to the database:', error);
    } else {
      console.error('Unable to connect to the database:', error.message);
    }
    throw boom.internal('Database connection failed');
  }
}

export { sequelize, testConnection };
