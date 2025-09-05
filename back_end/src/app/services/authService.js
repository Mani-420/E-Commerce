/**
 * Authentication Service
 * Handles JWT token generation, validation, and password operations
 */

const { createAppError } = require('../../utils/errorHandler');
const { API_MESSAGES } = require('../../constants/apiMessages');
const { hashPassword: hashPasswordUtil, verifyPassword } = require('../../utils/passwordUtils');
const { generateAccessToken: generateAccessTokenUtil, generateRefreshToken: generateRefreshTokenUtil, verifyToken: verifyTokenUtil } = require('../../utils/jwtUtils');
const { generatePasswordResetToken } = require('../../utils/otpUtils');

class AuthService {
  /**
   * Constructor with dependency injection
   * @param {Object} dependencies - Dependencies object
   */
  constructor({ userRepository, otpRepository, passwordResetRepository }) {
    this.userRepository = userRepository;
    this.otpRepository = otpRepository;
    this.passwordResetRepository = passwordResetRepository;
  }

  /**
   * Hash a password
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    try {
      return await hashPasswordUtil(password);
    } catch (error) {
      throw createAppError({
        message: 'Failed to hash password',
        statusCode: 500,
        code: 'PASSWORD_HASH_ERROR'
      });
    }
  }

  /**
   * Compare password with hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} True if passwords match
   */
  async comparePassword(password, hash) {
    try {
      return await verifyPassword(password, hash);
    } catch (error) {
      throw createAppError({
        message: 'Failed to compare password',
        statusCode: 500,
        code: 'PASSWORD_COMPARE_ERROR'
      });
    }
  }

  /**
   * Generate JWT access token
   * @param {Object} payload - Token payload
   * @returns {string} JWT access token
   */
  generateAccessToken(payload) {
    try {
      return generateAccessTokenUtil(payload);
    } catch (error) {
      throw createAppError({
        message: 'Failed to generate access token',
        statusCode: 500,
        code: 'TOKEN_GENERATION_ERROR'
      });
    }
  }

  /**
   * Generate JWT refresh token
   * @param {Object} payload - Token payload
   * @returns {string} JWT refresh token
   */
  generateRefreshToken(payload) {
    try {
      return generateRefreshTokenUtil(payload);
    } catch (error) {
      throw createAppError({
        message: 'Failed to generate refresh token',
        statusCode: 500,
        code: 'TOKEN_GENERATION_ERROR'
      });
    }
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  verifyToken(token) {
    try {
      return verifyTokenUtil(token);
    } catch (error) {
      if (error.message === 'Token has expired') {
        throw createAppError({
          message: 'Token has expired',
          statusCode: 401,
          code: 'TOKEN_EXPIRED'
        });
      } else if (error.message === 'Invalid token') {
        throw createAppError({
          message: 'Invalid token',
          statusCode: 401,
          code: 'INVALID_TOKEN'
        });
      } else {
        throw createAppError({
          message: 'Token verification failed',
          statusCode: 401,
          code: 'TOKEN_VERIFICATION_ERROR'
        });
      }
    }
  }

  /**
   * Generate password reset token
   * @returns {string} Random reset token
   */
  generatePasswordResetToken() {
    return generatePasswordResetToken();
  }

  /**
   * Authenticate user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User object and tokens
   */
  async authenticateUser(email, password) {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw createAppError({
          message: API_MESSAGES.INVALID_CREDENTIALS,
          statusCode: 401,
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Check if account is suspended
      if (user.status === 'SUSPENDED') {
        throw createAppError({
          message: API_MESSAGES.ACCOUNT_SUSPENDED,
          statusCode: 403,
          code: 'ACCOUNT_SUSPENDED'
        });
      }

      // Check if email is verified
      if (user.status === 'PENDING_VERIFICATION') {
        throw createAppError({
          message: 'Please verify your email before logging in',
          statusCode: 403,
          code: 'EMAIL_NOT_VERIFIED'
        });
      }

      // Verify password
      const isPasswordValid = await this.comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        throw createAppError({
          message: API_MESSAGES.INVALID_CREDENTIALS,
          statusCode: 401,
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Update last login time
      await this.userRepository.updateLastLogin(user.id);

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const accessToken = this.generateAccessToken(tokenPayload);
      const refreshToken = this.generateRefreshToken(tokenPayload);

      // Remove sensitive data
      const { password_hash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw createAppError({
        message: 'Authentication failed',
        statusCode: 500,
        code: 'AUTH_ERROR'
      });
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = this.verifyToken(refreshToken);
      
      if (decoded.type !== JWT_CONFIG.REFRESH_TOKEN) {
        throw createAppError({
          message: 'Invalid token type',
          statusCode: 401,
          code: 'INVALID_TOKEN_TYPE'
        });
      }

      // Check if user still exists and is active
      const user = await this.userRepository.findById(decoded.userId);
      if (!user || user.status !== 'ACTIVE') {
        throw createAppError({
          message: 'User not found or inactive',
          statusCode: 401,
          code: 'USER_NOT_FOUND'
        });
      }

      // Generate new access token
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const newAccessToken = this.generateAccessToken(tokenPayload);

      return {
        accessToken: newAccessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw createAppError({
        message: 'Token refresh failed',
        statusCode: 401,
        code: 'TOKEN_REFRESH_ERROR'
      });
    }
  }

  /**
   * Create password reset token
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset token and expiry
   */
  async createPasswordResetToken(email) {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw createAppError({
          message: API_MESSAGES.USER_NOT_FOUND,
          statusCode: 404,
          code: 'USER_NOT_FOUND'
        });
      }

      // Check if user has recent reset request
      const hasRecentRequest = await this.passwordResetRepository.hasRecentRequest(user.id, 5);
      if (hasRecentRequest) {
        throw createAppError({
          message: 'Please wait before requesting another password reset',
          statusCode: 429,
          code: 'TOO_MANY_REQUESTS'
        });
      }

      // Generate reset token
      const resetToken = this.generatePasswordResetToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Invalidate existing tokens for this user
      await this.passwordResetRepository.invalidateUserTokens(user.id);

      // Create new reset record
      await this.passwordResetRepository.create({
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAt
      });

      return {
        resetToken,
        expiresAt,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name
        }
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to create password reset token',
        statusCode: 500,
        code: 'PASSWORD_RESET_ERROR'
      });
    }
  }

  /**
   * Reset password using reset token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Success message
   */
  async resetPassword(token, newPassword) {
    try {
      // Find valid reset token
      const resetRecord = await this.passwordResetRepository.findValidByToken(token);
      if (!resetRecord) {
        throw createAppError({
          message: 'Invalid or expired reset token',
          statusCode: 400,
          code: 'INVALID_RESET_TOKEN'
        });
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update user password
      await this.userRepository.updateById(resetRecord.user_id, {
        password_hash: hashedPassword
      });

      // Mark reset token as used
      await this.passwordResetRepository.markAsUsed(resetRecord.id);

      // Invalidate all user sessions (optional - could implement token blacklist)
      await this.passwordResetRepository.invalidateUserTokens(resetRecord.user_id);

      return {
        message: API_MESSAGES.PASSWORD_RESET_SUCCESS
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to reset password',
        statusCode: 500,
        code: 'PASSWORD_RESET_ERROR'
      });
    }
  }

  /**
   * Change password for authenticated user
   * @param {number} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Success message
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Find user
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createAppError({
          message: API_MESSAGES.USER_NOT_FOUND,
          statusCode: 404,
          code: 'USER_NOT_FOUND'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        throw createAppError({
          message: 'Current password is incorrect',
          statusCode: 400,
          code: 'INVALID_CURRENT_PASSWORD'
        });
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password
      await this.userRepository.updateById(userId, {
        password_hash: hashedPassword
      });

      return {
        message: 'Password changed successfully'
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to change password',
        statusCode: 500,
        code: 'PASSWORD_CHANGE_ERROR'
      });
    }
  }
}

module.exports = AuthService;
