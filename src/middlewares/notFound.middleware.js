const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
    error: {
      statusCode: 404,
      path: req.originalUrl
    }
  });
};

export default notFound;
