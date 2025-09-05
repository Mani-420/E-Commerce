/**
 * Standard API response messages
 * Centralized messages for consistent API responses
 */

const API_MESSAGES = {
  // Authentication messages
  USER_REGISTERED: 'User registered successfully. Please verify your email.',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  EMAIL_VERIFIED: 'Email verified successfully',
  PASSWORD_RESET_SENT: 'Password reset email sent',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',
  WELCOME_EMAIL_SENT: 'Welcome email sent',
  
  // OTP messages
  OTP_SENT: 'OTP sent successfully',
  OTP_VERIFIED: 'OTP verified successfully',
  OTP_EXPIRED: 'OTP has expired',
  OTP_INVALID: 'Invalid OTP code',
  
  // Error messages
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  EMAIL_ALREADY_VERIFIED: 'Email already verified',
  ACCOUNT_SUSPENDED: 'Account is suspended',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  
  // Category messages
  CATEGORY_CREATED: 'Category created successfully',
  CATEGORY_UPDATED: 'Category updated successfully',
  CATEGORY_DELETED: 'Category deleted successfully',
  CATEGORY_NOT_FOUND: 'Category not found',
  CATEGORY_ALREADY_EXISTS: 'Category with this name already exists',
  CATEGORY_SLUG_EXISTS: 'Category with this slug already exists',
  
  // Product messages
  PRODUCT_CREATED: 'Product created successfully',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_DELETED: 'Product deleted successfully',
  PRODUCT_NOT_FOUND: 'Product not found',
  PRODUCT_SKU_EXISTS: 'Product with this SKU already exists',
  PRODUCT_SLUG_EXISTS: 'Product with this slug already exists',
  PRODUCT_STOCK_UPDATED: 'Product stock updated successfully',
  PRODUCT_FEATURED_UPDATED: 'Product featured status updated successfully',
  
  // General messages
  SUCCESS: 'Operation completed successfully',
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_ERROR: 'Internal server error'
};

module.exports = {
  API_MESSAGES
};
