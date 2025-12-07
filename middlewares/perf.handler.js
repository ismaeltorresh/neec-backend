
import env from '../environments/index.js';
import logger from '../utils/logger.js';

function perfTimeout(req, res, next) {
  const timeoutMs = env.requestTimeout || (process.env.REQUEST_TIMEOUT ? Number(process.env.REQUEST_TIMEOUT) : 20000);
  
  // Set a timer to abort the request
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      // Log timeout for monitoring
      logger.perf('Request timeout exceeded', { method: req.method, path: req.path, timeout: timeoutMs });
      
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

export default perfTimeout;
