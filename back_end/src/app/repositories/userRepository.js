/**
 * User Repository
 * Handles all user-related database operations with dependency injection
 */

const { createAppError } = require('../../utils/errorHandler');
const { USER_STATUSES } = require('../../constants/userStatuses');

class UserRepository {
  /**
   * Constructor with dependency injection
   * @param {Object} dependencies - Dependencies object
   * @param {Function} dependencies.getDB - Database connection function
   */
  constructor({ getDB }) {
    this.getDB = getDB;
  }

  /**
   * Create a new user
   * @param {Object} userData - User data to create
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Object>} Created user object
   */
  async create(userData, connection = null) {
    try {
      const db = connection || this.getDB();
      const { email, password_hash, first_name, last_name, phone, role, status } = userData;

      const query = `
        INSERT INTO users (email, password_hash, first_name, last_name, phone, role, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await db.execute(query, [
        email, password_hash, first_name, last_name, phone, role, status
      ]);

      return await this.findById(result.insertId, connection);
    } catch (error) {
      throw createAppError({
        message: 'Failed to create user',
        statusCode: 500,
        code: 'USER_CREATE_ERROR'
      });
    }
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @param {Object} connection - Optional database connection
   * @returns {Promise<Object|null>} User object or null
   */
  async findById(id, connection = null) {
    try {
      const db = connection || this.getDB();
      const query = `
        SELECT id, email, password_hash, first_name, last_name, phone, role, status, 
               email_verified_at, last_login_at, created_at, updated_at
        FROM users 
        WHERE id = ? AND status != ?
      `;
      
      const [rows] = await db.execute(query, [id, USER_STATUSES.DELETED]);
      return rows[0] || null;
    } catch (error) {
      throw createAppError({
        message: 'Failed to find user by ID',
        statusCode: 500,
        code: 'USER_FIND_ERROR'
      });
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @param {Object} connection - Optional database connection
   * @returns {Promise<Object|null>} User object or null
   */
  async findByEmail(email, connection = null) {
    try {
      const db = connection || this.getDB();
      const query = `
        SELECT id, email, password_hash, first_name, last_name, phone, role, status, 
               email_verified_at, last_login_at, created_at, updated_at
        FROM users 
        WHERE email = ? AND status != ?
      `;
      
      const [rows] = await db.execute(query, [email, USER_STATUSES.DELETED]);
      return rows[0] || null;
    } catch (error) {
      throw createAppError({
        message: 'Failed to find user by email',
        statusCode: 500,
        code: 'USER_FIND_ERROR'
      });
    }
  }

  /**
   * Update user by ID
   * @param {number} id - User ID
   * @param {Object} updateData - Data to update
   * @param {Object} connection - Optional database connection
   * @returns {Promise<Object|null>} Updated user object or null
   */
  async updateById(id, updateData, connection = null) {
    try {
      const db = connection || this.getDB();
      
      // Build dynamic query for only provided fields
      const fields = Object.keys(updateData);
      const values = Object.values(updateData);
      
      if (fields.length === 0) {
        return await this.findById(id, connection);
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const query = `
        UPDATE users 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND status != ?
      `;
      
      await db.execute(query, [...values, id, USER_STATUSES.DELETED]);
      return await this.findById(id, connection);
    } catch (error) {
      throw createAppError({
        message: 'Failed to update user',
        statusCode: 500,
        code: 'USER_UPDATE_ERROR'
      });
    }
  }

  /**
   * Update user's last login time
   * @param {number} id - User ID
   * @param {Object} connection - Optional database connection
   * @returns {Promise<Object|null>} Updated user object or null
   */
  async updateLastLogin(id, connection = null) {
    try {
      const db = connection || this.getDB();
      const query = `
        UPDATE users 
        SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND status != ?
      `;
      
      await db.execute(query, [id, USER_STATUSES.DELETED]);
      return await this.findById(id, connection);
    } catch (error) {
      throw createAppError({
        message: 'Failed to update last login',
        statusCode: 500,
        code: 'USER_UPDATE_ERROR'
      });
    }
  }

  /**
   * Soft delete user by ID
   * @param {number} id - User ID
   * @param {Object} connection - Optional database connection
   * @returns {Promise<boolean>} Success status
   */
  async deleteById(id, connection = null) {
    try {
      const db = connection || this.getDB();
      const query = `
        UPDATE users 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const [result] = await db.execute(query, [USER_STATUSES.DELETED, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw createAppError({
        message: 'Failed to delete user',
        statusCode: 500,
        code: 'USER_DELETE_ERROR'
      });
    }
  }

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @param {Object} connection - Optional database connection
   * @returns {Promise<boolean>} True if email exists
   */
  async emailExists(email, connection = null) {
    try {
      const db = connection || this.getDB();
      const query = `
        SELECT COUNT(*) as count 
        FROM users 
        WHERE email = ? AND status != ?
      `;
      
      const [rows] = await db.execute(query, [email, USER_STATUSES.DELETED]);
      return rows[0].count > 0;
    } catch (error) {
      throw createAppError({
        message: 'Failed to check email existence',
        statusCode: 500,
        code: 'USER_CHECK_ERROR'
      });
    }
  }

  /**
   * Get user statistics for admin dashboard
   * @param {Object} connection - Optional database connection
   * @returns {Promise<Object>} User statistics
   */
  async getUserStats(connection = null) {
    try {
      const db = connection || this.getDB();

      // Get total users (excluding deleted)
      const [totalResult] = await db.execute(
        'SELECT COUNT(*) as total FROM users WHERE status != ?',
        [USER_STATUSES.DELETED]
      );

      // Get active users
      const [activeResult] = await db.execute(
        'SELECT COUNT(*) as total FROM users WHERE status = ?',
        [USER_STATUSES.ACTIVE]
      );

      // Get pending verification users
      const [pendingResult] = await db.execute(
        'SELECT COUNT(*) as total FROM users WHERE status = ?',
        [USER_STATUSES.PENDING_VERIFICATION]
      );

      // Get suspended users
      const [suspendedResult] = await db.execute(
        'SELECT COUNT(*) as total FROM users WHERE status = ?',
        [USER_STATUSES.SUSPENDED]
      );

      return {
        totalUsers: totalResult[0].total,
        activeUsers: activeResult[0].total,
        pendingVerifications: pendingResult[0].total,
        suspendedUsers: suspendedResult[0].total
      };
    } catch (error) {
      throw createAppError({
        message: 'Failed to fetch user statistics',
        statusCode: 500,
        code: 'USER_STATS_ERROR'
      });
    }
  }

  /**
   * Get users with pagination
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of records to return
   * @param {number} options.offset - Number of records to skip
   * @param {string} options.role - Filter by role
   * @param {string} options.status - Filter by status
   * @param {Object} connection - Optional database connection
   * @returns {Promise<Object>} Users and pagination info
   */
  async findWithPagination(options = {}, connection = null) {
    try {
      const db = connection || this.getDB();
      const { limit = 10, offset = 0, role, status } = options;

      let whereClause = 'WHERE status != ?';
      const params = [USER_STATUSES.DELETED];

      if (role) {
        whereClause += ' AND role = ?';
        params.push(role);
      }

      if (status) {
        whereClause += ' AND status = ?';
        params.push(status);
      }

      const query = `
        SELECT id, email, first_name, last_name, phone, role, status, 
               email_verified_at, last_login_at, created_at, updated_at
        FROM users 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `;

      const countQuery = `
        SELECT COUNT(*) as total 
        FROM users 
        ${whereClause}
      `;

      const [users] = await db.execute(query, params);
      const [countResult] = await db.execute(countQuery, params);
      const total = countResult[0].total;

      return {
        users,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw createAppError({
        message: 'Failed to fetch users',
        statusCode: 500,
        code: 'USER_FETCH_ERROR'
      });
    }
  }
}

module.exports = UserRepository;
