const express = require('express');
const router = express.Router();
const env = require('../environments');
const {schema, get, del, post, update} = require('../schemas/blogs.schema');


router.post('/posts', (req, res) => {
  const body = req.body;
  res.status(200).json({
    message: 'Post created',
   });
});

router.get('/posts', (req, res) => {
  res.status(200).json([{
    title: 'string',
    content: 'string',
    date: 'date',
    authorId: 'string',
    categoriesId: 'string[]'
  }]);
});

router.get('/posts:postId', (req, res) => {
  const { postId } = req.params;
});

router.get('/schema', (req, res) => {
  if (env.execution === 'development') {
    return res.status(200).json({
      content: 'string', // El contenido del post
      date: 'date', // La fecha de publicación del post, si la fecha es superior a la fecha actual, el post se considera programado
      featureImage: 'string', // La URL de la imagen destacada del post
      id: 'string', // El ID único del post
      isPublished: 'boolean', // Indica si el post está publicado
      lastUpdate: 'date', // La fecha de la última actualización del post
      sumary: 'string', // Un resumen del post
      tagList: 'string[]', // Un array con los IDs de las categorías del post
      title: 'string', // El título del post
      userId: 'string', // El ID del autor del post
    });
  } else {
    return res.status(403).json({ message: 'I don’t have a correct execution environment'});
  }
});

module.exports = router;
