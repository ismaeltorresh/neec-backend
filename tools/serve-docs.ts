/**
 * [ES] Servidor para documentación OpenAPI/Swagger
 * [EN] Server for OpenAPI/Swagger documentation
 * 
 * @module tools/serve-docs
 */

import express from 'express';
import path from 'path';
import { readFileSync, existsSync } from 'fs';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT_DOCS || 3001;

// [ES] Ruta al archivo OpenAPI / [EN] Path to OpenAPI file
const specPath = path.join(__dirname, '..', 'docs', 'openapi-full.yaml');

if (!existsSync(specPath)) {
  console.error('❌ OpenAPI spec not found at', specPath);
  process.exit(1);
}

// [ES] Cargar y parsear el archivo YAML / [EN] Load and parse YAML file
const specRaw = readFileSync(specPath, 'utf8');
const spec = YAML.parse(specRaw);

// [ES] Configurar Swagger UI / [EN] Configure Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'NEEC Backend API Documentation'
}));

// [ES] Ruta raíz / [EN] Root route
app.get('/', (_req, res) => {
  res.redirect('/docs');
});

// [ES] Iniciar servidor / [EN] Start server
app.listen(port, () => {
  console.log(`✅ Swagger UI disponible en / available at: http://localhost:${port}/docs`);
});
