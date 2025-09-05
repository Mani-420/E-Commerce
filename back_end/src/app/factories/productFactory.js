/**
 * Product Factory
 * Factory functions for creating and formatting product objects
 */

class ProductFactory {
  /**
   * Create a new product object with proper defaults
   * @param {Object} productData - Raw product data
   * @returns {Object} Formatted product object
   */
  static createProduct(productData) {
    const {
      name,
      description,
      sku,
      price,
      compare_price = null,
      cost_price = null,
      stock_quantity = 0,
      low_stock_threshold = 5,
      weight = null,
      dimensions = null,
      category_id,
      brand = null,
      status = 'DRAFT',
      is_featured = false,
      meta_title = null,
      meta_description = null,
      tags = null
    } = productData;

    return {
      name: name.trim(),
      description: description.trim(),
      slug: this.generateSlug(name),
      sku: sku ? sku.trim().toUpperCase() : this.generateSKU(name),
      price: parseFloat(price),
      compare_price: compare_price ? parseFloat(compare_price) : null,
      cost_price: cost_price ? parseFloat(cost_price) : null,
      stock_quantity: parseInt(stock_quantity) || 0,
      low_stock_threshold: parseInt(low_stock_threshold) || 5,
      weight: weight ? parseFloat(weight) : null,
      dimensions: dimensions ? (typeof dimensions === 'string' ? dimensions : JSON.stringify(dimensions)) : null,
      category_id: parseInt(category_id),
      brand: brand ? brand.trim() : null,
      status: status.toUpperCase(),
      is_featured: Boolean(is_featured),
      meta_title: meta_title ? meta_title.trim() : null,
      meta_description: meta_description ? meta_description.trim() : null,
      tags: tags ? (typeof tags === 'string' ? tags : JSON.stringify(tags)) : null
    };
  }

  /**
   * Create a product response object
   * @param {Object} product - Product data from database
   * @returns {Object} Formatted product response
   */
  static createProductResponse(product) {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      slug: product.slug,
      sku: product.sku,
      price: parseFloat(product.price),
      compare_price: product.compare_price ? parseFloat(product.compare_price) : null,
      cost_price: product.cost_price ? parseFloat(product.cost_price) : null,
      stock_quantity: parseInt(product.stock_quantity),
      low_stock_threshold: parseInt(product.low_stock_threshold),
      weight: product.weight ? parseFloat(product.weight) : null,
      dimensions: product.dimensions ? (typeof product.dimensions === 'string' ? JSON.parse(product.dimensions) : product.dimensions) : null,
      category_id: product.category_id,
      category_name: product.category_name,
      category_slug: product.category_slug,
      brand: product.brand,
      status: product.status,
      is_featured: Boolean(product.is_featured),
      meta_title: product.meta_title,
      meta_description: product.meta_description,
      tags: product.tags ? (typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags) : null,
      created_by: product.created_by,
      created_by_name: product.created_by_name,
      created_by_last_name: product.created_by_last_name,
      created_at: product.created_at,
      updated_at: product.updated_at,
      // Stock status
      in_stock: parseInt(product.stock_quantity) > 0,
      low_stock: parseInt(product.stock_quantity) <= parseInt(product.low_stock_threshold),
      // Price calculations
      discount_percentage: product.compare_price && product.price < product.compare_price 
        ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
        : 0
    };
  }

  /**
   * Create a product list response
   * @param {Array} products - Array of product data
   * @returns {Array} Formatted product list
   */
  static createProductListResponse(products) {
    return products.map(product => this.createProductResponse(product));
  }

  /**
   * Create a product with images response
   * @param {Object} product - Product data
   * @param {Array} images - Product images
   * @returns {Object} Formatted product with images
   */
  static createProductWithImagesResponse(product, images = []) {
    const productResponse = this.createProductResponse(product);
    
    return {
      ...productResponse,
      images: images.map(image => ({
        id: image.id,
        image_url: image.image_url,
        alt_text: image.alt_text,
        is_primary: Boolean(image.is_primary),
        sort_order: image.sort_order
      })),
      primary_image: images.find(img => img.is_primary) || images[0] || null
    };
  }

  /**
   * Create a product summary response (for lists)
   * @param {Object} product - Product data
   * @returns {Object} Formatted product summary
   */
  static createProductSummaryResponse(product) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: parseFloat(product.price),
      compare_price: product.compare_price ? parseFloat(product.compare_price) : null,
      stock_quantity: parseInt(product.stock_quantity),
      category_id: product.category_id,
      category_name: product.category_name,
      brand: product.brand,
      status: product.status,
      is_featured: Boolean(product.is_featured),
      in_stock: parseInt(product.stock_quantity) > 0,
      discount_percentage: product.compare_price && product.price < product.compare_price 
        ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
        : 0,
      created_at: product.created_at
    };
  }

  /**
   * Create a product search result response
   * @param {Array} products - Array of product data
   * @param {string} query - Search query
   * @param {Object} pagination - Pagination info
   * @returns {Object} Formatted search result
   */
  static createProductSearchResponse(products, query, pagination) {
    return {
      query,
      products: this.createProductListResponse(products),
      pagination,
      total_results: pagination.total
    };
  }

  /**
   * Generate URL-friendly slug from product name
   * @param {string} name - Product name
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
   * Generate unique SKU from product name
   * @param {string} name - Product name
   * @returns {string} Generated SKU
   */
  static generateSKU(name) {
    const timestamp = Date.now().toString().slice(-6);
    const namePrefix = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 4);
    return `${namePrefix}-${timestamp}`;
  }

  /**
   * Validate product data
   * @param {Object} productData - Product data to validate
   * @returns {Object} Validation result
   */
  static validateProductData(productData) {
    const errors = [];

    // Required fields
    if (!productData.name || productData.name.trim().length === 0) {
      errors.push('Product name is required');
    } else if (productData.name.trim().length < 2) {
      errors.push('Product name must be at least 2 characters long');
    } else if (productData.name.trim().length > 255) {
      errors.push('Product name must be less than 255 characters');
    }

    if (!productData.description || productData.description.trim().length === 0) {
      errors.push('Product description is required');
    } else if (productData.description.trim().length < 10) {
      errors.push('Product description must be at least 10 characters long');
    }

    if (!productData.price || isNaN(parseFloat(productData.price))) {
      errors.push('Product price is required and must be a valid number');
    } else if (parseFloat(productData.price) < 0) {
      errors.push('Product price must be non-negative');
    }

    if (!productData.category_id || isNaN(parseInt(productData.category_id))) {
      errors.push('Category ID is required and must be a valid number');
    }

    // Optional fields validation
    if (productData.sku && productData.sku.trim().length > 100) {
      errors.push('SKU must be less than 100 characters');
    }

    if (productData.compare_price && (isNaN(parseFloat(productData.compare_price)) || parseFloat(productData.compare_price) < 0)) {
      errors.push('Compare price must be a valid non-negative number');
    }

    if (productData.cost_price && (isNaN(parseFloat(productData.cost_price)) || parseFloat(productData.cost_price) < 0)) {
      errors.push('Cost price must be a valid non-negative number');
    }

    if (productData.stock_quantity && (isNaN(parseInt(productData.stock_quantity)) || parseInt(productData.stock_quantity) < 0)) {
      errors.push('Stock quantity must be a valid non-negative number');
    }

    if (productData.low_stock_threshold && (isNaN(parseInt(productData.low_stock_threshold)) || parseInt(productData.low_stock_threshold) < 0)) {
      errors.push('Low stock threshold must be a valid non-negative number');
    }

    if (productData.weight && (isNaN(parseFloat(productData.weight)) || parseFloat(productData.weight) < 0)) {
      errors.push('Weight must be a valid non-negative number');
    }

    if (productData.brand && productData.brand.trim().length > 100) {
      errors.push('Brand must be less than 100 characters');
    }

    if (productData.meta_title && productData.meta_title.trim().length > 255) {
      errors.push('Meta title must be less than 255 characters');
    }

    if (productData.meta_description && productData.meta_description.trim().length > 500) {
      errors.push('Meta description must be less than 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize product data
   * @param {Object} productData - Raw product data
   * @returns {Object} Sanitized product data
   */
  static sanitizeProductData(productData) {
    const sanitized = {};

    if (productData.name) {
      sanitized.name = productData.name.trim();
    }

    if (productData.description) {
      sanitized.description = productData.description.trim();
    }

    if (productData.sku) {
      sanitized.sku = productData.sku.trim().toUpperCase();
    }

    if (productData.price) {
      sanitized.price = parseFloat(productData.price);
    }

    if (productData.compare_price) {
      sanitized.compare_price = parseFloat(productData.compare_price);
    }

    if (productData.cost_price) {
      sanitized.cost_price = parseFloat(productData.cost_price);
    }

    if (productData.stock_quantity) {
      sanitized.stock_quantity = parseInt(productData.stock_quantity);
    }

    if (productData.low_stock_threshold) {
      sanitized.low_stock_threshold = parseInt(productData.low_stock_threshold);
    }

    if (productData.weight) {
      sanitized.weight = parseFloat(productData.weight);
    }

    if (productData.dimensions) {
      sanitized.dimensions = typeof productData.dimensions === 'string' 
        ? productData.dimensions 
        : JSON.stringify(productData.dimensions);
    }

    if (productData.category_id) {
      sanitized.category_id = parseInt(productData.category_id);
    }

    if (productData.brand) {
      sanitized.brand = productData.brand.trim();
    }

    if (productData.status) {
      sanitized.status = productData.status.toUpperCase();
    }

    if (productData.is_featured !== undefined) {
      sanitized.is_featured = Boolean(productData.is_featured);
    }

    if (productData.meta_title) {
      sanitized.meta_title = productData.meta_title.trim();
    }

    if (productData.meta_description) {
      sanitized.meta_description = productData.meta_description.trim();
    }

    if (productData.tags) {
      sanitized.tags = typeof productData.tags === 'string' 
        ? productData.tags 
        : JSON.stringify(productData.tags);
    }

    return sanitized;
  }

  /**
   * Create product filter object
   * @param {Object} queryParams - Query parameters
   * @returns {Object} Filter object
   */
  static createProductFilter(queryParams) {
    const filter = {};

    if (queryParams.page) {
      filter.page = parseInt(queryParams.page) || 1;
    }

    if (queryParams.limit) {
      filter.limit = parseInt(queryParams.limit) || 20;
    }

    if (queryParams.status) {
      filter.status = queryParams.status.toUpperCase();
    }

    if (queryParams.category_id) {
      filter.category_id = parseInt(queryParams.category_id);
    }

    if (queryParams.is_featured !== undefined) {
      filter.is_featured = queryParams.is_featured;
    }

    if (queryParams.min_price) {
      filter.min_price = parseFloat(queryParams.min_price);
    }

    if (queryParams.max_price) {
      filter.max_price = parseFloat(queryParams.max_price);
    }

    if (queryParams.in_stock !== undefined) {
      filter.in_stock = queryParams.in_stock;
    }

    if (queryParams.brand) {
      filter.brand = queryParams.brand.trim();
    }

    if (queryParams.sort) {
      filter.sort = queryParams.sort;
    }

    if (queryParams.order) {
      filter.order = queryParams.order.toUpperCase();
    }

    return filter;
  }

  /**
   * Create product search filter object
   * @param {Object} queryParams - Query parameters
   * @returns {Object} Search filter object
   */
  static createProductSearchFilter(queryParams) {
    const filter = this.createProductFilter(queryParams);
    
    if (queryParams.q) {
      filter.query = queryParams.q.trim();
    }

    return filter;
  }
}

module.exports = ProductFactory;
