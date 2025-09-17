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
const compression = require('compression');
const routerAapp = require('./routes');
const app = express();
// jwtCheck will be created later only if oauth is enabled and env vars exist
let jwtCheck;
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

if (env.oauth) {
  if (process.env.AUDIENCE && process.env.ISSUER_BASE_URL) {
    jwtCheck = auth({
      audience: process.env.AUDIENCE,
      issuerBaseURL: process.env.ISSUER_BASE_URL,
    });
    app.use(jwtCheck);
  } else {
    console.warn('OAuth enabled in env but AUDIENCE or ISSUER_BASE_URL missing; skipping jwt middleware');
  }
}

// Limit request body size to prevent large payload DoS
app.use(express.json({ limit: process.env.BODY_LIMIT || '100kb' }));

// Enable response compression
app.use(compression());

app.use(helmet());

app.use(cors(corsOptions));

app.use(perfTimeout);


// Test connection and start server
(async () => {
  try {
    // Test the connection to the database
    if (env.execution !== 'development') {
      await sequelize.authenticate();
      console.log('Conexión a MariaDB exitosa');
      await sequelize.sync(); // Solo si quieres crear tablas si no existen
    }
    // Start the server
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

  if (env.execution === 'production' && env.sentry) {
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
