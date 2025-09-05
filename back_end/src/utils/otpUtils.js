/**
 * OTP Utility Functions
 * Helper functions for OTP generation and management
 */

const crypto = require('crypto');

/**
 * Generate a random OTP code
 * @param {number} length - OTP length (default: 6)
 * @returns {string} Generated OTP code
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  
  return otp;
};

/**
 * Generate OTP expiry time
 * @param {number} minutes - Expiry time in minutes (default: 10)
 * @returns {Date} Expiry date
 */
const generateOtpExpiry = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Generate password reset token
 * @returns {string} Random reset token
 */
const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateOTP,
  generateOtpExpiry,
  generatePasswordResetToken
};
