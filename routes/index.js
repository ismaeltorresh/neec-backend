const blogsRoutes = require('./blogs.routes');
const contactsRoutes = require('./contacts.routes');
const labelsRoutes = require('./labels.routes');
const peopleRoutes = require('./people.routes');
const templateRoutes = require('./template.routes');
const express = require('express');

function routesApp(app) {
  const router = express.Router();
  app.use('/api/v1', router);
  router.use('/blogs', blogsRoutes);
  router.use('/contacts', contactsRoutes);
  router.use('/labels', labelsRoutes);
  router.use('/people', peopleRoutes);
  router.use('/template', templateRoutes);
}

module.exports = routesApp;
