/**
 * OTP (One-Time Password) type constants
 * Defines the different types of OTP verification codes
 */

const OTP_TYPES = {
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET'
};

const OTP_TYPES_VALUES = Object.values(OTP_TYPES);

const OTP_TYPE_DESCRIPTIONS = {
  [OTP_TYPES.EMAIL_VERIFICATION]: 'OTP for email verification during registration',
  [OTP_TYPES.PASSWORD_RESET]: 'OTP for password reset functionality'
};

module.exports = {
  OTP_TYPES,
  OTP_TYPES_VALUES,
  OTP_TYPE_DESCRIPTIONS
};
