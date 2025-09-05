/**
 * Category Controller
 * Handles category-related API endpoints
 */

const asyncHandler = require('../utils/asyncHandler');
const ResponseFactory = require('../app/factories/responseFactory');
const { API_MESSAGES } = require('../constants/apiMessages');

class CategoryController {
  /**
   * Constructor with dependency injection
   * @param {Object} dependencies - Dependencies object
   */
  constructor({ categoryService }) {
    this.categoryService = categoryService;

    // Bind methods with asyncHandler
    this.createCategory = asyncHandler(this.createCategory.bind(this));
    this.getCategories = asyncHandler(this.getCategories.bind(this));
    this.getCategoryById = asyncHandler(this.getCategoryById.bind(this));
    this.getCategoryBySlug = asyncHandler(this.getCategoryBySlug.bind(this));
    this.updateCategory = asyncHandler(this.updateCategory.bind(this));
    this.deleteCategory = asyncHandler(this.deleteCategory.bind(this));
    this.getCategoryWithProducts = asyncHandler(this.getCategoryWithProducts.bind(this));
  }

  /**
   * Create a new category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createCategory(req, res) {
    const categoryData = req.body;
    const userId = req.user.id;

    const result = await this.categoryService.createCategory(categoryData, userId);

    res.status(201).json(ResponseFactory.success(
      result.data,
      result.message,
      201
    ));
  }

  /**
   * Get all categories with filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCategories(req, res) {
    const filters = req.query;

    const result = await this.categoryService.getAllCategories(filters);

    res.json(ResponseFactory.success(
      result.data,
      'Categories retrieved successfully'
    ));
  }

  /**
   * Get active categories (public endpoint)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getActiveCategories(req, res) {
    const result = await this.categoryService.getActiveCategories();

    res.json(ResponseFactory.success(
      result.data,
      'Active categories retrieved successfully'
    ));
  }

  /**
   * Get category by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCategoryById(req, res) {
    const { id } = req.params;

    const result = await this.categoryService.getCategoryById(id);

    res.json(ResponseFactory.success(
      result.data,
      'Category retrieved successfully'
    ));
  }

  /**
   * Get category by slug
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCategoryBySlug(req, res) {
    const { slug } = req.params;

    const result = await this.categoryService.getCategoryBySlug(slug);

    res.json(ResponseFactory.success(
      result.data,
      'Category retrieved successfully'
    ));
  }

  /**
   * Update category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateCategory(req, res) {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    const result = await this.categoryService.updateCategory(id, updateData, userId);

    res.json(ResponseFactory.success(
      result.data,
      result.message
    ));
  }

  /**
   * Delete category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteCategory(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await this.categoryService.deleteCategory(id, userId);

    res.json(ResponseFactory.success(
      null,
      result.message
    ));
  }

  /**
   * Get category with its products
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCategoryWithProducts(req, res) {
    const { id } = req.params;
    const filters = req.query;

    const result = await this.categoryService.getCategoryWithProducts(id, filters);

    res.json(ResponseFactory.success(
      result.data,
      'Category with products retrieved successfully'
    ));
  }
}

module.exports = CategoryController;
