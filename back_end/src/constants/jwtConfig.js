/**
 * JWT configuration constants
 * Defines JWT-related configuration values
 */

const JWT_CONFIG = {
  // Token expiration times
  ACCESS_TOKEN_EXPIRES_IN: '7d',
  REFRESH_TOKEN_EXPIRES_IN: '30d',
  
  // Token types
  ACCESS_TOKEN: 'access',
  REFRESH_TOKEN: 'refresh',
  
  // Algorithm
  ALGORITHM: 'HS256',
  
  // Issuer and audience
  ISSUER: 'ecommerce-api',
  AUDIENCE: 'ecommerce-client'
};

module.exports = {
  JWT_CONFIG
};
