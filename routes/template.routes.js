const express = require('express');
const router = express.Router();
const env = require('../environments');

router.post('/', (req, res) => {
  const body = req.body;
  res.status(201).json({
    message: 'Post created',
    data: body
  });
});

router.patch('/:id', (req, res) => {
  const body = req.body;
  res.status(200).json({
    message: 'Updated',
    data: req.body
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    message: 'Deleted',
    data: req.params
  });
});

router.get('/', (req, res) => {
  res.status(200).json([{}]);
});
router.get('/:postId', (req, res) => {
  const { postId } = req.params;
  res.status(200).json(req.params);
});

router.get('/datamodel', (req, res) => {
  if (env.execution === 'development') {
    return res.status(200).json({});
  } else {
    return res.status(500).json({ message: 'I don’t have a correct execution environment'});
  }
});

module.exports = router;
