/**
 * Template routes - CRUD operations
 * 
 * @module routes/template.routes
 */

import type { Request, Response } from 'express';
import boom from '@hapi/boom';
import env from '../environments/index.js';
import express from 'express';
import validatorHandler from '../middlewares/validator.handler.js';
import { asyncHandler, withTimeout } from '../middlewares/async.handler.js';
import { 
  schema, 
  get, 
  del, 
  post, 
  update, 
  paramsSchema,
  type GetInput,
  type PostInput,
  type UpdateInput,
  type DeleteInput,
  type ParamsInput
} from '../schemas/template.schema.js';
import { paginated } from '../utils/response.js';
import { validatePagination } from '../utils/validation.js';
import type { PaginationResult } from '../types/index.js';

const endpoint = 'template';

const router = express.Router();

// Get schema endpoint (development only)
router.get('/schema', asyncHandler(async (_req: Request, res: Response) => {
  if (env.execution === 'development') {
    res.status(200).json(schema);
  } else {
    throw boom.forbidden(`I don't have a correct execution environment, current execution is ${env.execution}`);
  }
}));

// Debug Sentry endpoint
router.get("/debug-sentry", function mainHandler(_req: Request, _res: Response) {
  throw new Error("My intentionally Sentry error! is only test");
});

// List all templates
router.get('/', validatorHandler(get, 'query'), asyncHandler(async (req: Request, res: Response) => {
  const inputData = req.query as unknown as GetInput;
  let result: unknown;

  if (inputData.dataSource === 'sql') {
    result = await withTimeout(sqlList(inputData), 5000);
  } else if (inputData.dataSource === 'nosql') {
    result = await nosqlList(inputData);
  } else if (inputData.dataSource === 'both') {
    result = {
      sql: await withTimeout(sqlList(inputData), 5000),
      nosql: await nosqlList(inputData),
    };
  } else if (inputData.dataSource === 'fake') {
    result = await getFakeList(inputData);
  } else {
    throw boom.badRequest(`${inputData.dataSource} is not a valid data source`);
  }
  
  const hasData = checkHasData(result, inputData.dataSource);
  if (!hasData) {
    return res.status(204).send();
  }
  return res.status(200).json(result);
}));

// Get template by ID
router.get('/:id', 
  validatorHandler(paramsSchema, 'params'),
  validatorHandler(get, 'query'), 
  asyncHandler(async (req: Request, res: Response) => {
  const params = req.params as ParamsInput;
  const inputData = { ...req.query as unknown as GetInput, id: params.id };
  let result: unknown;

  if (inputData.dataSource === 'sql') {
    result = await sqlFindById(inputData);
  } else if (inputData.dataSource === 'nosql') {
    result = nosqlFindById(inputData);
  } else if (inputData.dataSource === 'both') {
    result = {
      sql: await sqlFindById(inputData),
      nosql: nosqlFindById(inputData),
    };
  } else if (inputData.dataSource === 'fake') {
    result = getFakeById(inputData);
  } else {
    throw boom.badRequest(`${inputData.dataSource} is not a valid data source`);
  }

  const hasData = checkHasDataById(result, inputData.dataSource);
  if (!hasData) {
    return res.status(204).send();
  }
  return res.status(200).json(result);
}));

// Create new template
router.post('/', validatorHandler(post, 'body'), asyncHandler(async (req: Request, res: Response) => {
  const inputData = req.body as PostInput;
  let result: unknown;

  if (inputData.dataSource === 'sql') {
    result = await sqlCreate(inputData);
  } else if (inputData.dataSource === 'nosql') {
    result = await nosqlCreate(inputData);
  } else if (inputData.dataSource === 'both') {
    result = {
      sql: await sqlCreate(inputData),
      nosql: await nosqlCreate(inputData),
    };
  } else {
    throw boom.badRequest(`${inputData.dataSource} is not a valid data source`);
  }

  return res.status(201).json(result);
}));

// Update template
router.patch('/:id', 
  validatorHandler(paramsSchema, 'params'),
  validatorHandler(update, 'body'), 
  asyncHandler(async (req: Request, res: Response) => {
  const params = req.params as ParamsInput;
  const inputData = { ...req.body as UpdateInput, id: params.id };
  let result: unknown;

  if (inputData.dataSource === 'sql') {
    result = await sqlUpdate(inputData);
  } else if (inputData.dataSource === 'nosql') {
    result = await nosqlUpdate(inputData);
  } else if (inputData.dataSource === 'both') {
    result = {
      sql: await sqlUpdate(inputData),
      nosql: await nosqlUpdate(inputData),
    };
  } else {
    throw boom.badRequest(`${inputData.dataSource} is not a valid data source`);
  }

  return res.status(200).json(result);
}));

// Delete template
router.delete('/:id', 
  validatorHandler(paramsSchema, 'params'),
  validatorHandler(del, 'body'), 
  asyncHandler(async (req: Request, res: Response) => {
  const params = req.params as ParamsInput;
  const inputData = { ...req.body as DeleteInput, id: params.id };
  let result: unknown;

  if (inputData.dataSource === 'sql') {
    result = await sqlDelete(inputData);
  } else if (inputData.dataSource === 'nosql') {
    result = await nosqlDelete(inputData);
  } else if (inputData.dataSource === 'both') {
    result = {
      sql: await sqlDelete(inputData),
      nosql: await nosqlDelete(inputData),
    };
  } else {
    throw boom.badRequest(`${inputData.dataSource} is not a valid data source`);
  }

  return res.status(200).json(result);
}));

/**
 * Retrieves a paginated list of template from the database
 */
async function sqlList(inputData: GetInput): Promise<PaginationResult<unknown>> {
  const { sqlPaginate } = await import('../utils/pagination.js');
  const { page, pageSize } = validatePagination(inputData);
  const filters: Record<string, unknown> = {
    brand: inputData.brand,
    categoryId: inputData.categoryId,
    sku: inputData.sku,
    code: inputData.code,
  };
  const search = inputData.q ? { q: inputData.q, columns: ['brand', 'code', 'description', 'sumary'] } : undefined;
  const result = await sqlPaginate({
    table: endpoint,
    recordStatus: inputData.recordStatus,
    page,
    pageSize,
    columns: '*',
    orderBy: 'updatedAt DESC',
    filters,
    allowedFilters: ['brand', 'categoryId', 'sku', 'code'],
    search,
    sortColumn: inputData.sortBy,
    sortOrder: inputData.sortDir,
    allowedSortColumns: ['updatedAt','createdAt','price','brand','code'],
  });
  return result;
}

/**
 * Retrieves a paginated subset of template from the NoSQL mock data source
 */
async function nosqlList(inputData: GetInput): Promise<PaginationResult<unknown>> {
  const nosqlMock = await import('../utils/nosqlMock.js');
  const { page, pageSize } = validatePagination(inputData);
  const paged = nosqlMock.paginateList(endpoint, page, pageSize);
  return paged;
}

/**
 * Retrieves a template record from the NoSQL mock datastore by identifier
 */
async function nosqlFindById(inputData: GetInput): Promise<Record<string, unknown>> {
  const nosqlMock = await import('../utils/nosqlMock.js');
  const record = nosqlMock.findById(endpoint, inputData.id!) || {};
  return record;
}

/**
 * Retrieves fake data list with pagination
 */
async function getFakeList(inputData: GetInput): Promise<PaginationResult<unknown>> {
  const fakeData = (await import('../test/fakedata.js')).default;
  const list = fakeData.template || [];
  const { page, pageSize } = validatePagination(inputData);
  return paginated(list, page, pageSize);
}

/**
 * Retrieves a fake record by ID
 */
async function getFakeById(inputData: GetInput): Promise<Record<string, unknown>> {
  const fakeData = (await import('../test/fakedata.js')).default;
  const list = fakeData.template || [];
  return list.find((item: any) => item.id === inputData.id) || {};
}

/**
 * Retrieves a template record from SQL database by identifier
 */
async function sqlFindById(_inputData: GetInput): Promise<Record<string, unknown>> {
  // TODO: Implement SQL findById logic
  return {};
}

/**
 * Creates a new template record in SQL database
 */
async function sqlCreate(inputData: PostInput): Promise<Record<string, unknown>> {
  // TODO: Implement SQL create logic
  return {
    message: 'Created',
    body: inputData,
    id: '123e4567-e89b-12d3-a456-426614174001',
  };
}

/**
 * Creates a new template record in NoSQL database
 */
async function nosqlCreate(inputData: PostInput): Promise<Record<string, unknown>> {
  // TODO: Implement NoSQL create logic
  return {
    message: 'Created',
    body: inputData,
    id: '123e4567-e89b-12d3-a456-426614174001',
  };
}

/**
 * Updates a template record in SQL database
 */
async function sqlUpdate(inputData: UpdateInput): Promise<Record<string, unknown>> {
  // TODO: Implement SQL update logic
  return {
    message: 'Updated',
    data: inputData,
  };
}

/**
 * Updates a template record in NoSQL database
 */
async function nosqlUpdate(inputData: UpdateInput): Promise<Record<string, unknown>> {
  // TODO: Implement NoSQL update logic
  return {
    message: 'Updated',
    data: inputData,
  };
}

/**
 * Deletes a template record from SQL database
 */
async function sqlDelete(inputData: DeleteInput): Promise<Record<string, unknown>> {
  // TODO: Implement SQL delete logic
  return {
    message: 'Deleted',
    data: inputData,
  };
}

/**
 * Deletes a template record from NoSQL database
 */
async function nosqlDelete(inputData: DeleteInput): Promise<Record<string, unknown>> {
  // TODO: Implement NoSQL delete logic
  return {
    message: 'Deleted',
    data: inputData,
  };
}

/**
 * Checks if result has data based on data source type
 */
function checkHasData(result: unknown, dataSource: string): boolean {
  if (dataSource === 'both') {
    const r = result as { sql?: { meta?: { total: number } }; nosql?: { meta?: { total: number } } };
    return (r.sql?.meta?.total ?? 0) > 0 || (r.nosql?.meta?.total ?? 0) > 0;
  }
  const r = result as { meta?: { total: number } };
  return (r.meta?.total ?? 0) > 0;
}

/**
 * Checks if a single record result has data
 */
function checkHasDataById(result: unknown, dataSource: string): boolean {
  if (dataSource === 'both') {
    const r = result as { sql?: { id?: string }; nosql?: { id?: string } };
    return r.sql?.id !== undefined || r.nosql?.id !== undefined;
  }
  const r = result as { id?: string };
  return r.id !== undefined;
}

export default router;
