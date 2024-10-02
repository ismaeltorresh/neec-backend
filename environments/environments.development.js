const env = {
  execution: 'development',
  service: 'neec',
  server: 'http://localhost',
  port:3006,
  whiteList: ['http://localhost:3006', undefined],
  audience: 'https://api.loha.mx',
  issuerBaseURL: 'https://dev-oww130dxq3575ipw.us.auth0.com/',
}

module.exports = env;
