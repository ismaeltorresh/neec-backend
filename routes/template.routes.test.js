const request = require('supertest');
const express = require('express');
const templateRoutes = require('./template.routes'); // Ajusta la ruta si es necesario
const boom = require('@hapi/boom');

const app = express();
app.use(express.json()); // Asegúrate de que Express pueda parsear JSON
app.use('/', templateRoutes); // Monta las rutas de tu archivo

describe('Pruebas para rutas de template', () => {
  it('GET /datamodel debería retornar el esquema en desarrollo', async () => {
    // Mockea el entorno de desarrollo
    process.env.execution = 'development';

    const res = await request(app).get('/datamodel');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id'); // Verifica alguna propiedad del esquema
  });

  it('GET /datamodel debería retornar un error en producción', async () => {
    // Mockea el entorno de producción
    process.env.execution = 'production';

    const res = await request(app).get('/datamodel');
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('I don’t have a correct execution environment');
  });

  it('GET /debug-sentry debería lanzar un error', async () => {
    const res = await request(app).get('/debug-sentry');
    expect(res.statusCode).toBe(500); // Debería ser 500 por el error lanzado
  });

  it('POST / debería crear un nuevo template', async () => {
    const newTemplate = {
      content: 'The content',
      date: '2024-05-08',
      featureImage: 'image.jpg',
      isPublished: 'true',
      lastUpdate: '2024-05-08',
      sumary: 'The Sumary',
      title: 'The title',
      userId: '3F2504E0-4F89-11D3-9A0C-0305E82C3301',
    };
    const res = await request(app)
      .post('/')
      .send(newTemplate);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Created');
    expect(res.body.body).toEqual(newTemplate); // Verifica que los datos coincidan
  });

  // ... más pruebas para otras rutas y métodos (GET /:id, PATCH /:id, DELETE /:id)
});
