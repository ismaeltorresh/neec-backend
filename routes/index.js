const blogsRoutes = require('./blogs.routes');
const contactsRoutes = require('./contacts.routes');
const express = require('express');
const labelsRoutes = require('./tags.routes');
const peopleRoutes = require('./people.routes');
const templateRoutes = require('./template.routes');
const usersRoutes = require('./users.routes');

function routesApp(app) {
  const router = express.Router();

  app.use('/api/v1', router);
  router.use('/template', templateRoutes);
  router.use('/blogs', blogsRoutes);
  router.use('/contacts', contactsRoutes);
  router.use('/people', peopleRoutes);
  router.use('/tags', labelsRoutes);
  router.use('/users', usersRoutes);
}

module.exports = routesApp;
