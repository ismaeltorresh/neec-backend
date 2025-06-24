const Sentry = require("@sentry/node");
require("./instrument.js");

const { auth, requiresScopes } = require("express-oauth2-jwt-bearer");
const { errorLog, errorHandler, errorBoom, errorNotFound } = require('./middlewares/error.handler');
const boom = require('@hapi/boom');
const cors = require('cors');
const env = require('./environments');
const express = require('express');
const helmet = require('helmet');
const perfTimeout = require('./middlewares/perf.handler');
const routerAapp = require('./routes');
const app = express();
const jwtCheck = auth({
  audience: process.env.AUDIENCE,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
});

const { sequelize } = require('./db/connection');
const corsOptions = {
  origin: function (origin, callback) {
    if (env.whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS from ${origin}`));
    }
  }
}

app.use(jwtCheck);

app.use(express.json());

app.use(helmet());

app.use(cors(corsOptions));

app.use(perfTimeout);


// Prueba conexión y arranca servidor
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MariaDB exitosa');
    await sequelize.sync(); // Solo si quieres crear tablas si no existen
    app.listen(env.port, () => {
      const consoleMessage = env.execution === 'development' ?  `Server initialized ${env.server}:${env.port} in mode ${env.execution}` : `Server initialized in ${env.port} mode ${env.execution}`;
      console.info(consoleMessage);
    });
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
  }
})();

if (env.execution === 'development' || env.execution === 'production') {

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

  if (env.execution === 'production') {
    Sentry.setupExpressErrorHandler(app);
  }

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
