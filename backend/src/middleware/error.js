function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "An unexpected server error occurred",
  });
}

module.exports = { notFound, errorHandler };
