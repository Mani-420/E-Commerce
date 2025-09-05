/**
 * Authentication Composition
 * Dependency injection wiring for authentication module
 */

const { getDB } = require('../../config/database');

// Repositories
const UserRepository = require('../repositories/userRepository');
const OtpRepository = require('../repositories/otpRepository');
const PasswordResetRepository = require('../repositories/passwordResetRepository');

// Services
const AuthService = require('../services/authService');
const UserService = require('../services/userService');
const OtpService = require('../services/otpService');
const NotificationService = require('../services/notificationService');

// Controllers
const AuthController = require('../../controllers/authController');
const AdminController = require('../../controllers/adminController');

// Middleware
const AuthMiddleware = require('../../middleware/authMiddleware');

// Email transporter setup
const nodemailer = require('nodemailer');

/**
 * Create email transporter
 * @returns {Object} Nodemailer transporter
 */
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Initialize and wire all dependencies
 * @returns {Object} Composed dependencies
 */
const initializeAuthComposition = () => {
  // Create email transporter
  const emailTransporter = createEmailTransporter();

  // Initialize repositories with dependency injection
  const userRepository = new UserRepository({ getDB });
  const otpRepository = new OtpRepository({ getDB });
  const passwordResetRepository = new PasswordResetRepository({ getDB });

  // Initialize services with dependency injection
  const authService = new AuthService({
    userRepository,
    otpRepository,
    passwordResetRepository
  });

  const notificationService = new NotificationService({
    emailTransporter
  });

  const otpService = new OtpService({
    otpRepository,
    notificationService,
    userRepository
  });

  const userService = new UserService({
    userRepository,
    authService,
    otpService,
    notificationService
  });

  // Initialize controllers with dependency injection
  const authController = new AuthController({
    userService,
    authService,
    otpService,
    notificationService
  });

  const adminController = new AdminController({
    userService
  });

  // Initialize middleware with dependency injection
  const authMiddleware = new AuthMiddleware({
    authService,
    userRepository
  });

  return {
    // Repositories
    userRepository,
    otpRepository,
    passwordResetRepository,

    // Services
    authService,
    userService,
    otpService,
    notificationService,

    // Controllers
    authController,
    adminController,

    // Middleware
    authMiddleware,

    // Utilities
    emailTransporter
  };
};

module.exports = {
  initializeAuthComposition
};
