const express = require('express');
const router = express.Router();
const env = require('../environments');

router.post('/people', (req, res) => {
  const body = req.body;
  res.status(200).json({
    message: 'People created',
  });
});

router.get('/people', (req, res) => {
  res.status(200).json([{}]);
});
router.get('/people:peopleId', (req, res) => {
  const { peopleId } = req.params;
});

router.get('/datamodel', (req, res) => {
  if (env.execution === 'development') {
    return res.status(200).json({
      id: 'string',
      uid: 'string',
      nameFirst: 'string',
      nameLast: 'string',
      country: 'string',
      contact: 'contact[]',
    });
  } else {
    return res.status(500).json({ message: 'I don’t have a correct execution environment'});
  }
});

module.exports = router;
