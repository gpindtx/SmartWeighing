const Utils = module.exports;

/**
 * Checks if value is numeric;
 * @param value The value to be checked
 * @returns {boolean|boolean} True if it is a number, False otherwise.
 */
Utils.isNumeric = value => {
  const re = /^\d+$/;
  return re.test(value);
};

/**
 * Checks if a value matches a regular expression
 * @param regexp The regular expression to test.
 * @param value The value to use for the test.
 * @returns {*} True if the value matches, False otherwise.
 */
Utils.matches = (regexp, value) => {
  return regexp.test(value);
};