const request = require('supertest');
const express = require('express');
const service = 'address';

jest.mock('../db/connection', () => ({
  sequelize: { query: jest.fn().mockResolvedValue([[], []]), QueryTypes: { SELECT: 'SELECT', INSERT: 'INSERT', UPDATE: 'UPDATE' } },
}));
jest.mock('../middlewares/validator.handler', () => (schema, prop) => (req, res, next) => next());
jest.mock('../environments', () => ({ execution: process.env.execution || 'development' }));

const serviceRoutes = require('./address.routes');

const app = express();
app.use(express.json());
app.use('/', serviceRoutes);
app.use((err, req, res, next) => {
  if (err && err.isBoom) return res.status(err.output.statusCode).json(err.output.payload);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const db = require('../db/connection');
db.sequelize.query.mockImplementation((sql, options) => {
  if (/SELECT COUNT\(\*\) as total FROM/i.test(sql)) return Promise.resolve([[{ total: 1 }]]);
  if (/WHERE id =/i.test(sql)) return Promise.resolve([[{ id: 'e7b8f8e2-8d3b-4d3b-9f8e-2e8d3b4d3b9f' }]]);
  if (/SELECT .* FROM .* WHERE/i.test(sql)) return Promise.resolve([[{ id: 1 }]]);
  return Promise.resolve([[]]);
});

describe(`Pruebas para rutas de ${service}`, () => {
  it('GET /schema debería retornar el esquema en desarrollo', async () => {
    process.env.execution = 'development';
    const res = await request(app).get('/schema');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
  });

  it('GET /schema debería retornar un error en producción', async () => {
    process.env.execution = 'production';
    const res = await request(app).get('/schema');
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('I don’t have a correct execution environment');
  });

  it('GET /debug-sentry debería lanzar un error', async () => {
    const res = await request(app).get('/debug-sentry');
    expect(res.statusCode).toBe(500);
  });

  it('POST / debería crear un nuevo registro', async () => {
    const newInput = {
      createdAt: 1698765432,
      dataSource: 'sql',
      id: 'e7b8f8e2-8d3b-4d3b-9f8e-2e8d3b4d3b9f',
      recordStatus: true,
      updatedAt: 1698765432,
      updatedBy: 'e7b8f8e2-8d3b-4d3b-9f8e-2e8d3b4d3b9f',
      useAs: 'template',
    };
    const res = await request(app)
    .post('/')
    .send(newInput);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Created');
  });

  it('GET / Debería traer un listado registros', async () => {
    const newInput = {
      dataSource: 'fake',
      recordStatus: true,
    };
    const res = await request(app)
    .get('/')
    .query(newInput);
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('data');
  expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /:id Debería traer un registro', async () => {
    const newInput = {
      dataSource: 'sql',
      recordStatus: true
    };
    const res = await request(app)
    .get('/e7b8f8e2-8d3b-4d3b-9f8e-2e8d3b4d3b9f')
    .query(newInput);
    expect(res.statusCode).toBe(200);
    expect(res.body instanceof Object).toBe(true);
  });

  it('UPDATE /:id Debería actualizar un registro', async () => {
    const newInput = {
      dataSource: 'sql',
      id: 'e7b8f8e2-8d3b-4d3b-9f8e-2e8d3b4d3b9f',
      updatedAt: 1698765432,
      updatedBy: 'e7b8f8e2-8d3b-4d3b-9f8e-2e8d3b4d3b9f',
      recordStatus: true,
    };
    const res = await request(app)
    .put('/e7b8f8e2-8d3b-4d3b-9f8e-2e8d3b4d3b9f')
    .send(newInput);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Updated');
  });

  it('DELETE /:id Debería eliminar un registro', async () => {
    const newInput = {
      dataSource: 'sql',
      id: 'e7b8f8e2-8d3b-4d3b-9f8e-2e8d3b4d3b9f',
      updatedAt: 1698765432,
      updatedBy: 'e7b8f8e2-8d3b-4d3b-9f8e-2e8d3b4d3b9f',
      recordStatus: false,
    };
    const res = await request(app)
    .delete('/e7b8f8e2-8d3b-4d3b-9f8e-2e8d3b4d3b9f')
    .send(newInput);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Deleted');
  });
});
