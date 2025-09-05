/**
 * Product Composition
 * Dependency injection wiring for product module
 */

const { getDB } = require('../../config/database');

// Repositories
const ProductRepository = require('../repositories/productRepository');
const CategoryRepository = require('../repositories/categoryRepository');
const ProductImageRepository = require('../repositories/productImageRepository');

// Services
const ProductService = require('../services/productService');

// Controllers
const ProductController = require('../../controllers/productController');

/**
 * Initialize and wire all product dependencies
 * @returns {Object} Composed dependencies
 */
const initializeProductComposition = () => {
  // Initialize repositories with dependency injection
  const productRepository = new ProductRepository({ getDB });
  const categoryRepository = new CategoryRepository({ getDB });
  const productImageRepository = new ProductImageRepository({ getDB });

  // Initialize services with dependency injection
  const productService = new ProductService({
    productRepository,
    categoryRepository,
    productImageRepository
  });

  // Initialize controllers with dependency injection
  const productController = new ProductController({
    productService
  });

  return {
    // Repositories
    productRepository,
    categoryRepository,
    productImageRepository,

    // Services
    productService,

    // Controllers
    productController
  };
};

module.exports = {
  initializeProductComposition
};
