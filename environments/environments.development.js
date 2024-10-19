const env = {
  execution: 'development',
  service: 'neec',
  server: 'http://localhost',
  port:3006,
  whiteList: ['http://localhost:3006', undefined],
  audience: process.env.AUDIENCE,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  issuer: process.env.ISSUER,
  jwksUri: process.env.JWKS_URI,
  algorithms: ['RS256'],
}

module.exports = env;
