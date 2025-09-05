/**
 * OTP Repository
 * Handles all OTP-related database operations with dependency injection
 */

const { createAppError } = require('../../utils/errorHandler');
const { OTP_TYPES } = require('../../constants/otpTypes');

class OtpRepository {
  /**
   * Constructor with dependency injection
   * @param {Object} dependencies - Dependencies object
   * @param {Function} dependencies.getDB - Database connection function
   */
  constructor({ getDB }) {
    this.getDB = getDB;
  }

  /**
   * Create a new OTP record
   * @param {Object} otpData - OTP data to create
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Object>} Created OTP object
   */
  async create(otpData, connection = null) {
    try {
      const db = connection || this.getDB();
      const { user_id, otp_code, type, expires_at } = otpData;

      const query = `
        INSERT INTO otp_verifications (user_id, otp_code, type, expires_at)
        VALUES (?, ?, ?, ?)
      `;
      
      const [result] = await db.execute(query, [user_id, otp_code, type, expires_at]);

      return await this.findById(result.insertId, connection);
    } catch (error) {
      throw createAppError({
        message: 'Failed to create OTP record',
        statusCode: 500,
        code: 'OTP_CREATE_ERROR'
      });
    }
  }

  /**
   * Find OTP by ID
   * @param {number} id - OTP ID
   * @param {Object} connection - Optional database connection
   * @returns {Promise<Object|null>} OTP object or null
   */
  async findById(id, connection = null) {
    try {
      const db = connection || this.getDB();
      const query = `
        SELECT id, user_id, otp_code, type, expires_at, used, created_at
        FROM otp_verifications 
        WHERE id = ?
      `;
      
      const [rows] = await db.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw createAppError({
        message: 'Failed to find OTP by ID',
        statusCode: 500,
        code: 'OTP_FIND_ERROR'
      });
    }
  }

  /**
   * Find valid OTP by user ID and code
   * @param {number} userId - User ID
   * @param {string} otpCode - OTP code
   * @param {string} type - OTP type
   * @param {Object} connection - Optional database connection
   * @returns {Promise<Object|null>} OTP object or null
   */
  async findValidOtp(userId, otpCode, type, connection = null) {
    try {
      const db = connection || this.getDB();
      const query = `
        SELECT id, user_id, otp_code, type, expires_at, used, created_at
        FROM otp_verifications 
        WHERE user_id = ? AND otp_code = ? AND type = ? AND used = FALSE AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1
      `;
      
      const [rows] = await db.execute(query, [userId, otpCode, type]);
      return rows[0] || null;
    } catch (error) {
      throw createAppError({
        message: 'Failed to find valid OTP',
        statusCode: 500,
        code: 'OTP_FIND_ERROR'
      });
    }
  }

  /**
   * Mark OTP as used
   * @param {number} id - OTP ID
   * @param {Object} connection - Optional database connection
   * @returns {Promise<boolean>} Success status
   */
  async markAsUsed(id, connection = null) {
    try {
      const db = connection || this.getDB();
      const query = `
        UPDATE otp_verifications 
        SET used = TRUE
        WHERE id = ?
      `;
      
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw createAppError({
        message: 'Failed to mark OTP as used',
        statusCode: 500,
        code: 'OTP_UPDATE_ERROR'
      });
    }
  }

  /**
   * Delete expired OTPs
   * @param {Object} connection - Optional database connection
   * @returns {Promise<number>} Number of deleted records
   */
  async deleteExpired(connection = null) {
    try {
      const db = connection || this.getDB();
      const query = `
        DELETE FROM otp_verifications 
        WHERE expires_at < NOW()
      `;
      
      const [result] = await db.execute(query);
      return result.affectedRows;
    } catch (error) {
      throw createAppError({
        message: 'Failed to delete expired OTPs',
        statusCode: 500,
        code: 'OTP_DELETE_ERROR'
      });
    }
  }

  /**
   * Get recent OTPs for a user
   * @param {number} userId - User ID
   * @param {string} type - OTP type
   * @param {number} limit - Number of records to return
   * @param {Object} connection - Optional database connection
   * @returns {Promise<Array>} Array of OTP records
   */
  async getRecentOtps(userId, type, limit = 5, connection = null) {
    try {
      const db = connection || this.getDB();
      const query = `
        SELECT id, user_id, otp_code, type, expires_at, used, created_at
        FROM otp_verifications 
        WHERE user_id = ? AND type = ?
        ORDER BY created_at DESC
        LIMIT ?
      `;
      
      const [rows] = await db.execute(query, [userId, type, limit]);
      return rows;
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
   * @param {Object} connection - Optional database connection
   * @returns {Promise<boolean>} True if recent request exists
   */
  async hasRecentRequest(userId, type, minutes = 1, connection = null) {
    try {
      const db = connection || this.getDB();
      const query = `
        SELECT COUNT(*) as count
        FROM otp_verifications 
        WHERE user_id = ? AND type = ? AND created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)
      `;
      
      const [rows] = await db.execute(query, [userId, type, minutes]);
      return rows[0].count > 0;
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
   * @param {Object} connection - Optional database connection
   * @returns {Promise<number>} Number of invalidated records
   */
  async invalidateUserOtps(userId, type, connection = null) {
    try {
      const db = connection || this.getDB();
      const query = `
        UPDATE otp_verifications 
        SET used = TRUE
        WHERE user_id = ? AND type = ? AND used = FALSE
      `;
      
      const [result] = await db.execute(query, [userId, type]);
      return result.affectedRows;
    } catch (error) {
      throw createAppError({
        message: 'Failed to invalidate user OTPs',
        statusCode: 500,
        code: 'OTP_UPDATE_ERROR'
      });
    }
  }
}

module.exports = OtpRepository;
