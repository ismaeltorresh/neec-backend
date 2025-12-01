// Load environment variables from .env file
require('dotenv').config();

const Sentry = require("@sentry/node");
require("./instrument.js");

const { auth } = require("express-oauth2-jwt-bearer");
const { errorLog, errorHandler, errorBoom, errorNotFound } = require('./middlewares/error.handler');
const cors = require('cors');
const env = require('./environments');
const express = require('express');
const helmet = require('helmet');
const perfTimeout = require('./middlewares/perf.handler');
const compression = require('compression');
const routerApp = require('./routes');
const app = express();
const { sequelize } = require('./db/connection');
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman) in development
    if (!origin && env.execution === 'development') {
      return callback(null, true);
    }
    if (env.whiteList && env.whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS from ${origin}`));
    }
  }
}

// Swagger UI for docs (protected)
const fs = require('fs');
const path = require('path');
let swaggerUi;
let YAML;
try {
  swaggerUi = require('swagger-ui-express');
  YAML = require('yaml');
} catch (e) {
  // swagger-ui-express not installed; docs will be available via tools/serve-docs.js
  swaggerUi = null;
}

if (env.oauth) {
  if (process.env.AUDIENCE && process.env.ISSUER_BASE_URL) {
    try {
      const jwtCheck = auth({
        audience: process.env.AUDIENCE,
        issuerBaseURL: process.env.ISSUER_BASE_URL,
      });
      app.use(jwtCheck);
      console.info('OAuth middleware initialized successfully');
    } catch (error) {
      console.error('Error initializing OAuth middleware:', error.message);
    }
  } else {
    console.warn('OAuth enabled in env but AUDIENCE or ISSUER_BASE_URL missing; skipping jwt middleware');
  }
}

// Disable X-Powered-By header for security (information disclosure)
app.disable('x-powered-by');

// Limit request body size to prevent large payload DoS
app.use(express.json({ limit: process.env.BODY_LIMIT || '100kb' }));

// Enable response compression
app.use(compression());

app.use(helmet());

app.use(cors(corsOptions));

app.use(perfTimeout);

// *** CONFIGURE ROUTES AND MIDDLEWARES ***
if (env.execution === 'development' || env.execution === 'production') {

  app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to Neec backend server' });
  });

  app.get('/api', (req, res) => {
    res.status(200).json(
      {
        app: 'Neec Backend API',
        lastVersion: '1.0.0',
      }
    );
  });

  // Mount /docs only if swagger-ui-express is available and the spec file exists
  try {
    const specPath = path.join(__dirname, 'docs', 'openapi-full.yaml');
    if (swaggerUi && fs.existsSync(specPath)) {
      const specRaw = fs.readFileSync(specPath, 'utf8');
      const spec = YAML.parse(specRaw);

      // Protection middleware:
      // - If execution === 'development' allow access
      // - Otherwise require header X-DOCS-TOKEN === process.env.DOCS_TOKEN
      function docsAuth(req, res, next) {
        if (env.execution === 'development') return next();
        const token = req.header('X-DOCS-TOKEN') || req.query.docsToken;
        if (process.env.DOCS_TOKEN && token === process.env.DOCS_TOKEN) return next();
        return res.status(403).json({ message: 'Forbidden: invalid or missing docs token' });
      }

      app.use('/docs', docsAuth, swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }));
      console.info('Docs available at /docs');
    }
  } catch (err) {
    console.warn('Could not mount /docs:', err.message);
  }

  // *** ROUTES ***
  routerApp(app);

  if (env.execution === 'production' && env.sentry) {
    try {
      Sentry.setupExpressErrorHandler(app);
      console.info('Sentry error handler initialized');
    } catch (error) {
      console.error('Error setting up Sentry error handler:', error.message);
    }
  }

  // *** ERROR HANDLING ***
  // Order is critical: errorNotFound -> errorLog -> errorBoom -> errorHandler
  app.use(errorNotFound);
  app.use(errorLog);
  app.use(errorBoom);  // Must be before errorHandler to catch Boom errors
  app.use(errorHandler);

} else {
  app.get('*', (req, res) => {
    return res.status(500).json({ message: 'I don\'t have a defined execution environment'});
  });
}

// *** START SERVER ***
// Test connection and start server after all middleware/routes are configured
(async () => {
  try {
    // Validate port configuration
    if (!env.port) {
      throw new Error('PORT environment variable is not defined');
    }

    // Test the connection to the database
    if (env.execution !== 'development') {
      await sequelize.authenticate();
      console.log('Conexión a MariaDB exitosa');
      await sequelize.sync();
    }

    // Start the server
    app.listen(env.port, () => {
      const consoleMessage = env.execution === 'development' 
        ? `Server initialized ${env.server}:${env.port} in mode ${env.execution}` 
        : `Server initialized on port ${env.port} in mode ${env.execution}`;
      console.info(consoleMessage);
    });

  } catch (err) {
    console.error('Error al iniciar el servidor:', err.message);
    process.exit(1);
  }
})();
