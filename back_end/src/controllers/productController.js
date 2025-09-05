/**
 * Product Controller
 * Handles product-related API endpoints
 */

const asyncHandler = require('../utils/asyncHandler');
const ResponseFactory = require('../app/factories/responseFactory');
const { API_MESSAGES } = require('../constants/apiMessages');

class ProductController {
  /**
   * Constructor with dependency injection
   * @param {Object} dependencies - Dependencies object
   */
  constructor({ productService }) {
    this.productService = productService;

    // Bind methods with asyncHandler
    this.createProduct = asyncHandler(this.createProduct.bind(this));
    this.getProducts = asyncHandler(this.getProducts.bind(this));
    this.getActiveProducts = asyncHandler(this.getActiveProducts.bind(this));
    this.getProductById = asyncHandler(this.getProductById.bind(this));
    this.getProductBySlug = asyncHandler(this.getProductBySlug.bind(this));
    this.searchProducts = asyncHandler(this.searchProducts.bind(this));
    this.getFeaturedProducts = asyncHandler(this.getFeaturedProducts.bind(this));
    this.getProductsByCategory = asyncHandler(this.getProductsByCategory.bind(this));
    this.updateProduct = asyncHandler(this.updateProduct.bind(this));
    this.updateProductStock = asyncHandler(this.updateProductStock.bind(this));
    this.deleteProduct = asyncHandler(this.deleteProduct.bind(this));
  }

  /**
   * Create a new product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createProduct(req, res) {
    const productData = req.body;
    const userId = req.user.id;

    const result = await this.productService.createProduct(productData, userId);

    res.status(201).json(ResponseFactory.success(
      result.data,
      result.message,
      201
    ));
  }

  /**
   * Get all products with filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProducts(req, res) {
    const filters = req.query;

    const result = await this.productService.getAllProducts(filters);

    res.json(ResponseFactory.success(
      result.data,
      'Products retrieved successfully'
    ));
  }

  /**
   * Get active products (public endpoint)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getActiveProducts(req, res) {
    const filters = req.query;

    const result = await this.productService.getActiveProducts(filters);

    res.json(ResponseFactory.success(
      result.data,
      'Active products retrieved successfully'
    ));
  }

  /**
   * Get product by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProductById(req, res) {
    const { id } = req.params;

    const result = await this.productService.getProductById(id);

    res.json(ResponseFactory.success(
      result.data,
      'Product retrieved successfully'
    ));
  }

  /**
   * Get product by slug
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProductBySlug(req, res) {
    const { slug } = req.params;

    const result = await this.productService.getProductBySlug(slug);

    res.json(ResponseFactory.success(
      result.data,
      'Product retrieved successfully'
    ));
  }

  /**
   * Search products
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async searchProducts(req, res) {
    const { q: query, ...filters } = req.query;

    if (!query) {
      return res.status(400).json(ResponseFactory.error(
        'Search query is required',
        400,
        'MISSING_SEARCH_QUERY'
      ));
    }

    const result = await this.productService.searchProducts(query, filters);

    res.json(ResponseFactory.success(
      result.data,
      'Product search completed successfully'
    ));
  }

  /**
   * Get featured products
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getFeaturedProducts(req, res) {
    const { limit } = req.query;

    const result = await this.productService.getFeaturedProducts(limit);

    res.json(ResponseFactory.success(
      result.data,
      'Featured products retrieved successfully'
    ));
  }

  /**
   * Get products by category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProductsByCategory(req, res) {
    const { categoryId } = req.params;
    const filters = req.query;

    const result = await this.productService.getProductsByCategory(categoryId, filters);

    res.json(ResponseFactory.success(
      result.data,
      'Products by category retrieved successfully'
    ));
  }

  /**
   * Update product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateProduct(req, res) {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    const result = await this.productService.updateProduct(id, updateData, userId);

    res.json(ResponseFactory.success(
      result.data,
      result.message
    ));
  }

  /**
   * Update product stock
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateProductStock(req, res) {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    const result = await this.productService.updateProductStock(id, quantity, userId);

    res.json(ResponseFactory.success(
      result.data,
      result.message
    ));
  }

  /**
   * Delete product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteProduct(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await this.productService.deleteProduct(id, userId);

    res.json(ResponseFactory.success(
      null,
      result.message
    ));
  }
}

module.exports = ProductController;
