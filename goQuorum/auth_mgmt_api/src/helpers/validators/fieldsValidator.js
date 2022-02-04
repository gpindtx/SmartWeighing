const Validator = module.exports;

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