/**
 * Product Repository
 * Handles all product-related database operations with dependency injection
 */

const { createAppError } = require('../../utils/errorHandler');

class ProductRepository {
  /**
   * Constructor with dependency injection
   * @param {Object} dependencies - Dependencies object
   * @param {Function} dependencies.getDB - Database connection function
   */
  constructor({ getDB }) {
    this.getDB = getDB;
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data to create
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Object>} Created product object
   */
  async create(productData, connection = null) {
    try {
      const db = connection || this.getDB();
      const {
        name, description, slug, sku, price, compare_price, cost_price,
        stock_quantity, low_stock_threshold, weight, dimensions,
        category_id, brand, status, is_featured, meta_title,
        meta_description, tags, created_by
      } = productData;

      const query = `
        INSERT INTO products (
          name, description, slug, sku, price, compare_price, cost_price,
          stock_quantity, low_stock_threshold, weight, dimensions,
          category_id, brand, status, is_featured, meta_title,
          meta_description, tags, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await db.execute(query, [
        name, description, slug, sku, price, compare_price, cost_price,
        stock_quantity, low_stock_threshold, weight, dimensions,
        category_id, brand, status, is_featured, meta_title,
        meta_description, tags, created_by
      ]);

      return await this.findById(result.insertId, connection);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw createAppError({
          message: 'Product with this SKU or slug already exists',
          statusCode: 409,
          code: 'PRODUCT_DUPLICATE_ERROR'
        });
      }
      throw createAppError({
        message: 'Failed to create product',
        statusCode: 500,
        code: 'PRODUCT_CREATE_ERROR'
      });
    }
  }

  /**
   * Find product by ID
   * @param {number} id - Product ID
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Object|null>} Product object or null if not found
   */
  async findById(id, connection = null) {
    try {
      const db = connection || this.getDB();
      
      const query = `
        SELECT p.*, 
               c.name as category_name,
               c.slug as category_slug,
               u.first_name as created_by_name,
               u.last_name as created_by_last_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        JOIN users u ON p.created_by = u.id
        WHERE p.id = ? AND p.deleted_at IS NULL
      `;
      
      const [rows] = await db.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw createAppError({
        message: 'Failed to find product',
        statusCode: 500,
        code: 'PRODUCT_FIND_ERROR'
      });
    }
  }

  /**
   * Find product by slug
   * @param {string} slug - Product slug
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Object|null>} Product object or null if not found
   */
  async findBySlug(slug, connection = null) {
    try {
      const db = connection || this.getDB();
      
      const query = `
        SELECT p.*, 
               c.name as category_name,
               c.slug as category_slug,
               u.first_name as created_by_name,
               u.last_name as created_by_last_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        JOIN users u ON p.created_by = u.id
        WHERE p.slug = ? AND p.deleted_at IS NULL
      `;
      
      const [rows] = await db.execute(query, [slug]);
      return rows[0] || null;
    } catch (error) {
      throw createAppError({
        message: 'Failed to find product by slug',
        statusCode: 500,
        code: 'PRODUCT_FIND_ERROR'
      });
    }
  }

  /**
   * Find product by SKU
   * @param {string} sku - Product SKU
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Object|null>} Product object or null if not found
   */
  async findBySku(sku, connection = null) {
    try {
      const db = connection || this.getDB();
      
      const query = `
        SELECT p.*, 
               c.name as category_name,
               c.slug as category_slug
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.sku = ? AND p.deleted_at IS NULL
      `;
      
      const [rows] = await db.execute(query, [sku]);
      return rows[0] || null;
    } catch (error) {
      throw createAppError({
        message: 'Failed to find product by SKU',
        statusCode: 500,
        code: 'PRODUCT_FIND_ERROR'
      });
    }
  }

  /**
   * Find all products with optional filtering
   * @param {Object} filters - Filter options
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Array>} Array of product objects
   */
  async findAll(filters = {}, connection = null) {
    try {
      const db = connection || this.getDB();
      
      let query = `
        SELECT p.*, 
               c.name as category_name,
               c.slug as category_slug
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.deleted_at IS NULL
      `;
      
      const params = [];
      
      // Add filters
      if (filters.status) {
        query += ' AND p.status = ?';
        params.push(filters.status);
      }
      
      if (filters.category_id) {
        query += ' AND p.category_id = ?';
        params.push(filters.category_id);
      }
      
      if (filters.is_featured !== undefined) {
        query += ' AND p.is_featured = ?';
        params.push(filters.is_featured);
      }
      
      if (filters.min_price) {
        query += ' AND p.price >= ?';
        params.push(filters.min_price);
      }
      
      if (filters.max_price) {
        query += ' AND p.price <= ?';
        params.push(filters.max_price);
      }
      
      if (filters.in_stock) {
        query += ' AND p.stock_quantity > 0';
      }
      
      if (filters.brand) {
        query += ' AND p.brand = ?';
        params.push(filters.brand);
      }
      
      // Add ordering
      const orderBy = filters.sort || 'created_at';
      const orderDirection = filters.order || 'DESC';
      query += ` ORDER BY p.${orderBy} ${orderDirection}`;
      
      // Add pagination
      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(parseInt(filters.limit));
        
        if (filters.offset) {
          query += ' OFFSET ?';
          params.push(parseInt(filters.offset));
        }
      }
      
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      throw createAppError({
        message: 'Failed to find products',
        statusCode: 500,
        code: 'PRODUCT_FIND_ERROR'
      });
    }
  }

  /**
   * Find only active products
   * @param {Object} filters - Filter options
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Array>} Array of active product objects
   */
  async findActive(filters = {}, connection = null) {
    return this.findAll({ ...filters, status: 'ACTIVE' }, connection);
  }

  /**
   * Find products by category
   * @param {number} categoryId - Category ID
   * @param {Object} filters - Filter options
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Array>} Array of product objects
   */
  async findByCategory(categoryId, filters = {}, connection = null) {
    return this.findAll({ ...filters, category_id: categoryId }, connection);
  }

  /**
   * Search products by name and description
   * @param {string} query - Search query
   * @param {Object} filters - Additional filter options
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Array>} Array of matching product objects
   */
  async search(query, filters = {}, connection = null) {
    try {
      const db = connection || this.getDB();
      
      let searchQuery = `
        SELECT p.*, 
               c.name as category_name,
               c.slug as category_slug
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.deleted_at IS NULL
        AND (p.name LIKE ? OR p.description LIKE ?)
      `;
      
      const searchTerm = `%${query}%`;
      const params = [searchTerm, searchTerm];
      
      // Add additional filters
      if (filters.status) {
        searchQuery += ' AND p.status = ?';
        params.push(filters.status);
      }
      
      if (filters.category_id) {
        searchQuery += ' AND p.category_id = ?';
        params.push(filters.category_id);
      }
      
      if (filters.min_price) {
        searchQuery += ' AND p.price >= ?';
        params.push(filters.min_price);
      }
      
      if (filters.max_price) {
        searchQuery += ' AND p.price <= ?';
        params.push(filters.max_price);
      }
      
      // Add ordering
      const orderBy = filters.sort || 'name';
      const orderDirection = filters.order || 'ASC';
      searchQuery += ` ORDER BY p.${orderBy} ${orderDirection}`;
      
      // Add pagination
      if (filters.limit) {
        searchQuery += ' LIMIT ?';
        params.push(parseInt(filters.limit));
        
        if (filters.offset) {
          searchQuery += ' OFFSET ?';
          params.push(parseInt(filters.offset));
        }
      }
      
      const [rows] = await db.execute(searchQuery, params);
      return rows;
    } catch (error) {
      throw createAppError({
        message: 'Failed to search products',
        statusCode: 500,
        code: 'PRODUCT_SEARCH_ERROR'
      });
    }
  }

  /**
   * Find featured products
   * @param {number} limit - Maximum number of products to return
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Array>} Array of featured product objects
   */
  async findFeatured(limit = 10, connection = null) {
    return this.findAll({ is_featured: true, status: 'ACTIVE', limit }, connection);
  }

  /**
   * Update product by ID
   * @param {number} id - Product ID
   * @param {Object} updateData - Data to update
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Object>} Updated product object
   */
  async update(id, updateData, connection = null) {
    try {
      const db = connection || this.getDB();
      
      const allowedFields = [
        'name', 'description', 'slug', 'sku', 'price', 'compare_price', 'cost_price',
        'stock_quantity', 'low_stock_threshold', 'weight', 'dimensions',
        'category_id', 'brand', 'status', 'is_featured', 'meta_title',
        'meta_description', 'tags'
      ];
      
      const updateFields = [];
      const values = [];
      
      // Build dynamic update query
      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updateFields.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      if (updateFields.length === 0) {
        throw createAppError({
          message: 'No valid fields to update',
          statusCode: 400,
          code: 'PRODUCT_UPDATE_ERROR'
        });
      }
      
      values.push(id);
      
      const query = `
        UPDATE products 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      const [result] = await db.execute(query, values);
      
      if (result.affectedRows === 0) {
        throw createAppError({
          message: 'Product not found',
          statusCode: 404,
          code: 'PRODUCT_NOT_FOUND'
        });
      }
      
      return await this.findById(id, connection);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw createAppError({
          message: 'Product with this SKU or slug already exists',
          statusCode: 409,
          code: 'PRODUCT_DUPLICATE_ERROR'
        });
      }
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
   * Update product stock quantity
   * @param {number} id - Product ID
   * @param {number} quantity - New stock quantity
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Object>} Updated product object
   */
  async updateStock(id, quantity, connection = null) {
    try {
      const db = connection || this.getDB();
      
      const query = `
        UPDATE products 
        SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      const [result] = await db.execute(query, [quantity, id]);
      
      if (result.affectedRows === 0) {
        throw createAppError({
          message: 'Product not found',
          statusCode: 404,
          code: 'PRODUCT_NOT_FOUND'
        });
      }
      
      return await this.findById(id, connection);
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
   * Soft delete product by ID
   * @param {number} id - Product ID
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async softDelete(id, connection = null) {
    try {
      const db = connection || this.getDB();
      
      const query = `
        UPDATE products 
        SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      const [result] = await db.execute(query, [id]);
      
      if (result.affectedRows === 0) {
        throw createAppError({
          message: 'Product not found',
          statusCode: 404,
          code: 'PRODUCT_NOT_FOUND'
        });
      }
      
      return true;
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
   * Check if product SKU exists
   * @param {string} sku - Product SKU
   * @param {number} excludeId - Product ID to exclude from check
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<boolean>} True if SKU exists
   */
  async skuExists(sku, excludeId = null, connection = null) {
    try {
      const db = connection || this.getDB();
      
      let query = 'SELECT id FROM products WHERE sku = ? AND deleted_at IS NULL';
      const params = [sku];
      
      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      
      const [rows] = await db.execute(query, params);
      return rows.length > 0;
    } catch (error) {
      throw createAppError({
        message: 'Failed to check product SKU',
        statusCode: 500,
        code: 'PRODUCT_CHECK_ERROR'
      });
    }
  }

  /**
   * Check if product slug exists
   * @param {string} slug - Product slug
   * @param {number} excludeId - Product ID to exclude from check
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<boolean>} True if slug exists
   */
  async slugExists(slug, excludeId = null, connection = null) {
    try {
      const db = connection || this.getDB();
      
      let query = 'SELECT id FROM products WHERE slug = ? AND deleted_at IS NULL';
      const params = [slug];
      
      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      
      const [rows] = await db.execute(query, params);
      return rows.length > 0;
    } catch (error) {
      throw createAppError({
        message: 'Failed to check product slug',
        statusCode: 500,
        code: 'PRODUCT_CHECK_ERROR'
      });
    }
  }
}

module.exports = ProductRepository;
