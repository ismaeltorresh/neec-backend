const boom = require('@hapi/boom');
const env = require('../environments');
const express = require('express');
const validatorHandler = require('../middlewares/validator.handler');
const {schema, get, del, post, update} = require('../schemas/products.schema');
const service = 'products';


const router = express.Router();
let results;

router.get('/schema', (req, res, next) => {
  if (process.env.execution === 'development') {
    res.status(200).json(schema);
  } else {
    next(
      boom.forbidden('I don’t have a correct execution environment')
    );
  }
});

router.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My intentionally Sentry error! is only test");
});

router.get('/', validatorHandler(get, 'query'), (req, res, next) => {
  const inputData = req.query;
  try {
    if (inputData.dataSource === 'sql') {
      // Code to get data frome sql data base
      results = [{
        createdAt: 1698765432,
        dataSource: 'sql',
        id: 'e7b8f8e2-8d3b-4d3b-9f8e-2e8d3b4d3b9f',
        recordStatus: true,
        updatedAt: 1698765432,
        updatedBy: 'e7b8f8e2-8d3b-4d3b-9f8e-2e8d3b4d3b9f',
        useAs: 'test',
      }];
    } else if (inputData.dataSource === 'nosql') {
      // Code to get data frome nosql data base
      results = [{}];
    } else if (inputData.dataSource === 'both') {
      // code to get data frome sql an nosql database
      results = {
        sql: [{}],
        nosql: [{}]
      };
    } else {
      next(
        boom.forbidden(`${inputData.dataSource} not is a valid data source`)
      );
    }
    res.status(200).json(results);
  } catch (error) {
    next(
      boom.forbidden(`Failed to retrieve all data from the ${service} service`)
    );
  }
});

router.get('/:id', validatorHandler(get, 'query'),(req, res, next) => {
    const inputData = req.query;
    inputData.id = req.params.id;
    try {
      if (inputData.dataSource === 'sql') {
        // Code to get data frome sql data base
        results = {
          createdAt: 1698765432,
          dataSource: 'sql',
          id: inputData.id,
          recordStatus: true,
          updatedAt: 1698765432,
          updatedBy: 'e7b8f8e2-8d3b-4d3b-9f8e-2e8d3b4d3b9f',
          useAs: 'test',
        };
      } else if (inputData.dataSource === 'nosql') {
        // Code to get data frome nosql data base
        results = [{}];
      } else if (inputData.dataSource === 'both') {
        // code to get data frome sql an nosql database
        results = {
          sql: [{}],
          nosql: [{}]
        };
      } else {
        next(
          boom.forbidden(`${inputData.dataSource} not is a valid data source`)
        );
      }
      res.status(200).json(results);
    } catch (error) {
      next(
        boom.forbidden('I don’t have a correct execution environment')
      );
    }
  }
);

router.post('/', validatorHandler(post, 'body'), (req, res, next) => {
  const inputData = req.body;
  try {
    if (inputData.dataSource === 'sql') {
      // Code to get data frome sql data base
      results = {
        message: 'Created',
        body: inputData,
        id: 'A1B2C3D4E5F6'
      };
    } else if (inputData.dataSource === 'nosql') {
      // Code to get data frome nosql data base
      results = {};
    } else if (inputData.dataSource === 'both') {
      // code to get data frome sql an nosql database
      results = {
        sql: {},
        nosql: {}
      };
    } else {
      next(
        boom.forbidden(`${inputData.dataSource} not is a valid data source`)
      );
    }
    res.status(201).json(results);
  } catch (error) {
    next(
      boom.forbidden('I don’t have a correct execution environment')
    );
  }
});

router.put('/:id', validatorHandler(update, 'body'), (req, res, next) => {
  const inputData = req.body;
  inputData.id = req.params.id;
  try {
    if (inputData.dataSource === 'sql') {
      // Code to get data frome sql data base
      results = {
        message: 'Updated',
        data: inputData
      };
    } else if (inputData.dataSource === 'nosql') {
      // Code to get data frome nosql data base
      results = {};
    } else if (inputData.dataSource === 'both') {
      // code to get data frome sql an nosql database
      results = {
        sql: {},
        nosql: {}
      };
    } else {
      next(
        boom.forbidden(`${inputData.dataSource} not is a valid data source`)
      );
    }
    res.status(200).json(results);
  } catch (error) {
    next(
      boom.forbidden('I don’t have a correct execution environment')
    );
  }
});

router.delete('/:id', validatorHandler(del, 'body'), (req, res, next) => {
  const inputData = req.body;
  inputData.id = req.params.id;
  try {
    if (inputData.dataSource === 'sql') {
      // Code to get data frome sql data base
      results = {
        message: 'Deleted',
        data: inputData
      };
    } else if (inputData.dataSource === 'nosql') {
      // Code to get data frome nosql data base
      results = {};
    } else if (inputData.dataSource === 'both') {
      // code to get data frome sql an nosql database
      results = {
        sql: {},
        nosql: {}
      };
    } else {
      next(
        boom.forbidden(`${inputData.dataSource} not is a valid data source`)
      );
    }
    res.status(200).json(results);
  } catch (error) {
    next(
      boom.forbidden('I don’t have a correct execution environment')
    );
  }
});

module.exports = router;
