/**
 * Database configuration
 * Handles MySQL database connection setup and configuration
 */

require('dotenv').config();

const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'manitahir9211',
  database: process.env.DB_NAME || 'ecommerce_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

// Create connection pool
let pool = null;

/**
 * Get database connection pool
 * @returns {mysql.Pool} Database connection pool
 */
const getDB = () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

/**
 * Close database connection pool
 * @returns {Promise<void>}
 */
const closeDB = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection status
 */
const testConnection = async () => {
  try {
    const connection = await getDB().getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

module.exports = {
  getDB,
  closeDB,
  testConnection,
  dbConfig
};
