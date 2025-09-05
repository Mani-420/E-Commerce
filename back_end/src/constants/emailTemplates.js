/**
 * Email template constants
 * Defines the different email templates used in the application
 */

const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  OTP_VERIFICATION: 'otp-verification',
  PASSWORD_RESET: 'password-reset',
  LOGIN_NOTIFICATION: 'login-notification'
};

const EMAIL_TEMPLATES_VALUES = Object.values(EMAIL_TEMPLATES);

const EMAIL_TEMPLATE_DESCRIPTIONS = {
  [EMAIL_TEMPLATES.WELCOME]: 'Welcome email template for new users',
  [EMAIL_TEMPLATES.OTP_VERIFICATION]: 'OTP verification email template',
  [EMAIL_TEMPLATES.PASSWORD_RESET]: 'Password reset email template',
  [EMAIL_TEMPLATES.LOGIN_NOTIFICATION]: 'Login notification email template'
};

module.exports = {
  EMAIL_TEMPLATES,
  EMAIL_TEMPLATES_VALUES,
  EMAIL_TEMPLATE_DESCRIPTIONS
};
