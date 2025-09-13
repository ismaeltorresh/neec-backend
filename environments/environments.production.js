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
  oauth: process.env.OAUTH,
  algorithms: ['RS256'],
}

module.exports = env;
