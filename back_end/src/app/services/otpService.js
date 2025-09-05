/**
 * OTP Service
 * Handles OTP generation, validation, and management
 */

const { createAppError } = require('../../utils/errorHandler');
const { OTP_TYPES } = require('../../constants/otpTypes');
const { API_MESSAGES } = require('../../constants/apiMessages');
const { generateOTP, generateOtpExpiry } = require('../../utils/otpUtils');

class OtpService {
  /**
   * Constructor with dependency injection
   * @param {Object} dependencies - Dependencies object
   */
  constructor({ otpRepository, notificationService, userRepository }) {
    this.otpRepository = otpRepository;
    this.notificationService = notificationService;
    this.userRepository = userRepository;
  }

  /**
   * Generate a random OTP code
   * @param {number} length - OTP length (default: 6)
   * @returns {string} Generated OTP code
   */
  generateOtpCode(length = 6) {
    return generateOTP(length);
  }

  /**
   * Generate OTP expiry time
   * @param {number} minutes - Expiry time in minutes (default: 10)
   * @returns {Date} Expiry date
   */
  generateOtpExpiryTime(minutes = 10) {
    return generateOtpExpiry(minutes);
  }

  /**
   * Generate and send OTP
   * @param {Object} user - User object
   * @param {string} type - OTP type
   * @returns {Promise<Object>} OTP generation result
   */
  async generateAndSendOtp(user, type) {
    try {
      // Validate OTP type
      const validTypes = Object.values(OTP_TYPES);
      if (!validTypes.includes(type)) {
        throw createAppError({
          message: 'Invalid OTP type',
          statusCode: 400,
          code: 'INVALID_OTP_TYPE'
        });
      }

      // Check for recent OTP requests (rate limiting)
      const hasRecentRequest = await this.otpRepository.hasRecentRequest(user.id, type, 1);
      if (hasRecentRequest) {
        throw createAppError({
          message: 'Please wait before requesting another OTP',
          statusCode: 429,
          code: 'TOO_MANY_OTP_REQUESTS'
        });
      }

      // Generate OTP
      const otpCode = this.generateOtpCode();
      const expiresAt = this.generateOtpExpiryTime();

      // Invalidate existing OTPs for this user and type
      await this.otpRepository.invalidateUserOtps(user.id, type);

      // Create new OTP record
      const otpRecord = await this.otpRepository.create({
        user_id: user.id,
        otp_code: otpCode,
        type,
        expires_at: expiresAt
      });

      // Send OTP notification
      await this.notificationService.sendOtpNotification(user, otpCode, type);

      return {
        otpId: otpRecord.id,
        expiresAt,
        message: API_MESSAGES.OTP_SENT
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to generate and send OTP',
        statusCode: 500,
        code: 'OTP_GENERATION_ERROR'
      });
    }
  }

  /**
   * Verify OTP code
   * @param {number} userId - User ID
   * @param {string} otpCode - OTP code to verify
   * @param {string} type - OTP type
   * @returns {Promise<Object>} Verification result
   */
  async verifyOtp(userId, otpCode, type) {
    try {
      // Validate OTP type
      const validTypes = Object.values(OTP_TYPES);
      if (!validTypes.includes(type)) {
        throw createAppError({
          message: 'Invalid OTP type',
          statusCode: 400,
          code: 'INVALID_OTP_TYPE'
        });
      }

      // Find valid OTP
      const otpRecord = await this.otpRepository.findValidOtp(userId, otpCode, type);
      
      if (!otpRecord) {
        // Check if OTP exists but is expired or used
        const recentOtps = await this.otpRepository.getRecentOtps(userId, type, 1);
        if (recentOtps.length > 0) {
          const recentOtp = recentOtps[0];
          if (recentOtp.used) {
            return {
              valid: false,
              message: 'OTP has already been used'
            };
          } else if (new Date(recentOtp.expires_at) < new Date()) {
            return {
              valid: false,
              message: API_MESSAGES.OTP_EXPIRED
            };
          }
        }
        
        return {
          valid: false,
          message: API_MESSAGES.OTP_INVALID
        };
      }

      // Mark OTP as used
      await this.otpRepository.markAsUsed(otpRecord.id);

      return {
        valid: true,
        message: API_MESSAGES.OTP_VERIFIED,
        otpId: otpRecord.id
      };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to verify OTP',
        statusCode: 500,
        code: 'OTP_VERIFICATION_ERROR'
      });
    }
  }

  /**
   * Verify OTP by email and code
   * @param {string} email - User email
   * @param {string} otpCode - OTP code
   * @param {string} type - OTP type
   * @returns {Promise<Object>} Verification result
   */
  async verifyOtpByEmail(email, otpCode, type) {
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

      // Verify OTP
      return await this.verifyOtp(user.id, otpCode, type);
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to verify OTP by email',
        statusCode: 500,
        code: 'OTP_VERIFICATION_ERROR'
      });
    }
  }

  /**
   * Clean up expired OTPs
   * @returns {Promise<number>} Number of deleted OTPs
   */
  async cleanupExpiredOtps() {
    try {
      return await this.otpRepository.deleteExpired();
    } catch (error) {
      throw createAppError({
        message: 'Failed to cleanup expired OTPs',
        statusCode: 500,
        code: 'OTP_CLEANUP_ERROR'
      });
    }
  }

  /**
   * Get recent OTPs for a user
   * @param {number} userId - User ID
   * @param {string} type - OTP type
   * @param {number} limit - Number of records to return
   * @returns {Promise<Array>} Array of OTP records
   */
  async getRecentOtps(userId, type, limit = 5) {
    try {
      return await this.otpRepository.getRecentOtps(userId, type, limit);
    } catch (error) {
      throw createAppError({
        message: 'Failed to get recent OTPs',
        statusCode: 500,
        code: 'OTP_FETCH_ERROR'
      });
    }
  }

  /**
   * Check if user has recent OTP request
   * @param {number} userId - User ID
   * @param {string} type - OTP type
   * @param {number} minutes - Time window in minutes
   * @returns {Promise<boolean>} True if recent request exists
   */
  async hasRecentRequest(userId, type, minutes = 1) {
    try {
      return await this.otpRepository.hasRecentRequest(userId, type, minutes);
    } catch (error) {
      throw createAppError({
        message: 'Failed to check recent OTP request',
        statusCode: 500,
        code: 'OTP_CHECK_ERROR'
      });
    }
  }

  /**
   * Invalidate all OTPs for a user of specific type
   * @param {number} userId - User ID
   * @param {string} type - OTP type
   * @returns {Promise<number>} Number of invalidated OTPs
   */
  async invalidateUserOtps(userId, type) {
    try {
      return await this.otpRepository.invalidateUserOtps(userId, type);
    } catch (error) {
      throw createAppError({
        message: 'Failed to invalidate user OTPs',
        statusCode: 500,
        code: 'OTP_INVALIDATION_ERROR'
      });
    }
  }
}

module.exports = OtpService;
