/**
 * Rate Limiting Middleware
 * Custom rate limiting for different endpoints
 */

const rateLimit = require('express-rate-limit');
const { createAppError } = require('../utils/errorHandler');

/**
 * Create rate limiter
 * @param {Object} options - Rate limit options
 * @returns {Function} Rate limit middleware
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString()
      });
    }
  };

  return rateLimit({ ...defaultOptions, ...options });
};

/**
 * Strict rate limiter for authentication endpoints
 * Modified for development/testing - much more lenient
 */
const authRateLimit = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute (reduced from 15 minutes)
  max: 50, // limit each IP to 50 requests per minute (increased from 5 per 15 minutes)
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  }
});

/**
 * OTP rate limiter
 * Modified for development/testing - much more lenient
 */
const otpRateLimit = createRateLimiter({
  windowMs: 30 * 1000, // 30 seconds (reduced from 1 minute)
  max: 20, // limit each IP to 20 OTP requests per 30 seconds (increased from 3 per minute)
  message: {
    success: false,
    message: 'Too many OTP requests, please try again later.',
    code: 'OTP_RATE_LIMIT_EXCEEDED'
  }
});

/**
 * Password reset rate limiter
 * Modified for development/testing - much more lenient
 */
const passwordResetRateLimit = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes (reduced from 1 hour)
  max: 10, // limit each IP to 10 password reset requests per 5 minutes (increased from 3 per hour)
  message: {
    success: false,
    message: 'Too many password reset requests, please try again later.',
    code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED'
  }
});

/**
 * General API rate limiter
 * Modified for development/testing - much more lenient
 */
const generalRateLimit = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute (reduced from 15 minutes)
  max: 1000, // limit each IP to 1000 requests per minute (increased from 100 per 15 minutes)
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    code: 'GENERAL_RATE_LIMIT_EXCEEDED'
  }
});

/**
 * Upload rate limiter
 */
const uploadRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 uploads per hour
  message: {
    success: false,
    message: 'Too many upload requests, please try again later.',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
  }
});

/**
 * Custom rate limiter for specific endpoints
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} max - Maximum number of requests
 * @param {string} message - Custom error message
 * @returns {Function} Rate limit middleware
 */
const customRateLimit = (windowMs, max, message) => {
  return createRateLimiter({
    windowMs,
    max,
    message: {
      success: false,
      message,
      code: 'CUSTOM_RATE_LIMIT_EXCEEDED'
    }
  });
};

module.exports = {
  createRateLimiter,
  authRateLimit,
  otpRateLimit,
  passwordResetRateLimit,
  generalRateLimit,
  uploadRateLimit,
  customRateLimit
};
