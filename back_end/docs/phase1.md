# Phase 1 - Frontend Implementation Guide

## 🎯 **Overview**

This document provides comprehensive guidance for implementing a React.js frontend that perfectly integrates with the E-commerce Backend API Phase 1. The backend provides user authentication, authorization, and basic user management functionality.

## ✅ **Current Status & Testing Updates**

**Last Updated**: September 5, 2025  
**Status**: ✅ **FULLY TESTED AND WORKING**

### **Recent Fixes Applied During Testing:**

1. **✅ Database Connection Fixed**
   - MySQL connection established successfully
   - Database `ecommerce_db` created and migrations run
   - Password configuration resolved

2. **✅ Nodemailer Error Fixed**
   - Fixed `nodemailer.createTransporter` → `nodemailer.createTransport`
   - Email service now working properly

3. **✅ API Versioning Confirmed**
   - All routes properly versioned with `/api/v1/` pattern
   - Health check and version endpoints working
   - Authentication and admin routes fully functional

4. **✅ Server Status**
   - Backend server running successfully on `http://localhost:3000`
   - All endpoints tested and responding correctly
   - Database migrations completed successfully

### **Verified Working Endpoints:**
- ✅ Health Check: `GET /api/health`
- ✅ Version Info: `GET /api/version`
- ✅ All Authentication Routes: `/api/v1/auth/*`
- ✅ All Admin Routes: `/api/v1/admin/*`

## 📋 **Backend API Summary**

### **Base URL**: `http://localhost:3000/api`
### **Current Version**: `v1`
### **Authentication**: JWT-based with access and refresh tokens

---

## 🔐 **Authentication System**

### **User Roles**
- **ADMIN**: Full system access, user management
- **SELLER**: Product management capabilities (future phases)
- **CUSTOMER**: Standard user access

### **User Statuses**
- **PENDING_VERIFICATION**: User registered but email not verified
- **ACTIVE**: User account is active and verified
- **SUSPENDED**: User account is temporarily suspended
- **DELETED**: User account is soft deleted

---

## 🚀 **API Endpoints Reference**

### **Authentication Endpoints**

| Method | Endpoint | Description | Auth Required | Request Body |
|--------|----------|-------------|---------------|--------------|
| POST | `/api/v1/auth/register` | Register new user | No | `{ email, password, firstName, lastName, phone?, role? }` |
| POST | `/api/v1/auth/login` | User login | No | `{ email, password }` |
| POST | `/api/v1/auth/logout` | User logout | Yes | None |
| POST | `/api/v1/auth/verify-otp` | Verify email with OTP | No | `{ email, otpCode }` |
| POST | `/api/v1/auth/resend-otp` | Resend OTP | No | `{ email }` |
| POST | `/api/v1/auth/forgot-password` | Request password reset | No | `{ email }` |
| POST | `/api/v1/auth/reset-password` | Reset password | No | `{ token, password }` |
| POST | `/api/v1/auth/refresh-token` | Refresh access token | No | `{ refreshToken }` |
| GET | `/api/v1/auth/me` | Get current user profile | Yes | None |
| PUT | `/api/v1/auth/me` | Update user profile | Yes | `{ firstName?, lastName?, phone? }` |
| PUT | `/api/v1/auth/change-password` | Change password | Yes | `{ currentPassword, newPassword }` |

### **Admin Endpoints**

| Method | Endpoint | Description | Auth Required | Request Body |
|--------|----------|-------------|---------------|--------------|
| GET | `/api/v1/admin/users` | Get all users | Admin | Query: `{ page?, limit?, role?, status? }` |
| GET | `/api/v1/admin/users/:userId` | Get user by ID | Admin | None |
| PUT | `/api/v1/admin/users/:userId/status` | Update user status | Admin | `{ status }` |
| DELETE | `/api/v1/admin/users/:userId` | Delete user | Admin | None |
| GET | `/api/v1/admin/stats` | Get system statistics | Admin | None |

### **Utility Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Health check | No |
| GET | `/api/version` | API version info | No |

---

## 📱 **Frontend Implementation Guide**

### **1. Project Setup**

```bash
# Create React app
npx create-react-app ecommerce-frontend
cd ecommerce-frontend

# Install required dependencies
npm install axios react-router-dom @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material @mui/x-date-pickers
npm install react-hook-form @hookform/resolvers yup
npm install react-query @tanstack/react-query
npm install js-cookie
npm install react-hot-toast
```

### **2. Environment Configuration**

Create `.env` file:
```env
REACT_APP_API_BASE_URL=http://localhost:3000/api
REACT_APP_API_VERSION=v1
REACT_APP_FRONTEND_URL=http://localhost:3000
```

### **3. Folder Structure**

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Common components (Button, Input, Modal, etc.)
│   ├── auth/            # Authentication components
│   ├── admin/           # Admin-specific components
│   └── layout/          # Layout components (Header, Sidebar, Footer)
├── pages/               # Page components
│   ├── auth/            # Authentication pages
│   ├── admin/           # Admin pages
│   └── dashboard/       # User dashboard
├── hooks/               # Custom React hooks
├── services/            # API service functions
├── utils/               # Utility functions
├── context/             # React Context providers
├── constants/           # Application constants
├── types/               # TypeScript type definitions (if using TS)
└── assets/              # Static assets
```

### **4. API Service Layer**

Create `src/services/api.js`:

```javascript
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_VERSION = process.env.REACT_APP_API_VERSION;

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = Cookies.get('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/${API_VERSION}/auth/refresh-token`, {
            refreshToken
          });
          
          const { accessToken } = response.data.data;
          Cookies.set('accessToken', accessToken, { expires: 7 });
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### **5. Authentication Service**

Create `src/services/authService.js`:

```javascript
import api from './api';
import Cookies from 'js-cookie';

export const authService = {
  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { user, accessToken, refreshToken } = response.data.data;
    
    // Store tokens in cookies
    Cookies.set('accessToken', accessToken, { expires: 7 });
    Cookies.set('refreshToken', refreshToken, { expires: 30 });
    
    return { user, accessToken, refreshToken };
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
    }
  },

  // Verify OTP
  verifyOtp: async (email, otpCode) => {
    const response = await api.post('/auth/verify-otp', { email, otpCode });
    return response.data;
  },

  // Resend OTP
  resendOtp: async (email) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/me', userData);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};
```

### **6. Admin Service**

Create `src/services/adminService.js`:

```javascript
import api from './api';

export const adminService = {
  // Get all users
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  // Update user status
  updateUserStatus: async (userId, status) => {
    const response = await api.put(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Get system stats
  getSystemStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  }
};
```

### **7. Authentication Context**

Create `src/context/AuthContext.js`:

```javascript
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authService } from '../services/authService';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  role: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        role: action.payload.user.role
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        role: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('accessToken');
      if (token) {
        try {
          const response = await authService.getCurrentUser();
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: response.data.user }
          });
        } catch (error) {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
        }
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const { user } = await authService.login(credentials);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user } });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = async () => {
    await authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### **8. Protected Route Component**

Create `src/components/common/ProtectedRoute.js`:

```javascript
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

### **9. Form Validation Schemas**

Create `src/utils/validationSchemas.js`:

```javascript
import * as yup from 'yup';

export const registerSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character'
    )
    .required('Password is required'),
  firstName: yup
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters')
    .matches(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces')
    .required('First name is required'),
  lastName: yup
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces')
    .required('Last name is required'),
  phone: yup
    .string()
    .matches(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .optional()
});

export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
});

export const otpSchema = yup.object({
  otpCode: yup
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .matches(/^\d{6}$/, 'OTP must contain only numbers')
    .required('OTP is required')
});

export const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required')
});

export const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required')
});

export const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('Current password is required'),
  newPassword: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character'
    )
    .required('New password is required'),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm new password is required')
});

export const updateProfileSchema = yup.object({
  firstName: yup
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters')
    .matches(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  lastName: yup
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  phone: yup
    .string()
    .matches(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .optional()
});
```

### **10. Key Pages to Implement**

#### **Authentication Pages**

1. **Login Page** (`/login`)
   - Email and password fields
   - "Forgot Password" link
   - "Don't have an account? Register" link
   - Form validation with error handling

2. **Register Page** (`/register`)
   - Email, password, first name, last name fields
   - Optional phone field
   - Role selection (default: CUSTOMER)
   - Form validation with error handling

3. **Email Verification Page** (`/verify-email`)
   - OTP input field (6 digits)
   - Resend OTP button with cooldown timer
   - Email display for confirmation

4. **Forgot Password Page** (`/forgot-password`)
   - Email input field
   - Success message after submission

5. **Reset Password Page** (`/reset-password`)
   - Token from URL parameter
   - New password and confirm password fields
   - Form validation

#### **User Dashboard Pages**

1. **Dashboard Home** (`/dashboard`)
   - Welcome message with user name
   - Quick stats (if applicable)
   - Recent activity

2. **Profile Page** (`/profile`)
   - View and edit profile information
   - Change password section
   - Account status display

#### **Admin Pages**

1. **Admin Dashboard** (`/admin/dashboard`)
   - System statistics
   - Quick actions
   - Recent user registrations

2. **User Management** (`/admin/users`)
   - Users table with pagination
   - Search and filter functionality
   - Status update actions
   - User details modal

3. **User Details** (`/admin/users/:userId`)
   - Complete user information
   - Status change functionality
   - Delete user action

### **11. Error Handling**

Create `src/utils/errorHandler.js`:

```javascript
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || 'Bad request';
      case 401:
        return 'Unauthorized access';
      case 403:
        return 'Access forbidden';
      case 404:
        return 'Resource not found';
      case 409:
        return data.message || 'Conflict occurred';
      case 429:
        return 'Too many requests. Please try again later';
      case 500:
        return 'Internal server error';
      default:
        return data.message || 'An error occurred';
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection';
  } else {
    // Other error
    return 'An unexpected error occurred';
  }
};
```

### **12. Toast Notifications**

Use `react-hot-toast` for user feedback:

```javascript
import toast from 'react-hot-toast';

// Success messages
toast.success('Login successful!');
toast.success('Profile updated successfully!');

// Error messages
toast.error('Login failed. Please check your credentials.');
toast.error('Network error. Please try again.');

// Loading states
const loadingToast = toast.loading('Processing...');
// Later: toast.dismiss(loadingToast);
```

### **13. Loading States**

Implement loading states for better UX:

```javascript
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (data) => {
  setIsLoading(true);
  try {
    await authService.login(data);
    toast.success('Login successful!');
  } catch (error) {
    toast.error(handleApiError(error));
  } finally {
    setIsLoading(false);
  }
};
```

### **14. Responsive Design**

Use Material-UI's responsive breakpoints:

```javascript
import { useTheme, useMediaQuery } from '@mui/material';

const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
const isTablet = useMediaQuery(theme.breakpoints.down('md'));
```

### **15. Security Considerations**

1. **Token Storage**: Use httpOnly cookies (if possible) or secure localStorage
2. **XSS Protection**: Sanitize user inputs
3. **CSRF Protection**: Include CSRF tokens in requests
4. **Input Validation**: Validate all inputs on both client and server
5. **Error Messages**: Don't expose sensitive information in error messages

### **16. Testing Recommendations**

1. **Unit Tests**: Test individual components and functions
2. **Integration Tests**: Test API integration
3. **E2E Tests**: Test complete user flows
4. **Error Scenarios**: Test error handling and edge cases

### **17. Performance Optimization**

1. **Code Splitting**: Use React.lazy() for route-based splitting
2. **Memoization**: Use React.memo() and useMemo() where appropriate
3. **Image Optimization**: Optimize images and use lazy loading
4. **Bundle Analysis**: Use webpack-bundle-analyzer to optimize bundle size

---

## 🎯 **Implementation Checklist**

### **Phase 1 Frontend Requirements**

- [ ] Project setup with required dependencies
- [ ] Environment configuration
- [ ] API service layer implementation
- [ ] Authentication context and hooks
- [ ] Protected route components
- [ ] Form validation schemas
- [ ] Login page with validation
- [ ] Register page with validation
- [ ] Email verification page with OTP
- [ ] Forgot password flow
- [ ] Reset password page
- [ ] User dashboard
- [ ] Profile management page
- [ ] Admin dashboard (for admin users)
- [ ] User management (for admin users)
- [ ] Error handling and toast notifications
- [ ] Loading states and UX improvements
- [ ] Responsive design implementation
- [ ] Security best practices
- [ ] Testing setup and implementation

### **Backend Status (Phase 1 Complete)**
- [x] ✅ Database setup and migrations
- [x] ✅ User authentication system
- [x] ✅ JWT token management
- [x] ✅ Email verification with OTP
- [x] ✅ Password reset functionality
- [x] ✅ Admin user management
- [x] ✅ API versioning (/api/v1/)
- [x] ✅ Error handling and validation
- [x] ✅ Rate limiting and security
- [x] ✅ All endpoints tested and working

### **Key Features to Implement**

1. **Authentication Flow**
   - User registration with email verification
   - Login with JWT token management
   - Password reset functionality
   - Automatic token refresh

2. **User Management**
   - Profile viewing and editing
   - Password change functionality
   - Account status awareness

3. **Admin Features**
   - User listing with pagination
   - User status management
   - System statistics dashboard

4. **UX/UI Features**
   - Responsive design
   - Loading states
   - Error handling
   - Toast notifications
   - Form validation

---

## 🚀 **Getting Started**

1. **Setup the backend** following the backend documentation
2. **Create the React app** with the recommended folder structure
3. **Implement the API service layer** first
4. **Set up authentication context** and protected routes
5. **Build authentication pages** (login, register, verification)
6. **Implement user dashboard** and profile management
7. **Add admin features** for admin users
8. **Polish UX/UI** with loading states and error handling
9. **Test thoroughly** with different user roles and scenarios

---

## 🔧 **Troubleshooting Guide**

### **Common Issues & Solutions**

#### **1. Database Connection Issues**
**Error**: `Access denied for user 'root'@'localhost'`
**Solution**: 
- Update `.env` file with correct MySQL password
- Update `database.json` with matching password
- Ensure MySQL service is running

#### **2. Nodemailer Errors**
**Error**: `nodemailer.createTransporter is not a function`
**Solution**: 
- Use `nodemailer.createTransport()` (not `createTransporter`)
- Ensure email configuration in `.env` is correct

#### **3. Database Not Found**
**Error**: `Unknown database 'ecommerce_db'`
**Solution**:
```bash
# Create database manually
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ecommerce_db;"

# Then run migrations
npm run migrate
```

#### **4. Migration Issues**
**Error**: Migration fails to run
**Solution**:
- Ensure database exists
- Check `database.json` configuration
- Verify MySQL connection credentials

#### **5. Server Won't Start**
**Common Causes**:
- Port 3000 already in use
- Database connection issues
- Missing environment variables
- Invalid email configuration

### **Environment Setup Checklist**
- [ ] MySQL installed and running
- [ ] Database `ecommerce_db` created
- [ ] `.env` file configured with correct credentials
- [ ] `database.json` matches `.env` settings
- [ ] All dependencies installed (`npm install`)
- [ ] Migrations run successfully (`npm run migrate`)

---

## 📞 **Support**

For any questions or clarifications about the backend API, refer to:
- Backend README.md
- API endpoint documentation
- Backend source code comments
- This troubleshooting guide

**Happy coding! 🎉**
