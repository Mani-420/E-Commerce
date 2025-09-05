/**
 * Password Reset Repository
 * Handles all password reset-related database operations with dependency injection
 */

const { createAppError } = require('../../utils/errorHandler');

class PasswordResetRepository {
  /**
   * Constructor with dependency injection
   * @param {Object} dependencies - Dependencies object
   * @param {Function} dependencies.getDB - Database connection function
   */
  constructor({ getDB }) {
    this.getDB = getDB;
  }

  /**
   * Create a new password reset record
   * @param {Object} resetData - Password reset data to create
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Object>} Created password reset object
   */
  async create(resetData, connection = null) {
    try {
      const db = connection || this.getDB();
      const { user_id, token, expires_at } = resetData;

      const query = `
        INSERT INTO password_resets (user_id, token, expires_at)
        VALUES (?, ?, ?)
      `;
      
      const [result] = await db.execute(query, [user_id, token, expires_at]);

      return await this.findById(result.insertId, connection);
    } catch (error) {
      throw createAppError({
        message: 'Failed to create password reset record',
        statusCode: 500,
        code: 'PASSWORD_RESET_CREATE_ERROR'
      });
    }
  }

  /**
   * Find password reset by ID
   * @param {number} id - Password reset ID
   * @param {Object} connection - Optional database connection
   * @returns {Promise<Object|null>} Password reset object or null
   */
  async findById(id, connection = null) {
    try {
      const db = connection || this.getDB();
      const query = `
        SELECT id, user_id, token, expires_at, used, created_at
        FROM password_resets 
        WHERE id = ?
      `;
      
      const [rows] = await db.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw createAppError({
        message: 'Failed to find password reset by ID',
        statusCode: 500,
        code: 'PASSWORD_RESET_FIND_ERROR'
      });
    }
  }

  /**
   * Find valid password reset by token
   * @param {string} token - Password reset token
   * @param {Object} connection - Optional database connection
   * @returns {Promise<Object|null>} Password reset object or null
   */
  async findValidByToken(token, connection = null) {
    try {
      const db = connection || this.getDB();
      const query = `
        SELECT id, user_id, token, expires_at, used, created_at
        FROM password_resets 
        WHERE token = ? AND used = FALSE AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1
      `;
      
      const [rows] = await db.execute(query, [token]);
      return rows[0] || null;
    } catch (error) {
      throw createAppError({
        message: 'Failed to find valid password reset token',
        statusCode: 500,
        code: 'PASSWORD_RESET_FIND_ERROR'
      });
    }
  }

  /**
   * Mark password reset as used
   * @param {number} id - Password reset ID
   * @param {Object} connection - Optional database connection
   * @returns {Promise<boolean>} Success status
   */
  async markAsUsed(id, connection = null) {
    try {
      const db = connection || this.getDB();
      const query = `
        UPDATE password_resets 
        SET used = TRUE
        WHERE id = ?
      `;
      
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw createAppError({
        message: 'Failed to mark password reset as used',
        statusCode: 500,
        code: 'PASSWORD_RESET_UPDATE_ERROR'
      });
    }
  }

  /**
   * Delete expired password reset tokens
   * @param {Object} connection - Optional database connection
   * @returns {Promise<number>} Number of deleted records
   */
  async deleteExpired(connection = null) {
    try {
      const db = connection || this.getDB();
      const query = `
        DELETE FROM password_resets 
        WHERE expires_at < NOW()
      `;
      
      const [result] = await db.execute(query);
      return result.affectedRows;
    } catch (error) {
      throw createAppError({
        message: 'Failed to delete expired password reset tokens',
        statusCode: 500,
        code: 'PASSWORD_RESET_DELETE_ERROR'
      });
    }
  }

  /**
   * Invalidate all password reset tokens for a user
   * @param {number} userId - User ID
   * @param {Object} connection - Optional database connection
   * @returns {Promise<number>} Number of invalidated records
   */
  async invalidateUserTokens(userId, connection = null) {
    try {
      const db = connection || this.getDB();
      const query = `
        UPDATE password_resets 
        SET used = TRUE
        WHERE user_id = ? AND used = FALSE
      `;
      
      const [result] = await db.execute(query, [userId]);
      return result.affectedRows;
    } catch (error) {
      throw createAppError({
        message: 'Failed to invalidate user password reset tokens',
        statusCode: 500,
        code: 'PASSWORD_RESET_UPDATE_ERROR'
      });
    }
  }

  /**
   * Get recent password reset requests for a user
   * @param {number} userId - User ID
   * @param {number} limit - Number of records to return
   * @param {Object} connection - Optional database connection
   * @returns {Promise<Array>} Array of password reset records
   */
  async getRecentRequests(userId, limit = 5, connection = null) {
    try {
      const db = connection || this.getDB();
      const query = `
        SELECT id, user_id, token, expires_at, used, created_at
        FROM password_resets 
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `;
      
      const [rows] = await db.execute(query, [userId, limit]);
      return rows;
    } catch (error) {
      throw createAppError({
        message: 'Failed to get recent password reset requests',
        statusCode: 500,
        code: 'PASSWORD_RESET_FETCH_ERROR'
      });
    }
  }

  /**
   * Check if user has recent password reset request
   * @param {number} userId - User ID
   * @param {number} minutes - Time window in minutes
   * @param {Object} connection - Optional database connection
   * @returns {Promise<boolean>} True if recent request exists
   */
  async hasRecentRequest(userId, minutes = 5, connection = null) {
    try {
      const db = connection || this.getDB();
      const query = `
        SELECT COUNT(*) as count
        FROM password_resets 
        WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)
      `;
      
      const [rows] = await db.execute(query, [userId, minutes]);
      return rows[0].count > 0;
    } catch (error) {
      throw createAppError({
        message: 'Failed to check recent password reset request',
        statusCode: 500,
        code: 'PASSWORD_RESET_CHECK_ERROR'
      });
    }
  }
}

module.exports = PasswordResetRepository;
