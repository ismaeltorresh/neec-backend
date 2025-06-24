const express = require('express'); 
const productsRoutes = require('./products.routes'); 
const peopleRoutes = require('./people.routes'); 
const addressRoutes = require('./address.routes');
const blogsRoutes = require('./blogs.routes');
const usersRoutes = require('./users.routes');
const templateRoutes = require('./template.routes');

function routesApp(app) {
  const router = express.Router(); 
  router.use('/products', productsRoutes); 
  router.use('/people', peopleRoutes); 
  router.use('/address', addressRoutes);
  router.use('/blogs', blogsRoutes);
  router.use('/users', usersRoutes);
  router.use('/template', templateRoutes);
}

module.exports = routesApp;
