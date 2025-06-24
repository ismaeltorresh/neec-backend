require("../instrument.js");
const env = require("../environments");
const Sentry = require("@sentry/node");

function errorNotFound(req, res, next) {
  res.status(404).json({ error: 'The requested route was not found' });
}

function errorLog(err, req, res, next) {
  next(err);
}

function errorHandler(err, req, res, next) {
  if (env.execution === 'development') {
    res.status(500).json({
      message: err.message,
      stack: err.stack
    });
  } else {
    Sentry.captureException(err);
    res.status(500).json({
      message: err.message
    });
  }
}

function errorBoom(err, req, res, next) {
  if (err.isBoom) {
    const { output } = err;
    res.status(output.statusCode).json(output.payload);
  } else {
    next(err);
  }
}

module.exports = { errorNotFound, errorLog, errorHandler, errorBoom };
