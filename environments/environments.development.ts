/**
 * Configuración de entorno para desarrollo
 * 
 * @module environments/environments.development
 */

import type { Environment } from '../types/index.js';

const env: Environment = {
  execution: 'development',
  service: 'neec',
  server: 'http://localhost',
  port: Number(process.env.PORT) || 8008,
  bodyLimit: process.env.BODY_LIMIT || '100kb',
  requestTimeout: process.env.REQUEST_TIMEOUT ? Number(process.env.REQUEST_TIMEOUT) : 20000,
  whiteList: ['http://localhost:8008', undefined],
  audience: process.env.AUDIENCE,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  issuer: process.env.ISSUER,
  jwksUri: process.env.JWKS_URI,
  oauth: false,
  sentry: false,
  algorithms: ['RS256'],
  docsToken: process.env.DOCS_TOKEN,
  db: {
    maria: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '3306',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'neec_dev',
      dialect: 'mariadb',
      logging: false,
    },
  }
};

// Validación obligatoria de credenciales
if (!env.db.maria.password) {
  throw new Error('DB_PASSWORD environment variable is required');
}

export default env;
