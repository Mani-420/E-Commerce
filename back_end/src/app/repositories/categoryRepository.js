/**
 * Category Repository
 * Handles all category-related database operations with dependency injection
 */

const { createAppError } = require('../../utils/errorHandler');

class CategoryRepository {
  /**
   * Constructor with dependency injection
   * @param {Object} dependencies - Dependencies object
   * @param {Function} dependencies.getDB - Database connection function
   */
  constructor({ getDB }) {
    this.getDB = getDB;
  }

  /**
   * Create a new category
   * @param {Object} categoryData - Category data to create
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Object>} Created category object
   */
  async create(categoryData, connection = null) {
    try {
      const db = connection || this.getDB();
      const { name, description, slug, parent_id, image_url, is_active, sort_order } = categoryData;

      const query = `
        INSERT INTO categories (name, description, slug, parent_id, image_url, is_active, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await db.execute(query, [
        name, description, slug, parent_id, image_url, is_active, sort_order
      ]);

      return await this.findById(result.insertId, connection);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw createAppError({
          message: 'Category with this name or slug already exists',
          statusCode: 409,
          code: 'CATEGORY_DUPLICATE_ERROR'
        });
      }
      throw createAppError({
        message: 'Failed to create category',
        statusCode: 500,
        code: 'CATEGORY_CREATE_ERROR'
      });
    }
  }

  /**
   * Find category by ID
   * @param {number} id - Category ID
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Object|null>} Category object or null if not found
   */
  async findById(id, connection = null) {
    try {
      const db = connection || this.getDB();
      
      const query = `
        SELECT c.*, 
               p.name as parent_name, 
               p.slug as parent_slug
        FROM categories c
        LEFT JOIN categories p ON c.parent_id = p.id
        WHERE c.id = ? AND c.deleted_at IS NULL
      `;
      
      const [rows] = await db.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw createAppError({
        message: 'Failed to find category',
        statusCode: 500,
        code: 'CATEGORY_FIND_ERROR'
      });
    }
  }

  /**
   * Find category by slug
   * @param {string} slug - Category slug
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Object|null>} Category object or null if not found
   */
  async findBySlug(slug, connection = null) {
    try {
      const db = connection || this.getDB();
      
      const query = `
        SELECT c.*, 
               p.name as parent_name, 
               p.slug as parent_slug
        FROM categories c
        LEFT JOIN categories p ON c.parent_id = p.id
        WHERE c.slug = ? AND c.deleted_at IS NULL
      `;
      
      const [rows] = await db.execute(query, [slug]);
      return rows[0] || null;
    } catch (error) {
      throw createAppError({
        message: 'Failed to find category by slug',
        statusCode: 500,
        code: 'CATEGORY_FIND_ERROR'
      });
    }
  }

  /**
   * Find all categories with optional filtering
   * @param {Object} filters - Filter options
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Array>} Array of category objects
   */
  async findAll(filters = {}, connection = null) {
    try {
      const db = connection || this.getDB();
      
      let query = `
        SELECT c.*, 
               p.name as parent_name, 
               p.slug as parent_slug
        FROM categories c
        LEFT JOIN categories p ON c.parent_id = p.id
        WHERE c.deleted_at IS NULL
      `;
      
      const params = [];
      
      // Add filters
      if (filters.is_active !== undefined) {
        query += ' AND c.is_active = ?';
        params.push(filters.is_active);
      }
      
      if (filters.parent_id !== undefined) {
        query += ' AND c.parent_id = ?';
        params.push(filters.parent_id);
      }
      
      // Add ordering
      query += ' ORDER BY c.sort_order ASC, c.name ASC';
      
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
      
      // Return empty array if no categories found (this is normal, not an error)
      return rows || [];
    } catch (error) {
      // Log the actual error for debugging
      console.error('Database error in CategoryRepository.findAll:', error);
      
      // Only throw error for actual database issues, not for empty results
      throw createAppError({
        message: 'Database error occurred while fetching categories',
        statusCode: 500,
        code: 'DATABASE_ERROR',
        originalError: error.message
      });
    }
  }

  /**
   * Find only active categories
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Array>} Array of active category objects
   */
  async findActive(connection = null) {
    return this.findAll({ is_active: true }, connection);
  }

  /**
   * Update category by ID
   * @param {number} id - Category ID
   * @param {Object} updateData - Data to update
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Object>} Updated category object
   */
  async update(id, updateData, connection = null) {
    try {
      const db = connection || this.getDB();
      
      const allowedFields = ['name', 'description', 'slug', 'parent_id', 'image_url', 'is_active', 'sort_order'];
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
          code: 'CATEGORY_UPDATE_ERROR'
        });
      }
      
      values.push(id);
      
      const query = `
        UPDATE categories 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      const [result] = await db.execute(query, values);
      
      if (result.affectedRows === 0) {
        throw createAppError({
          message: 'Category not found',
          statusCode: 404,
          code: 'CATEGORY_NOT_FOUND'
        });
      }
      
      return await this.findById(id, connection);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw createAppError({
          message: 'Category with this name or slug already exists',
          statusCode: 409,
          code: 'CATEGORY_DUPLICATE_ERROR'
        });
      }
      if (error.statusCode) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to update category',
        statusCode: 500,
        code: 'CATEGORY_UPDATE_ERROR'
      });
    }
  }

  /**
   * Soft delete category by ID
   * @param {number} id - Category ID
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async softDelete(id, connection = null) {
    try {
      const db = connection || this.getDB();
      
      const query = `
        UPDATE categories 
        SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      const [result] = await db.execute(query, [id]);
      
      if (result.affectedRows === 0) {
        throw createAppError({
          message: 'Category not found',
          statusCode: 404,
          code: 'CATEGORY_NOT_FOUND'
        });
      }
      
      return true;
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to delete category',
        statusCode: 500,
        code: 'CATEGORY_DELETE_ERROR'
      });
    }
  }

  /**
   * Find category with its products
   * @param {number} categoryId - Category ID
   * @param {Object} filters - Filter options for products
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Object>} Category object with products
   */
  async findWithProducts(categoryId, filters = {}, connection = null) {
    try {
      const db = connection || this.getDB();
      
      // Get category
      const category = await this.findById(categoryId, connection);
      if (!category) {
        throw createAppError({
          message: 'Category not found',
          statusCode: 404,
          code: 'CATEGORY_NOT_FOUND'
        });
      }
      
      // Get products for this category
      let productQuery = `
        SELECT p.*, c.name as category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.category_id = ? AND p.deleted_at IS NULL
      `;
      
      const productParams = [categoryId];
      
      // Add product filters
      if (filters.status) {
        productQuery += ' AND p.status = ?';
        productParams.push(filters.status);
      }
      
      if (filters.is_featured !== undefined) {
        productQuery += ' AND p.is_featured = ?';
        productParams.push(filters.is_featured);
      }
      
      productQuery += ' ORDER BY p.created_at DESC';
      
      if (filters.limit) {
        productQuery += ' LIMIT ?';
        productParams.push(parseInt(filters.limit));
      }
      
      const [products] = await db.execute(productQuery, productParams);
      
      return {
        ...category,
        products
      };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to find category with products',
        statusCode: 500,
        code: 'CATEGORY_FIND_ERROR'
      });
    }
  }

  /**
   * Check if category name exists
   * @param {string} name - Category name
   * @param {number} excludeId - Category ID to exclude from check
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<boolean>} True if name exists
   */
  async nameExists(name, excludeId = null, connection = null) {
    try {
      const db = connection || this.getDB();
      
      let query = 'SELECT id FROM categories WHERE name = ? AND deleted_at IS NULL';
      const params = [name];
      
      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      
      const [rows] = await db.execute(query, params);
      return rows.length > 0;
    } catch (error) {
      throw createAppError({
        message: 'Failed to check category name',
        statusCode: 500,
        code: 'CATEGORY_CHECK_ERROR'
      });
    }
  }

  /**
   * Check if category slug exists
   * @param {string} slug - Category slug
   * @param {number} excludeId - Category ID to exclude from check
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<boolean>} True if slug exists
   */
  async slugExists(slug, excludeId = null, connection = null) {
    try {
      const db = connection || this.getDB();
      
      let query = 'SELECT id FROM categories WHERE slug = ? AND deleted_at IS NULL';
      const params = [slug];
      
      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      
      const [rows] = await db.execute(query, params);
      return rows.length > 0;
    } catch (error) {
      throw createAppError({
        message: 'Failed to check category slug',
        statusCode: 500,
        code: 'CATEGORY_CHECK_ERROR'
      });
    }
  }
}

module.exports = CategoryRepository;
