/**
 * User Service
 * Handles user-related business logic and operations
 */

const { createAppError } = require('../../utils/errorHandler');
const { USER_STATUSES, USER_ROLES } = require('../../constants/userStatuses');
const { API_MESSAGES } = require('../../constants/apiMessages');

class UserService {
  /**
   * Constructor with dependency injection
   * @param {Object} dependencies - Dependencies object
   */
  constructor({ userRepository, authService, otpService, notificationService }) {
    this.userRepository = userRepository;
    this.authService = authService;
    this.otpService = otpService;
    this.notificationService = notificationService;
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user and OTP info
   */
  async registerUser(userData) {
    try {
      const { email, password, firstName, lastName, phone, role } = userData;

      // Check if email already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw createAppError({
          message: API_MESSAGES.USER_ALREADY_EXISTS,
          statusCode: 409,
          code: 'USER_ALREADY_EXISTS'
        });
      }

      // Hash password
      const passwordHash = await this.authService.hashPassword(password);

      // Prepare user data
      const newUserData = {
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        role: role || USER_ROLES.CUSTOMER,
        status: USER_STATUSES.PENDING_VERIFICATION
      };

      // Create user
      const user = await this.userRepository.create(newUserData);

      // Generate and send OTP
      const otpResult = await this.otpService.generateAndSendOtp(user, 'EMAIL_VERIFICATION');

      // Remove sensitive data
      const { password_hash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        otpSent: true,
        message: API_MESSAGES.USER_REGISTERED
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to register user',
        statusCode: 500,
        code: 'USER_REGISTRATION_ERROR'
      });
    }
  }

  /**
   * Verify user email with OTP
   * @param {string} email - User email
   * @param {string} otpCode - OTP code
   * @returns {Promise<Object>} Verification result
   */
  async verifyEmail(email, otpCode) {
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

      // Check if already verified
      if (user.status === USER_STATUSES.ACTIVE) {
        throw createAppError({
          message: API_MESSAGES.EMAIL_ALREADY_VERIFIED,
          statusCode: 400,
          code: 'EMAIL_ALREADY_VERIFIED'
        });
      }

      // Verify OTP
      const otpResult = await this.otpService.verifyOtp(user.id, otpCode, 'EMAIL_VERIFICATION');
      if (!otpResult.valid) {
        throw createAppError({
          message: otpResult.message,
          statusCode: 400,
          code: 'INVALID_OTP'
        });
      }

      // Update user status to active
      const updatedUser = await this.userRepository.updateById(user.id, {
        status: USER_STATUSES.ACTIVE,
        email_verified_at: new Date()
      });

      // Send welcome notification
      await this.notificationService.sendWelcomeNotification(updatedUser);

      // Remove sensitive data
      const { password_hash, ...userWithoutPassword } = updatedUser;

      return {
        user: userWithoutPassword,
        message: API_MESSAGES.EMAIL_VERIFIED
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to verify email',
        statusCode: 500,
        code: 'EMAIL_VERIFICATION_ERROR'
      });
    }
  }

  /**
   * Resend OTP for email verification
   * @param {string} email - User email
   * @returns {Promise<Object>} Resend result
   */
  async resendOtp(email) {
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

      // Check if already verified
      if (user.status === USER_STATUSES.ACTIVE) {
        throw createAppError({
          message: API_MESSAGES.EMAIL_ALREADY_VERIFIED,
          statusCode: 400,
          code: 'EMAIL_ALREADY_VERIFIED'
        });
      }

      // Generate and send new OTP
      const otpResult = await this.otpService.generateAndSendOtp(user, 'EMAIL_VERIFICATION');

      return {
        message: API_MESSAGES.OTP_SENT,
        otpSent: true
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to resend OTP',
        statusCode: 500,
        code: 'OTP_RESEND_ERROR'
      });
    }
  }

  /**
   * Get user profile by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getUserProfile(userId) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createAppError({
          message: API_MESSAGES.USER_NOT_FOUND,
          statusCode: 404,
          code: 'USER_NOT_FOUND'
        });
      }

      // Remove sensitive data
      const { password_hash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to get user profile',
        statusCode: 500,
        code: 'USER_PROFILE_ERROR'
      });
    }
  }

  /**
   * Update user profile
   * @param {number} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user profile
   */
  async updateUserProfile(userId, updateData) {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        throw createAppError({
          message: API_MESSAGES.USER_NOT_FOUND,
          statusCode: 404,
          code: 'USER_NOT_FOUND'
        });
      }

      // Prepare allowed update fields
      const allowedFields = ['first_name', 'last_name', 'phone'];
      const filteredData = {};
      
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      }

      if (Object.keys(filteredData).length === 0) {
        throw createAppError({
          message: 'No valid fields to update',
          statusCode: 400,
          code: 'NO_UPDATE_FIELDS'
        });
      }

      // Update user
      const updatedUser = await this.userRepository.updateById(userId, filteredData);

      // Remove sensitive data
      const { password_hash, ...userWithoutPassword } = updatedUser;

      return {
        user: userWithoutPassword,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to update user profile',
        statusCode: 500,
        code: 'USER_UPDATE_ERROR'
      });
    }
  }

  /**
   * Get users with pagination (admin only)
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of records to return
   * @param {number} options.offset - Number of records to skip
   * @param {string} options.role - Filter by role
   * @param {string} options.status - Filter by status
   * @returns {Promise<Object>} Users and pagination info
   */
  async getUsers(options = {}) {
    try {
      const result = await this.userRepository.findWithPagination(options);

      // Remove sensitive data from all users
      const usersWithoutPasswords = result.users.map(user => {
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      return {
        users: usersWithoutPasswords,
        pagination: result.pagination
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to fetch users',
        statusCode: 500,
        code: 'USERS_FETCH_ERROR'
      });
    }
  }

  /**
   * Update user status (admin only)
   * @param {number} userId - User ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated user
   */
  async updateUserStatus(userId, status) {
    try {
      // Validate status
      const validStatuses = Object.values(USER_STATUSES);
      if (!validStatuses.includes(status)) {
        throw createAppError({
          message: 'Invalid status value',
          statusCode: 400,
          code: 'INVALID_STATUS'
        });
      }

      // Check if user exists
      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        throw createAppError({
          message: API_MESSAGES.USER_NOT_FOUND,
          statusCode: 404,
          code: 'USER_NOT_FOUND'
        });
      }

      // Update status
      const updatedUser = await this.userRepository.updateById(userId, { status });

      // Remove sensitive data
      const { password_hash, ...userWithoutPassword } = updatedUser;

      return {
        user: userWithoutPassword,
        message: 'User status updated successfully'
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to update user status',
        statusCode: 500,
        code: 'USER_STATUS_UPDATE_ERROR'
      });
    }
  }

  /**
   * Delete user (soft delete)
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteUser(userId) {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        throw createAppError({
          message: API_MESSAGES.USER_NOT_FOUND,
          statusCode: 404,
          code: 'USER_NOT_FOUND'
        });
      }

      // Soft delete user
      const deleted = await this.userRepository.deleteById(userId);
      if (!deleted) {
        throw createAppError({
          message: 'Failed to delete user',
          statusCode: 500,
          code: 'USER_DELETE_ERROR'
        });
      }

      return {
        message: 'User deleted successfully'
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to delete user',
        statusCode: 500,
        code: 'USER_DELETE_ERROR'
      });
    }
  }

  /**
   * Get user statistics for admin dashboard
   * @returns {Promise<Object>} User statistics
   */
  async getUserStats() {
    try {
      const stats = await this.userRepository.getUserStats();
      return stats;
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to fetch user statistics',
        statusCode: 500,
        code: 'USER_STATS_ERROR'
      });
    }
  }
}

module.exports = UserService;
