const dot = require(
  /* webpackInclude: ['./environments.development.js', './environments.production.js'] */
  `./environments.${process.env.NODE_ENV}`
);

const env = dot;

module.exports = env;
