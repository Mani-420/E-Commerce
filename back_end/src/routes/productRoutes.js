/**
 * Product Routes
 * Defines all product-related API endpoints
 */

const express = require('express');
const router = express.Router();

// Import validation schemas
const {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  productSlugSchema,
  updateProductStockSchema,
  productQuerySchema,
  productSearchQuerySchema,
  productFeaturedQuerySchema,
  productByCategoryQuerySchema
} = require('../validators/productValidators');

// Import middleware
const { validate } = require('../middleware/validationMiddleware');
const { generalRateLimit } = require('../middleware/rateLimitMiddleware');

/**
 * Setup product routes
 * @param {Object} dependencies - Composed dependencies
 * @returns {Object} Express router
 */
const setupProductRoutes = (dependencies) => {
  const { productController, authMiddleware } = dependencies;

  // Public routes (no authentication required)
  
  // Get all products with filtering
  router.get('/',
    generalRateLimit,
    validate(productQuerySchema),
    productController.getProducts
  );

  // Get active products (public endpoint)
  router.get('/active',
    generalRateLimit,
    productController.getActiveProducts
  );

  // Search products
  router.get('/search',
    generalRateLimit,
    validate(productSearchQuerySchema),
    productController.searchProducts
  );

  // Get featured products
  router.get('/featured',
    generalRateLimit,
    validate(productFeaturedQuerySchema),
    productController.getFeaturedProducts
  );

  // Get products by category
  router.get('/category/:categoryId',
    generalRateLimit,
    validate(productByCategoryQuerySchema),
    productController.getProductsByCategory
  );

  // Get product by ID
  router.get('/:id',
    generalRateLimit,
    validate(productIdSchema),
    productController.getProductById
  );

  // Get product by slug
  router.get('/slug/:slug',
    generalRateLimit,
    validate(productSlugSchema),
    productController.getProductBySlug
  );

  // Protected routes (Admin/Seller only)
  
  // Create new product
  router.post('/',
    generalRateLimit,
    authMiddleware.authenticate,
    authMiddleware.requireRole(['ADMIN', 'SELLER']),
    validate(createProductSchema),
    productController.createProduct
  );

  // Update product
  router.put('/:id',
    generalRateLimit,
    authMiddleware.authenticate,
    authMiddleware.requireRole(['ADMIN', 'SELLER']),
    validate(updateProductSchema),
    productController.updateProduct
  );

  // Update product stock
  router.patch('/:id/stock',
    generalRateLimit,
    authMiddleware.authenticate,
    authMiddleware.requireRole(['ADMIN', 'SELLER']),
    validate(updateProductStockSchema),
    productController.updateProductStock
  );

  // Delete product
  router.delete('/:id',
    generalRateLimit,
    authMiddleware.authenticate,
    authMiddleware.requireRole(['ADMIN', 'SELLER']),
    validate(productIdSchema),
    productController.deleteProduct
  );

  return router;
};

module.exports = setupProductRoutes;
