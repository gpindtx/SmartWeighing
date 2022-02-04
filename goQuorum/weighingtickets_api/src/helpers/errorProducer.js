const ErrorProducer = module.exports;
const Errors = require('../config/app/errorCodes');

/**
 * Produces an Error object indicating that the ticket with the given ticketID does not exist.
 * @param ticketID The ticketID of the ticket that does not exist. String.
 * @returns {Error} The Error object with the appropriate message and code.
 */
ErrorProducer.produceTicketDoesNotExistError = ticketID => {
  const error = new Error('Ticket Does Not Exist. TicketID: ' + ticketID);
  error.code = Errors.TicketDoesNotExist;
  return error;
};

/**
 * Produces an Error object indicating that the date parameters of the filter, if provided, are incorrect.
 * @param code The error code of the specific date operands error.
 * @param from_date The minimum date operand.
 * @param until_date The maximum date operand.
 * @returns {Error} The Error object with the appropriate message and code.
 */
ErrorProducer.produceDateOperandsError = (code, from_date, until_date) => {
  const error = new Error();
  if (code === Errors.InvalidFromDateOperand) {
    error.message = 'From date has an invalid structure, it is not a number neither complies with format dd-mm-yyyy hh:mm:ss. from_date: ' +
      from_date;
  } else if (code === Errors.InvalidUntilDateOperand) {
    error.message = 'Until date has an invalid structure, it is not a number neither complies with format dd-mm-yyyy hh:mm:ss. until_date: ' +
      until_date;
  } else if (code === Errors.InvalidDateInterval) {
    error.message = 'Until date is smaller than From date. until_date: ' +
      until_date + '; from_date: ' + from_date;
  } else {
    error.message = 'An unknown error occured when validating dates. Please try again.';
  }

  error.code = code;
  return error;
};

/**
 * Produces an Error object indicating that the weight parameters of the filter, if provided, are incorrect.
 * @param code The error code of the specific weight operands error.
 * @param from_weight The minimum weight operand.
 * @param until_weight The maximum weight operand.
 * @returns {Error} The Error object with the appropriate message and code.
 */
ErrorProducer.produceWeightOperandsError = (
  code, from_weight, until_weight) => {
  const error = new Error();
  if (code === Errors.InvalidFromWeightOperand) {
    error.message = 'From weight has an invalid structure, it is not a number. from_weight: ' +
      from_weight;
  } else if (code === Errors.InvalidUntilWeightOperand) {
    error.message = 'Until weight has an invalid structure, it is not a number. until_weight: ' +
      until_weight;
  } else if (code === Errors.InvalidWeightInterval) {
    error.message = 'Until weight is smaller than From weight. until_weight: ' +
      until_weight + '; from_weight: ' + from_weight;
  } else {
    error.message = 'An unknown error occurred when validating weights. Please try again.';
  }

  error.code = code;
  return error;
};

/**
 * Produces an Error object indicating that the key to group tickets by is not recognized.
 * @param code The error code of the specific groupBy Error.
 * @param groupKey The key by which the tickets should be grouped.
 * @param availableKeys The available keys for grouping tickets.
 * @returns {Error} The Error object with the appropriate message and code.
 */
ErrorProducer.produceGroupByKeyError = (code, groupKey, availableKeys) => {
  const error = new Error();
  if (code === Errors.InvalidGroupKey) {
    error.message = 'Group Key was not recognized. Provided key: ' + groupKey +
      ' ; Available keys: ' + availableKeys;
  } else {
    error.message = 'An unknown error occurred when validating the groupKey. Please try again.';
  }

  error.code = code;
  return error;
};

/**
 * Produces an Error object indicating that the format provided for dates is not recognized.
 * @param code The error code of the specific dateFormat Error.
 * @param dateFormat The format by which the dates should be formatted.
 * @param availableDateFormats The available date formats.
 * @returns {Error} The Error object with the appropriate message and code.
 */
ErrorProducer.produceDateFormatError = (
  code, dateFormat, availableDateFormats) => {
  const error = new Error();
  if (code === Errors.InvalidDateFormat) {
    error.message = 'Date format was not recognized. Provided date format: ' +
      dateFormat + ' ; Available date formats: ' + availableDateFormats;
  } else {
    error.message = 'An unknown error occurred when validating the dateFormat. Please try again.';
  }

  error.code = code;
  return error;
};

