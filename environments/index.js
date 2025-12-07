const envName = process.env.NODE_ENV || 'development';
const env = await import(`./environments.${envName}.js`);

export default env.default;
