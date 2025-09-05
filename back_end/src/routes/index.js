/**
 * Main Routes Index
 * Centralized route configuration and setup
 */

const express = require('express');
const router = express.Router();

// Import route setups
const setupAuthRoutes = require('./authRoutes');
const setupAdminRoutes = require('./adminRoutes');
const setupCategoryRoutes = require('./categoryRoutes');
const setupProductRoutes = require('./productRoutes');

// Import middleware
const { generalRateLimit } = require('../middleware/rateLimitMiddleware');

/**
 * Setup all application routes
 * @param {Object} dependencies - Composed dependencies
 * @returns {Object} Express router
 */
const setupRoutes = (dependencies) => {
  // Apply general rate limiting to all routes
  router.use(generalRateLimit);

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // API version info
  router.get('/version', (req, res) => {
    const { API_VERSION_INFO, API_ENDPOINTS } = require('../constants/apiVersion');
    
    res.status(200).json({
      success: true,
      currentVersion: 'v1',
      versionInfo: API_VERSION_INFO,
      endpoints: API_ENDPOINTS,
      name: 'E-commerce API',
      description: 'E-commerce Backend API with Node.js, Express, and MySQL'
    });
  });

  // Setup route modules with versioning
  router.use('/v1/auth', setupAuthRoutes(dependencies));
  router.use('/v1/admin', setupAdminRoutes(dependencies));
  router.use('/v1/categories', setupCategoryRoutes(dependencies));
  router.use('/v1/products', setupProductRoutes(dependencies));

  return router;
};

module.exports = setupRoutes;
