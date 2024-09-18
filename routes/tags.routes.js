const express = require('express');
const router = express.Router();
const env = require('../environments');

router.post('/', (req, res) => {
  const body = req.body;
  res.status(200).json({
    message: 'Label created',
  });
});

router.get('/', (req, res) => {
  res.status(200).json([{}]);
});
router.post('/:postId', (req, res) => {
  const { postId } = req.params;
  res.status(200).json(req.params);
});

router.get('/datamodel', (req, res) => {
  if (env.execution === 'development') {
    return res.status(200).json({
      id: 'string', // El ID único de la etiqueta
      text: 'string', // El texto de la etiqueta
      color: 'string', // El color de la etiqueta
      description: 'string', // La descripción de la etiqueta
      fatherId: 'string', // El ID de la etiqueta padre
    });
  } else {
    return res.status(403).json({ message: 'I don’t have a correct execution environment'});
  }
});

module.exports = router;
