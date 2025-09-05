/**
 * Product validation schemas using Zod
 * All request validation schemas for product endpoints
 */

const { z } = require('zod');
const { PRODUCT_STATUSES, PRODUCT_STATUS_VALUES } = require('../constants/productStatuses');

/**
 * Product creation validation schema
 */
const createProductSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Product name is required')
      .max(255, 'Product name must be less than 255 characters')
      .trim(),
    
    description: z.string()
      .min(10, 'Product description must be at least 10 characters long')
      .max(5000, 'Product description must be less than 5000 characters')
      .trim(),
    
    sku: z.string()
      .min(1, 'SKU is required')
      .max(100, 'SKU must be less than 100 characters')
      .regex(/^[A-Z0-9-_]+$/, 'SKU can only contain uppercase letters, numbers, hyphens, and underscores')
      .trim(),
    
    price: z.number()
      .positive('Price must be positive')
      .max(999999.99, 'Price must be less than 1,000,000')
      .multipleOf(0.01, 'Price must have at most 2 decimal places'),
    
    compare_price: z.number()
      .positive('Compare price must be positive')
      .max(999999.99, 'Compare price must be less than 1,000,000')
      .multipleOf(0.01, 'Compare price must have at most 2 decimal places')
      .optional()
      .nullable(),
    
    cost_price: z.number()
      .positive('Cost price must be positive')
      .max(999999.99, 'Cost price must be less than 1,000,000')
      .multipleOf(0.01, 'Cost price must have at most 2 decimal places')
      .optional()
      .nullable(),
    
    stock_quantity: z.number()
      .int('Stock quantity must be an integer')
      .min(0, 'Stock quantity must be non-negative')
      .max(999999, 'Stock quantity must be less than 1,000,000')
      .optional()
      .default(0),
    
    low_stock_threshold: z.number()
      .int('Low stock threshold must be an integer')
      .min(0, 'Low stock threshold must be non-negative')
      .max(999999, 'Low stock threshold must be less than 1,000,000')
      .optional()
      .default(5),
    
    weight: z.number()
      .positive('Weight must be positive')
      .max(9999.99, 'Weight must be less than 10,000')
      .multipleOf(0.01, 'Weight must have at most 2 decimal places')
      .optional()
      .nullable(),
    
    dimensions: z.object({
      length: z.number().positive().optional(),
      width: z.number().positive().optional(),
      height: z.number().positive().optional()
    }).optional().nullable(),
    
    category_id: z.number()
      .int('Category ID must be an integer')
      .positive('Category ID must be positive'),
    
    brand: z.string()
      .max(100, 'Brand must be less than 100 characters')
      .optional()
      .nullable(),
    
    status: z.enum(PRODUCT_STATUS_VALUES, {
      errorMap: () => ({ message: `Status must be one of: ${PRODUCT_STATUS_VALUES.join(', ')}` })
    }).optional().default(PRODUCT_STATUSES.DRAFT),
    
    is_featured: z.boolean()
      .optional()
      .default(false),
    
    meta_title: z.string()
      .max(255, 'Meta title must be less than 255 characters')
      .optional()
      .nullable(),
    
    meta_description: z.string()
      .max(500, 'Meta description must be less than 500 characters')
      .optional()
      .nullable(),
    
    tags: z.array(z.string().max(50, 'Each tag must be less than 50 characters'))
      .max(20, 'Maximum 20 tags allowed')
      .optional()
      .nullable()
  })
});

/**
 * Product update validation schema
 */
const updateProductSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Product name is required')
      .max(255, 'Product name must be less than 255 characters')
      .trim()
      .optional(),
    
    description: z.string()
      .min(10, 'Product description must be at least 10 characters long')
      .max(5000, 'Product description must be less than 5000 characters')
      .trim()
      .optional(),
    
    sku: z.string()
      .min(1, 'SKU is required')
      .max(100, 'SKU must be less than 100 characters')
      .regex(/^[A-Z0-9-_]+$/, 'SKU can only contain uppercase letters, numbers, hyphens, and underscores')
      .trim()
      .optional(),
    
    price: z.number()
      .positive('Price must be positive')
      .max(999999.99, 'Price must be less than 1,000,000')
      .multipleOf(0.01, 'Price must have at most 2 decimal places')
      .optional(),
    
    compare_price: z.number()
      .positive('Compare price must be positive')
      .max(999999.99, 'Compare price must be less than 1,000,000')
      .multipleOf(0.01, 'Compare price must have at most 2 decimal places')
      .optional()
      .nullable(),
    
    cost_price: z.number()
      .positive('Cost price must be positive')
      .max(999999.99, 'Cost price must be less than 1,000,000')
      .multipleOf(0.01, 'Cost price must have at most 2 decimal places')
      .optional()
      .nullable(),
    
    stock_quantity: z.number()
      .int('Stock quantity must be an integer')
      .min(0, 'Stock quantity must be non-negative')
      .max(999999, 'Stock quantity must be less than 1,000,000')
      .optional(),
    
    low_stock_threshold: z.number()
      .int('Low stock threshold must be an integer')
      .min(0, 'Low stock threshold must be non-negative')
      .max(999999, 'Low stock threshold must be less than 1,000,000')
      .optional(),
    
    weight: z.number()
      .positive('Weight must be positive')
      .max(9999.99, 'Weight must be less than 10,000')
      .multipleOf(0.01, 'Weight must have at most 2 decimal places')
      .optional()
      .nullable(),
    
    dimensions: z.object({
      length: z.number().positive().optional(),
      width: z.number().positive().optional(),
      height: z.number().positive().optional()
    }).optional().nullable(),
    
    category_id: z.number()
      .int('Category ID must be an integer')
      .positive('Category ID must be positive')
      .optional(),
    
    brand: z.string()
      .max(100, 'Brand must be less than 100 characters')
      .optional()
      .nullable(),
    
    status: z.enum(PRODUCT_STATUS_VALUES, {
      errorMap: () => ({ message: `Status must be one of: ${PRODUCT_STATUS_VALUES.join(', ')}` })
    }).optional(),
    
    is_featured: z.boolean()
      .optional(),
    
    meta_title: z.string()
      .max(255, 'Meta title must be less than 255 characters')
      .optional()
      .nullable(),
    
    meta_description: z.string()
      .max(500, 'Meta description must be less than 500 characters')
      .optional()
      .nullable(),
    
    tags: z.array(z.string().max(50, 'Each tag must be less than 50 characters'))
      .max(20, 'Maximum 20 tags allowed')
      .optional()
      .nullable()
  })
});

/**
 * Product ID parameter validation schema
 */
const productIdSchema = z.object({
  params: z.object({
    id: z.string()
      .regex(/^\d+$/, 'Product ID must be a valid number')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, 'Product ID must be positive')
  })
});

/**
 * Product slug parameter validation schema
 */
const productSlugSchema = z.object({
  params: z.object({
    slug: z.string()
      .min(1, 'Product slug is required')
      .max(255, 'Product slug must be less than 255 characters')
      .regex(/^[a-z0-9-]+$/, 'Product slug can only contain lowercase letters, numbers, and hyphens')
  })
});

/**
 * Product stock update validation schema
 */
const updateProductStockSchema = z.object({
  params: z.object({
    id: z.string()
      .regex(/^\d+$/, 'Product ID must be a valid number')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, 'Product ID must be positive')
  }),
  body: z.object({
    quantity: z.number()
      .int('Stock quantity must be an integer')
      .min(0, 'Stock quantity must be non-negative')
      .max(999999, 'Stock quantity must be less than 1,000,000')
  })
});

/**
 * Product query parameters validation schema
 */
const productQuerySchema = z.object({
  query: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Page must be a valid number')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, 'Page must be positive')
      .optional()
      .default(1),
    
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a valid number')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
      .optional()
      .default(20),
    
    status: z.enum(PRODUCT_STATUS_VALUES)
      .optional(),
    
    category_id: z.string()
      .regex(/^\d+$/, 'Category ID must be a valid number')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, 'Category ID must be positive')
      .optional(),
    
    is_featured: z.enum(['true', 'false'])
      .optional(),
    
    min_price: z.string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Min price must be a valid number')
      .transform((val) => parseFloat(val))
      .refine((val) => val >= 0, 'Min price must be non-negative')
      .optional(),
    
    max_price: z.string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Max price must be a valid number')
      .transform((val) => parseFloat(val))
      .refine((val) => val >= 0, 'Max price must be non-negative')
      .optional(),
    
    in_stock: z.enum(['true', 'false'])
      .optional(),
    
    brand: z.string()
      .max(100, 'Brand must be less than 100 characters')
      .optional(),
    
    sort: z.enum(['name', 'price', 'created_at', 'updated_at'])
      .optional()
      .default('created_at'),
    
    order: z.enum(['asc', 'desc'])
      .optional()
      .default('desc')
  })
});

/**
 * Product search query parameters validation schema
 */
const productSearchQuerySchema = z.object({
  query: z.object({
    q: z.string()
      .min(2, 'Search query must be at least 2 characters long')
      .max(100, 'Search query must be less than 100 characters')
      .trim(),
    
    page: z.string()
      .regex(/^\d+$/, 'Page must be a valid number')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, 'Page must be positive')
      .optional()
      .default(1),
    
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a valid number')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
      .optional()
      .default(20),
    
    status: z.enum(PRODUCT_STATUS_VALUES)
      .optional(),
    
    category_id: z.string()
      .regex(/^\d+$/, 'Category ID must be a valid number')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, 'Category ID must be positive')
      .optional(),
    
    min_price: z.string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Min price must be a valid number')
      .transform((val) => parseFloat(val))
      .refine((val) => val >= 0, 'Min price must be non-negative')
      .optional(),
    
    max_price: z.string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Max price must be a valid number')
      .transform((val) => parseFloat(val))
      .refine((val) => val >= 0, 'Max price must be non-negative')
      .optional(),
    
    sort: z.enum(['name', 'price', 'created_at', 'updated_at'])
      .optional()
      .default('name'),
    
    order: z.enum(['asc', 'desc'])
      .optional()
      .default('asc')
  })
});

/**
 * Product featured query parameters validation schema
 */
const productFeaturedQuerySchema = z.object({
  query: z.object({
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a valid number')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0 && val <= 50, 'Limit must be between 1 and 50')
      .optional()
      .default(10)
  })
});

/**
 * Product by category query parameters validation schema
 */
const productByCategoryQuerySchema = z.object({
  params: z.object({
    categoryId: z.string()
      .regex(/^\d+$/, 'Category ID must be a valid number')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, 'Category ID must be positive')
  }),
  query: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Page must be a valid number')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, 'Page must be positive')
      .optional()
      .default(1),
    
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a valid number')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
      .optional()
      .default(20),
    
    status: z.enum(PRODUCT_STATUS_VALUES)
      .optional(),
    
    is_featured: z.enum(['true', 'false'])
      .optional(),
    
    min_price: z.string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Min price must be a valid number')
      .transform((val) => parseFloat(val))
      .refine((val) => val >= 0, 'Min price must be non-negative')
      .optional(),
    
    max_price: z.string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Max price must be a valid number')
      .transform((val) => parseFloat(val))
      .refine((val) => val >= 0, 'Max price must be non-negative')
      .optional(),
    
    sort: z.enum(['name', 'price', 'created_at', 'updated_at'])
      .optional()
      .default('created_at'),
    
    order: z.enum(['asc', 'desc'])
      .optional()
      .default('desc')
  })
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  productSlugSchema,
  updateProductStockSchema,
  productQuerySchema,
  productSearchQuerySchema,
  productFeaturedQuerySchema,
  productByCategoryQuerySchema
};
