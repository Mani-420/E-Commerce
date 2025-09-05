/**
 * Authentication validation schemas using Zod
 * All request validation schemas for authentication endpoints
 */

const { z } = require('zod');
const { USER_ROLES, USER_ROLE_VALUES } = require('../constants/userRoles');

/**
 * User registration validation schema
 */
const registerSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email format')
      .min(1, 'Email is required')
      .max(255, 'Email must be less than 255 characters'),
    
    password: z.string()
      .min(8, 'Password must be at least 8 characters long')
      .max(100, 'Password must be less than 100 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    firstName: z.string()
      .min(1, 'First name is required')
      .max(100, 'First name must be less than 100 characters')
      .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
    
    lastName: z.string()
      .min(1, 'Last name is required')
      .max(100, 'Last name must be less than 100 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
    
    phone: z.string()
      .optional()
      .refine((val) => !val || /^\+?[\d\s\-\(\)]+$/.test(val), 
        'Invalid phone number format'),
    
    role: z.enum(USER_ROLE_VALUES, {
      errorMap: () => ({ message: `Role must be one of: ${USER_ROLE_VALUES.join(', ')}` })
    }).optional().default(USER_ROLES.CUSTOMER)
  })
});

/**
 * User login validation schema
 */
const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email format')
      .min(1, 'Email is required'),
    
    password: z.string()
      .min(1, 'Password is required')
  })
});

/**
 * OTP verification validation schema
 */
const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email format')
      .min(1, 'Email is required'),
    
    otpCode: z.string()
      .length(6, 'OTP code must be exactly 6 digits')
      .regex(/^\d{6}$/, 'OTP code must contain only numbers')
  })
});

/**
 * Forgot password validation schema
 */
const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email format')
      .min(1, 'Email is required')
  })
});

/**
 * Reset password validation schema
 */
const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string()
      .min(1, 'Reset token is required'),
    
    password: z.string()
      .min(8, 'Password must be at least 8 characters long')
      .max(100, 'Password must be less than 100 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  })
});

/**
 * Resend OTP validation schema
 */
const resendOtpSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email format')
      .min(1, 'Email is required')
  })
});

/**
 * Change password validation schema (for authenticated users)
 */
const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string()
      .min(1, 'Current password is required'),
    
    newPassword: z.string()
      .min(8, 'New password must be at least 8 characters long')
      .max(100, 'New password must be less than 100 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
        'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendOtpSchema,
  changePasswordSchema
};
