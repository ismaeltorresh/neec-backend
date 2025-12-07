#!/usr/bin/env node

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import readline from 'readline/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear una interfaz para leer la entrada del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Preguntar al usuario por el nombre del servicio
const service = await rl.question('Ingrese el nombre del servicio: ');

// Definir las rutas de los archivos
const schemaTemplatePath = path.join(__dirname, 'schemas', 'template.schema.js');
const schemaServicePath = path.join(__dirname, 'schemas', `${service}.schema.js`);
const routesTemplatePath = path.join(__dirname, 'routes', 'template.routes.js');
const routesServicePath = path.join(__dirname, 'routes', `${service}.routes.js`);
const routesTemplateTestPath = path.join(__dirname, 'routes', 'template.routes.test.js');
const routesServiceTestPath = path.join(__dirname, 'routes', `${service}.routes.test.js`);
const routesIndexPath = path.join(__dirname, 'routes', 'index.js');

try {
  // Copiar y renombrar template.schema.js
  await fs.copyFile(schemaTemplatePath, schemaServicePath);

  // Copiar y renombrar template.routes.js
  await fs.copyFile(routesTemplatePath, routesServicePath);

  // Copiar y renombrar template.routes.test.js
  await fs.copyFile(routesTemplateTestPath, routesServiceTestPath);

  // Reemplazar la línea en service.routes.js
  let routesContent = await fs.readFile(routesServicePath, 'utf8');
  routesContent = routesContent.replace("const service = 'template';", `const service = '${service}';`);
  routesContent = routesContent.replace("import { schema, get, del, post, update } from '../schemas/template.schema.js'", `import { schema, get, del, post, update } from '../schemas/${service}.schema.js'`);
  await fs.writeFile(routesServicePath, routesContent, 'utf8');

  // Reemplazar la línea en service.routes.test.js
  let routesTestContent = await fs.readFile(routesServiceTestPath, 'utf8');
  routesTestContent = routesTestContent.replace("const service = 'template';", `const service = '${service}';`);
  routesTestContent = routesTestContent.replace("import serviceRoutes from './template.routes.js';", `import serviceRoutes from './${service}.routes.js';`);
  await fs.writeFile(routesServiceTestPath, routesTestContent, 'utf8');

  // Modificar routes/index.js
  let indexContent = await fs.readFile(routesIndexPath, 'utf8');
  const newImport = `import ${service}Routes from './${service}.routes.js';`;
  const newRouteLine = `  router.use('/${service}', ${service}Routes);`;
  
  // Agregar import después del último import
  const lastImportIndex = indexContent.lastIndexOf('import');
  const endOfLine = indexContent.indexOf('\n', lastImportIndex);
  indexContent = indexContent.slice(0, endOfLine + 1) + newImport + '\n' + indexContent.slice(endOfLine + 1);
  
  // Agregar ruta antes del app.use('/api/v1', router);
  const routerUseIndex = indexContent.indexOf("app.use('/api/v1', router);");
  indexContent = indexContent.slice(0, routerUseIndex) + newRouteLine + '\n  ' + indexContent.slice(routerUseIndex);

  await fs.writeFile(routesIndexPath, indexContent, 'utf8');

  console.log(`✅ Servicio ${service} creado exitosamente.`);
} catch (error) {
  console.error(`❌ Error creando el servicio: ${error.message}`);
} finally {
  rl.close();
}
