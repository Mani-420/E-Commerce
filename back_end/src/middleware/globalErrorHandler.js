/**
 * Global error handling middleware
 * Centralized error handling for all routes
 */

const { createAppError, handleValidationError, handleDatabaseError, handleJWTError, isOperationalError, formatErrorForLogging } = require('../utils/errorHandler');

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error occurred:', formatErrorForLogging(err));

  // Handle different types of errors
  if (err.name === 'ZodError') {
    error = handleValidationError(err);
  } else if (err.code && err.code.startsWith('ER_')) {
    error = handleDatabaseError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
  } else if (!isOperationalError(err)) {
    // Non-operational errors (programming errors, etc.)
    error = createAppError({
      message: 'Something went wrong',
      statusCode: 500,
      code: 'INTERNAL_ERROR'
    });
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    code: error.code,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Handle 404 errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFoundHandler = (req, res, next) => {
  const error = createAppError({
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404,
    code: 'ROUTE_NOT_FOUND'
  });
  next(error);
};

module.exports = {
  globalErrorHandler,
  notFoundHandler
};
