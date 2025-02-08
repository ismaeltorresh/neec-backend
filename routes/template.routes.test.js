const request = require('supertest');
const express = require('express');
const templateRoutes = require('./template.routes');
const boom = require('@hapi/boom');
const { create } = require('browser-sync');
const service = 'Template';

const app = express();
app.use(express.json());
app.use('/', templateRoutes);

describe('Pruebas para rutas de template', () => {
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
    expect(res.statusCode).toBe(500); // Debería ser 500 por el error lanzado
  });

  it('POST / debería crear un nuevo template', async () => {
    const newTemplate = {
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
    .send(newTemplate);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Created');
    expect(res.body.body).toEqual(newTemplate); // Verifica que los datos coincidan
  });

  it('GET / Debería traer un listado registros', async () => {
    const newTemplate = {
      dataSource: 'sql',
      recordStatus: true,
    };
    const res = await request(app)
    .get('/')
    .query(newTemplate);
    expect(res.statusCode).toBe(200);
    expect(res.body instanceof Array).toBe(true);
  });

  it('GET /:id Debería traer un registro', async () => {
    const newTemplate = {
      dataSource: 'sql',
      recordStatus: true
    };
    const res = await request(app)
    .get('/e7b8f8e2-8d3b-4d3b-9f8e-2e8d3b4d3b9f')
    .query(newTemplate);
    expect(res.statusCode).toBe(200);
    expect(res.body instanceof Object).toBe(true);
  });

  it('UPDATE /:id Debería actualizar un registro', async () => {
    const newTemplate = {
      dataSource: 'sql',
      id: 'e7b8f8e2-8d3b-4d3b-9f8e-2e8d3b4d3b9f',
      updatedAt: 1698765432,
      updatedBy: 'e7b8f8e2-8d3b-4d3b-9f8e-2e8d3b4d3b9f',
      recordStatus: true,
    };
    const res = await request(app)
    .put('/e7b8f8e2-8d3b-4d3b-9f8e-2e8d3b4d3b9f')
    .send(newTemplate);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Updated');
  });

  it('DELETE /:id Debería eliminar un registro', async () => {
    const newTemplate = {
      dataSource: 'sql',
      id: 'e7b8f8e2-8d3b-4d3b-9f8e-2e8d3b4d3b9f',
      updatedAt: 1698765432,
      updatedBy: 'e7b8f8e2-8d3b-4d3b-9f8e-2e8d3b4d3b9f',
      recordStatus: false,
    };
    const res = await request(app)
    .delete('/e7b8f8e2-8d3b-4d3b-9f8e-2e8d3b4d3b9f')
    .send(newTemplate);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Deleted');
  });
});
