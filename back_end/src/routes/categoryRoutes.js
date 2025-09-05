/**
 * Category Routes
 * Defines all category-related API endpoints
 */

const express = require('express');
const router = express.Router();

// Import validation schemas
const {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
  categorySlugSchema,
  categoryQuerySchema,
  categoryWithProductsQuerySchema
} = require('../validators/categoryValidators');

// Import middleware
const { validate } = require('../middleware/validationMiddleware');
const { generalRateLimit } = require('../middleware/rateLimitMiddleware');

/**
 * Setup category routes
 * @param {Object} dependencies - Composed dependencies
 * @returns {Object} Express router
 */
const setupCategoryRoutes = (dependencies) => {
  const { categoryController, authMiddleware } = dependencies;

  // Public routes (no authentication required)
  
  // Get all categories with filtering
  router.get('/',
    generalRateLimit,
    validate(categoryQuerySchema, 'query'),
    categoryController.getCategories
  );

  // Get active categories (public endpoint)
  router.get('/active',
    generalRateLimit,
    categoryController.getActiveCategories
  );

  // Get category by ID
  router.get('/:id',
    generalRateLimit,
    validate(categoryIdSchema, 'params'),
    categoryController.getCategoryById
  );

  // Get category by slug
  router.get('/slug/:slug',
    generalRateLimit,
    validate(categorySlugSchema, 'params'),
    categoryController.getCategoryBySlug
  );

  // Get category with products
  router.get('/:id/products',
    generalRateLimit,
    validate(categoryWithProductsQuerySchema, 'query'),
    categoryController.getCategoryWithProducts
  );

  // Protected routes (Admin/Seller only)
  
  // Create new category
  router.post('/',
    generalRateLimit,
    authMiddleware.authenticate,
    authMiddleware.requireRole(['ADMIN', 'SELLER']),
    validate(createCategorySchema),
    categoryController.createCategory
  );

  // Update category
  router.put('/:id',
    generalRateLimit,
    authMiddleware.authenticate,
    authMiddleware.requireRole(['ADMIN', 'SELLER']),
    validate(updateCategorySchema, 'body'),
    categoryController.updateCategory
  );

  // Delete category
  router.delete('/:id',
    generalRateLimit,
    authMiddleware.authenticate,
    authMiddleware.requireRole(['ADMIN', 'SELLER']),
    validate(categoryIdSchema, 'params'),
    categoryController.deleteCategory
  );

  return router;
};

module.exports = setupCategoryRoutes;
