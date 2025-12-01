
const env = require('../environments');

function perfTimeout(req, res, next) {
  const timeoutMs = env.requestTimeout || (process.env.REQUEST_TIMEOUT ? Number(process.env.REQUEST_TIMEOUT) : 20000);
  
  // Set a timer to abort the request
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      // Log timeout for monitoring
      console.warn(`[TIMEOUT] ${req.method} ${req.path} exceeded ${timeoutMs}ms`);
      
      res.status(408).json({ 
        error: 'Request Timeout',
        message: 'The request took too long to complete'
      });
    }
  }, timeoutMs);

  // Clear timer when response finishes
  res.on('finish', () => {
    clearTimeout(timer);
  });

  next();
};

module.exports = perfTimeout;
