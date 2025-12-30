#!/usr/bin/env node

/**
 * Script para generar un nuevo endpoint con su estructura completa
 * Uso: npm run generate <nombre> [y]
 * Ejemplo: npm run generate product y
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Utilidades
const toPascalCase = (str) => str.split(/[-_\s]/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
const toCamelCase = (str) => { const p = toPascalCase(str); return p.charAt(0).toLowerCase() + p.slice(1); };
const toPlural = (str) => {
  if (str.endsWith('y')) return str.slice(0, -1) + 'ies';
  if (str.endsWith('s') || str.endsWith('x') || str.endsWith('z')) return str + 'es';
  return str + 's';
};

// Templates
const templates = {
  route: (c) => `/**
 * Controlador de ${c.name}
 * @module routes/${c.name}.routes
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import validatorHandler from '../middlewares/validator.handler.js';
import { asyncHandler } from '../middlewares/async.handler.js';
import {
  create${c.namePascalCase}Schema,
  update${c.namePascalCase}Schema,
  ${c.nameCamelCase}QuerySchema,
  type Create${c.namePascalCase}Input,
  type Update${c.namePascalCase}Input,
  type ${c.namePascalCase}QueryParams,
} from '../schemas/${c.name}.schema.js';
import { ${c.namePascalCase}Repository } from '../repositories/${c.name}.repository.js';
import boom from '@hapi/boom';
import logger from '../utils/logger.js';

const router = Router();
const ${c.nameCamelCase}Repo = new ${c.namePascalCase}Repository();

router.get(
  '/',
  validatorHandler(${c.nameCamelCase}QuerySchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ${c.namePascalCase}QueryParams;
    logger.info('Fetching ${c.namePlural}', { query });
    const ${c.namePlural} = await ${c.nameCamelCase}Repo.findAll();
    return res.json({ data: ${c.namePlural}, meta: { total: ${c.namePlural}.length } });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    logger.info(\`Fetching ${c.name} by ID\`, { id });
    const ${c.nameCamelCase} = await ${c.nameCamelCase}Repo.findById(Number(id));
    if (!${c.nameCamelCase}) {
      throw boom.notFound('${c.namePascalCase} no encontrado');
    }
    return res.json({ data: ${c.nameCamelCase} });
  })
);

router.post(
  '/',
  validatorHandler(create${c.namePascalCase}Schema, 'body'),
  asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as Create${c.namePascalCase}Input;
    logger.info('Creating ${c.name}', { body });
    const ${c.nameCamelCase} = await ${c.nameCamelCase}Repo.create(body);
    return res.status(201).json({
      message: '${c.namePascalCase} creado exitosamente',
      data: ${c.nameCamelCase},
    });
  })
);

router.patch(
  '/:id',
  validatorHandler(update${c.namePascalCase}Schema, 'body'),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as Update${c.namePascalCase}Input;
    logger.info(\`Updating ${c.name}\`, { id, body });
    const ${c.nameCamelCase} = await ${c.nameCamelCase}Repo.update(Number(id), body);
    return res.json({
      message: '${c.namePascalCase} actualizado exitosamente',
      data: ${c.nameCamelCase},
    });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    logger.info(\`Deleting ${c.name}\`, { id });
    await ${c.nameCamelCase}Repo.delete(Number(id));
    return res.json({ message: '${c.namePascalCase} eliminado exitosamente' });
  })
);

export default router;
`,

  schema: (c) => `/**
 * Schemas de validación Zod para la entidad ${c.namePascalCase}
 * @module schemas/${c.name}.schema
 */

import { z } from 'zod';

export const create${c.namePascalCase}Schema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres')
    .trim(),
  description: z.string()
    .max(5000, 'La descripción no puede exceder 5000 caracteres')
    .trim()
    .optional()
    .nullable(),
  isActive: z.boolean().default(true),
});

export const update${c.namePascalCase}Schema = create${c.namePascalCase}Schema.partial();

export const ${c.nameCamelCase}QuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

export type Create${c.namePascalCase}Input = z.infer<typeof create${c.namePascalCase}Schema>;
export type Update${c.namePascalCase}Input = z.infer<typeof update${c.namePascalCase}Schema>;
export type ${c.namePascalCase}QueryParams = z.infer<typeof ${c.nameCamelCase}QuerySchema>;
`,

  interface: (c) => `/**
 * Interfaces TypeScript generadas desde schemas Zod
 * @module interfaces/${c.name}.interface
 */

export interface IBaseEntity {
  id: number;
  recordStatus: boolean;
  dataSource: 'sql' | 'nosql' | 'both' | 'fake';
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreate${c.namePascalCase} {
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface IUpdate${c.namePascalCase} {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface I${c.namePascalCase} extends IBaseEntity {
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface I${c.namePascalCase}QueryParams {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  sortBy: 'name' | 'createdAt' | 'updatedAt';
  sortOrder: 'ASC' | 'DESC';
}
`,

  entity: (c) => `/**
 * Entidad ${c.namePascalCase}
 * @module entities/${c.name}.entity
 */

import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity.js';

@Entity('${c.tableName}')
export class ${c.namePascalCase} extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;
}
`,

  repository: (c) => `/**
 * Repositorio para la entidad ${c.namePascalCase}
 * @module repositories/${c.name}.repository
 */

import { BaseRepository } from './base.repository.js';
import { ${c.namePascalCase} } from '../entities/${c.name}.entity.js';
import { AppDataSource } from '../db/connection.js';
import boom from '@hapi/boom';
import logger from '../utils/logger.js';

export class ${c.namePascalCase}Repository extends BaseRepository<${c.namePascalCase}> {
  constructor() {
    super(AppDataSource.getRepository(${c.namePascalCase}));
  }

  async findActive(): Promise<${c.namePascalCase}[]> {
    try {
      return await this.repository.find({
        where: { isActive: true, recordStatus: true },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      const err = error as Error;
      logger.error('Error finding active ${c.namePlural}', { error: err.message });
      throw boom.internal('Database query failed');
    }
  }

  async searchByName(name: string): Promise<${c.namePascalCase}[]> {
    try {
      return await this.repository
        .createQueryBuilder('${c.nameCamelCase}')
        .where('${c.nameCamelCase}.name LIKE :name', { name: \`%\${name}%\` })
        .andWhere('${c.nameCamelCase}.recordStatus = :recordStatus', { recordStatus: true })
        .orderBy('${c.nameCamelCase}.createdAt', 'DESC')
        .getMany();
    } catch (error) {
      const err = error as Error;
      logger.error('Error searching ${c.namePlural} by name', { name, error: err.message });
      throw boom.internal('Database query failed');
    }
  }
}
`,

  sql: (c) => `-- ============================================
-- Tabla: ${c.tableName}
-- Descripción: Almacena información de ${c.namePlural}
-- Generado: ${new Date().toISOString()}
-- ============================================

CREATE TABLE IF NOT EXISTS \`${c.tableName}\` (
  -- Identificador único
  \`id\` INT NOT NULL AUTO_INCREMENT,
  
  -- Campos de negocio
  \`name\` VARCHAR(255) NOT NULL COMMENT 'Nombre del ${c.name}',
  \`description\` TEXT NULL COMMENT 'Descripción detallada',
  \`isActive\` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado activo/inactivo',
  
  -- Campos de auditoría (BaseEntity)
  \`recordStatus\` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado del registro (1=activo, 0=eliminado)',
  \`dataSource\` ENUM('sql', 'nosql', 'both', 'fake') NOT NULL DEFAULT 'sql' COMMENT 'Origen de los datos',
  \`createdAt\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Fecha de creación',
  \`updatedAt\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Fecha de última actualización',
  
  -- Restricciones
  PRIMARY KEY (\`id\`),
  INDEX \`idx_${c.tableName}_name\` (\`name\`),
  INDEX \`idx_${c.tableName}_isActive\` (\`isActive\`),
  INDEX \`idx_${c.tableName}_recordStatus\` (\`recordStatus\`),
  INDEX \`idx_${c.tableName}_createdAt\` (\`createdAt\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla de ${c.namePlural}';

-- ============================================
-- Datos de ejemplo (OPCIONAL - comentar si no se necesita)
-- ============================================

-- INSERT INTO \`${c.tableName}\` (\`name\`, \`description\`, \`isActive\`) VALUES
-- ('Ejemplo 1', 'Descripción del ejemplo 1', 1),
-- ('Ejemplo 2', 'Descripción del ejemplo 2', 1),
-- ('Ejemplo 3', 'Descripción del ejemplo 3', 0);

-- ============================================
-- Consultas útiles
-- ============================================

-- Ver todos los registros activos
-- SELECT * FROM \`${c.tableName}\` WHERE \`recordStatus\` = 1 AND \`isActive\` = 1;

-- Contar registros por estado
-- SELECT \`isActive\`, COUNT(*) as total FROM \`${c.tableName}\` WHERE \`recordStatus\` = 1 GROUP BY \`isActive\`;

-- Buscar por nombre (búsqueda parcial)
-- SELECT * FROM \`${c.tableName}\` WHERE \`name\` LIKE '%búsqueda%' AND \`recordStatus\` = 1;
`,
};

// Función para actualizar routes/index.ts
function updateRoutesIndex(config) {
  const routesIndexPath = join(rootDir, 'routes', 'index.ts');
  let content = readFileSync(routesIndexPath, 'utf-8');

  const newImport = `import ${config.nameCamelCase}Routes from './${config.name}.routes.js';`;
  const newRouterUse = `  router.use('/${config.namePlural}', ${config.nameCamelCase}Routes);`;

  if (content.includes(newImport)) {
    console.log(`⚠️  El import para ${config.name} ya existe`);
    return;
  }

  // Agregar import
  const importRegex = /import .* from '\.\/.*\.routes\.js';/g;
  const imports = content.match(importRegex);
  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    content = content.replace(lastImport, `${lastImport}\n${newImport}`);
  }

  // Agregar router.use
  const routerUseRegex = /router\.use\('\/[^']+',\s+\w+Routes\);/g;
  const routerUses = content.match(routerUseRegex);
  if (routerUses && routerUses.length > 0) {
    const lastRouterUse = routerUses[routerUses.length - 1];
    content = content.replace(lastRouterUse, `${lastRouterUse}\n${newRouterUse}`);
  }

  writeFileSync(routesIndexPath, content, 'utf-8');
  console.log(`✅ Actualizado: routes/index.ts`);
}

// Main
function main() {
  console.log('\n🎯 Generador de Endpoints NEEC Backend\n');

  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('❌ Error: Debes proporcionar un nombre');
    console.log('Uso: npm run generate <nombre> [y]');
    console.log('Ejemplo: npm run generate product y\n');
    process.exit(1);
  }

  const name = args[0].trim().toLowerCase();
  const confirm = args[1] || 'y';

  const config = {
    name,
    nameCamelCase: toCamelCase(name),
    namePascalCase: toPascalCase(name),
    namePlural: toPlural(name),
    tableName: toPlural(name),
  };

  console.log('📋 Configuración:');
  console.log(`   Nombre: ${config.name}`);
  console.log(`   PascalCase: ${config.namePascalCase}`);
  console.log(`   camelCase: ${config.nameCamelCase}`);
  console.log(`   Plural: ${config.namePlural}\n`);

  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ Operación cancelada\n');
    process.exit(0);
  }

  console.log('🚀 Generando archivos...\n');

  const files = [
    { path: join(rootDir, 'routes', `${config.name}.routes.ts`), content: templates.route(config), name: 'Route' },
    { path: join(rootDir, 'schemas', `${config.name}.schema.ts`), content: templates.schema(config), name: 'Schema' },
    { path: join(rootDir, 'interfaces', `${config.name}.interface.ts`), content: templates.interface(config), name: 'Interface' },
    { path: join(rootDir, 'entities', `${config.name}.entity.ts`), content: templates.entity(config), name: 'Entity' },
    { path: join(rootDir, 'repositories', `${config.name}.repository.ts`), content: templates.repository(config), name: 'Repository' },
    { path: join(rootDir, 'db', 'sql', `create-${config.tableName}-table.sql`), content: templates.sql(config), name: 'SQL Script' },
  ];

  for (const file of files) {
    if (existsSync(file.path)) {
      console.log(`⚠️  Ya existe: ${file.name} (${basename(file.path)})`);
    } else {
      writeFileSync(file.path, file.content, 'utf-8');
      console.log(`✅ Creado: ${file.name} (${basename(file.path)})`);
    }
  }

  updateRoutesIndex(config);

  console.log('\n✨ Endpoint generado exitosamente!\n');
  console.log('📝 Pasos siguientes:');
  console.log(`   1. Revisa y ajusta los archivos generados`);
  console.log(`   2. (Opción A) Ejecuta el SQL: mysql -u user -p database < db/sql/create-${config.tableName}-table.sql`);
  console.log(`   2. (Opción B) Crea una migración: npm run migration:generate -- migrations/${config.namePascalCase}`);
  console.log(`   3. Prueba el endpoint: GET /api/v1/${config.namePlural}\n`);
}

main();
