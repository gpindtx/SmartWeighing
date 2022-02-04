const Validator = module.exports;
const { ObjectId } = require('mongoose').Types;

/**
 * Checks if a provided email adheres to the RFC
 * @param email
 * @returns {boolean}
 */
Validator.isEmailValid = email => {
  const re = /^[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/;
  if (re.test(email.toUpperCase())) return true;
  return false;
};

/**
 *
 * @param id The objectID to verify.
 * @returns {boolean} True if the object id is valid, False otherwise.
 */
Validator.isObjectIDValid = id => {
  if (ObjectId.isValid(id)) return true;
  return false;
};