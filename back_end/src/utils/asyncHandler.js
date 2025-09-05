/**
 * Async handler utility
 * Wraps async functions to catch errors and pass them to error handling middleware
 */

/**
 * Async handler wrapper
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function that catches errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
