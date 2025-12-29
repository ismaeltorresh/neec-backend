/**
 * Configuración de entorno para producción
 * 
 * @module environments/environments.production
 */

import type { Environment } from '../types/index.js';

const env: Environment = {
  execution: 'production',
  service: 'neec',
  server: 'https://neec-backend.loha.mx',
  port: Number(process.env.PORT) || 8008,
  bodyLimit: process.env.BODY_LIMIT || '100kb',
  requestTimeout: process.env.REQUEST_TIMEOUT ? Number(process.env.REQUEST_TIMEOUT) : 20000,
  whiteList: ['http://localhost'],
  audience: process.env.AUDIENCE,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  issuer: process.env.ISSUER,
  jwksUri: process.env.JWKS_URI,
  oauth: process.env.OAUTH === 'true',
  sentry: process.env.SENTRY === 'true',
  algorithms: ['RS256'],
  docsToken: process.env.DOCS_TOKEN,
  skipDatabase: process.env.SKIP_DATABASE === 'true',
  db: {
    maria: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '3306',
      user: process.env.DB_USER || '',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || '',
      logging: false,
    },
  }
};

// Validaciones obligatorias para producción (solo si no se omite la base de datos)
if (!env.skipDatabase) {
  const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables in production: ${missingVars.join(', ')}`);
  }
}

export default env;
