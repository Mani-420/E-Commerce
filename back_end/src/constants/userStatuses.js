/**
 * User status constants for the e-commerce platform
 * Defines the different user account statuses and their allowed values
 */

const USER_STATUSES = {
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED'
};

const USER_STATUS_VALUES = Object.values(USER_STATUSES);

const USER_STATUS_DESCRIPTIONS = {
  [USER_STATUSES.PENDING_VERIFICATION]: 'User registered but email not verified',
  [USER_STATUSES.ACTIVE]: 'User account is active and verified',
  [USER_STATUSES.SUSPENDED]: 'User account is temporarily suspended',
  [USER_STATUSES.DELETED]: 'User account is soft deleted'
};

module.exports = {
  USER_STATUSES,
  USER_STATUS_VALUES,
  USER_STATUS_DESCRIPTIONS
};
