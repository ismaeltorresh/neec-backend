#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Crear una interfaz para leer la entrada del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Preguntar al usuario por el nombre del servicio
rl.question('Ingrese el nombre del servicio: ', (service) => {
  // Definir las rutas de los archivos
  const schemaTemplatePath = path.join(__dirname, 'schemas', 'template.schema.js');
  const schemaServicePath = path.join(__dirname, 'schemas', `${service}.schema.js`);
  const routesTemplatePath = path.join(__dirname, 'routes', '/template.routes.js');
  const routesServicePath = path.join(__dirname, 'routes', `${service}.routes.js`);
  const routesTemplateTestPath = path.join(__dirname, 'routes', '/template.routes.test.js');
  const routesServiceTestPath = path.join(__dirname, 'routes', `${service}.routes.test.js`);
  const routesIndexPath = path.join(__dirname, 'routes', 'index.js');

  // Copiar y renombrar template.schema.js
  fs.copyFileSync(schemaTemplatePath, schemaServicePath);

  // Copiar y renombrar template.routes.js
  fs.copyFileSync(routesTemplatePath, routesServicePath);

  // Copiar y renombrar template.routes.js
  fs.copyFileSync(routesTemplateTestPath, routesServiceTestPath);

  // Reemplazar la línea en service.routes.js
  let routesContent = fs.readFileSync(routesServicePath, 'utf8');
  routesContent = routesContent.replace("const service = 'Template';", `const service = '${service}';`);
  routesContent = routesContent.replace("const {schema, get, del, post, update} = require('../schemas/template.schema')", `const {schema, get, del, post, update} = require('../schemas/${service}.schema')`);
  fs.writeFileSync(routesServicePath, routesContent, 'utf8');

  // Reemplazar la línea en service.routes.test.js
  let routesTestContent = fs.readFileSync(routesServiceTestPath, 'utf8');
  routesTestContent = routesTestContent.replace("const service = 'Template';", `const service = '${service}';`);
  routesTestContent = routesTestContent.replace("const serviceRoutes = require('./template.routes');", `const serviceRoutes = require('./${service}.routes');`);
  routesTestContent = routesTestContent.replace("app.use('/', serviceRoutes);", `app.use('/', ${service}Routes);`);

  fs.writeFileSync(routesServiceTestPath, routesTestContent, 'utf8');

  // Modificar routes/index.js
  let indexContent = fs.readFileSync(routesIndexPath, 'utf8');
  const newRouteLine = `router.use('/${service}', ${service}Routes);`;
  indexContent = indexContent.replace("const express = require('express');", `const express = require('express'); \nconst ${service}Routes = require('./${service}.routes');`);
  indexContent = indexContent.replace('const router = express.Router();', `const router = express.Router(); \n  ${newRouteLine}`);

  fs.writeFileSync(routesIndexPath, indexContent, 'utf8');

  console.log(`Servicio ${service} creado exitosamente.`);
  rl.close();
});
