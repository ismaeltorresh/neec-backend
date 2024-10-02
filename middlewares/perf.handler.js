
function perfTimeout(req, res, next) {
  res.setTimeout(1000, () => {
    res.status(408).json({ message: 'Request timeout for this request'});
  });
  next();
};

module.exports = perfTimeout;
