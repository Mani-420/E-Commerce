/**
 * Response Factory
 * Centralized response formatting for consistent API responses
 */

class ResponseFactory {
  /**
   * Create a successful response
   * @param {Object} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   * @returns {Object} Formatted success response
   */
  static success(data = null, message = 'Success', statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create an error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Error code
   * @param {Array} errors - Detailed error information
   * @returns {Object} Formatted error response
   */
  static error(message, statusCode = 400, code = 'ERROR', errors = null) {
    const response = {
      success: false,
      statusCode,
      message,
      code,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      response.errors = errors;
    }

    return response;
  }

  /**
   * Create a paginated response
   * @param {Array} data - Response data array
   * @param {Object} pagination - Pagination information
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   * @returns {Object} Formatted paginated response
   */
  static paginated(data, pagination, message = 'Data retrieved successfully', statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a validation error response
   * @param {Array} errors - Validation errors
   * @param {string} message - Error message
   * @returns {Object} Formatted validation error response
   */
  static validationError(errors, message = 'Validation failed') {
    return {
      success: false,
      statusCode: 400,
      message,
      code: 'VALIDATION_ERROR',
      errors,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create an authentication error response
   * @param {string} message - Error message
   * @returns {Object} Formatted authentication error response
   */
  static authError(message = 'Authentication failed') {
    return {
      success: false,
      statusCode: 401,
      message,
      code: 'AUTH_ERROR',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create an authorization error response
   * @param {string} message - Error message
   * @returns {Object} Formatted authorization error response
   */
  static forbiddenError(message = 'Access forbidden') {
    return {
      success: false,
      statusCode: 403,
      message,
      code: 'FORBIDDEN',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a not found error response
   * @param {string} message - Error message
   * @returns {Object} Formatted not found error response
   */
  static notFoundError(message = 'Resource not found') {
    return {
      success: false,
      statusCode: 404,
      message,
      code: 'NOT_FOUND',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a conflict error response
   * @param {string} message - Error message
   * @returns {Object} Formatted conflict error response
   */
  static conflictError(message = 'Resource conflict') {
    return {
      success: false,
      statusCode: 409,
      message,
      code: 'CONFLICT',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create an internal server error response
   * @param {string} message - Error message
   * @returns {Object} Formatted internal server error response
   */
  static internalError(message = 'Internal server error') {
    return {
      success: false,
      statusCode: 500,
      message,
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = ResponseFactory;
