const FilterValidator = module.exports;
const Errors = require('../../config/app/errorCodes');
const { appSettings } = require('../../config/app/appConfig');
const { isNumeric, matches } = require('../../helpers/utils');
const VALID_GROUP_KEYS = appSettings.validGroupKeys;
const VALID_DATE_FORMATS = appSettings.validDateFormats;

/**
 * Checks if the provided date operands are valid.
 * @param from_date The timestamp of the minimum date to look for.
 * @param until_date The timestamp of the maximum date to look for.
 * @returns {number} 0 if the dates are valid, otherwise returns the error code.
 */
FilterValidator.validateDates = (from_date, until_date) => {
  const re = /\d\d?\-\d\d?\-\d{4} \d\d?:\d\d?:\d\d?/;
  if (from_date && !matches(re, from_date) && !isNumeric(from_date)) {
    return Errors.InvalidFromDateOperand;
  }

  if (until_date && !matches(re, until_date) && !isNumeric(until_date)) {
    return Errors.InvalidUntilDateOperand;
  }

  if (from_date && until_date && until_date < from_date) {
    return Errors.InvalidDateInterval;
  }

  return 0;
};

/**
 * Checks if the provided weight operands are valid.
 * @param from_weight The minimum weight to look for
 * @param until_weight The maximum weight to look for
 * @returns {number} 0 if the weights are valid, otherwise returns the error code.
 */
FilterValidator.validateWeights = (from_weight, until_weight) => {
  if (from_weight && !isNumeric(from_weight)) {
    return Errors.InvalidFromWeightOperand;
  }

  if (until_weight && !isNumeric(until_weight)) {
    return Errors.InvalidUntilWeightOperand;
  }

  if (from_weight && until_weight && until_weight < from_weight) {
    return Errors.InvalidWeightInterval;
  }

  return 0;
};

/**
 * Checks if the provided grouping key is valid.
 * @param groupKey The key by which tickets should be grouped
 * @returns {number} 0 if the groupKey is valid, otherwise returns the error code.
 */
FilterValidator.validateGroupKey = groupKey => {
  if (groupKey && !VALID_GROUP_KEYS.includes(groupKey)) {
    return Errors.InvalidGroupKey;
  }

  return 0;
};

/**
 * Checks if the provided date format is valid.
 * @param dateFormat  The format the date should be transformed in
 * @returns {number} 0 if the dateFormat is valid, otherwise returns the error.code.
 */
FilterValidator.validateDateFormat = dateFormat => {
  if (dateFormat && !VALID_DATE_FORMATS.includes(dateFormat)) {
    return Errors.InvalidDateFormat;
  }

  return 0;
};

