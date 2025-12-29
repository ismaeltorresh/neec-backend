/**
 * Configuración de entorno para tests
 * 
 * @module environments/environments.test
 */

import type { Environment } from '../types/index.js';

const env: Environment = {
  execution: 'test',
  service: 'neec',
  server: 'http://localhost',
  port: Number(process.env.PORT) || 8009,
  bodyLimit: process.env.BODY_LIMIT || '100kb',
  requestTimeout: process.env.REQUEST_TIMEOUT ? Number(process.env.REQUEST_TIMEOUT) : 5000,
  whiteList: ['http://localhost:8009', undefined],
  audience: process.env.AUDIENCE,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  issuer: process.env.ISSUER,
  jwksUri: process.env.JWKS_URI,
  oauth: false,
  sentry: false,
  algorithms: ['RS256'],
  docsToken: process.env.DOCS_TOKEN || 'test-token',
  skipDatabase: process.env.SKIP_DATABASE === 'true',
  db: {
    maria: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '3306',
      user: process.env.DB_USER || 'test',
      password: process.env.DB_PASSWORD || 'test',
      database: process.env.DB_NAME || 'neec_test',
      logging: false,
    },
  }
};

export default env;
