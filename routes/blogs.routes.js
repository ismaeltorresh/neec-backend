const express = require('express');
const router = express.Router();
const env = require('../environments');


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

router.get('/datamodel', (req, res) => {
  if (env.execution === 'development') {
    return res.status(200).json({
      title: 'string',
      content: 'string',
      date: 'date',
      authorId: 'string',
      categoriesId: 'string[]'
    });
  } else {
    return res.status(500).json({ message: 'I don’t have a correct execution environment'});
  }
});

module.exports = router;

