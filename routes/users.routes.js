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

router.get('/', (req, res, next) => {
  try {
    results = [];
    res.status(200).json(results);
  } catch (error) {
    next(
      boom.forbidden('I don’t have a correct execution environment')
    );
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
