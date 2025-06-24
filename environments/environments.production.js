const env = {
  execution: 'production',
  service: 'neec',
  server: 'https://neec-backend.loha.mx',
  port: 8008,
  whiteList: ['http://localhost'],
  audience: process.env.AUDIENCE,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  issuer: process.env.ISSUER,
  jwksUri: process.env.JWKS_URI,
  algorithms: ['RS256'],
  db: {
    maria: {
      host: 'localhost',
      port: '3006',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      dialect: 'mariadb',
      logging: false,
    },
  }
}

module.exports = env;
