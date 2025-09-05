/**
 * API Version constants
 * Defines API versioning information and configuration
 */

const API_VERSION = {
  CURRENT: 'v1',
  SUPPORTED_VERSIONS: ['v1'],
  DEFAULT_VERSION: 'v1'
};

const API_VERSION_INFO = {
  v1: {
    version: '1.0.0',
    releaseDate: '2025-01-17',
    status: 'stable',
    description: 'API version with user authentication, admin features, and product/category management'
  }
};

const API_ENDPOINTS = {
  v1: {
    auth: '/api/v1/auth',
    admin: '/api/v1/admin',
    categories: '/api/v1/categories',
    products: '/api/v1/products',
    health: '/api/health',
    version: '/api/version'
  }
};

module.exports = {
  API_VERSION,
  API_VERSION_INFO,
  API_ENDPOINTS
};
