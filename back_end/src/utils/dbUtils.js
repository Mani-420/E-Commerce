/**
 * Database Utility Functions
 * Helper functions for database operations and connection management
 */

const { getDB, testConnection } = require('../config/database');

/**
 * Start database connection and test it
 * @returns {Promise<boolean>} Connection status
 */
const startDB = async () => {
  try {
    console.log('🔧 Testing database connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
};

/**
 * Get database connection
 * @returns {Object} Database connection
 */
const getDatabaseConnection = () => {
  return getDB();
};

/**
 * Execute a query with parameters
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @param {Object} connection - Optional connection for transactions
 * @returns {Promise<Array>} Query results
 */
const executeQuery = async (query, params = [], connection = null) => {
  const db = connection || getDB();
  const [rows] = await db.execute(query, params);
  return rows;
};

/**
 * Begin a transaction
 * @returns {Promise<Object>} Transaction connection
 */
const beginTransaction = async () => {
  const connection = await getDB().getConnection();
  await connection.beginTransaction();
  return connection;
};

/**
 * Commit a transaction
 * @param {Object} connection - Transaction connection
 */
const commitTransaction = async (connection) => {
  await connection.commit();
  connection.release();
};

/**
 * Rollback a transaction
 * @param {Object} connection - Transaction connection
 */
const rollbackTransaction = async (connection) => {
  await connection.rollback();
  connection.release();
};

/**
 * Close database connection
 * @returns {Promise<void>}
 */
const closeDB = async () => {
  const { closeDB: closeConnection } = require('../config/database');
  await closeConnection();
};

module.exports = {
  startDB,
  getDatabaseConnection,
  executeQuery,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
  closeDB
};
