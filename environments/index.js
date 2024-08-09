const dot = require(`./environments.${process.env.NODE_ENV}`);

const env = dot;

module.exports = env;
