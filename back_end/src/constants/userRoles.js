/**
 * User role constants for the e-commerce platform
 * Defines the different user roles and their allowed values
 */

const USER_ROLES = {
  ADMIN: 'ADMIN',
  SELLER: 'SELLER',
  CUSTOMER: 'CUSTOMER'
};

const USER_ROLE_VALUES = Object.values(USER_ROLES);

const USER_ROLE_DESCRIPTIONS = {
  [USER_ROLES.ADMIN]: 'System administrator with full access',
  [USER_ROLES.SELLER]: 'Seller who can manage products and orders',
  [USER_ROLES.CUSTOMER]: 'Regular customer who can browse and purchase'
};

module.exports = {
  USER_ROLES,
  USER_ROLE_VALUES,
  USER_ROLE_DESCRIPTIONS
};
