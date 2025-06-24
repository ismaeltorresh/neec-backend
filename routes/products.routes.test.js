const request = require('supertest');
const express = require('express');
const serviceRoutes = require('./products.routes');
const service = 'products';

const app = express();
app.use(express.json());
app.use('/', productsRoutes);

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
      dataSource: 'sql',
      recordStatus: true,
    };
    const res = await request(app)
    .get('/')
    .query(newInput);
    expect(res.statusCode).toBe(200);
    expect(res.body instanceof Array).toBe(true);
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
