import '../instrument.js';
import env from '../environments/index.js';
import * as Sentry from '@sentry/node';

function errorNotFound(req, res, next) {
  res.status(404).json({ error: 'The requested route was not found' });
}

function errorLog(err, req, res, next) {
  // Structured logging
  const errorContext = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    errorMessage: err.message,
    errorName: err.name,
    statusCode: err.statusCode || err.status || 500
  };

  if (env.execution === 'development') {
    console.error('[ERROR]', JSON.stringify(errorContext, null, 2));
    console.error('[STACK]', err.stack);
  } else {
    // In production, log without stack trace
    console.error('[ERROR]', JSON.stringify(errorContext));
  }

  next(err);
}

function errorHandler(err, req, res, next) {
  // Determine status code
  const statusCode = err.statusCode || err.status || 500;
  
  // Send to Sentry in production (only for 5xx errors)
  if (env.execution === 'production' && statusCode >= 500) {
    Sentry.captureException(err, {
      tags: {
        path: req.path,
        method: req.method
      },
      user: {
        ip_address: req.ip
      }
    });
  }

  // Prepare safe error response
  const errorResponse = {
    error: statusCode >= 500 ? 'Internal Server Error' : err.name || 'Error',
    message: statusCode >= 500 
      ? 'An unexpected error occurred' // Generic message for 5xx
      : (err.message || 'An error occurred'), // Client errors can show message
  };

  // In development, add debugging info
  if (env.execution === 'development') {
    errorResponse.debug = {
      message: err.message,
      stack: err.stack,
      statusCode
    };
  }

  res.status(statusCode).json(errorResponse);
}

function errorBoom(err, req, res, next) {
  if (err.isBoom) {
    const { output } = err;
    res.status(output.statusCode).json(output.payload);
  } else {
    next(err);
  }
}

export { errorNotFound, errorLog, errorHandler, errorBoom };
