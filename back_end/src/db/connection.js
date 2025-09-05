/**
 * Database connection module
 * Centralized database connection management following dependency injection pattern
 */

const { getDB } = require('../config/database');

/**
 * Database connection wrapper
 * Provides a clean interface for database operations
 */
class DatabaseConnection {
  constructor() {
    this.getDB = getDB;
  }

  /**
   * Execute a query with parameters
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @param {Object} connection - Optional connection for transactions
   * @returns {Promise<Array>} Query results
   */
  async query(query, params = [], connection = null) {
    const db = connection || this.getDB();
    const [rows] = await db.execute(query, params);
    return rows;
  }

  /**
   * Begin a transaction
   * @returns {Promise<Object>} Transaction connection
   */
  async beginTransaction() {
    const connection = await this.getDB().getConnection();
    await connection.beginTransaction();
    return connection;
  }

  /**
   * Commit a transaction
   * @param {Object} connection - Transaction connection
   */
  async commitTransaction(connection) {
    await connection.commit();
    connection.release();
  }

  /**
   * Rollback a transaction
   * @param {Object} connection - Transaction connection
   */
  async rollbackTransaction(connection) {
    await connection.rollback();
    connection.release();
  }

  /**
   * Get a connection from the pool
   * @returns {Promise<Object>} Database connection
   */
  async getConnection() {
    return await this.getDB().getConnection();
  }
}

module.exports = DatabaseConnection;
