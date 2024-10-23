let env;

if (process.env.NODE_ENV === 'development') {
  env = require('./environments.development');
} else if (process.env.NODE_ENV === 'production') {
  env = require('./environments.production');
}

module.exports = env;
