/**
 * Admin Routes
 * Defines all admin-only API endpoints
 */

const express = require('express');
const router = express.Router();

/**
 * Setup admin routes
 * @param {Object} dependencies - Composed dependencies
 * @returns {Object} Express router
 */
const setupAdminRoutes = (dependencies) => {
  const { adminController, authMiddleware } = dependencies;

  // All admin routes require authentication and admin role
  router.use(authMiddleware.authenticate);
  router.use(authMiddleware.adminOnly);

  // User management routes
  
  // Get all users with pagination
  router.get('/users',
    adminController.getUsers
  );

  // Get user by ID
  router.get('/users/:userId',
    adminController.getUserById
  );

  // Update user status
  router.put('/users/:userId/status',
    adminController.updateUserStatus
  );

  // Delete user (soft delete)
  router.delete('/users/:userId',
    adminController.deleteUser
  );

  // System management routes
  
  // Get system statistics
  router.get('/stats',
    adminController.getSystemStats
  );

  return router;
};

module.exports = setupAdminRoutes;
