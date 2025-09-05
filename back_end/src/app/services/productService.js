/**
 * Product Service
 * Handles product-related business logic and operations
 */

const { createAppError } = require('../../utils/errorHandler');
const { API_MESSAGES } = require('../../constants/apiMessages');
const { PRODUCT_STATUSES } = require('../../constants/productStatuses');

class ProductService {
  /**
   * Constructor with dependency injection
   * @param {Object} dependencies - Dependencies object
   */
  constructor({ productRepository, categoryRepository, productImageRepository }) {
    this.productRepository = productRepository;
    this.categoryRepository = categoryRepository;
    this.productImageRepository = productImageRepository;
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @param {number} userId - User ID creating the product
   * @returns {Promise<Object>} Created product
   */
  async createProduct(productData, userId) {
    try {
      const {
        name, description, sku, price, compare_price, cost_price,
        stock_quantity, low_stock_threshold, weight, dimensions,
        category_id, brand, status, is_featured, meta_title,
        meta_description, tags
      } = productData;

      // Validate category exists
      const category = await this.categoryRepository.findById(category_id);
      if (!category) {
        throw createAppError({
          message: 'Category not found',
          statusCode: 404,
          code: 'CATEGORY_NOT_FOUND'
        });
      }

      // Generate slug from name
      const slug = this.generateSlug(name);

      // Check if SKU already exists
      const skuExists = await this.productRepository.skuExists(sku);
      if (skuExists) {
        throw createAppError({
          message: API_MESSAGES.PRODUCT_SKU_EXISTS,
          statusCode: 409,
          code: 'PRODUCT_SKU_EXISTS'
        });
      }

      // Check if slug already exists
      const slugExists = await this.productRepository.slugExists(slug);
      if (slugExists) {
        throw createAppError({
          message: API_MESSAGES.PRODUCT_SLUG_EXISTS,
          statusCode: 409,
          code: 'PRODUCT_SLUG_EXISTS'
        });
      }

      // Prepare product data
      const newProductData = {
        name,
        description,
        slug,
        sku,
        price: parseFloat(price),
        compare_price: compare_price ? parseFloat(compare_price) : null,
        cost_price: cost_price ? parseFloat(cost_price) : null,
        stock_quantity: parseInt(stock_quantity) || 0,
        low_stock_threshold: parseInt(low_stock_threshold) || 5,
        weight: weight ? parseFloat(weight) : null,
        dimensions: dimensions ? JSON.stringify(dimensions) : null,
        category_id: parseInt(category_id),
        brand: brand || null,
        status: status || PRODUCT_STATUSES.DRAFT,
        is_featured: is_featured || false,
        meta_title: meta_title || null,
        meta_description: meta_description || null,
        tags: tags ? JSON.stringify(tags) : null,
        created_by: userId
      };

      // Create product
      const product = await this.productRepository.create(newProductData);

      return {
        success: true,
        message: API_MESSAGES.PRODUCT_CREATED,
        data: product
      };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to create product',
        statusCode: 500,
        code: 'PRODUCT_CREATE_ERROR'
      });
    }
  }

  /**
   * Get product by ID
   * @param {number} id - Product ID
   * @returns {Promise<Object>} Product data
   */
  async getProductById(id) {
    try {
      const product = await this.productRepository.findById(id);
      
      if (!product) {
        throw createAppError({
          message: API_MESSAGES.PRODUCT_NOT_FOUND,
          statusCode: 404,
          code: 'PRODUCT_NOT_FOUND'
        });
      }

      // Get product images
      const images = await this.productImageRepository.findByProductId(id);

      return {
        success: true,
        data: {
          ...product,
          images
        }
      };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to get product',
        statusCode: 500,
        code: 'PRODUCT_GET_ERROR'
      });
    }
  }

  /**
   * Get product by slug
   * @param {string} slug - Product slug
   * @returns {Promise<Object>} Product data
   */
  async getProductBySlug(slug) {
    try {
      const product = await this.productRepository.findBySlug(slug);
      
      if (!product) {
        throw createAppError({
          message: API_MESSAGES.PRODUCT_NOT_FOUND,
          statusCode: 404,
          code: 'PRODUCT_NOT_FOUND'
        });
      }

      // Get product images
      const images = await this.productImageRepository.findByProductId(product.id);

      return {
        success: true,
        data: {
          ...product,
          images
        }
      };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to get product by slug',
        statusCode: 500,
        code: 'PRODUCT_GET_ERROR'
      });
    }
  }

  /**
   * Get all products with filtering
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Products data with pagination
   */
  async getAllProducts(filters = {}) {
    try {
      const {
        page = 1, limit = 20, status, category_id, is_featured,
        min_price, max_price, in_stock, brand, sort, order
      } = filters;
      
      // Calculate offset
      const offset = (page - 1) * limit;
      
      // Build filter object
      const filterOptions = {
        limit: parseInt(limit),
        offset: parseInt(offset)
      };
      
      if (status) filterOptions.status = status;
      if (category_id) filterOptions.category_id = parseInt(category_id);
      if (is_featured !== undefined) filterOptions.is_featured = is_featured === 'true';
      if (min_price) filterOptions.min_price = parseFloat(min_price);
      if (max_price) filterOptions.max_price = parseFloat(max_price);
      if (in_stock === 'true') filterOptions.in_stock = true;
      if (brand) filterOptions.brand = brand;
      if (sort) filterOptions.sort = sort;
      if (order) filterOptions.order = order;

      // Get products
      const products = await this.productRepository.findAll(filterOptions);

      // Get total count for pagination
      const totalCount = await this.getProductCount(filterOptions);

      return {
        success: true,
        data: {
          products,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount,
            pages: Math.ceil(totalCount / limit)
          }
        }
      };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to get products',
        statusCode: 500,
        code: 'PRODUCT_GET_ERROR'
      });
    }
  }

  /**
   * Get active products (for public use)
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Active products data
   */
  async getActiveProducts(filters = {}) {
    try {
      const products = await this.productRepository.findActive(filters);

      return {
        success: true,
        data: products
      };
    } catch (error) {
      throw createAppError({
        message: 'Failed to get active products',
        statusCode: 500,
        code: 'PRODUCT_GET_ERROR'
      });
    }
  }

  /**
   * Get products by category
   * @param {number} categoryId - Category ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Products data
   */
  async getProductsByCategory(categoryId, filters = {}) {
    try {
      const products = await this.productRepository.findByCategory(categoryId, filters);

      return {
        success: true,
        data: products
      };
    } catch (error) {
      throw createAppError({
        message: 'Failed to get products by category',
        statusCode: 500,
        code: 'PRODUCT_GET_ERROR'
      });
    }
  }

  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} filters - Additional filter options
   * @returns {Promise<Object>} Search results
   */
  async searchProducts(query, filters = {}) {
    try {
      if (!query || query.trim().length < 2) {
        throw createAppError({
          message: 'Search query must be at least 2 characters long',
          statusCode: 400,
          code: 'INVALID_SEARCH_QUERY'
        });
      }

      const {
        page = 1, limit = 20, status, category_id,
        min_price, max_price, sort, order
      } = filters;
      
      // Calculate offset
      const offset = (page - 1) * limit;
      
      // Build filter object
      const filterOptions = {
        limit: parseInt(limit),
        offset: parseInt(offset)
      };
      
      if (status) filterOptions.status = status;
      if (category_id) filterOptions.category_id = parseInt(category_id);
      if (min_price) filterOptions.min_price = parseFloat(min_price);
      if (max_price) filterOptions.max_price = parseFloat(max_price);
      if (sort) filterOptions.sort = sort;
      if (order) filterOptions.order = order;

      // Search products
      const products = await this.productRepository.search(query.trim(), filterOptions);

      // Get total count for pagination
      const totalCount = await this.getSearchCount(query.trim(), filterOptions);

      return {
        success: true,
        data: {
          products,
          query: query.trim(),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount,
            pages: Math.ceil(totalCount / limit)
          }
        }
      };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to search products',
        statusCode: 500,
        code: 'PRODUCT_SEARCH_ERROR'
      });
    }
  }

  /**
   * Get featured products
   * @param {number} limit - Maximum number of products
   * @returns {Promise<Object>} Featured products data
   */
  async getFeaturedProducts(limit = 10) {
    try {
      const products = await this.productRepository.findFeatured(parseInt(limit));

      return {
        success: true,
        data: products
      };
    } catch (error) {
      throw createAppError({
        message: 'Failed to get featured products',
        statusCode: 500,
        code: 'PRODUCT_GET_ERROR'
      });
    }
  }

  /**
   * Update product
   * @param {number} id - Product ID
   * @param {Object} updateData - Data to update
   * @param {number} userId - User ID updating the product
   * @returns {Promise<Object>} Updated product
   */
  async updateProduct(id, updateData, userId) {
    try {
      const {
        name, description, sku, price, compare_price, cost_price,
        stock_quantity, low_stock_threshold, weight, dimensions,
        category_id, brand, status, is_featured, meta_title,
        meta_description, tags
      } = updateData;

      // Check if product exists
      const existingProduct = await this.productRepository.findById(id);
      if (!existingProduct) {
        throw createAppError({
          message: API_MESSAGES.PRODUCT_NOT_FOUND,
          statusCode: 404,
          code: 'PRODUCT_NOT_FOUND'
        });
      }

      // Validate category if provided
      if (category_id && category_id !== existingProduct.category_id) {
        const category = await this.categoryRepository.findById(category_id);
        if (!category) {
          throw createAppError({
            message: 'Category not found',
            statusCode: 404,
            code: 'CATEGORY_NOT_FOUND'
          });
        }
      }

      // Check if SKU already exists (excluding current product)
      if (sku && sku !== existingProduct.sku) {
        const skuExists = await this.productRepository.skuExists(sku, id);
        if (skuExists) {
          throw createAppError({
            message: API_MESSAGES.PRODUCT_SKU_EXISTS,
            statusCode: 409,
            code: 'PRODUCT_SKU_EXISTS'
          });
        }
      }

      // Generate new slug if name changed
      let slug = existingProduct.slug;
      if (name && name !== existingProduct.name) {
        slug = this.generateSlug(name);
        
        // Check if new slug already exists
        const slugExists = await this.productRepository.slugExists(slug, id);
        if (slugExists) {
          throw createAppError({
            message: API_MESSAGES.PRODUCT_SLUG_EXISTS,
            statusCode: 409,
            code: 'PRODUCT_SLUG_EXISTS'
          });
        }
      }

      // Prepare update data
      const updateFields = {};
      if (name !== undefined) updateFields.name = name;
      if (description !== undefined) updateFields.description = description;
      if (sku !== undefined) updateFields.sku = sku;
      if (price !== undefined) updateFields.price = parseFloat(price);
      if (compare_price !== undefined) updateFields.compare_price = compare_price ? parseFloat(compare_price) : null;
      if (cost_price !== undefined) updateFields.cost_price = cost_price ? parseFloat(cost_price) : null;
      if (stock_quantity !== undefined) updateFields.stock_quantity = parseInt(stock_quantity);
      if (low_stock_threshold !== undefined) updateFields.low_stock_threshold = parseInt(low_stock_threshold);
      if (weight !== undefined) updateFields.weight = weight ? parseFloat(weight) : null;
      if (dimensions !== undefined) updateFields.dimensions = dimensions ? JSON.stringify(dimensions) : null;
      if (category_id !== undefined) updateFields.category_id = parseInt(category_id);
      if (brand !== undefined) updateFields.brand = brand;
      if (status !== undefined) updateFields.status = status;
      if (is_featured !== undefined) updateFields.is_featured = is_featured;
      if (meta_title !== undefined) updateFields.meta_title = meta_title;
      if (meta_description !== undefined) updateFields.meta_description = meta_description;
      if (tags !== undefined) updateFields.tags = tags ? JSON.stringify(tags) : null;
      if (slug !== existingProduct.slug) updateFields.slug = slug;

      // Update product
      const updatedProduct = await this.productRepository.update(id, updateFields);

      return {
        success: true,
        message: API_MESSAGES.PRODUCT_UPDATED,
        data: updatedProduct
      };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to update product',
        statusCode: 500,
        code: 'PRODUCT_UPDATE_ERROR'
      });
    }
  }

  /**
   * Update product stock
   * @param {number} id - Product ID
   * @param {number} quantity - New stock quantity
   * @param {number} userId - User ID updating the stock
   * @returns {Promise<Object>} Updated product
   */
  async updateProductStock(id, quantity, userId) {
    try {
      // Check if product exists
      const product = await this.productRepository.findById(id);
      if (!product) {
        throw createAppError({
          message: API_MESSAGES.PRODUCT_NOT_FOUND,
          statusCode: 404,
          code: 'PRODUCT_NOT_FOUND'
        });
      }

      // Update stock
      const updatedProduct = await this.productRepository.updateStock(id, parseInt(quantity));

      return {
        success: true,
        message: API_MESSAGES.PRODUCT_STOCK_UPDATED,
        data: updatedProduct
      };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to update product stock',
        statusCode: 500,
        code: 'PRODUCT_UPDATE_ERROR'
      });
    }
  }

  /**
   * Delete product
   * @param {number} id - Product ID
   * @param {number} userId - User ID deleting the product
   * @returns {Promise<Object>} Deletion result
   */
  async deleteProduct(id, userId) {
    try {
      // Check if product exists
      const product = await this.productRepository.findById(id);
      if (!product) {
        throw createAppError({
          message: API_MESSAGES.PRODUCT_NOT_FOUND,
          statusCode: 404,
          code: 'PRODUCT_NOT_FOUND'
        });
      }

      // Soft delete product
      await this.productRepository.softDelete(id);

      return {
        success: true,
        message: API_MESSAGES.PRODUCT_DELETED
      };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to delete product',
        statusCode: 500,
        code: 'PRODUCT_DELETE_ERROR'
      });
    }
  }

  /**
   * Generate URL-friendly slug from name
   * @param {string} name - Product name
   * @returns {string} Generated slug
   */
  generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Generate unique SKU from product name
   * @param {string} name - Product name
   * @returns {string} Generated SKU
   */
  generateSKU(name) {
    const timestamp = Date.now().toString().slice(-6);
    const namePrefix = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 4);
    return `${namePrefix}-${timestamp}`;
  }

  /**
   * Get total product count for pagination
   * @param {Object} filters - Filter options
   * @returns {Promise<number>} Total count
   */
  async getProductCount(filters = {}) {
    try {
      const products = await this.productRepository.findAll(filters);
      return products.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get total search count for pagination
   * @param {string} query - Search query
   * @param {Object} filters - Filter options
   * @returns {Promise<number>} Total count
   */
  async getSearchCount(query, filters = {}) {
    try {
      const products = await this.productRepository.search(query, filters);
      return products.length;
    } catch (error) {
      return 0;
    }
  }
}

module.exports = ProductService;
