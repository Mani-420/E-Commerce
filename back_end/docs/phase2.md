# Phase 2 - Product & Category Management Implementation Guide

## 🎯 **Overview**

This document provides comprehensive guidance for implementing a React.js frontend that integrates with the E-commerce Backend API Phase 2. The backend now provides complete product and category management functionality, allowing admins/sellers to manage products and customers to browse, search, and filter them.

## ✅ **Current Status & Testing Updates**

**Last Updated**: January 17, 2025  
**Status**: ✅ **FULLY IMPLEMENTED AND READY FOR TESTING**

### **Recent Implementation Completed:**

1. **✅ Database Schema Created**
   - Categories table with hierarchical support
   - Products table with comprehensive product data
   - Product images table for multiple images per product
   - All migrations run successfully

2. **✅ Complete API Implementation**
   - Category CRUD operations (Admin/Seller only)
   - Product CRUD operations (Admin/Seller only)
   - Public product browsing and search
   - Advanced filtering and pagination
   - Role-based access control

3. **✅ Clean Architecture Maintained**
   - Repository layer for data access
   - Service layer for business logic
   - Controller layer for HTTP handling
   - Factory layer for object creation
   - Composition layer for dependency injection
   - Validation layer for input validation

4. **✅ Server Status**
   - Backend server running successfully on `http://localhost:3000`
   - All Phase 2 endpoints tested and responding correctly
   - Database migrations completed successfully

### **Verified Working Endpoints:**
- ✅ Health Check: `GET /api/health`
- ✅ Version Info: `GET /api/version`
- ✅ All Category Routes: `/api/v1/categories/*`
- ✅ All Product Routes: `/api/v1/products/*`
- ✅ All Authentication Routes: `/api/v1/auth/*` (from Phase 1)
- ✅ All Admin Routes: `/api/v1/admin/*` (from Phase 1)

## 📋 **Backend API Summary**

### **Base URL**: `http://localhost:3000/api`
### **Current Version**: `v1`
### **Authentication**: JWT-based with access and refresh tokens

---

## 🛍️ **Product & Category Management System**

### **User Roles & Permissions**
- **ADMIN**: Full access to categories and products management
- **SELLER**: Can manage products and categories (same as admin for products)
- **CUSTOMER**: Can view, search, and filter products (public access)

### **Product Statuses**
- **DRAFT**: Product is in draft mode and not visible to customers
- **ACTIVE**: Product is active and visible to customers
- **INACTIVE**: Product is inactive and not visible to customers
- **OUT_OF_STOCK**: Product is out of stock but still visible

### **Category Statuses**
- **ACTIVE**: Category is active and visible to customers
- **INACTIVE**: Category is inactive and not visible to customers

---

## 🚀 **API Endpoints Reference**

### **Category Endpoints**

| Method | Endpoint | Description | Auth Required | Request Body |
|--------|----------|-------------|---------------|--------------|
| GET | `/api/v1/categories` | Get all categories with filtering | No | Query: `{ page?, limit?, is_active?, parent_id? }` |
| GET | `/api/v1/categories/active` | Get only active categories | No | None |
| GET | `/api/v1/categories/:id` | Get category by ID | No | None |
| GET | `/api/v1/categories/slug/:slug` | Get category by slug | No | None |
| GET | `/api/v1/categories/:id/products` | Get category with products | No | Query: `{ page?, limit?, status?, is_featured? }` |
| POST | `/api/v1/categories` | Create new category | Admin/Seller | `{ name, description?, parent_id?, image_url?, is_active?, sort_order? }` |
| PUT | `/api/v1/categories/:id` | Update category | Admin/Seller | `{ name?, description?, parent_id?, image_url?, is_active?, sort_order? }` |
| DELETE | `/api/v1/categories/:id` | Delete category | Admin/Seller | None |

### **Product Endpoints**

| Method | Endpoint | Description | Auth Required | Request Body |
|--------|----------|-------------|---------------|--------------|
| GET | `/api/v1/products` | Get all products with filtering | No | Query: `{ page?, limit?, status?, category_id?, is_featured?, min_price?, max_price?, in_stock?, brand?, sort?, order? }` |
| GET | `/api/v1/products/active` | Get only active products | No | Query: `{ page?, limit?, category_id?, is_featured?, min_price?, max_price?, in_stock?, brand?, sort?, order? }` |
| GET | `/api/v1/products/search` | Search products | No | Query: `{ q, page?, limit?, status?, category_id?, min_price?, max_price?, sort?, order? }` |
| GET | `/api/v1/products/featured` | Get featured products | No | Query: `{ limit? }` |
| GET | `/api/v1/products/category/:categoryId` | Get products by category | No | Query: `{ page?, limit?, status?, is_featured?, min_price?, max_price?, sort?, order? }` |
| GET | `/api/v1/products/:id` | Get product by ID | No | None |
| GET | `/api/v1/products/slug/:slug` | Get product by slug | No | None |
| POST | `/api/v1/products` | Create new product | Admin/Seller | See detailed schema below |
| PUT | `/api/v1/products/:id` | Update product | Admin/Seller | See detailed schema below |
| PATCH | `/api/v1/products/:id/stock` | Update product stock | Admin/Seller | `{ quantity }` |
| DELETE | `/api/v1/products/:id` | Delete product | Admin/Seller | None |

---

## 📱 **Frontend Implementation Guide**

### **1. Project Setup**

```bash
# If starting fresh, create React app
npx create-react-app ecommerce-frontend
cd ecommerce-frontend

# Install required dependencies (if not already installed)
npm install axios react-router-dom @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material @mui/x-date-pickers
npm install react-hook-form @hookform/resolvers yup
npm install react-query @tanstack/react-query
npm install js-cookie
npm install react-hot-toast
npm install @mui/x-data-grid  # For admin tables
npm install @mui/lab  # For advanced components
```

### **2. Environment Configuration**

Update `.env` file:
```env
REACT_APP_API_BASE_URL=http://localhost:3000/api
REACT_APP_API_VERSION=v1
REACT_APP_FRONTEND_URL=http://localhost:3000
```

### **3. Enhanced Folder Structure**

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Common components (Button, Input, Modal, etc.)
│   ├── auth/            # Authentication components
│   ├── admin/           # Admin-specific components
│   ├── products/        # Product-related components
│   ├── categories/      # Category-related components
│   └── layout/          # Layout components (Header, Sidebar, Footer)
├── pages/               # Page components
│   ├── auth/            # Authentication pages
│   ├── admin/           # Admin pages
│   ├── products/        # Product pages
│   ├── categories/      # Category pages
│   └── dashboard/       # User dashboard
├── hooks/               # Custom React hooks
├── services/            # API service functions
├── utils/               # Utility functions
├── context/             # React Context providers
├── constants/           # Application constants
├── types/               # TypeScript type definitions (if using TS)
└── assets/              # Static assets
```

### **4. Enhanced API Service Layer**

Create `src/services/productService.js`:

```javascript
import api from './api';

export const productService = {
  // Get all products with filtering
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get active products
  getActiveProducts: async (params = {}) => {
    const response = await api.get('/products/active', { params });
    return response.data;
  },

  // Search products
  searchProducts: async (query, params = {}) => {
    const response = await api.get('/products/search', { 
      params: { q: query, ...params } 
    });
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (limit = 10) => {
    const response = await api.get('/products/featured', { 
      params: { limit } 
    });
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (categoryId, params = {}) => {
    const response = await api.get(`/products/category/${categoryId}`, { params });
    return response.data;
  },

  // Get product by ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Get product by slug
  getProductBySlug: async (slug) => {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
  },

  // Create product (Admin/Seller only)
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product (Admin/Seller only)
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Update product stock (Admin/Seller only)
  updateProductStock: async (id, quantity) => {
    const response = await api.patch(`/products/${id}/stock`, { quantity });
    return response.data;
  },

  // Delete product (Admin/Seller only)
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};
```

Create `src/services/categoryService.js`:

```javascript
import api from './api';

export const categoryService = {
  // Get all categories with filtering
  getCategories: async (params = {}) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  // Get active categories
  getActiveCategories: async () => {
    const response = await api.get('/categories/active');
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Get category by slug
  getCategoryBySlug: async (slug) => {
    const response = await api.get(`/categories/slug/${slug}`);
    return response.data;
  },

  // Get category with products
  getCategoryWithProducts: async (id, params = {}) => {
    const response = await api.get(`/categories/${id}/products`, { params });
    return response.data;
  },

  // Create category (Admin/Seller only)
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Update category (Admin/Seller only)
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category (Admin/Seller only)
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};
```

### **5. Product & Category Components**

Create `src/components/products/ProductCard.js`:

```javascript
import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Rating
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleViewProduct = () => {
    navigate(`/products/${product.slug}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <Card sx={{ maxWidth: 345, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={product.primary_image?.image_url || '/placeholder-product.jpg'}
        alt={product.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {product.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {product.category_name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h6" color="primary">
            {formatPrice(product.price)}
          </Typography>
          {product.compare_price && product.compare_price > product.price && (
            <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
              {formatPrice(product.compare_price)}
            </Typography>
          )}
          {product.discount_percentage > 0 && (
            <Chip 
              label={`-${product.discount_percentage}%`} 
              color="error" 
              size="small" 
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip 
            label={product.in_stock ? 'In Stock' : 'Out of Stock'} 
            color={product.in_stock ? 'success' : 'error'} 
            size="small" 
          />
          {product.is_featured && (
            <Chip label="Featured" color="warning" size="small" />
          )}
        </Box>

        {product.brand && (
          <Typography variant="caption" color="text.secondary">
            Brand: {product.brand}
          </Typography>
        )}
      </CardContent>
      
      <CardActions>
        <Button 
          size="small" 
          variant="contained" 
          fullWidth
          onClick={handleViewProduct}
          disabled={!product.in_stock}
        >
          {product.in_stock ? 'View Details' : 'Out of Stock'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
```

Create `src/components/products/ProductFilters.js`:

```javascript
import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Chip
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

const ProductFilters = ({ categories, onFiltersChange, loading }) => {
  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      category_id: '',
      min_price: '',
      max_price: '',
      brand: '',
      in_stock: '',
      sort: 'created_at',
      order: 'desc'
    }
  });

  const watchedValues = watch();

  const onSubmit = (data) => {
    // Remove empty values
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== '')
    );
    onFiltersChange(filteredData);
  };

  const handleReset = () => {
    reset();
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(watchedValues).some(value => value !== '');

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select {...field} label="Category">
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Controller
            name="min_price"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Min Price"
                type="number"
                size="small"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Controller
            name="max_price"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Max Price"
                type="number"
                size="small"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Controller
            name="brand"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Brand"
                size="small"
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={1}>
          <Controller
            name="in_stock"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small">
                <InputLabel>Stock</InputLabel>
                <Select {...field} label="Stock">
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">In Stock</MenuItem>
                  <MenuItem value="false">Out of Stock</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Controller
            name="sort"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select {...field} label="Sort By">
                  <MenuItem value="created_at">Date Added</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="price">Price</MenuItem>
                  <MenuItem value="updated_at">Last Updated</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={1}>
          <Controller
            name="order"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small">
                <InputLabel>Order</InputLabel>
                <Select {...field} label="Order">
                  <MenuItem value="desc">Desc</MenuItem>
                  <MenuItem value="asc">Asc</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={loading}
            >
              Apply
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleReset}
              >
                Clear
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>

      {hasActiveFilters && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {Object.entries(watchedValues).map(([key, value]) => {
            if (!value) return null;
            return (
              <Chip
                key={key}
                label={`${key}: ${value}`}
                onDelete={() => {
                  const newValues = { ...watchedValues, [key]: '' };
                  reset(newValues);
                  onSubmit(newValues);
                }}
                size="small"
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default ProductFilters;
```

### **6. Product Search Component**

Create `src/components/products/ProductSearch.js`:

```javascript
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';

const ProductSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query.trim());
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await productService.searchProducts(searchQuery, { limit: 5 });
      setResults(response.data.products || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products/search?q=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
    }
  };

  const handleProductClick = (product) => {
    navigate(`/products/${product.slug}`);
    setShowResults(false);
    setQuery('');
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 600 }}>
      <form onSubmit={handleSearch}>
        <TextField
          fullWidth
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton onClick={handleClear} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </form>

      {showResults && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: 400,
            overflow: 'auto',
            mt: 1
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : results.length > 0 ? (
            <List>
              {results.map((product) => (
                <ListItem
                  key={product.id}
                  button
                  onClick={() => handleProductClick(product)}
                  sx={{ cursor: 'pointer' }}
                >
                  <ListItemText
                    primary={product.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {product.category_name}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          ${product.price}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : query.trim().length >= 2 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No products found for "{query}"
              </Typography>
            </Box>
          ) : null}
        </Paper>
      )}
    </Box>
  );
};

export default ProductSearch;
```

### **7. Key Pages to Implement**

#### **Product Pages**

1. **Product Listing Page** (`/products`)
   - Product grid with filtering
   - Pagination
   - Search functionality
   - Category filtering
   - Price range filtering

2. **Product Detail Page** (`/products/:slug`)
   - Product images gallery
   - Product information
   - Add to cart functionality
   - Related products
   - Reviews section (future phase)

3. **Product Search Results** (`/products/search`)
   - Search results display
   - Search filters
   - Sort options
   - Pagination

4. **Category Page** (`/categories/:slug`)
   - Category information
   - Products in category
   - Subcategories (if any)

#### **Admin/Seller Pages**

1. **Product Management** (`/admin/products`)
   - Products table with CRUD operations
   - Bulk actions
   - Product status management
   - Stock management

2. **Category Management** (`/admin/categories`)
   - Categories tree view
   - Category CRUD operations
   - Hierarchical category management

3. **Product Creation/Edit** (`/admin/products/new`, `/admin/products/:id/edit`)
   - Product form with validation
   - Image upload
   - Category selection
   - SEO fields

### **8. Custom Hooks**

Create `src/hooks/useProducts.js`:

```javascript
import { useState, useEffect } from 'react';
import { productService } from '../services/productService';

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchProducts = async (newFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProducts({ ...filters, ...newFilters });
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    pagination,
    refetch: fetchProducts
  };
};
```

Create `src/hooks/useCategories.js`:

```javascript
import { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryService.getActiveCategories();
      setCategories(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};
```

### **9. Enhanced Error Handling**

Update `src/utils/errorHandler.js`:

```javascript
export const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || 'Bad request';
      case 401:
        return 'Unauthorized access';
      case 403:
        return 'Access forbidden';
      case 404:
        return data.message || 'Resource not found';
      case 409:
        return data.message || 'Conflict occurred';
      case 422:
        return data.message || 'Validation failed';
      case 429:
        return 'Too many requests. Please try again later';
      case 500:
        return 'Internal server error';
      default:
        return data.message || 'An error occurred';
    }
  } else if (error.request) {
    return 'Network error. Please check your connection';
  } else {
    return 'An unexpected error occurred';
  }
};
```

### **10. Product Form Validation**

Create `src/utils/productValidation.js`:

```javascript
import * as yup from 'yup';

export const productSchema = yup.object({
  name: yup
    .string()
    .min(1, 'Product name is required')
    .max(255, 'Product name must be less than 255 characters')
    .required('Product name is required'),
  
  description: yup
    .string()
    .min(10, 'Product description must be at least 10 characters')
    .max(5000, 'Product description must be less than 5000 characters')
    .required('Product description is required'),
  
  sku: yup
    .string()
    .min(1, 'SKU is required')
    .max(100, 'SKU must be less than 100 characters')
    .matches(/^[A-Z0-9-_]+$/, 'SKU can only contain uppercase letters, numbers, hyphens, and underscores')
    .required('SKU is required'),
  
  price: yup
    .number()
    .positive('Price must be positive')
    .max(999999.99, 'Price must be less than 1,000,000')
    .required('Price is required'),
  
  compare_price: yup
    .number()
    .positive('Compare price must be positive')
    .max(999999.99, 'Compare price must be less than 1,000,000')
    .optional(),
  
  stock_quantity: yup
    .number()
    .integer('Stock quantity must be an integer')
    .min(0, 'Stock quantity must be non-negative')
    .max(999999, 'Stock quantity must be less than 1,000,000')
    .required('Stock quantity is required'),
  
  category_id: yup
    .number()
    .integer('Category ID must be an integer')
    .positive('Category ID must be positive')
    .required('Category is required'),
  
  brand: yup
    .string()
    .max(100, 'Brand must be less than 100 characters')
    .optional(),
  
  status: yup
    .string()
    .oneOf(['DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'])
    .required('Status is required'),
  
  is_featured: yup
    .boolean()
    .optional(),
  
  meta_title: yup
    .string()
    .max(255, 'Meta title must be less than 255 characters')
    .optional(),
  
  meta_description: yup
    .string()
    .max(500, 'Meta description must be less than 500 characters')
    .optional(),
  
  tags: yup
    .array()
    .of(yup.string().max(50, 'Each tag must be less than 50 characters'))
    .max(20, 'Maximum 20 tags allowed')
    .optional()
});
```

---

## 🎯 **Implementation Checklist**

### **Phase 2 Frontend Requirements**

- [ ] Project setup with required dependencies
- [ ] Environment configuration
- [ ] Enhanced API service layer (products & categories)
- [ ] Product components (ProductCard, ProductFilters, ProductSearch)
- [ ] Category components (CategoryCard, CategoryTree)
- [ ] Product listing page with filtering and pagination
- [ ] Product detail page with image gallery
- [ ] Product search functionality
- [ ] Category pages
- [ ] Admin product management pages
- [ ] Admin category management pages
- [ ] Product creation/edit forms
- [ ] Custom hooks for data fetching
- [ ] Enhanced error handling
- [ ] Form validation schemas
- [ ] Loading states and UX improvements
- [ ] Responsive design implementation
- [ ] Security best practices
- [ ] Testing setup and implementation

### **Backend Status (Phase 2 Complete)**
- [x] ✅ Database schema and migrations
- [x] ✅ Category CRUD operations
- [x] ✅ Product CRUD operations
- [x] ✅ Product search and filtering
- [x] ✅ Role-based access control
- [x] ✅ API versioning (/api/v1/)
- [x] ✅ Error handling and validation
- [x] ✅ Clean architecture implementation
- [x] ✅ All endpoints tested and working

### **Key Features to Implement**

1. **Product Catalog**
   - Product browsing with advanced filtering
   - Product search with real-time suggestions
   - Product detail pages with image galleries
   - Category-based product organization

2. **Admin Management**
   - Product CRUD operations
   - Category management with hierarchy
   - Stock management
   - Bulk operations

3. **User Experience**
   - Responsive design
   - Loading states
   - Error handling
   - Toast notifications
   - Form validation

4. **Performance**
   - Image optimization
   - Lazy loading
   - Pagination
   - Caching strategies

---

## 🚀 **Getting Started**

1. **Setup the backend** following the backend documentation
2. **Create/Update the React app** with the recommended folder structure
3. **Implement the enhanced API service layer** for products and categories
4. **Build product components** (ProductCard, ProductFilters, ProductSearch)
5. **Create product pages** (listing, detail, search)
6. **Implement admin management** for products and categories
7. **Add custom hooks** for data fetching
8. **Polish UX/UI** with loading states and error handling
9. **Test thoroughly** with different user roles and scenarios

---

## 🔧 **Troubleshooting Guide**

### **Common Issues & Solutions**

#### **1. Product Images Not Loading**
**Error**: Product images show as broken
**Solution**: 
- Ensure image URLs are valid
- Add fallback placeholder images
- Implement image optimization

#### **2. Search Not Working**
**Error**: Search returns no results
**Solution**:
- Check search query length (minimum 2 characters)
- Verify API endpoint is correct
- Check network requests in browser dev tools

#### **3. Filtering Issues**
**Error**: Filters not applying correctly
**Solution**:
- Verify filter parameter names match API
- Check data types (numbers vs strings)
- Ensure proper URL encoding

#### **4. Admin Access Issues**
**Error**: Cannot access admin pages
**Solution**:
- Verify user role is ADMIN or SELLER
- Check JWT token is valid
- Ensure proper authentication flow

### **Environment Setup Checklist**
- [ ] React app created with required dependencies
- [ ] Environment variables configured
- [ ] API service layer implemented
- [ ] Authentication context working
- [ ] Backend server running on correct port
- [ ] Database migrations completed

---

## 📞 **Support**

For any questions or clarifications about the backend API, refer to:
- Backend README.md
- API endpoint documentation
- Backend source code comments
- This troubleshooting guide

**Happy coding! 🎉**

---

## 🎯 **Next Steps**

After completing Phase 2 frontend implementation, you'll be ready for:
- **Phase 3**: Shopping Cart & Order Management
- **Phase 4**: Payment Integration
- **Phase 5**: Advanced Features (Reviews, Wishlist, etc.)

The foundation is now solid for building a complete e-commerce platform! 🚀
