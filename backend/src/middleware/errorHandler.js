const ApiResponse = require('../utils/apiResponse');

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code === 'P2002') {
    return ApiResponse.conflict(res, 'A record with this unique value already exists');
  }

  if (err.code === 'P2025') {
    return ApiResponse.notFound(res, 'Record not found');
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return ApiResponse.badRequest(res, 'Validation failed', err.errors);
  }

  // Default error
  return ApiResponse.error(
    res,
    process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    500
  );
};

module.exports = errorHandler;
