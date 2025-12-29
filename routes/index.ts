/**
 * Configuración y montaje de rutas de la aplicación
 * 
 * @module routes/index
 */

import type { Application } from 'express';
import express from 'express';
import templateRoutes from './template.routes.js';

/**
 * Configura y monta todas las rutas de la aplicación bajo el prefijo /api/v1.
 * 
 * @param app - Instancia de la aplicación Express
 * 
 * @description
 * Esta función centraliza el montaje de todos los módulos de rutas del sistema.
 * Todas las rutas quedan disponibles bajo el prefijo /api/v1:
 * - /api/v1/template (servicio de ejemplo/template)
 */
function routesApp(app: Application): void {
  const router = express.Router();
  
  // Montaje de rutas de servicios
  router.use('/template', templateRoutes);
  
  // Montar el router principal bajo /api/v1
  app.use('/api/v1', router);
}

export default routesApp;
