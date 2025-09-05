/**
 * Category Service
 * Handles category-related business logic and operations
 */

const { createAppError } = require('../../utils/errorHandler');
const { API_MESSAGES } = require('../../constants/apiMessages');

class CategoryService {
  /**
   * Constructor with dependency injection
   * @param {Object} dependencies - Dependencies object
   */
  constructor({ categoryRepository, productRepository }) {
    this.categoryRepository = categoryRepository;
    this.productRepository = productRepository;
  }

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @param {number} userId - User ID creating the category
   * @returns {Promise<Object>} Created category
   */
  async createCategory(categoryData, userId) {
    try {
      const { name, description, parent_id, image_url, is_active, sort_order } = categoryData;

      // Validate parent category if provided
      if (parent_id) {
        const parentCategory = await this.categoryRepository.findById(parent_id);
        if (!parentCategory) {
          throw createAppError({
            message: 'Parent category not found',
            statusCode: 404,
            code: 'PARENT_CATEGORY_NOT_FOUND'
          });
        }
      }

      // Generate slug from name
      const slug = this.generateSlug(name);

      // Check if name already exists
      const nameExists = await this.categoryRepository.nameExists(name);
      if (nameExists) {
        throw createAppError({
          message: API_MESSAGES.CATEGORY_ALREADY_EXISTS,
          statusCode: 409,
          code: 'CATEGORY_NAME_EXISTS'
        });
      }

      // Check if slug already exists
      const slugExists = await this.categoryRepository.slugExists(slug);
      if (slugExists) {
        throw createAppError({
          message: API_MESSAGES.CATEGORY_SLUG_EXISTS,
          statusCode: 409,
          code: 'CATEGORY_SLUG_EXISTS'
        });
      }

      // Prepare category data
      const newCategoryData = {
        name,
        description: description || null,
        slug,
        parent_id: parent_id || null,
        image_url: image_url || null,
        is_active: is_active !== undefined ? is_active : true,
        sort_order: sort_order || 0
      };

      // Create category
      const category = await this.categoryRepository.create(newCategoryData);

      return {
        success: true,
        message: API_MESSAGES.CATEGORY_CREATED,
        data: category
      };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to create category',
        statusCode: 500,
        code: 'CATEGORY_CREATE_ERROR'
      });
    }
  }

  /**
   * Get category by ID
   * @param {number} id - Category ID
   * @returns {Promise<Object>} Category data
   */
  async getCategoryById(id) {
    try {
      const category = await this.categoryRepository.findById(id);
      
      if (!category) {
        throw createAppError({
          message: API_MESSAGES.CATEGORY_NOT_FOUND,
          statusCode: 404,
          code: 'CATEGORY_NOT_FOUND'
        });
      }

      return {
        success: true,
        data: category
      };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to get category',
        statusCode: 500,
        code: 'CATEGORY_GET_ERROR'
      });
    }
  }

  /**
   * Get category by slug
   * @param {string} slug - Category slug
   * @returns {Promise<Object>} Category data
   */
  async getCategoryBySlug(slug) {
    try {
      const category = await this.categoryRepository.findBySlug(slug);
      
      if (!category) {
        throw createAppError({
          message: API_MESSAGES.CATEGORY_NOT_FOUND,
          statusCode: 404,
          code: 'CATEGORY_NOT_FOUND'
        });
      }

      return {
        success: true,
        data: category
      };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to get category by slug',
        statusCode: 500,
        code: 'CATEGORY_GET_ERROR'
      });
    }
  }

  /**
   * Get all categories with filtering
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Categories data with pagination
   */
  async getAllCategories(filters = {}) {
    try {
      const { page = 1, limit = 20, is_active, parent_id } = filters;
      
      // Calculate offset
      const offset = (page - 1) * limit;
      
      // Build filter object
      const filterOptions = {
        limit: parseInt(limit),
        offset: parseInt(offset)
      };
      
      if (is_active !== undefined) {
        filterOptions.is_active = is_active === 'true';
      }
      
      if (parent_id) {
        filterOptions.parent_id = parseInt(parent_id);
      }

      // Get categories
      const categories = await this.categoryRepository.findAll(filterOptions);

      // Get total count for pagination
      const totalCount = await this.getCategoryCount(filterOptions);

      return {
        success: true,
        data: {
          categories,
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
        message: 'Failed to get categories',
        statusCode: 500,
        code: 'CATEGORY_GET_ERROR'
      });
    }
  }

  /**
   * Get active categories (for public use)
   * @returns {Promise<Object>} Active categories data
   */
  async getActiveCategories() {
    try {
      const categories = await this.categoryRepository.findActive();

      return {
        success: true,
        data: categories
      };
    } catch (error) {
      throw createAppError({
        message: 'Failed to get active categories',
        statusCode: 500,
        code: 'CATEGORY_GET_ERROR'
      });
    }
  }

  /**
   * Update category
   * @param {number} id - Category ID
   * @param {Object} updateData - Data to update
   * @param {number} userId - User ID updating the category
   * @returns {Promise<Object>} Updated category
   */
  async updateCategory(id, updateData, userId) {
    try {
      const { name, description, parent_id, image_url, is_active, sort_order } = updateData;

      // Check if category exists
      const existingCategory = await this.categoryRepository.findById(id);
      if (!existingCategory) {
        throw createAppError({
          message: API_MESSAGES.CATEGORY_NOT_FOUND,
          statusCode: 404,
          code: 'CATEGORY_NOT_FOUND'
        });
      }

      // Validate parent category if provided
      if (parent_id && parent_id !== existingCategory.parent_id) {
        if (parent_id === id) {
          throw createAppError({
            message: 'Category cannot be its own parent',
            statusCode: 400,
            code: 'INVALID_PARENT_CATEGORY'
          });
        }

        const parentCategory = await this.categoryRepository.findById(parent_id);
        if (!parentCategory) {
          throw createAppError({
            message: 'Parent category not found',
            statusCode: 404,
            code: 'PARENT_CATEGORY_NOT_FOUND'
          });
        }
      }

      // Check if name already exists (excluding current category)
      if (name && name !== existingCategory.name) {
        const nameExists = await this.categoryRepository.nameExists(name, id);
        if (nameExists) {
          throw createAppError({
            message: API_MESSAGES.CATEGORY_ALREADY_EXISTS,
            statusCode: 409,
            code: 'CATEGORY_NAME_EXISTS'
          });
        }
      }

      // Generate new slug if name changed
      let slug = existingCategory.slug;
      if (name && name !== existingCategory.name) {
        slug = this.generateSlug(name);
        
        // Check if new slug already exists
        const slugExists = await this.categoryRepository.slugExists(slug, id);
        if (slugExists) {
          throw createAppError({
            message: API_MESSAGES.CATEGORY_SLUG_EXISTS,
            statusCode: 409,
            code: 'CATEGORY_SLUG_EXISTS'
          });
        }
      }

      // Prepare update data
      const updateFields = {};
      if (name !== undefined) updateFields.name = name;
      if (description !== undefined) updateFields.description = description;
      if (parent_id !== undefined) updateFields.parent_id = parent_id;
      if (image_url !== undefined) updateFields.image_url = image_url;
      if (is_active !== undefined) updateFields.is_active = is_active;
      if (sort_order !== undefined) updateFields.sort_order = sort_order;
      if (slug !== existingCategory.slug) updateFields.slug = slug;

      // Update category
      const updatedCategory = await this.categoryRepository.update(id, updateFields);

      return {
        success: true,
        message: API_MESSAGES.CATEGORY_UPDATED,
        data: updatedCategory
      };
    } catch (error) {
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
   * Delete category
   * @param {number} id - Category ID
   * @param {number} userId - User ID deleting the category
   * @returns {Promise<Object>} Deletion result
   */
  async deleteCategory(id, userId) {
    try {
      // Check if category exists
      const category = await this.categoryRepository.findById(id);
      if (!category) {
        throw createAppError({
          message: API_MESSAGES.CATEGORY_NOT_FOUND,
          statusCode: 404,
          code: 'CATEGORY_NOT_FOUND'
        });
      }

      // Check if category has products
      const products = await this.productRepository.findByCategory(id, { limit: 1 });
      if (products.length > 0) {
        throw createAppError({
          message: 'Cannot delete category with existing products',
          statusCode: 400,
          code: 'CATEGORY_HAS_PRODUCTS'
        });
      }

      // Check if category has subcategories
      const subcategories = await this.categoryRepository.findAll({ parent_id: id, limit: 1 });
      if (subcategories.length > 0) {
        throw createAppError({
          message: 'Cannot delete category with existing subcategories',
          statusCode: 400,
          code: 'CATEGORY_HAS_SUBCATEGORIES'
        });
      }

      // Soft delete category
      await this.categoryRepository.softDelete(id);

      return {
        success: true,
        message: API_MESSAGES.CATEGORY_DELETED
      };
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
   * Get category with its products
   * @param {number} categoryId - Category ID
   * @param {Object} filters - Filter options for products
   * @returns {Promise<Object>} Category with products data
   */
  async getCategoryWithProducts(categoryId, filters = {}) {
    try {
      const { page = 1, limit = 20, status, is_featured } = filters;
      
      // Calculate offset
      const offset = (page - 1) * limit;
      
      // Build filter object
      const filterOptions = {
        limit: parseInt(limit),
        offset: parseInt(offset)
      };
      
      if (status) {
        filterOptions.status = status;
      }
      
      if (is_featured !== undefined) {
        filterOptions.is_featured = is_featured === 'true';
      }

      // Get category with products
      const categoryWithProducts = await this.categoryRepository.findWithProducts(categoryId, filterOptions);

      // Get total product count for pagination
      const totalProducts = await this.getProductCountByCategory(categoryId, filterOptions);

      return {
        success: true,
        data: {
          ...categoryWithProducts,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalProducts,
            pages: Math.ceil(totalProducts / limit)
          }
        }
      };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw createAppError({
        message: 'Failed to get category with products',
        statusCode: 500,
        code: 'CATEGORY_GET_ERROR'
      });
    }
  }

  /**
   * Generate URL-friendly slug from name
   * @param {string} name - Category name
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
   * Get total category count for pagination
   * @param {Object} filters - Filter options
   * @returns {Promise<number>} Total count
   */
  async getCategoryCount(filters = {}) {
    try {
      const categories = await this.categoryRepository.findAll(filters);
      return categories.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get total product count by category for pagination
   * @param {number} categoryId - Category ID
   * @param {Object} filters - Filter options
   * @returns {Promise<number>} Total count
   */
  async getProductCountByCategory(categoryId, filters = {}) {
    try {
      const products = await this.productRepository.findByCategory(categoryId, filters);
      return products.length;
    } catch (error) {
      return 0;
    }
  }
}

module.exports = CategoryService;
