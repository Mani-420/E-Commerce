/**
 * Error handling utilities
 * Centralized error handling and custom error creation
 */

/**
 * Create a custom application error
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code for client identification
 * @returns {Error} Custom error object
 */
const createAppError = ({ message, statusCode = 500, code = 'INTERNAL_ERROR' }) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.isOperational = true;
  return error;
};

/**
 * Handle validation errors from Zod
 * @param {Object} zodError - Zod validation error
 * @returns {Error} Formatted validation error
 */
const handleValidationError = (zodError) => {
  const errors = zodError.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));

  return createAppError({
    message: 'Validation failed',
    statusCode: 400,
    code: 'VALIDATION_ERROR'
  });
};

/**
 * Handle database errors
 * @param {Error} dbError - Database error
 * @returns {Error} Formatted database error
 */
const handleDatabaseError = (dbError) => {
  // MySQL specific error handling
  if (dbError.code === 'ER_DUP_ENTRY') {
    return createAppError({
      message: 'Resource already exists',
      statusCode: 409,
      code: 'DUPLICATE_ENTRY'
    });
  }

  if (dbError.code === 'ER_NO_REFERENCED_ROW_2') {
    return createAppError({
      message: 'Referenced resource not found',
      statusCode: 400,
      code: 'FOREIGN_KEY_CONSTRAINT'
    });
  }

  if (dbError.code === 'ER_ROW_IS_REFERENCED_2') {
    return createAppError({
      message: 'Cannot delete resource as it is referenced by other records',
      statusCode: 400,
      code: 'REFERENCE_CONSTRAINT'
    });
  }

  // Generic database error
  return createAppError({
    message: 'Database operation failed',
    statusCode: 500,
    code: 'DATABASE_ERROR'
  });
};

/**
 * Handle JWT errors
 * @param {Error} jwtError - JWT error
 * @returns {Error} Formatted JWT error
 */
const handleJWTError = (jwtError) => {
  if (jwtError.name === 'JsonWebTokenError') {
    return createAppError({
      message: 'Invalid token',
      statusCode: 401,
      code: 'INVALID_TOKEN'
    });
  }

  if (jwtError.name === 'TokenExpiredError') {
    return createAppError({
      message: 'Token has expired',
      statusCode: 401,
      code: 'TOKEN_EXPIRED'
    });
  }

  return createAppError({
    message: 'Authentication failed',
    statusCode: 401,
    code: 'AUTH_ERROR'
  });
};

/**
 * Check if error is operational (expected error)
 * @param {Error} error - Error to check
 * @returns {boolean} True if operational error
 */
const isOperationalError = (error) => {
  return error.isOperational === true;
};

/**
 * Format error for logging
 * @param {Error} error - Error to format
 * @returns {Object} Formatted error object
 */
const formatErrorForLogging = (error) => {
  return {
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    stack: error.stack,
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  createAppError,
  handleValidationError,
  handleDatabaseError,
  handleJWTError,
  isOperationalError,
  formatErrorForLogging
};
