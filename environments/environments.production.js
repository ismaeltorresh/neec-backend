const env = {
  execution: 'production',
  service: 'neec',
  server: 'https://neec-backend.loha.mx',
  port: process.env.PORT || 8008,
  whiteList: ['http://localhost'],
  audience: process.env.AUDIENCE,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  issuer: process.env.ISSUER,
  jwksUri: process.env.JWKS_URI,
  oauth: process.env.OAUTH === 'true',
  sentry: process.env.SENTRY === 'true',
  algorithms: ['RS256'],
  db: {
    maria: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '3306',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      dialect: 'mariadb',
      logging: false,
    },
  }
};

// Validaciones obligatorias para producción
const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables in production: ${missingVars.join(', ')}`);
}

module.exports = env;
