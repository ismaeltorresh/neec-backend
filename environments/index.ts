/**
 * Loader dinámico de configuración de entorno
 * 
 * @module environments
 */

import type { Environment } from '../types/index.js';

const envName = process.env.NODE_ENV || 'development';
// Map 'test' to 'testing' for the config file name
const configName = envName === 'test' ? 'testing' : envName;
const env = await import(`./environments.${configName}.js`);

export default env.default as Environment;
