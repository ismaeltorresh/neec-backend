const envName = process.env.NODE_ENV || 'development';
const env = require(`./environments.${envName}`);

module.exports = env;
