/**
 * Category status constants for the e-commerce platform
 * Defines the different category statuses and their allowed values
 */

const CATEGORY_STATUSES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

const CATEGORY_STATUS_VALUES = Object.values(CATEGORY_STATUSES);

const CATEGORY_STATUS_DESCRIPTIONS = {
  [CATEGORY_STATUSES.ACTIVE]: 'Category is active and visible to customers',
  [CATEGORY_STATUSES.INACTIVE]: 'Category is inactive and not visible to customers'
};

module.exports = {
  CATEGORY_STATUSES,
  CATEGORY_STATUS_VALUES,
  CATEGORY_STATUS_DESCRIPTIONS
};
