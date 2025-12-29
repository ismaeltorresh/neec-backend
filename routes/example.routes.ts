/**
 * Controlador de ejemplo que demuestra la integración Zod + TypeORM
 * 
 * @module routes/example.routes
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import validatorHandler from '../middlewares/validator.handler.js';
import { asyncHandler } from '../middlewares/async.handler.js';
import {
  createExampleSchema,
  updateExampleSchema,
  exampleQuerySchema,
  findByEmailSchema,
  type CreateExampleInput,
  type UpdateExampleInput,
  type ExampleQueryParams,
} from '../schemas/example.schema.js';
import { ExampleRepository } from '../repositories/example.repository.js';
import boom from '@hapi/boom';
import logger from '../utils/logger.js';

const router = Router();
const exampleRepo = new ExampleRepository();

/**
 * @api {get} /api/v1/examples Listar ejemplos con filtros
 * @apiName GetExamples
 * @apiGroup Example
 * 
 * @apiQuery {Number} [page=1] Número de página
 * @apiQuery {Number} [pageSize=10] Tamaño de página (máx 100)
 * @apiQuery {String} [search] Búsqueda por nombre
 * @apiQuery {Boolean} [isActive] Filtrar por estado activo
 * @apiQuery {String="name","email","createdAt","updatedAt"} [sortBy=createdAt] Campo de ordenamiento
 * @apiQuery {String="ASC","DESC"} [sortOrder=DESC] Dirección de ordenamiento
 * 
 * @apiSuccess {Object[]} data Array de ejemplos
 * @apiSuccess {Object} meta Metadata de paginación
 * @apiSuccess {Number} meta.total Total de registros
 * @apiSuccess {Number} meta.page Página actual
 * @apiSuccess {Number} meta.pageSize Tamaño de página
 * @apiSuccess {Number} meta.totalPages Total de páginas
 */
router.get(
  '/',
  validatorHandler(exampleQuerySchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ExampleQueryParams;

    logger.info('Fetching examples with filters', { query });

    let examples;

    // Si hay búsqueda, usar método específico
    if (query.search) {
      examples = await exampleRepo.searchByName(query.search);
      return res.json({
        data: examples,
        meta: {
          total: examples.length,
          page: 1,
          pageSize: examples.length,
          totalPages: 1,
        },
      });
    }

    // Si solo quiere activos
    if (query.isActive !== undefined) {
      examples = query.isActive
        ? await exampleRepo.findActive()
        : await exampleRepo.findAll({ where: { isActive: false } });
    } else {
      examples = await exampleRepo.findAll();
    }

    // Paginación manual (idealmente usar TypeORM skip/take)
    const start = (query.page - 1) * query.pageSize;
    const end = start + query.pageSize;
    const paginatedData = examples.slice(start, end);

    return res.json({
      data: paginatedData,
      meta: {
        total: examples.length,
        page: query.page,
        pageSize: query.pageSize,
        totalPages: Math.ceil(examples.length / query.pageSize),
      },
    });
  })
);

/**
 * @api {get} /api/v1/examples/:id Obtener ejemplo por ID
 * @apiName GetExampleById
 * @apiGroup Example
 * 
 * @apiParam {Number} id ID del ejemplo
 * 
 * @apiSuccess {Object} data Ejemplo encontrado
 * @apiError (404) NotFound Ejemplo no encontrado
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      throw boom.badRequest('ID debe ser un número válido');
    }

    const example = await exampleRepo.findById(id);

    if (!example) {
      throw boom.notFound(`Ejemplo con ID ${id} no encontrado`);
    }

    logger.info('Example retrieved', { id });
    res.json(example);
  })
);

/**
 * @api {get} /api/v1/examples/email/:email Buscar por email
 * @apiName GetExampleByEmail
 * @apiGroup Example
 * 
 * @apiParam {String} email Email del ejemplo
 * 
 * @apiSuccess {Object} data Ejemplo encontrado
 * @apiError (404) NotFound Ejemplo no encontrado
 */
router.get(
  '/email/:email',
  validatorHandler(findByEmailSchema, 'params'),
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.params;

    const example = await exampleRepo.findByEmail(email);

    if (!example) {
      throw boom.notFound(`Ejemplo con email ${email} no encontrado`);
    }

    logger.info('Example retrieved by email', { email });
    res.json(example);
  })
);

/**
 * @api {post} /api/v1/examples Crear ejemplo
 * @apiName CreateExample
 * @apiGroup Example
 * 
 * @apiBody {String{3..255}} name Nombre del ejemplo
 * @apiBody {String} email Email único del ejemplo
 * @apiBody {String} [description] Descripción opcional
 * @apiBody {Boolean} [isActive=true] Estado activo
 * 
 * @apiSuccess (201) {Object} data Ejemplo creado
 * @apiError (400) BadRequest Datos de entrada inválidos
 * @apiError (409) Conflict Email ya existe
 */
router.post(
  '/',
  validatorHandler(createExampleSchema, 'body'),
  asyncHandler(async (req: Request, res: Response) => {
    // req.body ya está validado por Zod y tiene el tipo correcto
    const data = req.body as CreateExampleInput;

    logger.info('Creating new example', { email: data.email });

    // Verificar que el email no exista (regla de negocio)
    const existingExample = await exampleRepo.findByEmail(data.email);
    if (existingExample) {
      throw boom.conflict(`Ya existe un ejemplo con el email ${data.email}`);
    }

    // Crear en BD (TypeORM usa los datos validados por Zod)
    const example = await exampleRepo.create(data);

    logger.info('Example created successfully', { id: example.id });
    res.status(201).json(example);
  })
);

/**
 * @api {patch} /api/v1/examples/:id Actualizar ejemplo
 * @apiName UpdateExample
 * @apiGroup Example
 * 
 * @apiParam {Number} id ID del ejemplo
 * @apiBody {String{3..255}} [name] Nombre del ejemplo
 * @apiBody {String} [email] Email único del ejemplo
 * @apiBody {String} [description] Descripción opcional
 * @apiBody {Boolean} [isActive] Estado activo
 * 
 * @apiSuccess {Object} data Ejemplo actualizado
 * @apiError (400) BadRequest Datos de entrada inválidos
 * @apiError (404) NotFound Ejemplo no encontrado
 * @apiError (409) Conflict Email ya existe (si se intenta cambiar)
 */
router.patch(
  '/:id',
  validatorHandler(updateExampleSchema, 'body'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const data = req.body as UpdateExampleInput;

    if (isNaN(id)) {
      throw boom.badRequest('ID debe ser un número válido');
    }

    logger.info('Updating example', { id, fields: Object.keys(data) });

    // Si se intenta cambiar email, verificar que no exista
    if (data.email) {
      const existingExample = await exampleRepo.findByEmail(data.email);
      if (existingExample && existingExample.id !== id) {
        throw boom.conflict(`Ya existe un ejemplo con el email ${data.email}`);
      }
    }

    // Actualizar (lanza 404 si no existe)
    const example = await exampleRepo.update(id, data);

    logger.info('Example updated successfully', { id });
    res.json(example);
  })
);

/**
 * @api {delete} /api/v1/examples/:id Eliminar ejemplo (soft delete)
 * @apiName DeleteExample
 * @apiGroup Example
 * 
 * @apiParam {Number} id ID del ejemplo
 * 
 * @apiSuccess (204) NoContent Ejemplo eliminado
 * @apiError (404) NotFound Ejemplo no encontrado
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      throw boom.badRequest('ID debe ser un número válido');
    }

    logger.info('Deleting example (soft)', { id });

    // Soft delete (cambia recordStatus a false)
    await exampleRepo.delete(id);

    logger.info('Example deleted successfully', { id });
    res.status(204).send();
  })
);

/**
 * @api {delete} /api/v1/examples/:id/hard Eliminar ejemplo permanentemente
 * @apiName HardDeleteExample
 * @apiGroup Example
 * @apiPermission admin
 * 
 * @apiParam {Number} id ID del ejemplo
 * 
 * @apiSuccess (204) NoContent Ejemplo eliminado permanentemente
 * @apiError (404) NotFound Ejemplo no encontrado
 * @apiWarning ⚠️ PELIGROSO: Esta acción no se puede deshacer
 */
router.delete(
  '/:id/hard',
  // TODO: Agregar middleware de autorización (solo admin)
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      throw boom.badRequest('ID debe ser un número válido');
    }

    logger.warn('Hard deleting example - PERMANENT', { id });

    // Hard delete (elimina físicamente de la BD)
    await exampleRepo.hardDelete(id);

    logger.info('Example permanently deleted', { id });
    res.status(204).send();
  })
);

export default router;
