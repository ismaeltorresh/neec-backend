const boom = require('@hapi/boom');
const env = require('../environments');
const express = require('express');
const validatorHandler = require('../middlewares/validator.handler');
const {schema, get, del, post, update} = require('../schemas/products.schema');
const service = 'products';
const { paginated } = require('../utils/response');


const router = express.Router();
let results;

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
    if (inputData.dataSource === 'sql') {
      const result = await sqlList(inputData);
      if (result.meta.total === 0) {
        return res.status(204).json(result);
      } else{
        return res.status(200).json(result);
      }
    } else if (inputData.dataSource === 'nosql') {
      const paged = nosqlList(inputData);
      if (paged.meta.total === 0) {
        return res.status(204).json(paged);
      } else {
        return res.status(200).json(paged);
      }
    } else if (inputData.dataSource === 'both') {
      const paged = {
        sql: [], // await sqlList(inputData)
        nosql: await nosqlList(inputData),
      };
      if (paged.sql.meta?.total === 0 && paged.nosql.meta.total === 0) {
        return res.status(204).json(paged);
      } else {
        return res.status(200).json(paged);
      }
    } else if (inputData.dataSource === 'fake') {
      const fake = require('../test/fakedata.json');
      const list = fake.products || [];
      const page = parseInt(inputData.page, 10) || 1;
      const pageSize = parseInt(inputData.pageSize, 10) || 10;
      const paged = paginated(list, page, pageSize);
      if (paged.meta.total === 0) {
        return res.status(204).json(paged);
      } else{
        return res.status(200).json(paged);
      }
    } else {
      next(
        boom.badRequest(`${inputData.dataSource} not is a valid data source`)
      );
    }
  } catch (error) {
    if (error && error.isBoom) return next(error);
    next(
      boom.internal(`An error occurred while retrieving the list from ${service} service`)
    );
  }
});

router.get('/:id', validatorHandler(get, 'query'),(req, res, next) => { 
  const inputData = req.query;
  inputData.id = req.params.id;
  try {
    if (inputData.dataSource === 'sql') {
      return res.status(200).json({}) // sqlFindById(inputData);
    } else if (inputData.dataSource === 'nosql') {
      const nosqlMock = require('../utils/nosqlMock');
      const record  = nosqlMock.findById('products', inputData.id) || {};
      if (record.id === undefined) {
        return res.status(204).json(record);
      } else{
        return res.status(200).json(record);
      }
    } else if (inputData.dataSource === 'both') {
      results = {
        sql: {}, // squlFindById(inputData),
        nosql: nosqlFindById(inputData)
      };
      if (results.nosql.id === undefined && results.sql.id === 0) {
        return res.status(204).json(results);
      } else {
        return res.status(200).json(results);
      }
    } else if (inputData.dataSource === 'fake') {
      const fake = require('../test/fakedata.json');
      const list = fake.products || [];
      const record = list.find(item => item.id === inputData.id) || {};
      if (record.id === undefined) {
        return res.status(204).json(record);
      } else{
        return res.status(200).json(record);
      }
    } else {
      next(
        boom.forbidden(`${inputData.dataSource} not is a valid data source`)
      );
    }
    res.status(200).json(results);
  } catch (error) {
    if (error && error.isBoom) return next(error);
    next(
      boom.internal(`An error occurred while retrieving the record from ${service} service`)
    );
  }
});

router.post('/', validatorHandler(post, 'body'), (req, res, next) => {
  const inputData = req.body;
  try {
    if (inputData.dataSource === 'sql') {
      const results = {
        message: 'Created',
        body: inputData,
        id: '123e4567-e89b-12d3-a456-426614174001'
      };
      return res.status(201).json(results);
    } else if (inputData.dataSource === 'nosql') {
      const results = {
        message: 'Created',
        body: inputData,
        id: '123e4567-e89b-12d3-a456-426614174001'
      };
      return res.status(201).json(results);
    } else if (inputData.dataSource === 'both') {
      const results = {
        sql: {
          message: 'Created',
          body: inputData,
          id: '123e4567-e89b-12d3-a456-426614174001'
        },
          nosql: {
          message: 'Created',
          body: inputData,
          id: '123e4567-e89b-12d3-a456-426614174001'
        }
      };
      return res.status(201).json(results);
    } else {
      next(
        boom.forbidden(`${inputData.dataSource} not is a valid data source`)
      );
    }
  } catch (error) {
    next(
      boom.internal(`An error occurred while creating the record from ${service} service`)
    );
  }
});

router.patch('/:id', validatorHandler(update, 'body'), (req, res, next) => {
  const inputData = req.body;
  inputData.id = req.params.id;
  try {
    if (inputData.dataSource === 'sql') {
      results = {
        message: 'Updated',
        data: inputData
      };
      return res.status(204).json(results);
    } else if (inputData.dataSource === 'nosql') {
      results = {
        message: 'Updated',
        data: inputData
      };
      return res.status(204).json(results);
    } else if (inputData.dataSource === 'both') {
      results = {
        sql: {
          message: 'Updated',
          data: inputData
        },
        nosql: {
          message: 'Updated',
          data: inputData
        }
      };
      return res.status(204).json(results);
    } else {
      next(
        boom.forbidden(`${inputData.dataSource} not is a valid data source`)
      );
    }
    res.status(200).json(results);
  } catch (error) {
    next(
      boom.internal(`An error occurred while updating the record from ${service} service`)
    );
  }
});

router.delete('/:id', validatorHandler(del, 'body'), (req, res, next) => {
  const inputData = req.body;
  inputData.id = req.params.id;
  try {
    if (inputData.dataSource === 'sql') {
      results = {
        message: 'Deleted',
        data: inputData
      };
    } else if (inputData.dataSource === 'nosql') {
      results = {
        message: 'Deleted',
        data: inputData
      };
    } else if (inputData.dataSource === 'both') {
      results = {
        sql: {
          message: 'Deleted',
          data: inputData
        },
        nosql: {
          message: 'Deleted',
          data: inputData
        }
      };
    } else {
      next(
        boom.forbidden(`${inputData.dataSource} not is a valid data source`)
      );
    }
    res.status(200).json(results);
  } catch (error) {
    next(
      boom.internal(`An error occurred while deleting the record from ${service} service`)
    );
  }
});

/**
 * Retrieves a paginated list of products from the database using the provided filters, search criteria, and sorting options.
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
    table: 'products',
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
 * Retrieves a paginated subset of products from the NoSQL mock data source.
 *
 * @param {{ page?: number|string, pageSize?: number|string }} inputData - Pagination parameters provided by the caller.
 * @returns {Object} Paginated result containing the requested page of products.
 */
function nosqlList(inputData) {
  const nosqlMock = require('../utils/nosqlMock');
  const page = parseInt(inputData.page, 10) || 1;
  const pageSize = parseInt(inputData.pageSize, 10) || 10;
  const paged = nosqlMock.paginateList('products', page, pageSize);
  return paged;
}

/**
 * Retrieves a product record from the NoSQL mock datastore by identifier.
 *
 * @param {{ id: string }} inputData - The lookup payload containing the product identifier.
 * @returns {Object} The matching product record if found, otherwise an empty object.
 */
function nosqlFindById(inputData) {
  const nosqlMock = require('../utils/nosqlMock');
  const record  = nosqlMock.findById('products', inputData.id) || {};
  return record;
}

module.exports = router;
