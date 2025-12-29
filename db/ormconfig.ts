/**
 * Configuración TypeORM CLI
 * Utilizado para migraciones y CLI de TypeORM
 * 
 * @module db/ormconfig
 */

import { DataSource } from 'typeorm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * DataSource para TypeORM CLI (migraciones, schema sync, etc.)
 * Usa variables de entorno directamente sin pasar por la capa de configuración
 */
export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'neec_dev',
  synchronize: false,
  logging: true,
  entities: [join(__dirname, '../entities/**/*.entity.{ts,js}')],
  migrations: [join(__dirname, '../migrations/**/*.{ts,js}')],
  subscribers: [join(__dirname, '../subscribers/**/*.{ts,js}')],
});
