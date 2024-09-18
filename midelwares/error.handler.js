const { stack } = require("../routes/blogs.routes");
const { env } = require("../environments");

function errorNotFound(req, res, next) {
  res.status(404).json({ error: 'No se encontró la ruta solicitada' });
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