/**
 * Authentication Routes
 * Defines all authentication-related API endpoints
 */

const express = require('express');
const router = express.Router();

// Import validation schemas
const {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendOtpSchema,
  changePasswordSchema
} = require('../validators/authValidators');

// Import middleware
const { validate } = require('../middleware/validationMiddleware');
const {
  authRateLimit,
  otpRateLimit,
  passwordResetRateLimit
} = require('../middleware/rateLimitMiddleware');

/**
 * Setup authentication routes
 * @param {Object} dependencies - Composed dependencies
 * @returns {Object} Express router
 */
const setupAuthRoutes = (dependencies) => {
  const { authController, authMiddleware } = dependencies;

  // Public routes (no authentication required)
  
  // User registration
  router.post('/register',
    authRateLimit,
    validate(registerSchema),
    authController.register
  );

  // User login
  router.post('/login',
    authRateLimit,
    validate(loginSchema),
    authController.login
  );

  // Email verification with OTP
  router.post('/verify-otp',
    otpRateLimit,
    validate(verifyOtpSchema),
    authController.verifyEmail
  );

  // Resend OTP
  router.post('/resend-otp',
    otpRateLimit,
    validate(resendOtpSchema),
    authController.resendOtp
  );

  // Forgot password
  router.post('/forgot-password',
    passwordResetRateLimit,
    validate(forgotPasswordSchema),
    authController.forgotPassword
  );

  // Reset password
  router.post('/reset-password',
    passwordResetRateLimit,
    validate(resetPasswordSchema),
    authController.resetPassword
  );

  // Refresh token
  router.post('/refresh-token',
    authRateLimit,
    authMiddleware.refreshToken,
    authController.refreshToken
  );

  // Protected routes (authentication required)
  
  // User logout
  router.post('/logout',
    authMiddleware.authenticate,
    authController.logout
  );

  // Get current user profile
  router.get('/me',
    authMiddleware.authenticate,
    authController.getProfile
  );

  // Update current user profile
  router.put('/me',
    authMiddleware.authenticate,
    authController.updateProfile
  );

  // Change password
  router.put('/change-password',
    authMiddleware.authenticate,
    validate(changePasswordSchema),
    authController.changePassword
  );

  return router;
};

module.exports = setupAuthRoutes;
