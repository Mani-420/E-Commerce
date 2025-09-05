/**
 * Validation middleware
 * Middleware for validating request data using Zod schemas
 */

const { createAppError } = require('../utils/errorHandler');

/**
 * Validation middleware factory
 * @param {Object} schema - Zod schema to validate against
 * @param {string} property - Request property to validate (body, query, params)
 * @returns {Function} Express middleware function
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse({ [property]: req[property] });
      
      if (!result.success) {
        const error = createAppError({
          message: 'Validation failed',
          statusCode: 400,
          code: 'VALIDATION_ERROR'
        });
        error.details = result.error.errors;
        return next(error);
      }

      // Replace the request property with validated data
      req[property] = result.data[property];
      next();
    } catch (error) {
      next(createAppError({
        message: 'Validation middleware error',
        statusCode: 500,
        code: 'VALIDATION_MIDDLEWARE_ERROR'
      }));
    }
  };
};

module.exports = {
  validate
};
