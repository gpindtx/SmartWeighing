const Controller = module.exports;
const TicketService = require('../services/tickets');
const FilterValidator = require('../helpers/validators/filtersValidator');
const TicketValidator = require('../helpers/validators/ticketsValidator');
const FieldsValidator = require('../helpers/validators/fieldsValidator');
const Errors = require('../config/app/errorCodes');
const ErrorProducer = require('../helpers/errorProducer');
const status = require('http-status');
const { isNumeric, matches } = require('../helpers/utils');
const userService = require('../services/user');
const stationService = require('../services/station');
const customerService = require('../services/customer');
const { validGroupKeys, validDateFormats } = require(
  '../config/app/appConfig').appSettings;
const winston = require('winston');
const logger = winston.loggers.get('apiLogger');
const Encoder = require('../helpers/databaseEncoder');

/**
 * @apiDefine Client Only an authenticated client can access this route.
 */

/**
 * @api {get} /tickets/:ticket_id Get Ticket by ID
 * @apiName GetTicket
 * @apiPermission Client
 * @apiParam {String} ticket_id The identifier of the ticket
 * @apiGroup Tickets
 * @apiExample Consulting one Ticket with its ID
 * http://host:port/tickets/C1-SSN1-1736473872
 *
 * @apiSuccess {Object} ticket The ticket with ticket_id
 */
Controller.getTicket = async (req, res) => {
  const ticketID = req.value.params.ticket_id;
  const { userID, role } = req.value.token;
  if (req.value.token.stationID) {
    return res.status(status.BAD_REQUEST).jsonp({
      message: 'A station is not able to query tickets.'
    });
  }
  let { customerID } = req.value.token;
  let connectionInfo;
  if (role === 'admin')
    connectionInfo = await userService.getConnectionInfo(userID);
  else
    connectionInfo = await customerService.getConnectionInfo(customerID);
  let { address, node } = connectionInfo;
  const ticketParts = ticketID.split('_');
  if (ticketParts.length !== 3) return res.status(status.BAD_REQUEST).jsonp({
    message: `Ticket with ID ${ticketID} is malformed. The format of a ticket must be customerID_stationID_timestamp`
  });

  const stationID = ticketParts[1];
  if (!FieldsValidator.isObjectIDValid(stationID)) {
    return res.status(status.BAD_REQUEST).jsonp({
      message: 'Ticket ID malformed. First element is not a valid ObjectID.'
    });
  }
  if (role === 'admin') customerID = ticketParts[0]; // customerID is the first position in the ticket parts.
  let contractAddress = await stationService.getContractAddress(stationID);
  contractAddress = await Encoder.decrypt(contractAddress);
  address = await Encoder.decrypt(address);
  node = await Encoder.decrypt(node);
  TicketService.getTicket(address, node, contractAddress, customerID, ticketID).then(ticket => {
    return res.status(status.OK).json(ticket);
  }).catch(error => {
    if (error.code === Errors.TicketDoesNotExist) {
      logger.info(error.message + 'Called from client ' + customerID);
      return res.status(status.BAD_REQUEST).json({
        message: error.message
      });
    }

    if (error.message === 'Returned values aren\'t valid, did it run Out of Gas?') {
      logger.info(`User with ID ${userID} tried to access ticket with ID ${ticketID} which does not belong to him.`);
      return res.status(status.UNAUTHORIZED).jsonp({
        message: `You cannot access ticket with ID ${ticketID}. It does not belong to you.`
      });
    }

    logger.error('Something went wrong while attempting to get a ticket: ' +
      error.message);
    return res.status(status.INTERNAL_SERVER_ERROR).json({
      message: 'Something went wrong while performing the request.',
      detailedMessage: error.message
    });
  });
};

/**
 * @api {get} /tickets Get All Tickets.
 * @apiName GetTickets
 * @apiPermission Client
 * @apiParam {String} customer The customer to look for. Only relevant for an Admin. For a customer the ID is automatically extracted from the token.
 * @apiParam {String} stations The IDs of the station's to look for. Note: For more than one station separate them by comma: <station1>,<station2>
 * @apiParam {Number} from_date The begin date to search for tickets. Required format: dd-mm-yyyy hh:mm:ss or a timestamp
 * @apiParam {Number} until_date The end date to search for tickets. Required format: dd-mm-yyyy hh:mm:ss or a timestamp.
 * @apiParam {Number} from_weight The begin weight to search for tickets.
 * @apiParam {Number} until_weight The end weight to search for tickets.
 * @apiParam {String} scale_serial_number The serial number of the station to look for.
 * @apiParam {String} terminal_serial_number The serial number of the terminal to look for.
 * @apiParam {String} date_type By default, permits "simple_date", "simple_date_hour", "full_date", "timestamp"
 * @apiParam {String} group_by The attribute by which the tickets should be grouped. Either "terminalSerialNumber",
 * "scaleSerialNumber", "scaleStatus", "terminalRestartValue" or "timestamp"
 * @apiGroup Tickets
 * @apiExample Consulting all your tickets, with some filters and grouping.
 * http://host:port/tickets?scale_serial_number=SSN1&from_date=1-2-2020 15:15:15&group_by=scaleStatus&date_type=full_date
 *
 * @apiSuccess {Any} tickets The tickets of the given client. If group_by is specified returns an object where keys are the possible values, otherwise returns an array of tickets.
 */
Controller.getTickets = async (req, res) => {
  const { userID, role } = req.value.token;
  let { customerID } = req.value.token;
  if (req.value.token.stationID) {
    return res.status(status.BAD_REQUEST).jsonp({
      message: 'A station is not able to query tickets.'
    });
  }
  let connectionInfo;
  if (role === 'admin')
    connectionInfo = await userService.getConnectionInfo(userID);
  else
    connectionInfo = await customerService.getConnectionInfo(customerID);
  let { address, node } = connectionInfo;
  address = await Encoder.decrypt(address);
  node = await Encoder.decrypt(node);
  let tickets;
  const { count } = req.value.query;
  if (req.value && anyFilter(req.value.query)) {
    let { customer, stations, from_date, until_date, from_weight, until_weight, terminal_serial_number, terminal_restart_value, scale_status, scale_serial_number, group_by, date_type } = req.value.query;
    if (customer && customerID !== '' && customer !== customerID) return res.status(status.UNAUTHORIZED).jsonp({
      message: 'You can only consult your own customer\'s data'
    });
    if (customer) {
      if (FieldsValidator.isEmailValid(customer)) {
        const customerToLookForID = await userService.getCustomerIDByEmail(customer);
        if (customerToLookForID === '') return res.status(status.BAD_REQUEST).jsonp({
          message: `The provided email (${customer}) does not exist.`
        });

        customerID = customerToLookForID;
      } else customerID = customer;
    }
    if (!stations) stations = await stationService.getCustomerStations(customerID);
    else stations = await stationService.getContractAddresses(stations.split(','));
    if (from_date && !isNumeric(from_date)) {
      from_date = await parseDate(
        from_date);
    }
    if (from_date === null) {
      const error = ErrorProducer.produceDateOperandsError(
        Errors.InvalidFromDateOperand, from_date, until_date);
      return res.status(status.BAD_REQUEST).json({
        code: error.code,
        message: error.message
      });
    }
    if (until_date && !isNumeric(until_date)) until_date = await parseDate(
      until_date);
    if (until_date === null) {
      const error = ErrorProducer.produceDateOperandsError(
        Errors.InvalidUntilDateOperand, from_date, until_date);
      return res.status(status.BAD_REQUEST).json({
        code: error.code,
        message: error.message
      });
    }
    const dateValidation = FilterValidator.validateDates(from_date, until_date);
    if (dateValidation < 0) {
      const error = ErrorProducer.produceDateOperandsError(dateValidation,
        from_date,
        until_date);
      return res.status(status.BAD_REQUEST).json({
        code: error.code,
        message: error.message
      });
    }
    const weightValidation = FilterValidator.validateWeights(from_weight,
      until_weight);
    if (weightValidation < 0) {
      const error = ErrorProducer.produceWeightOperandsError(weightValidation,
        from_weight, until_weight);
      return res.status(status.BAD_REQUEST).json({
        code: error.code,
        message: error.message
      });
    }

    const formatGroupValidation = validateFormatterGrouper(group_by, date_type);
    if (formatGroupValidation.code < 0) {
      return res.status(status.BAD_REQUEST).json(formatGroupValidation);
    }

    try {
      tickets = await filterTickets(customerID, address, node, stations, from_date, until_date,
        from_weight,
        until_weight, terminal_serial_number, scale_serial_number,
        terminal_restart_value, scale_status);
    } catch (error) {
      logger.error(
        'An error occurred while attempting to consult tickets. [Filter Tickets]: ' +
        error.message);
      return res.status(status.INTERNAL_SERVER_ERROR).json(error.message);
    }
    tickets = await TicketService.formatDates(tickets, date_type);
    tickets = await cleanTickets(tickets);
    if (group_by)
      tickets = await groupTickets(tickets, group_by);
  } else {
    if (req.value && req.value.query) {
      const formatGroupValidation = validateFormatterGrouper(
        req.value.query.group_by, req.value.query.date_type);
      if (formatGroupValidation.code < 0) {
        return res.status(status.BAD_REQUEST).json(formatGroupValidation);
      }
      let { customer } = req.value.query;
      if (customer && customerID !== '' && customer !== customerID) return res.status(status.UNAUTHORIZED).jsonp({
        message: 'You can only consult your own customer\'s data'
      });
      if (customer) {
        if (FieldsValidator.isEmailValid(customer)) {
          const customerToLookForID = await userService.getCustomerIDByEmail(customer);
          if (customerToLookForID === '') return res.status(status.BAD_REQUEST).jsonp({
            message: `The provided email (${customer}) does not exist.`
          });

          customerID = customerToLookForID;
        } else customerID = customer;
      }
      let stations = req.value.query.stations;
      if (!stations) stations = await stationService.getCustomerStations(customerID);
      else stations = await stationService.getContractAddresses(stations.split(','));
      let dateFormat = 'full_date';
      if (req.value.query.date_type) dateFormat = req.value.query.date_type;
      try {
        tickets = await getAllTickets(address, node, customerID, stations, dateFormat);
      } catch (error) {
        logger.error(
          'An error occurred while attempting to consult tickets. [All Tickets]: ' +
          error.message);
        return res.status(status.INTERNAL_SERVER_ERROR).json(error.message);
      }

      tickets = await cleanTickets(tickets);
      if (req.value.query.group_by) {
        tickets = await groupTickets(tickets, req.value.query.group_by);
      }
    }
  }

  if (count) {
    return res.status(status.OK).jsonp({
      'count': tickets.length,
      'tickets': tickets
    });
  }

  return res.status(status.OK).jsonp(tickets);
};

/**
 * @api {post} /tickets Register Ticket.
 * @apiName RegisterTicket
 * @apiPermission Client
 * @apiGroup Tickets
 * @apiExample Registering a ticket.
 * http://host:port/tickets
 *
 * body: {
 *    "terminalSerialNumber": "TSN1",
      "terminalRestartValue": "R0",
      "scaleSerialNumber": "SSN1",
      "scaleStatus": "OK",
      "scaleGross": 4700,
      "scaleNet": 4700,
      "cells": [
          {
              "cellSerialNumber": "LC1",
              "cellWeight": 500
          },
          {
              "cellSerialNumber": "LC2",
              "cellWeight": 500
          },
          {
              "cellSerialNumber": "LC3",
              "cellWeight": 500
          },
          {
              "cellSerialNumber": "LC4",
              "cellWeight": 500
          },
          {
              "cellSerialNumber": "LC5",
              "cellWeight": 500
          },
          {
              "cellSerialNumber": "LC6",
              "cellWeight": 500
          },
          {
              "cellSerialNumber": "LC7",
              "cellWeight": 500
          },
          {
              "cellSerialNumber": "LC8",
              "cellWeight": 500
          }
      ]
 * }
 *
 * @apiSuccess {Object} Returns the transaction hash under the 'transactionHash' key
 * and the ticket identifier under the 'ticketID' key.
 */
Controller.registerTicket = async (req, res) => {
  const ticket = req.value.body;
  const { stationID, customerID } = req.value.token;
  if (!stationID) return res.status(status.BAD_REQUEST).jsonp({
    message: 'A ticket can only be registered by a customer\'s station'
  });
  const connectionInfo = await stationService.getConnectionInfo(stationID);
  let { address, node } = connectionInfo;
  address = await Encoder.decrypt(address);
  node = await Encoder.decrypt(node);
  let contractAddress = await stationService.getContractAddress(stationID);
  let customerTesseraPK = await customerService.getTesseraPublicKey(customerID);
  let adminTesseraPK = await userService.getAdminTesseraPublicKey();
  contractAddress = await Encoder.decrypt(contractAddress);
  customerTesseraPK = await Encoder.decrypt(customerTesseraPK);
  adminTesseraPK = await Encoder.decrypt(adminTesseraPK);
  const privateForNodes = [customerTesseraPK, adminTesseraPK];
  if (!ticket.timestamp) {
    ticket.timestamp = Date.now();
  }
  ticket.ticketID = `${customerID}_${stationID}_${ticket.timestamp}`;
  let transaction;
  try {
    transaction = await TicketService.registerTicket(address, customerID, node, contractAddress, privateForNodes, ticket);
    logger.info('Ticket registered with ID: ' + ticket.ticketID);
  } catch (error) {
    logger.error(
      'An error occurred while attempting to register a ticket: ' +
      error.message);
    return res.status(status.INTERNAL_SERVER_ERROR).jsonp({
      message: error.message
    });
  }

  return res.status(status.OK).json({
    ticketID: transaction.ticketID,
    transactionHash: transaction.transaction.transactionHash
  });
};

/**
 * @api {put} /tickets/:ticket_id Update Ticket.
 * @apiName UpdateTicket
 * @apiPermission Client
 * @apiDeprecated
 * @apiParam {String} ticket_id The identifier of the ticket
 * @apiGroup Tickets
 */
Controller.updateTicket = async (req, res) => {
  logger.info('Call to a non implemented feature. [Update Ticket]');
  return res.status(status.NOT_IMPLEMENTED).json({
    message: 'This feature is currently not implemented.'
  });
};

/**
 * @api {delete} /tickets/:ticket_id Delete Ticket
 * @apiName DeleteTicket
 * @apiPermission Client
 * @apiParam {String} ticket_id The identifier of the ticket
 * @apiGroup Tickets
 * @apiExample Deleting a ticket.
 * http://host:port/tickets/C1-SSN1-1533784732
 *
 * @apiSuccess {String} The identifier of the deleted WeighingTicket.
 */
Controller.deleteTicket = async (req, res) => {
  const ticketID = req.value.params.ticket_id;
  const { userID, customerID, role } = req.value.token;
  let connectionInfo;
  if (role === 'admin') {
    connectionInfo = await userService.getConnectionInfo(userID);
  } else {
    connectionInfo = await customerService.getConnectionInfo(customerID);
  }
  const ticketParts = ticketID.split('_');
  if (ticketParts.length !== 3) return res.status(status.BAD_REQUEST).jsonp({
    message: `Ticket with ID ${ticketID} is malformed. The format of a ticket must be customerID_stationID_timestamp`
  });
  let { address, node } = connectionInfo;
  address = await Encoder.decrypt(address);
  node = await Encoder.decrypt(node);
  const stationID = ticketParts[1];
  let contractAddress = await stationService.getContractAddress(stationID);
  let customerTesseraPK = await customerService.getTesseraPublicKey(customerID);
  let adminTesseraPK = await userService.getAdminTesseraPublicKey();
  contractAddress = await Encoder.decrypt(contractAddress);
  customerTesseraPK = await Encoder.decrypt(customerTesseraPK);
  adminTesseraPK = await Encoder.decrypt(adminTesseraPK);
  const privateForNodes = [customerTesseraPK, adminTesseraPK];
  let transaction;
  try {
    transaction = await TicketService.deleteTicket(address, customerID, node, contractAddress, privateForNodes,
      ticketID
    );
  } catch (error) {
    logger.error(
      'An error occurred while attempting to delete a ticket: ' +
      error.message);
    return res.status(status.INTERNAL_SERVER_ERROR).json(error.message);
  }

  return res.status(status.OK).json({
    message: 'Ticket ' + transaction.ticketID + ' was deleted from the ledger.',
    transactionHash: transaction.transaction.transactionHash
  });
};

/**
 * Parses the date string into a timestamp if it complies with the format dd-mm-yyyy hh:mm:ss, otherwise returns null
 * @param dateString The string to be parsed into timestamp
 * @returns {Promise<null|number>} Returns the timestamp of the date or null if the date is not recognized.
 */
parseDate = async dateString => {
  const dateFormat = /\d\d?\-\d\d?\-\d{4} \d\d?:\d\d?:\d\d?/;
  if (matches(dateFormat, dateString)) {
    const yearHour = dateString.split(' ');
    const yearParts = yearHour[0].split('-');
    const hourParts = yearHour[1].split(':');
    const date = new Date(parseInt(yearParts[2]), parseInt(yearParts[1]) - 1,
      parseInt(yearParts[0]), parseInt(hourParts[0]),
      parseInt(hourParts[1]),
      parseInt(hourParts[2]), 0);
    return date.getTime();
  }

  return null;
};

/**
 * Iterates over each station and requests the extraction of the tickets filtered.
 * @param clientID The client's identifier.
 * @param fromAddress The address of the client's node.
 * @param node The node's url to connect to.
 * @param stations The stations where to look for tickets.
 * @param fromDate The minimum date to look for.
 * @param untilDate The maximum date to look for.
 * @param fromWeight The minimum weight to look for.
 * @param untilWeight The maximum weight to look for.
 * @param terminalSerialNumber The serial number of the terminal to look for
 * @param scaleSerialNumber The serial number of the scale to look for
 * @param terminalRestartValue the restart value of the terminal to look for.
 * @param scaleStatus the status of the scale to look for.
 * @returns {Promise<[]>} The tickets after all filters were applied.
 */
filterTickets = async (
  clientID, fromAddress, node, stations, fromDate, untilDate, fromWeight, untilWeight,
  terminalSerialNumber,
  scaleSerialNumber, terminalRestartValue, scaleStatus) => {
  let tickets = [];
  for (let station of stations) {
    const stationTickets = await extractTickets(
      clientID, fromAddress, node, await Encoder.decrypt(station.contractAddress), fromDate, untilDate, fromWeight, untilWeight,
      terminalSerialNumber, scaleSerialNumber, terminalRestartValue, scaleStatus
    );
    tickets = tickets.concat(stationTickets);
  }
  return tickets;
};

/**
 * Filters and extracts the tickets.
 * @param clientID The client's identifier.
 * @param fromAddress The address of the client's node.
 * @param node The node's url to connect to.
 * @param contractAddress The address of the station on where to look for the tickets.
 * @param fromDate The minimum date to look for.
 * @param untilDate The maximum date to look for.
 * @param fromWeight The minimum weight to look for.
 * @param untilWeight The maximum weight to look for.
 * @param terminalSerialNumber The serial number of the terminal to look for
 * @param scaleSerialNumber The serial number of the scale to look for
 * @param terminalRestartValue the restart value of the terminal to look for.
 * @param scaleStatus the status of the scale to look for.
 * @returns {Promise<[]>} The tickets after all filters were applied.
 */
extractTickets = async (
  clientID, fromAddress, node, contractAddress, fromDate, untilDate, fromWeight, untilWeight,
  terminalSerialNumber,
  scaleSerialNumber, terminalRestartValue, scaleStatus) => {
  let tickets = [];
  let extracted = false;
  if (fromWeight || untilWeight) {
    tickets = await TicketService.getTicketsByWeight(fromAddress, clientID, node, contractAddress,
      fromWeight, untilWeight);
    extracted = true;
  }

  if ((fromDate || untilDate) && !(extracted && tickets.length === 0)) {
    if (extracted) {
      tickets = await TicketService.getTicketsByDate(fromAddress, clientID, node, contractAddress,
        fromDate, untilDate, tickets);
    } else {
      tickets = await TicketService.getTicketsByDate(fromAddress, clientID, node, contractAddress,
        fromDate, untilDate);
      extracted = true;
    }
  }

  if (terminalSerialNumber && !(extracted && tickets.length === 0)) {
    if (extracted) {
      tickets = await TicketService.getTicketsByTerminal(fromAddress, clientID, node, contractAddress,
        terminalSerialNumber, tickets);
    } else {
      tickets = await TicketService.getTicketsByTerminal(fromAddress, clientID, node, contractAddress,
        terminalSerialNumber);
      extracted = true;
    }
  }

  if (scaleSerialNumber && !(extracted && tickets.length === 0)) {
    if (extracted) {
      tickets = await TicketService.getTicketsByScale(fromAddress, clientID, node, contractAddress,
        scaleSerialNumber, tickets);
    } else {
      tickets = await TicketService.getTicketsByScale(fromAddress, clientID, node, contractAddress,
        scaleSerialNumber);
      extracted = true;
    }
  }

  if (scaleStatus && !(extracted && tickets.length === 0)) {
    if (extracted) {
      tickets = await TicketService.getTicketsByScaleStatus(fromAddress, clientID,
        node, contractAddress, scaleStatus, tickets);
    } else {
      tickets = await TicketService.getTicketsByScaleStatus(fromAddress, clientID,
        node, contractAddress, scaleStatus);
      extracted = true;
    }
  }

  if (terminalRestartValue && !(extracted && tickets.length === 0)) {
    if (extracted) {
      tickets = await TicketService.getTicketsByTerminalRestartValue(
        fromAddress, clientID, node, contractAddress, terminalRestartValue, tickets);
    } else {
      tickets = await TicketService.getTicketsByTerminalRestartValue(
        fromAddress, clientID, node, contractAddress, terminalRestartValue);
    }
  }

  return tickets;
};

/**
 *
 * @param fromAddress The address of the node that requests the tickets.
 * @param node The node URL of the node that requests the tickets.
 * @param customerID The database identifier of the customer.
 * @param stations The array of {stationID, contractAddress}
 * @param dateFormat The format by which the dates should be presented.
 * @returns {Promise<[]>}
 */
getAllTickets = async (fromAddress, node, customerID, stations, dateFormat) => {
  let tickets = [];
  for (let station of stations) {
    const stationTickets = await TicketService.getAllTickets(fromAddress, customerID, node, await Encoder.decrypt(station.contractAddress), dateFormat);
    tickets = tickets.concat(stationTickets);
  }
  return tickets;
};

/**
 * Groups all tickets by the specified key.
 * @param tickets The tickets array to group into an object.
 * @param groupByKey The key by which the tickets have to be grouped.
 * @returns {Promise<{}>} The grouped tickets object.
 */
groupTickets = async (tickets, groupByKey) => {
  let groupedTickets = {};
  tickets.forEach(ticket => {
    if (groupedTickets[ticket[groupByKey]]) groupedTickets[ticket[groupByKey]].push(
      ticket);
    else groupedTickets[ticket[groupByKey]] = [ticket];
  });
  return groupedTickets;
};

/**
 * Function that receives an array of tickets and removes the null ones.
 * @param tickets The tickets array to clean.
 * @returns {Promise<[]>} Returns the tickets array without null tickets.
 */
cleanTickets = async tickets => {
  let cleanedTickets = [];
  tickets.forEach(ticket => {
    if (!TicketValidator.isNull(ticket)) {
      cleanedTickets.push(ticket);
    }
  });
  return cleanedTickets;
};

/**
 * Validates the group_by and date_type query string parameters
 * @param groupBy The group_by query string parameter
 * @param dateType The date_type query string parameter
 * @returns {{code: number}|{code: (string|number), message: string}} An object containing the code with the result of the execution.
 */
validateFormatterGrouper = (groupBy, dateType) => {
  const groupByValidation = FilterValidator.validateGroupKey(groupBy);
  if (groupByValidation < 0) {
    const error = ErrorProducer.produceGroupByKeyError(groupByValidation,
      groupBy, validGroupKeys);
    return {
      code: error.code,
      message: error.message
    };
  }
  const dateFormatValidation = FilterValidator.validateDateFormat(dateType);
  if (dateFormatValidation < 0) {
    const error = ErrorProducer.produceDateFormatError(dateFormatValidation,
      dateType, validDateFormats);
    return {
      code: error.code,
      message: error.message
    };
  }

  return { code: 0 };
};

/**
 * Checks if query has any filter operation
 * @param query The object holding all query string parameters
 * @returns {boolean} True if a filter exists, False otherwise.
 */
anyFilter = query => {
  if (!query) return false;

  return !!(query.from_date || query.until_date || query.from_weight ||
    query.until_weight || query.terminal_serial_number ||
    query.terminal_restart_value || query.scale_status ||
    query.scale_serial_number);
};