const { errorLog, errorHandler, errorBoom, errorNotFound } = require('./midelwares/error.handler');
const express = require('express');
const routerAapp = require('./routes');
const env = require('./environments');

const app = express();

app.use(express.json());

app.listen(env.port, () => {
  const consoleMessage = env.execution === 'development' ?  `Server initialized ${env.server}:${env.port} in mode ${env.execution}` : `Server initialized in ${env.port} mode ${env.execution}`;
  console.info(consoleMessage);
});

if (env.execution === 'development' || env.execution === 'production') {

  // *** COMMON ***

  // Middleware to handle request timeout
  // app.use((req, res, next) => {
  //   res.setTimeout(1000, () => {
  //     res.status(408).json({ message: 'Request timeout for this request'});
  //   }); 
  //   next();
  // });

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

  // *** ROUTES ***
  routerAapp(app);

  // *** ERROR HANDLING ***
  app.use(errorNotFound);
  app.use(errorLog);
  app.use(errorBoom);
  app.use(errorHandler);

} else {
  app.get('*', (req, res) => {
    return res.status(500).json({ message: 'I don’t have a defined execution environment'});
  });
}

