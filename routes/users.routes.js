const boom = require('@hapi/boom');
const env = require('../environments');
const express = require('express');

const validatorHandler = require('../middlewares/validator.handler');
const { users, usersDelete, usersGet, usersPatch, usersPost } = require('../schemas/users.schema');


const router = express.Router();
let results;

router.get('/datamodel', (req, res, next) => {
  if (env.execution === 'development') {
    res.status(200).json(users);
  } else {
    next(
      boom.forbidden('I don’t have a correct execution environment')
    );
  }
});

router.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My intentionally Sentry error! is only test");
});

router.get('/', validatorHandler(usersGet, 'query'), async (req, res, next) => {
  try {
    const inputData = req.query;
    // If client requests SQL source, run paginated query
    if (inputData.dataSource === 'sql') {
      const { sqlPaginate } = require('../utils/sqlPagination');
      const page = parseInt(inputData.page, 10) || 1;
      const pageSize = parseInt(inputData.pageSize, 10) || 10;
      const filters = {
        userName: inputData.userName,
        email: inputData.email,
        role: inputData.role,
        status: inputData.status,
      };
      const search = inputData.q ? { q: inputData.q, columns: ['userName','email'] } : undefined;
      const result = await sqlPaginate({
        table: 'users',
        recordStatus: inputData.recordStatus,
        page,
        pageSize,
        columns: 'id, userName, email, role, status, recordStatus, updatedAt',
        orderBy: 'updatedAt DESC',
        filters,
        allowedFilters: ['userName','email','role','status'],
        search,
        sortBy: inputData.sortBy,
        sortDir: inputData.sortDir,
        allowedSorts: ['updatedAt','createdAt','userName','email'],
      });
      return res.status(200).json(result);
    }

    // Fallback: return empty paginated result
    results = [];
    const { paginate } = require('../utils/pagination');
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 10;
    const all = [];
    res.status(200).json(paginate(all, page, pageSize));
  } catch (error) {
    if (error && error.isBoom) return next(error);
    next(boom.internal('I don’t have a correct execution environment'));
  }
});

router.get(
  '/:id',
  validatorHandler(usersGet, 'params'),
  (req, res, next) => {
    try {
      results = [];
      res.status(200).json(results);
    } catch (error) {
      next(
        boom.forbidden('I don’t have a correct execution environment')
      );
    }
  }
);

router.post(
  '/',
  validatorHandler(usersPost, 'body'),
  (req, res, next) => {
    try {
      const body = req.body;
      results = {
        message: 'Created',
        body: req.body,
        id: 'A1B2C3D4E5F6'
      };
      res.status(201).json(results);
    } catch (error) {
      next(
        boom.forbidden('I don’t have a correct execution environment')
      );
    }
  }
);

router.patch(
  '/:id',
  validatorHandler(usersPatch, 'params'),
  (req, res, next) => {
    try {
      const {id} = req.params;
      const body = req.body;
      res.status(200).json({
        message: 'Updated',
        data: req.body
      });
    } catch (error) {
      next(
        boom.forbidden('I don’t have a correct execution environment')
      );
    }
  }
);

router.delete(
  '/:id',
  validatorHandler(usersDelete, 'params'),
  (req, res, next) => {
    try {
      const { id } = req.params;
      res.status(200).json({
        message: 'Deleted',
        data: req.params
      });
    } catch (error) {
      next(
        boom.forbidden('I don’t have a correct execution environment')
      );
    }
  }
);

module.exports = router;
