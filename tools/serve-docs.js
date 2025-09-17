const express = require('express');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');

const app = express();
const port = process.env.PORT_DOCS || 3001;

const specPath = path.join(__dirname, '..', 'docs', 'openapi-full.yaml');
if (!fs.existsSync(specPath)) {
  console.error('OpenAPI spec not found at', specPath);
  process.exit(1);
}

const specRaw = fs.readFileSync(specPath, 'utf8');
const spec = YAML.parse(specRaw);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

app.listen(port, () => {
  console.log(`Swagger UI available at http://localhost:${port}/docs`);
});
