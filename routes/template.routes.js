const boom = require('@hapi/boom');
const express = require('express');
const validatorHandler = require('../middlewares/validator.handler');
const { schema, get, del, post, update } = require('../schemas/template.schema');
const { sequelize } = require('../db/connection');
const service = 'Template';
const env = require('../environments');

const router = express.Router();
const connection = sequelize; // Connection to SQL database

router.get('/schema', (req, res, next) => {
  if (env.execution === 'development') {
    res.status(200).json(schema);
  } else {
    next(boom.forbidden('You do not have the correct execution environment'));
  }
});

router.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My intentional Sentry error! This is just a test");
});

router.get('/', validatorHandler(get, 'query'), async (req, res, next) => {
  const inputData = req.query;
  try {
    let results = {};
    if (inputData.dataSource === 'sql' || inputData.dataSource === 'both') {
      let [rows] = await connection.query('SELECT * FROM template WHERE recordStatus = ?', {
        replacements: [inputData.recordStatus],
        type: connection.QueryTypes.SELECT,
      });
      rows = typeof rows !== 'object' ? rows : [rows];
      if (rows) {
        results.sql = rows.map(row => ({
          ...row
        }));
      } else{
        next(boom.notFound('No records found'));
      }
    } else if (inputData.dataSource === 'nosql') {
      // Code to fetch data from the NoSQL database
      results.nosql = [{}];
    } else {
      next(boom.badRequest(`${inputData.dataSource} is not a valid data source`));
    }
  } catch (error) {
    console.error(error);
    next(boom.internal(`Error retrieving data from the ${service} service`));
  }
});

router.get('/:id', validatorHandler(get, 'query'), async (req, res, next) => {
  const inputData = req.query;
  inputData.id = req.params.id;
  try {
    let results;
    if (inputData.dataSource === 'sql' || inputData.dataSource === 'both') {
      // Use the SQL connection to fetch the data
      const [rows] = await connection.query('SELECT * FROM template WHERE id = ?', [inputData.id]);
      if (rows.length === 0) {
        next(boom.notFound(`No record found with ID ${inputData.id}`));
        return;
      }
      results = {
        ...rows[0],
        dataSource: 'sql'
      };
      if (inputData.dataSource === 'both') {
        results = {
          sql: results,
          nosql: []
        };
      }
    } else if (inputData.dataSource === 'nosql') {
      results = [{}];
    } else {
      next(boom.badRequest(`${inputData.dataSource} is not a valid data source`));
    }
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    next(boom.internal(`Error retrieving the data from the ${service} service`));
  }
});

router.post('/', validatorHandler(post, 'body'), async (req, res, next) => {
  const inputData = req.body;
  try {
    let results;
    if (inputData.dataSource === 'sql' || inputData.dataSource === 'both') {
      const { createdAt, id, recordStatus, updatedAt, updatedBy, useAs } = inputData;
      const [result] = await connection.query(
        'INSERT INTO template (createdAt, id, recordStatus, updatedAt, updatedBy, useAs) VALUES (?, ?, ?, ?, ?, ?)',
        {
          replacements: [createdAt, id, recordStatus, updatedAt, updatedBy, useAs],
          type: connection.QueryTypes.INSERT
        }
      );
      results = {
        message: 'created',
        body: inputData,
        id: result.insertId
      };
    } else if (inputData.dataSource === 'nosql') {
      results = {};
    } else {
      next(boom.badRequest(`${inputData.dataSource} is not a valid data source`));
    }
    res.status(201).json(results);
  } catch (error) {
    console.error(error);
    next(boom.internal(`Error creating the record in the ${service} service`));
  }
});

router.put('/:id', validatorHandler(update, 'body'), async (req, res, next) => {
  const inputData = req.body;
  inputData.id = req.params.id;
  try {
    let results;
    if (inputData.dataSource === 'sql' || inputData.dataSource === 'both') {
      const { updatedAt, updatedBy, recordStatus, useAs, id } = inputData;
      const [result] = await connection.query(
        'UPDATE template SET updatedAt = ?, updatedBy = ?, recordStatus = ?, useAs = ? WHERE id = ?', {
          replacements: [updatedAt, updatedBy, recordStatus, useAs, id],
          type: connection.QueryTypes.UPDATE
        }
      );
      if (result.affectedRows === 0) {
        next(boom.notFound(`No record found with ID ${inputData.id}`));
        return;
      }
      results = {
        message: 'updated',
        data: inputData
      };
    } else if (inputData.dataSource === 'nosql') {
      results = {};
    } else {
      next(boom.badRequest(`${inputData.dataSource} is not a valid data source`));
    }
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    next(boom.internal(`Error updating the record in the ${service} service`));
  }
});

router.delete('/:id', validatorHandler(del, 'body'), async (req, res, next) => {
  const inputData = req.body;
  inputData.id = req.params.id;
  try {
    let results;
    if (inputData.dataSource === 'sql' || inputData.dataSource === 'both') {
      // Utiliza la conexión SQL para eliminar el registro
      const [result] = await connection.query('DELETE FROM template WHERE id = ?', [inputData.id]);
      if (result.affectedRows === 0) {
        next(boom.notFound(`No record found with ID ${inputData.id}`));
        return;
      }
      results = {
        message: 'Eliminado',
        data: inputData
      };
    } else if (inputData.dataSource === 'nosql') {
      results = {};
    } else {
      next(boom.badRequest(`${inputData.dataSource} is not a valid data source`));
    }
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    next(boom.internal(`Error deleting the record in the ${service} service`));
  }
});

module.exports = router;
