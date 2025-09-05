/**
 * Validation schemas index
 * Centralized export of all validation schemas
 */

const authValidators = require('./authValidators');
const categoryValidators = require('./categoryValidators');
const productValidators = require('./productValidators');

module.exports = {
  ...authValidators,
  ...categoryValidators,
  ...productValidators
};
