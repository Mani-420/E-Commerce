/**
 * Product Image Repository
 * Handles all product image-related database operations with dependency injection
 */

const { createAppError } = require('../../utils/errorHandler');

class ProductImageRepository {
  /**
   * Constructor with dependency injection
   * @param {Object} dependencies - Dependencies object
   * @param {Function} dependencies.getDB - Database connection function
   */
  constructor({ getDB }) {
    this.getDB = getDB;
  }

  /**
   * Create a new product image
   * @param {Object} imageData - Image data to create
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Object>} Created image object
   */
  async create(imageData, connection = null) {
    try {
      const db = connection || this.getDB();
      const { product_id, image_url, alt_text, is_primary, sort_order } = imageData;

      const query = `
        INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const [result] = await db.execute(query, [
        product_id, image_url, alt_text, is_primary, sort_order
      ]);

      return await this.findById(result.insertId, connection);
    } catch (error) {
      throw createAppError({
        message: 'Failed to create product image',
        statusCode: 500,
        code: 'PRODUCT_IMAGE_CREATE_ERROR'
      });
    }
  }

  /**
   * Find image by ID
   * @param {number} id - Image ID
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Object|null>} Image object or null if not found
   */
  async findById(id, connection = null) {
    try {
      const db = connection || this.getDB();
      
      const query = `
        SELECT pi.*, p.name as product_name
        FROM product_images pi
        JOIN products p ON pi.product_id = p.id
        WHERE pi.id = ?
      `;
      
      const [rows] = await db.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw createAppError({
        message: 'Failed to find product image',
        statusCode: 500,
        code: 'PRODUCT_IMAGE_FIND_ERROR'
      });
    }
  }

  /**
   * Find all images for a product
   * @param {number} productId - Product ID
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Array>} Array of image objects
   */
  async findByProductId(productId, connection = null) {
    try {
      const db = connection || this.getDB();
      
      const query = `
        SELECT pi.*, p.name as product_name
        FROM product_images pi
        JOIN products p ON pi.product_id = p.id
        WHERE pi.product_id = ?
        ORDER BY pi.sort_order ASC, pi.created_at ASC
      `;
      
      const [rows] = await db.execute(query, [productId]);
      return rows;
    } catch (error) {
      throw createAppError({
        message: 'Failed to find product images',
        statusCode: 500,
        code: 'PRODUCT_IMAGE_FIND_ERROR'
      });
    }
  }

  /**
   * Find primary image for a product
   * @param {number} productId - Product ID
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Object|null>} Primary image object or null if not found
   */
  async findPrimaryByProductId(productId, connection = null) {
    try {
      const db = connection || this.getDB();
      
      const query = `
        SELECT pi.*, p.name as product_name
        FROM product_images pi
        JOIN products p ON pi.product_id = p.id
        WHERE pi.product_id = ? AND pi.is_primary = TRUE
        LIMIT 1
      `;
      
      const [rows] = await db.execute(query, [productId]);
      return rows[0] || null;
    } catch (error) {
      throw createAppError({
        message: 'Failed to find primary product image',
        statusCode: 500,
        code: 'PRODUCT_IMAGE_FIND_ERROR'
      });
    }
  }

  /**
   * Update image by ID
   * @param {number} id - Image ID
   * @param {Object} updateData - Data to update
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Object>} Updated image object
   */
  async update(id, updateData, connection = null) {
    try {
      const db = connection || this.getDB();
      
      const allowedFields = ['image_url', 'alt_text', 'is_primary', 'sort_order'];
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
          code: 'PRODUCT_IMAGE_UPDATE_ERROR'
        });
      }
      
      values.push(id);
      
      const query = `
        UPDATE product_images 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;
      
      const [result] = await db.execute(query, values);
      
      if (result.affectedRows === 0) {
        throw createAppError({
          message: 'Product image not found',
          statusCode: 404,
          code: 'PRODUCT_IMAGE_NOT_FOUND'
        });
      }
      
      return await this.findById(id, connection);
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to update product image',
        statusCode: 500,
        code: 'PRODUCT_IMAGE_UPDATE_ERROR'
      });
    }
  }

  /**
   * Set primary image for a product
   * @param {number} productId - Product ID
   * @param {number} imageId - Image ID to set as primary
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<Object>} Updated image object
   */
  async updatePrimary(productId, imageId, connection = null) {
    try {
      const db = connection || this.getDB();
      
      // Start transaction
      await db.execute('START TRANSACTION');
      
      try {
        // Remove primary flag from all images of this product
        await db.execute(
          'UPDATE product_images SET is_primary = FALSE WHERE product_id = ?',
          [productId]
        );
        
        // Set the specified image as primary
        const [result] = await db.execute(
          'UPDATE product_images SET is_primary = TRUE WHERE id = ? AND product_id = ?',
          [imageId, productId]
        );
        
        if (result.affectedRows === 0) {
          throw createAppError({
            message: 'Product image not found or does not belong to the product',
            statusCode: 404,
            code: 'PRODUCT_IMAGE_NOT_FOUND'
          });
        }
        
        // Commit transaction
        await db.execute('COMMIT');
        
        return await this.findById(imageId, connection);
      } catch (error) {
        // Rollback transaction
        await db.execute('ROLLBACK');
        throw error;
      }
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to update primary product image',
        statusCode: 500,
        code: 'PRODUCT_IMAGE_UPDATE_ERROR'
      });
    }
  }

  /**
   * Delete image by ID
   * @param {number} id - Image ID
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(id, connection = null) {
    try {
      const db = connection || this.getDB();
      
      const query = 'DELETE FROM product_images WHERE id = ?';
      
      const [result] = await db.execute(query, [id]);
      
      if (result.affectedRows === 0) {
        throw createAppError({
          message: 'Product image not found',
          statusCode: 404,
          code: 'PRODUCT_IMAGE_NOT_FOUND'
        });
      }
      
      return true;
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to delete product image',
        statusCode: 500,
        code: 'PRODUCT_IMAGE_DELETE_ERROR'
      });
    }
  }

  /**
   * Reorder images for a product
   * @param {number} productId - Product ID
   * @param {Array} imageOrder - Array of image IDs in desired order
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<boolean>} True if reordered successfully
   */
  async reorder(productId, imageOrder, connection = null) {
    try {
      const db = connection || this.getDB();
      
      // Start transaction
      await db.execute('START TRANSACTION');
      
      try {
        // Update sort order for each image
        for (let i = 0; i < imageOrder.length; i++) {
          await db.execute(
            'UPDATE product_images SET sort_order = ? WHERE id = ? AND product_id = ?',
            [i + 1, imageOrder[i], productId]
          );
        }
        
        // Commit transaction
        await db.execute('COMMIT');
        
        return true;
      } catch (error) {
        // Rollback transaction
        await db.execute('ROLLBACK');
        throw error;
      }
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to reorder product images',
        statusCode: 500,
        code: 'PRODUCT_IMAGE_UPDATE_ERROR'
      });
    }
  }

  /**
   * Get next sort order for a product
   * @param {number} productId - Product ID
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<number>} Next sort order number
   */
  async getNextSortOrder(productId, connection = null) {
    try {
      const db = connection || this.getDB();
      
      const query = `
        SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order
        FROM product_images
        WHERE product_id = ?
      `;
      
      const [rows] = await db.execute(query, [productId]);
      return rows[0].next_order;
    } catch (error) {
      throw createAppError({
        message: 'Failed to get next sort order',
        statusCode: 500,
        code: 'PRODUCT_IMAGE_FIND_ERROR'
      });
    }
  }

  /**
   * Check if image belongs to product
   * @param {number} imageId - Image ID
   * @param {number} productId - Product ID
   * @param {Object} connection - Optional database connection for transactions
   * @returns {Promise<boolean>} True if image belongs to product
   */
  async belongsToProduct(imageId, productId, connection = null) {
    try {
      const db = connection || this.getDB();
      
      const query = 'SELECT id FROM product_images WHERE id = ? AND product_id = ?';
      
      const [rows] = await db.execute(query, [imageId, productId]);
      return rows.length > 0;
    } catch (error) {
      throw createAppError({
        message: 'Failed to check image ownership',
        statusCode: 500,
        code: 'PRODUCT_IMAGE_CHECK_ERROR'
      });
    }
  }
}

module.exports = ProductImageRepository;
