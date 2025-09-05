/**
 * Category Composition
 * Dependency injection wiring for category module
 */

const { getDB } = require('../../config/database');

// Repositories
const CategoryRepository = require('../repositories/categoryRepository');
const ProductRepository = require('../repositories/productRepository');

// Services
const CategoryService = require('../services/categoryService');

// Controllers
const CategoryController = require('../../controllers/categoryController');

/**
 * Initialize and wire all category dependencies
 * @returns {Object} Composed dependencies
 */
const initializeCategoryComposition = () => {
  // Initialize repositories with dependency injection
  const categoryRepository = new CategoryRepository({ getDB });
  const productRepository = new ProductRepository({ getDB });

  // Initialize services with dependency injection
  const categoryService = new CategoryService({
    categoryRepository,
    productRepository
  });

  // Initialize controllers with dependency injection
  const categoryController = new CategoryController({
    categoryService
  });

  return {
    // Repositories
    categoryRepository,
    productRepository,

    // Services
    categoryService,

    // Controllers
    categoryController
  };
};

module.exports = {
  initializeCategoryComposition
};
