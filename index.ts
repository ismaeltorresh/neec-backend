/**
 * Archivo principal de la aplicación NEEC Backend
 * Configura Express, middlewares, rutas y conexión a base de datos
 * 
 * @module index
 */

import 'dotenv/config';
import 'reflect-metadata';
import * as Sentry from '@sentry/node';
import './instrument.js';
import type { Request, Response, NextFunction } from 'express';
import type { CorsCallback } from './types/index.js';
import { auth } from 'express-oauth2-jwt-bearer';
import { errorLog, errorHandler, errorBoom, errorNotFound } from './middlewares/error.handler.js';
import { asyncHandler } from './middlewares/async.handler.js';
import cors from 'cors';
import env from './environments/index.js';
import express from 'express';
import helmet from 'helmet';
import perfTimeout from './middlewares/perf.handler.js';
import { limiter } from './middlewares/rate-limit.handler.js';
import compression from 'compression';
import routerApp from './routes/index.js';
import { AppDataSource, initializeDatabase, closeDatabase } from './db/connection.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validación de variables de entorno críticas
const requiredEnvVars: Record<string, string | undefined> = {
  'NODE_ENV': process.env.NODE_ENV
};

// Solo validar DB si no está en modo test
if (process.env.NODE_ENV !== 'test') {
  requiredEnvVars['DB_HOST'] = process.env.DB_HOST;
  requiredEnvVars['DB_NAME'] = process.env.DB_NAME;
  requiredEnvVars['DB_USER'] = process.env.DB_USER;
}

const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  logger.error('Missing required environment variables', { missing: missingVars });
  logger.error('Please check your .env file or environment configuration');
  process.exit(1);
}

// Validar valores de NODE_ENV
const validEnvs = ['development', 'production', 'test'];
if (!validEnvs.includes(process.env.NODE_ENV!)) {
  logger.warn('NODE_ENV is not standard', { 
    current: process.env.NODE_ENV, 
    expected: validEnvs 
  });
}

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: CorsCallback) {
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
};

// Swagger UI for docs (protected)
let swaggerUi: any;
let YAML: any;
try {
  const swaggerModule = await import('swagger-ui-express');
  swaggerUi = swaggerModule.default;
  const yamlModule = await import('yaml');
  YAML = yamlModule.default;
} catch (e) {
  // swagger-ui-express not installed; docs will be available via tools/serve-docs.js
  swaggerUi = null;
}

// OAuth middleware configuration
if (env.oauth) {
  if (process.env.AUDIENCE && process.env.ISSUER_BASE_URL) {
    try {
      const jwtCheck = auth({
        audience: process.env.AUDIENCE,
        issuerBaseURL: process.env.ISSUER_BASE_URL,
      });
      app.use(jwtCheck);
      logger.info('OAuth middleware initialized successfully');
    } catch (error) {
      const err = error as Error;
      logger.error('Error initializing OAuth middleware', { error: err.message });
    }
  } else {
    logger.error('OAuth enabled but AUDIENCE or ISSUER_BASE_URL missing');
    process.exit(1);
  }
}

// Disable X-Powered-By header for security (information disclosure)
app.disable('x-powered-by');

// Limit request body size to prevent large payload DoS
app.use(express.json({ limit: env.bodyLimit }));

// Enable response compression
app.use(compression({
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  threshold: 1024 // Only compress responses larger than 1KB
}));

// Security headers with helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors(corsOptions));

// Apply rate limiting to all API routes
app.use('/api/', limiter);

app.use(perfTimeout);

// *** CONFIGURE ROUTES AND MIDDLEWARES ***
if (env.execution === 'development' || env.execution === 'production') {

  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({ message: 'Welcome to Neec backend server' });
  });

  app.get('/health', asyncHandler(async (_req: Request, res: Response) => {
    let dbStatus = 'disconnected';
    let dbOk = false;
    
    try {
      if (AppDataSource.isInitialized) {
        await AppDataSource.query('SELECT 1');
        dbStatus = 'connected';
        dbOk = true;
      }
    } catch (error) {
      const err = error as Error;
      logger.error('Health check: database connection failed', { error: err.message });
    }
    
    const healthData = {
      status: dbOk ? 'healthy' : 'unhealthy',
      uptime: process.uptime(),
      timestamp: Date.now(),
      environment: env.execution,
      database: dbStatus,
      service: env.service,
      version: '1.0.0'
    };
    
    res.status(dbOk ? 200 : 503).json(healthData);
  }));

  app.get('/api', (_req: Request, res: Response) => {
    res.status(200).json({
      app: 'Neec Backend API',
      lastVersion: '1.0.0',
    });
  });

  // Mount /docs only if swagger-ui-express is available and the spec file exists
  try {
    const specPath = path.join(__dirname, 'docs', 'openapi-full.yaml');
    if (swaggerUi && fs.existsSync(specPath)) {
      const specRaw = fs.readFileSync(specPath, 'utf8');
      const spec = YAML.parse(specRaw);

      // Protection middleware for docs
      function docsAuth(req: Request, res: Response, next: NextFunction): Response | void {
        if (env.execution === 'development') return next();
        const token = req.header('X-DOCS-TOKEN') || req.query.docsToken;
        if (env.docsToken && token === env.docsToken) return next();
        return res.status(403).json({ message: 'Forbidden: invalid or missing docs token' });
      }

      app.use('/docs', docsAuth, swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }));
      logger.info('Docs available at /docs');
    }
  } catch (err) {
    const error = err as Error;
    logger.warn('Could not mount /docs', { error: error.message });
  }

  // *** ROUTES ***
  routerApp(app);

  if (env.execution === 'production' && env.sentry) {
    try {
      Sentry.setupExpressErrorHandler(app);
      logger.info('Sentry error handler initialized');
    } catch (error) {
      const err = error as Error;
      logger.error('Error setting up Sentry error handler', { error: err.message });
    }
  }

  // *** ERROR HANDLING ***
  // Order is critical: errorNotFound -> errorLog -> errorBoom -> errorHandler
  app.use(errorNotFound);
  app.use(errorLog);
  app.use(errorBoom);  // Must be before errorHandler to catch Boom errors
  app.use(errorHandler);

} else {
  app.get('*', (_req: Request, res: Response) => {
    return res.status(500).json({ message: 'I don\'t have a defined execution environment'});
  });
}

// *** START SERVER ***
// Initialize database and start server after all middleware/routes are configured
(async () => {
  try {
    // Validate port configuration
    if (!env.port) {
      throw new Error('PORT environment variable is not defined');
    }

    // Initialize TypeORM DataSource (Circuit Breaker pattern - Section 12.A)
    if (env.execution !== 'test') {
      await initializeDatabase();
      logger.db('TypeORM DataSource initialized successfully');
    }

    // Start the server
    const server = app.listen(env.port, () => {
      const message = env.execution === 'development' 
        ? `Server initialized ${env.server}:${env.port} in mode ${env.execution}` 
        : `Server initialized on port ${env.port} in mode ${env.execution}`;
      logger.info(message);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received: closing HTTP server and database connection`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await closeDatabase();
          logger.info('Database connection closed');
          process.exit(0);
        } catch (error) {
          const err = error as Error;
          logger.error('Error during shutdown', { error: err.message });
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (err) {
    const error = err as Error;
    logger.error('Error al iniciar el servidor', { error: error.message, stack: error.stack });
    process.exit(1);
  }
})();

export { app };
