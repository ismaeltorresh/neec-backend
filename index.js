const express = require('express');
const app = express();
const port = 3006;

app.listen(port, () => {
  const consoleMessage = process.env.NODE_ENV === 'development' ?  `Server initialized http://localhost:${port} in mode ${process.env.NODE_ENV}` : `Server initialized in mode ${process.env.NODE_ENV}`;
  console.info(consoleMessage);
});

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') {
  if (process.env.NODE_ENV === 'development') {
    const environment = {};

    /* *********************************
    * DATA MODELS ONLY FOR DEVELOPMENT *
    ********************************* */

    // *** BLOG ***
    app.get('/api/blog/', (req, res) => {
      return res.status(200).json({
        title: 'string',
        content: 'string',
        date: 'date',
        authorId: 'string',
        categoriesId: 'string[]'
      });
    });

  } else if (process.env.NODE_ENV === 'production') {
    const environment = {};
  } else {
    return res.status(500).json({ error: 'I dont have a defined execution environment' });
  }

  // *** COMMON ***

  app.get('/', (req, res) => {
    res.status(200).send('Welcome to Neec backend server');
  });

  app.get('/api', (req, res) => {
    res.status(200).json(
      {
        app: 'Neec Backend API',
        lastVersion: '1.0.0',
      }
    );
  });

  // *** BLOG ***

  app.get('/api/blog/posts:postId', (req, res) => {
    const { postId } = req.params;
  });

} else {
  app.get('*', (req, res) => {
    return res.status(500).json({ error: 'I don’t have a defined execution environment' });
  });
}

