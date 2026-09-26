function errorHandler(err, req, res, next) {
  console.error('[API Error]:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
