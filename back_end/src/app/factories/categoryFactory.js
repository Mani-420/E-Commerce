/**
 * Category Factory
 * Factory functions for creating and formatting category objects
 */

class CategoryFactory {
  /**
   * Create a new category object with proper defaults
   * @param {Object} categoryData - Raw category data
   * @returns {Object} Formatted category object
   */
  static createCategory(categoryData) {
    const {
      name,
      description = null,
      parent_id = null,
      image_url = null,
      is_active = true,
      sort_order = 0
    } = categoryData;

    return {
      name: name.trim(),
      description: description ? description.trim() : null,
      slug: this.generateSlug(name),
      parent_id: parent_id ? parseInt(parent_id) : null,
      image_url: image_url ? image_url.trim() : null,
      is_active: Boolean(is_active),
      sort_order: parseInt(sort_order) || 0
    };
  }

  /**
   * Create a category response object
   * @param {Object} category - Category data from database
   * @returns {Object} Formatted category response
   */
  static createCategoryResponse(category) {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      slug: category.slug,
      parent_id: category.parent_id,
      parent_name: category.parent_name,
      parent_slug: category.parent_slug,
      image_url: category.image_url,
      is_active: Boolean(category.is_active),
      sort_order: category.sort_order,
      created_at: category.created_at,
      updated_at: category.updated_at
    };
  }

  /**
   * Create a category list response
   * @param {Array} categories - Array of category data
   * @returns {Array} Formatted category list
   */
  static createCategoryListResponse(categories) {
    return categories.map(category => this.createCategoryResponse(category));
  }

  /**
   * Create a category with products response
   * @param {Object} categoryWithProducts - Category with products data
   * @returns {Object} Formatted category with products response
   */
  static createCategoryWithProductsResponse(categoryWithProducts) {
    const { products, ...categoryData } = categoryWithProducts;
    
    return {
      ...this.createCategoryResponse(categoryData),
      products: products || [],
      product_count: products ? products.length : 0
    };
  }

  /**
   * Create a category hierarchy response
   * @param {Array} categories - Array of category data
   * @returns {Array} Hierarchical category structure
   */
  static createCategoryHierarchy(categories) {
    const categoryMap = new Map();
    const rootCategories = [];

    // First pass: create category objects
    categories.forEach(category => {
      categoryMap.set(category.id, {
        ...this.createCategoryResponse(category),
        children: []
      });
    });

    // Second pass: build hierarchy
    categories.forEach(category => {
      const categoryObj = categoryMap.get(category.id);
      
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children.push(categoryObj);
        }
      } else {
        rootCategories.push(categoryObj);
      }
    });

    return rootCategories;
  }

  /**
   * Create a category breadcrumb response
   * @param {Object} category - Category data
   * @param {Array} allCategories - All categories for building breadcrumb
   * @returns {Array} Breadcrumb array
   */
  static createCategoryBreadcrumb(category, allCategories) {
    const breadcrumb = [];
    let currentCategory = category;

    while (currentCategory) {
      breadcrumb.unshift({
        id: currentCategory.id,
        name: currentCategory.name,
        slug: currentCategory.slug
      });

      if (currentCategory.parent_id) {
        currentCategory = allCategories.find(cat => cat.id === currentCategory.parent_id);
      } else {
        currentCategory = null;
      }
    }

    return breadcrumb;
  }

  /**
   * Generate URL-friendly slug from category name
   * @param {string} name - Category name
   * @returns {string} Generated slug
   */
  static generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Validate category data
   * @param {Object} categoryData - Category data to validate
   * @returns {Object} Validation result
   */
  static validateCategoryData(categoryData) {
    const errors = [];

    // Required fields
    if (!categoryData.name || categoryData.name.trim().length === 0) {
      errors.push('Category name is required');
    } else if (categoryData.name.trim().length < 2) {
      errors.push('Category name must be at least 2 characters long');
    } else if (categoryData.name.trim().length > 255) {
      errors.push('Category name must be less than 255 characters');
    }

    // Optional fields validation
    if (categoryData.description && categoryData.description.length > 1000) {
      errors.push('Category description must be less than 1000 characters');
    }

    if (categoryData.parent_id && isNaN(parseInt(categoryData.parent_id))) {
      errors.push('Parent category ID must be a valid number');
    }

    if (categoryData.sort_order && (isNaN(parseInt(categoryData.sort_order)) || parseInt(categoryData.sort_order) < 0)) {
      errors.push('Sort order must be a non-negative number');
    }

    if (categoryData.image_url && categoryData.image_url.length > 500) {
      errors.push('Image URL must be less than 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize category data
   * @param {Object} categoryData - Raw category data
   * @returns {Object} Sanitized category data
   */
  static sanitizeCategoryData(categoryData) {
    const sanitized = {};

    if (categoryData.name) {
      sanitized.name = categoryData.name.trim();
    }

    if (categoryData.description) {
      sanitized.description = categoryData.description.trim();
    }

    if (categoryData.parent_id) {
      sanitized.parent_id = parseInt(categoryData.parent_id);
    }

    if (categoryData.image_url) {
      sanitized.image_url = categoryData.image_url.trim();
    }

    if (categoryData.is_active !== undefined) {
      sanitized.is_active = Boolean(categoryData.is_active);
    }

    if (categoryData.sort_order !== undefined) {
      sanitized.sort_order = parseInt(categoryData.sort_order) || 0;
    }

    return sanitized;
  }

  /**
   * Create category filter object
   * @param {Object} queryParams - Query parameters
   * @returns {Object} Filter object
   */
  static createCategoryFilter(queryParams) {
    const filter = {};

    if (queryParams.page) {
      filter.page = parseInt(queryParams.page) || 1;
    }

    if (queryParams.limit) {
      filter.limit = parseInt(queryParams.limit) || 20;
    }

    if (queryParams.is_active !== undefined) {
      filter.is_active = queryParams.is_active;
    }

    if (queryParams.parent_id) {
      filter.parent_id = parseInt(queryParams.parent_id);
    }

    return filter;
  }
}

module.exports = CategoryFactory;
