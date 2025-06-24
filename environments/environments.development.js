const env = {
  execution: 'development',
  service: 'neec',
  server: 'http://localhost',
  port:8008,
  whiteList: ['http://localhost:8008', undefined],
  audience: process.env.AUDIENCE,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  issuer: process.env.ISSUER,
  jwksUri: process.env.JWKS_URI,
  algorithms: ['RS256'],
  db: {
    maria: {
      host: 'localhost',
      port: '3306',
      user: 'root',
      password: 'D1lb3rt$10',
      database: 'neec_dev',
      dialect: 'mariadb',
      logging: false,
    },
  }
}

module.exports = env;
