
const env = require('../environments');

function perfTimeout(req, res, next) {
  const timeoutMs = env.requestTimeout || (process.env.REQUEST_TIMEOUT ? Number(process.env.REQUEST_TIMEOUT) : 20000);
  res.setTimeout(timeoutMs, () => {
    // Let the framework handle finalization; log or notify if needed
    res.status(408).json({ message: 'Request timeout for this request' });
  });
  next();
};

module.exports = perfTimeout;
