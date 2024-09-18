const express = require('express');
const router = express.Router();
const env = require('../environments');

router.post('/contact', (req, res) => {
  const body = req.body;
  res.status(200).json({
    message: 'Contact created',
  });
});

router.get('/contact', (req, res) => {
  res.status(200).json([{}]);
});
router.get('/contact:postId', (req, res) => {
  const { postId } = req.params;
});

router.get('/datamodel', (req, res) => {
  if (env.execution === 'development') {
    return res.status(200).json({
      id: 'string',
      mediumType: 'string',
      value: 'string',
      address1: 'string',
      address2: 'string',
      address3: 'string',
      address4: 'string',
      address5: 'string',
      zipCode: 'string',
      countryId: 'string',
    });
  } else {
    return res.status(403).json({ message: 'I don’t have a correct execution environment'});
  }
});

module.exports = router;
