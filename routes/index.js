import express from 'express';
import templateRoutes from './template.routes.js';

/**
 * Configura y monta todas las rutas de la aplicación bajo el prefijo /api/v1.
 * 
 * @param {express.Application} app - Instancia de la aplicación Express.
 * @returns {void}
 * 
 * @description
 * Esta función centraliza el montaje de todos los módulos de rutas del sistema.
 * Todas las rutas quedan disponibles bajo el prefijo /api/v1:
 * - /api/v1/products
 * - /api/v1/people
 * - /api/v1/address
 * - /api/v1/blogs
 * - /api/v1/users
 * - /api/v1/template
 */
function routesApp(app) {
  const router = express.Router();
  
  // Montaje de rutas de servicios
  router.use('/template', templateRoutes);
  
  // Montar el router principal bajo /api/v1
  app.use('/api/v1', router);
}

export default routesApp;
