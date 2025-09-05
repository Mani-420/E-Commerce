/**
 * Notification type constants
 * Defines the different types of notifications that can be sent
 */

const NOTIFICATION_TYPES = {
  WELCOME_EMAIL: 'WELCOME_EMAIL',
  OTP_EMAIL: 'OTP_EMAIL',
  PASSWORD_RESET_EMAIL: 'PASSWORD_RESET_EMAIL',
  LOGIN_NOTIFICATION: 'LOGIN_NOTIFICATION'
};

const NOTIFICATION_TYPES_VALUES = Object.values(NOTIFICATION_TYPES);

const NOTIFICATION_TYPE_DESCRIPTIONS = {
  [NOTIFICATION_TYPES.WELCOME_EMAIL]: 'Welcome email sent after successful email verification',
  [NOTIFICATION_TYPES.OTP_EMAIL]: 'OTP code sent via email',
  [NOTIFICATION_TYPES.PASSWORD_RESET_EMAIL]: 'Password reset link sent via email',
  [NOTIFICATION_TYPES.LOGIN_NOTIFICATION]: 'Login notification sent to user'
};

module.exports = {
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPES_VALUES,
  NOTIFICATION_TYPE_DESCRIPTIONS
};
