/**
 * Authentication Middleware
 * Handles JWT token verification and user authentication
 */

const { createAppError } = require('../utils/errorHandler');
const { API_MESSAGES } = require('../constants/apiMessages');

class AuthMiddleware {
  /**
   * Constructor with dependency injection
   * @param {Object} dependencies - Dependencies object
   */
  constructor({ authService, userRepository }) {
    this.authService = authService;
    this.userRepository = userRepository;
  }

  /**
   * Authenticate user with JWT token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  authenticate = async (req, res, next) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw createAppError({
          message: API_MESSAGES.UNAUTHORIZED,
          statusCode: 401,
          code: 'NO_TOKEN'
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify token
      const decoded = this.authService.verifyToken(token);

      // Check if token is access token
      if (decoded.type !== 'access') {
        throw createAppError({
          message: 'Invalid token type',
          statusCode: 401,
          code: 'INVALID_TOKEN_TYPE'
        });
      }

      // Get user from database
      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw createAppError({
          message: API_MESSAGES.USER_NOT_FOUND,
          statusCode: 401,
          code: 'USER_NOT_FOUND'
        });
      }

      // Check if user is active
      if (user.status !== 'ACTIVE') {
        throw createAppError({
          message: API_MESSAGES.ACCOUNT_SUSPENDED,
          statusCode: 403,
          code: 'ACCOUNT_INACTIVE'
        });
      }

      // Add user to request object
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      };

      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Optional authentication - doesn't throw error if no token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  optionalAuth = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.user = null;
        return next();
      }

      const token = authHeader.substring(7);
      const decoded = this.authService.verifyToken(token);

      if (decoded.type !== 'access') {
        req.user = null;
        return next();
      }

      const user = await this.userRepository.findById(decoded.userId);
      if (!user || user.status !== 'ACTIVE') {
        req.user = null;
        return next();
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      };

      next();
    } catch (error) {
      // If token is invalid, just set user to null and continue
      req.user = null;
      next();
    }
  };

  /**
   * Authorize user roles
   * @param {Array} allowedRoles - Array of allowed roles
   * @returns {Function} Middleware function
   */
  authorize = (allowedRoles) => {
    return (req, res, next) => {
      try {
        if (!req.user) {
          throw createAppError({
            message: API_MESSAGES.UNAUTHORIZED,
            statusCode: 401,
            code: 'NO_AUTH'
          });
        }

        if (!allowedRoles.includes(req.user.role)) {
          throw createAppError({
            message: API_MESSAGES.FORBIDDEN,
            statusCode: 403,
            code: 'INSUFFICIENT_PERMISSIONS'
          });
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };

  /**
   * Require specific roles (alias for authorize)
   * @param {Array} allowedRoles - Array of allowed roles
   * @returns {Function} Middleware function
   */
  requireRole = (allowedRoles) => {
    return this.authorize(allowedRoles);
  };

  /**
   * Admin only authorization
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  adminOnly = (req, res, next) => {
    try {
      if (!req.user) {
        throw createAppError({
          message: API_MESSAGES.UNAUTHORIZED,
          statusCode: 401,
          code: 'NO_AUTH'
        });
      }

      if (req.user.role !== 'ADMIN') {
        throw createAppError({
          message: API_MESSAGES.FORBIDDEN,
          statusCode: 403,
          code: 'ADMIN_REQUIRED'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Seller or Admin authorization
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  sellerOrAdmin = (req, res, next) => {
    try {
      if (!req.user) {
        throw createAppError({
          message: API_MESSAGES.UNAUTHORIZED,
          statusCode: 401,
          code: 'NO_AUTH'
        });
      }

      if (!['SELLER', 'ADMIN'].includes(req.user.role)) {
        throw createAppError({
          message: API_MESSAGES.FORBIDDEN,
          statusCode: 403,
          code: 'SELLER_OR_ADMIN_REQUIRED'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check if user owns resource or is admin
   * @param {string} userIdParam - Parameter name containing user ID
   * @returns {Function} Middleware function
   */
  ownerOrAdmin = (userIdParam = 'userId') => {
    return (req, res, next) => {
      try {
        if (!req.user) {
          throw createAppError({
            message: API_MESSAGES.UNAUTHORIZED,
            statusCode: 401,
            code: 'NO_AUTH'
          });
        }

        const resourceUserId = parseInt(req.params[userIdParam]);
        const currentUserId = req.user.id;

        if (req.user.role !== 'ADMIN' && currentUserId !== resourceUserId) {
          throw createAppError({
            message: API_MESSAGES.FORBIDDEN,
            statusCode: 403,
            code: 'RESOURCE_ACCESS_DENIED'
          });
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };

  /**
   * Refresh token middleware
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  refreshToken = async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw createAppError({
          message: 'Refresh token is required',
          statusCode: 400,
          code: 'NO_REFRESH_TOKEN'
        });
      }

      const result = await this.authService.refreshAccessToken(refreshToken);
      req.refreshResult = result;

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = AuthMiddleware;
