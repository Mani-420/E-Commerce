/**
 * Product status constants for the e-commerce platform
 * Defines the different product statuses and their allowed values
 */

const PRODUCT_STATUSES = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  OUT_OF_STOCK: 'OUT_OF_STOCK'
};

const PRODUCT_STATUS_VALUES = Object.values(PRODUCT_STATUSES);

const PRODUCT_STATUS_DESCRIPTIONS = {
  [PRODUCT_STATUSES.DRAFT]: 'Product is in draft mode and not visible to customers',
  [PRODUCT_STATUSES.ACTIVE]: 'Product is active and visible to customers',
  [PRODUCT_STATUSES.INACTIVE]: 'Product is inactive and not visible to customers',
  [PRODUCT_STATUSES.OUT_OF_STOCK]: 'Product is out of stock but still visible'
};

module.exports = {
  PRODUCT_STATUSES,
  PRODUCT_STATUS_VALUES,
  PRODUCT_STATUS_DESCRIPTIONS
};
