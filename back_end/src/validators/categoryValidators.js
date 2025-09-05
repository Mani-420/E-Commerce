/**
 * Category validation schemas using Zod
 * All request validation schemas for category endpoints
 */

const { z } = require('zod');
const { CATEGORY_STATUSES, CATEGORY_STATUS_VALUES } = require('../constants/categoryStatuses');

/**
 * Category creation validation schema
 */
const createCategorySchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Category name is required')
      .max(255, 'Category name must be less than 255 characters')
      .trim(),
    
    description: z.string()
      .max(1000, 'Category description must be less than 1000 characters')
      .optional()
      .nullable(),
    
    parent_id: z.number()
      .int('Parent category ID must be an integer')
      .positive('Parent category ID must be positive')
      .optional()
      .nullable(),
    
    image_url: z.string()
      .url('Invalid image URL format')
      .max(500, 'Image URL must be less than 500 characters')
      .optional()
      .nullable(),
    
    is_active: z.boolean()
      .optional()
      .default(true),
    
    sort_order: z.number()
      .int('Sort order must be an integer')
      .min(0, 'Sort order must be non-negative')
      .optional()
      .default(0)
  })
});

/**
 * Category update validation schema
 */
const updateCategorySchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Category name is required')
      .max(255, 'Category name must be less than 255 characters')
      .trim()
      .optional(),
    
    description: z.string()
      .max(1000, 'Category description must be less than 1000 characters')
      .optional()
      .nullable(),
    
    parent_id: z.number()
      .int('Parent category ID must be an integer')
      .positive('Parent category ID must be positive')
      .optional()
      .nullable(),
    
    image_url: z.string()
      .url('Invalid image URL format')
      .max(500, 'Image URL must be less than 500 characters')
      .optional()
      .nullable(),
    
    is_active: z.boolean()
      .optional(),
    
    sort_order: z.number()
      .int('Sort order must be an integer')
      .min(0, 'Sort order must be non-negative')
      .optional()
  })
});

/**
 * Category ID parameter validation schema
 */
const categoryIdSchema = z.object({
  params: z.object({
    id: z.string()
      .regex(/^\d+$/, 'Category ID must be a valid number')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, 'Category ID must be positive')
  })
});

/**
 * Category slug parameter validation schema
 */
const categorySlugSchema = z.object({
  params: z.object({
    slug: z.string()
      .min(1, 'Category slug is required')
      .max(255, 'Category slug must be less than 255 characters')
      .regex(/^[a-z0-9-]+$/, 'Category slug can only contain lowercase letters, numbers, and hyphens')
  })
});

/**
 * Category query parameters validation schema
 */
const categoryQuerySchema = z.object({
  query: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Page must be a valid number')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, 'Page must be positive')
      .optional()
      .default('1'),
    
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a valid number')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
      .optional()
      .default('20'),
    
    is_active: z.enum(['true', 'false'])
      .optional(),
    
    parent_id: z.string()
      .regex(/^\d+$/, 'Parent ID must be a valid number')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, 'Parent ID must be positive')
      .optional()
  }).transform((query) => {
    // Apply defaults for missing fields
    return {
      page: query.page || '1',
      limit: query.limit || '20',
      is_active: query.is_active,
      parent_id: query.parent_id
    };
  })
});

/**
 * Category with products query parameters validation schema
 */
const categoryWithProductsQuerySchema = z.object({
  params: z.object({
    id: z.string()
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
    
    status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'])
      .optional(),
    
    is_featured: z.enum(['true', 'false'])
      .optional()
  })
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
  categorySlugSchema,
  categoryQuerySchema,
  categoryWithProductsQuerySchema
};
