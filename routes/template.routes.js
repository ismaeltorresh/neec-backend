const boom = require('@hapi/boom');
const env = require('../environments');
const express = require('express');
const templateService = require('../services/template.services');
const { chat } = require('googleapis/build/src/apis/chat');

const router = express.Router();
const services = new templateService();

router.get('/datamodel', (req, res, next) => {
  if (env.execution === 'development') {
    res.status(200).json({});
  } else {
    next(
      boom.forbidden('I don’t have a correct execution environment')
    )
  }
});

router.get('/', (req, res, next) => {
  try {
    const list = services.read();
    res.status(200).json([{}]);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const item = services.readOne(id);
    res.status(200).json(req.params);
  } catch (error) {
    next(error);
  }
});

router.post('/', (req, res, next) => {
  try {
    const body = req.body;
    res.status(200).json({
      message: 'Created',
      body: req.body,
      id: 'A1B2C3D4E5F6'
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', (req, res, next) => {
  try {
    const {id} = req.params;
    const body = req.body;
    const item = services.update(id)
    res.status(200).json({
      message: 'Updated',
      data: req.body
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const item = services.delete(id)
    res.status(200).json({
      message: 'Deleted',
      data: req.params
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
