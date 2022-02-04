const Abstractor = module.exports;
const web3 = require('web3');
const { appSettings } = require('../config/app/appConfig');
const CONVERSION_FACTOR = appSettings.conversionFactor; // Default is 10^4
const MONTHS_ARRAY = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'];

/**
 * Converts a ticket with smart contract structure to Javascript Object Notation.
 * @param ticket The ticket to be converted.
 * @param dateFormat the format to convert the date. A string that must be
 * "simple_date", "simple_date_hour"; "full_date", "timestamp"
 * @returns {object} The same ticket in Javascript Object Notation.
 */
Abstractor.ticketToJSON = (ticket, dateFormat) => {
  // A ticket from the smart contract eight fixed position plus 0-8 more load cells.
  const jsonTicket = {
    'ticketID': ticket[0],
    'terminalSerialNumber': ticket[1],
    'terminalRestartValue': ticket[2],
    'timestamp': Abstractor.asDate(ticket[3], dateFormat),
    'scaleSerialNumber': ticket[4],
    'scaleStatus': ticket[5],
    'scaleGross': Abstractor.asFloat(ticket[6]),
    'scaleNet': Abstractor.asFloat(ticket[7]),
    'cells': []
  };

  for (let i = 8; i < ticket.length; i++) {
    if (!(ticket[i][0] === 'NONE')) {
      jsonTicket.cells.push({
        'cellSerialNumber': ticket[i][0],
        'cellWeight': Abstractor.asFloat(ticket[i][1])
      });
    }
  }

  return jsonTicket;
};

/**
 * Converts a ticket in Javascript Object Notation to a ticket with smart contract structure.
 * @param jsonTicket The ticket to be converted.
 * @returns {object} The ticket in smart contract structure.
 */
Abstractor.JSONtoTicket = jsonTicket => {
  // jsonTicket.timestamp = Abstractor.asInteger(jsonTicket.timestamp);
  jsonTicket.scaleGross = Abstractor.asInteger(jsonTicket.scaleGross);
  jsonTicket.scaleNet = Abstractor.asInteger(jsonTicket.scaleNet);
  jsonTicket.cells.forEach(cell => {
    cell.cellWeight = Abstractor.asInteger(cell.cellWeight);
  });
  if (jsonTicket.cells.length < 8) {
    for (let i = jsonTicket.cells.length; i < 8; i++) {
      jsonTicket.cells.push({
        cellSerialNumber: 'NONE',
        cellWeight: 0
      });
    }
  }

  return jsonTicket;
};

roundConversion = number => {
  return Math.round(number * CONVERSION_FACTOR) / CONVERSION_FACTOR;
};

/**
 * Converts a float value into its integer representation for the smart contract
 * by multiplying the conversion factor.
 * @param value The value that is going to be converted to the integer representation. Number.
 * @returns {number} The value converted into its integer representation.
 */
Abstractor.asInteger = value => {
  return Math.round(roundConversion(value) * CONVERSION_FACTOR);
};

/**
 * Converts a value in integer representation (from the smart contract) into its actual real world value.
 * @param value The value in smart contract integer representation.
 * @returns {number} The value converted into its real world value.
 */
Abstractor.asFloat = value => {
  return value / CONVERSION_FACTOR;
};

/**
 * Converts a timestamp into a human-readable date format.
 * @param timestamp The timestamp to be converted. Number.
 * @param dateFormat The format to convert the timestamp in.
 * @returns {string} The date in a human-readable format.
 */
Abstractor.asDate = (timestamp, dateFormat) => {
  if (dateFormat === 'timestamp') {
    return timestamp;
  }

  const date = new Date(parseInt(timestamp));
  if (dateFormat === 'simple_date') {
    return simpleDate(date);
  } else if (dateFormat === 'simple_date_hour') {
    return dateHour(date, 'simple');
  } else {
    return dateHour(date, 'full');
  }
};

/**
 * Converts an hexadecimal value into its integer representation.
 * NOTE: If hexValue is not hexadecimal, the same value will be returned.
 * @param hexValue The hexadecimal value. String.
 * @returns {number} The integer representation of the hexadecimal value.
 */
Abstractor.hexAsInteger = hexValue => {
  if (web3.utils.isHex(hexValue)) {
    return parseInt(hexValue, 16);
  } else {
    return hexValue;
  }
};

/**
 * Formats a date object into the dd-mm-yyyy format.
 * @param date The date object to format.
 * @returns {string} The formatted date.
 */
simpleDate = date => {
  const year = date.getFullYear();
  let month = date.getMonth();
  const day = date.getDate();
  return `${day}-${month}-${year}`;

};

/**
 * Formats a date to the format dd-mm-yyyy hh:mm:ss or dd-M-yyyy hh:mm:ss depending on the parameter type.
 * @param date The date object to format.
 * @param type Either "full" to have the month written or "simple" to have the month in number.
 * @returns {string} The formatted date.
 */
dateHour = (date, type = 'full') => {
  const year = date.getFullYear();
  let month = date.getMonth();
  const day = date.getDate();
  let hours = date.getHours();
  if (hours < 10) hours = '0' + hours;
  let minutes = date.getMinutes();
  if (minutes < 10) minutes = '0' + minutes;
  let seconds = date.getSeconds();
  if (seconds < 10) seconds = '0' + seconds;
  if (type === 'full') {
    month = MONTHS_ARRAY[month];
  } else {
    month += 1;
    if (month < 10) month = '0' + month;
  }

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};
