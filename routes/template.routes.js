const boom = require('@hapi/boom');
const env = require('../environments');
const express = require('express');
const validatorHandler = require('../middlewares/validator.handler');
const { schema, get, del, post, update } = require('../schemas/template.schema');
const service = 'template';
const { paginated } = require('../utils/response');

const router = express.Router();

router.get('/schema', (req, res, next) => {
  try {
    if (env.execution === 'development') {
      res.status(200).json(schema);
    } else {
      next(
        boom.forbidden(`I don’t have a correct execution environment, current execution is ${env.execution}`)
      );
    }
  } catch (error) {
    if (error && error.isBoom) return next(error);
    next(
      boom.internal(`Unknown error while retrieving schema for the ${service} service`)
    );
  }
  
});

router.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My intentionally Sentry error! is only test");
});

router.get('/', validatorHandler(get, 'query'), async (req, res, next) => {
  const inputData = req.query;
  try {
    let result;

    if (inputData.dataSource === 'sql') {
      result = await sqlList(inputData);
    } else if (inputData.dataSource === 'nosql') {
      result = await nosqlList(inputData);
    } else if (inputData.dataSource === 'both') {
      result = {
        sql: await sqlList(inputData),
        nosql: await nosqlList(inputData),
      };
    } else if (inputData.dataSource === 'fake') {
      result = await getFakeList(inputData);
    } else {
      return next(
        boom.badRequest(`${inputData.dataSource} is not a valid data source`)
      );
    }
    const hasData = checkHasData(result, inputData.dataSource);
    return res.status(hasData ? 200 : 204).json(result);
  } catch (error) {
    if (error && error.isBoom) return next(error);
    return next(
      boom.internal(`An error occurred while retrieving the list from ${service} service`)
    );
  }
});

router.get('/:id', validatorHandler(get, 'query'), async (req, res, next) => {
  const inputData = req.query;
  inputData.id = req.params.id;
  try {
    let result;

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
      return next(
        boom.badRequest(`${inputData.dataSource} is not a valid data source`)
      );
    }

    const hasData = checkHasDataById(result, inputData.dataSource);
    return res.status(hasData ? 200 : 204).json(result);
  } catch (error) {
    if (error && error.isBoom) return next(error);
    return next(
      boom.internal(`An error occurred while retrieving the record from ${service} service`)
    );
  }
});

router.post('/', validatorHandler(post, 'body'), async (req, res, next) => {
  const inputData = req.body;
  try {
    let result;

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
      return next(
        boom.badRequest(`${inputData.dataSource} is not a valid data source`)
      );
    }

    return res.status(201).json(result);
  } catch (error) {
    if (error && error.isBoom) return next(error);
    return next(
      boom.internal(`An error occurred while creating the record from ${service} service`)
    );
  }
});

router.patch('/:id', validatorHandler(update, 'body'), async (req, res, next) => {
  const inputData = req.body;
  inputData.id = req.params.id;
  try {
    let result;

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
      return next(
        boom.badRequest(`${inputData.dataSource} is not a valid data source`)
      );
    }

    return res.status(200).json(result);
  } catch (error) {
    if (error && error.isBoom) return next(error);
    return next(
      boom.internal(`An error occurred while updating the record from ${service} service`)
    );
  }
});

router.delete('/:id', validatorHandler(del, 'body'), async (req, res, next) => {
  const inputData = req.body;
  inputData.id = req.params.id;
  try {
    let result;

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
      return next(
        boom.badRequest(`${inputData.dataSource} is not a valid data source`)
      );
    }

    return res.status(200).json(result);
  } catch (error) {
    if (error && error.isBoom) return next(error);
    return next(
      boom.internal(`An error occurred while deleting the record from ${service} service`)
    );
  }
});

/**
 * Retrieves a paginated list of template from the database using the provided filters, search criteria, and sorting options.
 *
 * @param {Object} inputData - The request parameters for pagination and filtering.
 * @param {string} [inputData.brand] - Brand name filter.
 * @param {number|string} [inputData.categoryId] - Category identifier filter.
 * @param {string} [inputData.sku] - SKU filter.
 * @param {string} [inputData.code] - Product code filter.
 * @param {string} [inputData.q] - Search query applied across multiple product columns.
 * @param {string} [inputData.recordStatus] - Record status filter for active, inactive, etc.
 * @param {number|string} [inputData.page] - Page number for pagination.
 * @param {number|string} [inputData.pageSize] - Number of records per page.
 * @param {string} [inputData.sortBy] - Field by which to sort the results.
 * @param {('ASC'|'DESC')} [inputData.sortDir] - Sort direction.
 * @returns {Promise<Object>} Resolves to the paginated result set containing product data.
 */
async function sqlList(inputData) {
  const { sqlPaginate } = require('../utils/pagination');
  const page = parseInt(inputData.page, 10) || 1;
  const pageSize = parseInt(inputData.pageSize, 10) || 10;
  const filters = {
    brand: inputData.brand,
    categoryId: inputData.categoryId,
    sku: inputData.sku,
    code: inputData.code,
  };
  const search = inputData.q ? { q: inputData.q, columns: ['brand', 'code', 'description', 'sumary'] } : undefined;
  const result = await sqlPaginate({
    table: service,
    recordStatus: inputData.recordStatus,
    page,
    pageSize,
    columns: '*',
    orderBy: 'updatedAt DESC',
    filters,
    allowedFilters: ['brand', 'categoryId', 'sku', 'code'],
    search,
    sortBy: inputData.sortBy,
    sortDir: inputData.sortDir,
    allowedSorts: ['updatedAt','createdAt','price','brand','code'],
  });
  return result;
}

/**
 * Retrieves a paginated subset of template from the NoSQL mock data source.
 *
 * @param {{ page?: number|string, pageSize?: number|string }} inputData - Pagination parameters provided by the caller.
 * @returns {Promise<Object>} Paginated result containing the requested page of template.
 */
async function nosqlList(inputData) {
  const nosqlMock = require('../utils/nosqlMock');
  const page = parseInt(inputData.page, 10) || 1;
  const pageSize = parseInt(inputData.pageSize, 10) || 10;
  const paged = nosqlMock.paginateList(service, page, pageSize);
  return paged;
}

/**
 * Retrieves a template record from the NoSQL mock datastore by identifier.
 *
 * @param {{ id: string }} inputData - The lookup payload containing the template identifier.
 * @returns {Object} The matching template record if found, otherwise an empty object.
 */
function nosqlFindById(inputData) {
  const nosqlMock = require('../utils/nosqlMock');
  const record = nosqlMock.findById(service, inputData.id) || {};
  return record;
}

/**
 * Retrieves fake data list with pagination.
 *
 * @param {Object} inputData - Pagination parameters.
 * @returns {Promise<Object>} Paginated fake data.
 */
async function getFakeList(inputData) {
  const fake = require('../test/fakedata.json');
  const list = fake.template || [];
  const page = parseInt(inputData.page, 10) || 1;
  const pageSize = parseInt(inputData.pageSize, 10) || 10;
  return paginated(list, page, pageSize);
}

/**
 * Retrieves a fake record by ID.
 *
 * @param {{ id: string }} inputData - The lookup payload.
 * @returns {Object} The matching fake record if found.
 */
function getFakeById(inputData) {
  const fake = require('../test/fakedata.json');
  const list = fake.template || [];
  return list.find(item => item.id === inputData.id) || {};
}

/**
 * Retrieves a template record from SQL database by identifier.
 *
 * @param {{ id: string }} inputData - The lookup payload.
 * @returns {Promise<Object>} The matching template record.
 */
async function sqlFindById(inputData) {
  // TODO: Implement SQL findById logic
  return {};
}

/**
 * Creates a new template record in SQL database.
 *
 * @param {Object} inputData - The template data to create.
 * @returns {Promise<Object>} The created template record.
 */
async function sqlCreate(inputData) {
  // TODO: Implement SQL create logic
  return {
    message: 'Created',
    body: inputData,
    id: '123e4567-e89b-12d3-a456-426614174001',
  };
}

/**
 * Creates a new template record in NoSQL database.
 *
 * @param {Object} inputData - The template data to create.
 * @returns {Promise<Object>} The created template record.
 */
async function nosqlCreate(inputData) {
  // TODO: Implement NoSQL create logic
  return {
    message: 'Created',
    body: inputData,
    id: '123e4567-e89b-12d3-a456-426614174001',
  };
}

/**
 * Updates a template record in SQL database.
 *
 * @param {Object} inputData - The template data to update.
 * @returns {Promise<Object>} The update result.
 */
async function sqlUpdate(inputData) {
  // TODO: Implement SQL update logic
  return {
    message: 'Updated',
    data: inputData,
  };
}

/**
 * Updates a template record in NoSQL database.
 *
 * @param {Object} inputData - The template data to update.
 * @returns {Promise<Object>} The update result.
 */
async function nosqlUpdate(inputData) {
  // TODO: Implement NoSQL update logic
  return {
    message: 'Updated',
    data: inputData,
  };
}

/**
 * Deletes a template record from SQL database.
 *
 * @param {Object} inputData - The template data with ID to delete.
 * @returns {Promise<Object>} The deletion result.
 */
async function sqlDelete(inputData) {
  // TODO: Implement SQL delete logic
  return {
    message: 'Deleted',
    data: inputData,
  };
}

/**
 * Deletes a template record from NoSQL database.
 *
 * @param {Object} inputData - The template data with ID to delete.
 * @returns {Promise<Object>} The deletion result.
 */
async function nosqlDelete(inputData) {
  // TODO: Implement NoSQL delete logic
  return {
    message: 'Deleted',
    data: inputData,
  };
}

/**
 * Checks if result has data based on data source type.
 *
 * @param {Object} result - The result object to check.
 * @param {string} dataSource - The data source type.
 * @returns {boolean} True if has data, false otherwise.
 */
function checkHasData(result, dataSource) {
  if (dataSource === 'both') {
    return (result.sql?.meta?.total > 0) || (result.nosql?.meta?.total > 0);
  }
  return result.meta?.total > 0;
}

/**
 * Checks if a single record result has data.
 *
 * @param {Object} result - The result object to check.
 * @param {string} dataSource - The data source type.
 * @returns {boolean} True if has data, false otherwise.
 */
function checkHasDataById(result, dataSource) {
  if (dataSource === 'both') {
    return (result.sql?.id !== undefined) || (result.nosql?.id !== undefined);
  }
  return result.id !== undefined;
}

module.exports = router;
