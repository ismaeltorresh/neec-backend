const env = require(`./environments.${process.env.NODE_ENV}`)

module.exports = env;
