const Handler = module.exports;
const errorDefinitions = require('./definitions');
const { loggers } = require('winston');
const logger = loggers.get('apiLogger');
const status = require('http-status');
Handler.authorization = {};
Handler.users = {};
Handler.blacklistedTokens = {};
Handler.customers = {};
Handler.stations = {};

/**
 * Handles errors that may occur in the authorization route.
 * @param error The error that occurred
 * @param res The response object.
 * @returns {*}
 */
Handler.authorization.handleAuthorizationErrors = (error, res) => {
  if (error.name && error.name === errorDefinitions.invalidEmail) {
    return res.status(status.BAD_REQUEST).json({
      message: error.toString()
    });
  }

  if (error.name && error.name === errorDefinitions.unmatchedEmail) {
    return res.status(status.BAD_REQUEST).json({
      message: error.toString()
    });
  }

  produceUnknownError(error, res, 'authorize a user.');
};

/**
 * Handles errors that may occur in the verification route.
 * @param error The error that occurred
 * @param res The response object.
 * @returns {*}
 */
Handler.authorization.handleVerificationErrors = (error, res) => {
  produceUnknownError(error, res, 'verify a token');
};

/**
 * Handles errors that may occur in the token refresh route.
 * @param error The error that occurred
 * @param res The response object.
 * @returns {*}
 */
Handler.authorization.handleRefreshError = (error, res) => {
  produceUnknownError(error, res, 'refresh an access token');
};

/**
 * Handles errors that may occur in the customer registration route.
 * @param error The error that occurred
 * @param res The response object.
 * @returns {*}
 */
Handler.customers.handleRegistrationErrors = (error, res) => {
  if (error.name && error.name === errorDefinitions.invalidEmail) {
    return res.status(status.BAD_REQUEST).json({
      message: error.toString()
    });
  }

  produceUnknownError(error, res, 'register a customer');
};

/**
 * Handles errors that may occur in the customer query all route.
 * @param error The error that occurred
 * @param res The response object.
 * @returns {*}
 */
Handler.customers.handleQueryAllErrors = (error, res) => {
  produceUnknownError(error, res, 'query for all customers. [ADMIN OP].');
};

/**
 * Handles errors that may occur in the customer query single route.
 * @param error The error that occurred
 * @param res The response object.
 * @returns {*}
 */
Handler.customers.handleQueryErrors = (error, res) => {
  if (error.name && error.name === errorDefinitions.unmatchedCustomerName) {
    return res.status(status.BAD_REQUEST).json({
      message: 'The customer info passed did not match either the customer\'s id neither its name'
    });
  }

  produceUnknownError(error, res, 'query one customer');
};

/**
 * Handles errors that may occur in the customer update route.
 * @param error The error that occurred
 * @param res The response object.
 * @returns {*}
 */
Handler.customers.handleUpdateErrors = (error, res) => {
  if (error.name && (error.name === errorDefinitions.unmatchedCustomerID || error.name === errorDefinitions.unmatchedCustomerName || error.name === errorDefinitions.oneMustBeProvided)) {
    return res.status(status.BAD_REQUEST).json({
      message: error.toString()
    });
  }

  produceUnknownError(error, res, 'update a customer');
};

/**
 * Handles errors that may occur in the customer delete route.
 * @param error The error that occurred
 * @param res The response object.
 * @returns {*}
 */
Handler.customers.handleDeleteErrors = (error, res) => {
  if (error.name && (error.name === errorDefinitions.unmatchedCustomerID || error.name === errorDefinitions.oneMustBeProvided)) {
    return res.status(status.BAD_REQUEST).json({
      message: error.toString()
    });
  }

  produceUnknownError(error, res, 'delete a customer');
};

/**
 * Handles errors that may occur in the user's registration route.
 * @param error The error that occurred
 * @param res The response object.
 * @returns {*}
 */
Handler.users.handleRegistrationErrors = (error, res) => {
  if (error.name && error.name === errorDefinitions.invalidEmail)
    return res.status(status.BAD_REQUEST).json({
      message: error.toString()
    });

  if (error.name && error.name === errorDefinitions.unmatchedEmail)
    return res.status(status.BAD_REQUEST).json({
      message: error.toString()
    });

  produceUnknownError(error, res, 'register a user');
};

/**
 * Handles errors that may occur in the user's query all route.
 * @param error The error that occurred
 * @param res The response object
 * @returns {*}
 */
Handler.users.handleQueryAllErrors = (error, res) => {
  produceUnknownError(error, res, 'query all users');
};

/**
 * Handles errors that may occur in the user's query all route.
 * @param error The error that occurred
 * @param res The response object
 * @returns {*}
 */
Handler.users.handleQueryErrors = (error, res) => {
  if (error.name && error.name === errorDefinitions.unmatchedEmail) {
    return res.status(status.BAD_REQUEST).json({
      message: 'The user info provided does not match agains an userID or a user email.'
    });
  }

  produceUnknownError(error, res, 'query for a user');
};

/**
 * Handles errors that may occur in the user's update route.
 * @param error The error that occurred.
 * @param res The response object.
 */
Handler.users.handleUpdateErrors = (error, res) => {
  if (error.name && error.name === errorDefinitions.unmatchedPassword)
    return res.status(status.UNAUTHORIZED).json({
      message: error.toString()
    });
  
  produceUnknownError(error, res, 'update a user');
};

/**
 * Handles errors that may occur in the user's delete route.
 * @param error The error that occurred.
 * @param res The response object.
 * @returns {*}
 */
Handler.users.handleDeleteErrors = (error, res) => {
  if (error.name && error.name === errorDefinitions.unmatchedUserID) {
    return res.status(status.BAD_REQUEST).json({
      message: error.toString()
    });
  }

  produceUnknownError(error, res, 'delete a user');
};

/**
 * Handles errors that may occur in the station's registration route.
 * @param error The error that occurred.
 * @param res The response object
 * @returns {*}
 */
Handler.stations.handleRegistrationErrors = (error, res) => {
  produceUnknownError(error, res, 'register a station');
};

/**
 * Handles errors that may occur in the station's query all route.
 * @param error The error that occurred.
 * @param res The response object
 * @returns {*}
 */
Handler.stations.handleQueryAllErrors = (error, res) => {
  produceUnknownError(error, res, 'query all stations');
};

/**
 * Handles errors that may occur in the station's query single route.
 * @param error The error that occurred.
 * @param res The response object
 * @returns {*}
 */
Handler.stations.handleQueryErrors = (error, res) => {
  if (error.name && error.name === errorDefinitions.unmatchedStationID) {
    return res.status(status.BAD_REQUEST).json({
      message: error.toString()
    });
  }

  produceUnknownError(error, res, 'query a station');
};

/**
 * Handles errors that may occur in the station's update route.
 * @param error The error that occurred.
 * @param res The response object
 * @returns {*}
 */
Handler.stations.handleUpdateErrors = (error, res) => {
  produceUnknownError(error, res, 'update a station');
};

/**
 * Handles errors that may occur in the station's delete route.
 * @param error The error that occurred.
 * @param res The response object
 * @returns {*}
 */
Handler.stations.handleDeleteErrors = (error, res) => {
  if (error.name && error.name === errorDefinitions.unmatchedStationID)
    return res.status(status.BAD_REQUEST).json({
      message: error.toString()
    });

  produceUnknownError(error, res, 'delete a station');
};

/**
 * Handles errors that may occur in the blacklisted tokens' registration route.
 * @param error The error that occurred.
 * @param res The response object
 * @returns {*}
 */
Handler.blacklistedTokens.handleRegistrationErrors = (error, res) => {
  produceUnknownError(error, res, 'blacklist a token');
};

/**
 * Handles errors that may occur in the blacklisted tokens' query all route.
 * @param error The error that occurred.
 * @param res The response object
 * @returns {*}
 */
Handler.blacklistedTokens.handleQueryAllErrors = (error, res) => {
  produceUnknownError(error, res, 'query blacklisted tokens');
};

/**
 * Handles errors that may occur in the blacklisted tokens' query single route.
 * @param error The error that occurred.
 * @param res The response object
 * @returns {*}
 */
Handler.blacklistedTokens.handleQuerySingleErrors = (error, res) => {
  if (error.name && error.name === errorDefinitions.unmatchedBlacklistedTokenString)
    return res.status(status.BAD_REQUEST).json({
      message: 'Could not find the requested token'
    });
  produceUnknownError(error, res, 'query a specific blacklisted token');
};

/**
 * Handles errors that may occur in the blacklisted tokens' delete expired route.
 * @param error The error that occurred.
 * @param res The response object
 * @returns {*}
 */
Handler.blacklistedTokens.handleDeleteAllErrors = (error, res) => {
  produceUnknownError(error, res, 'delete all expired blacklisted tokens');
};

/**
 * Handles errors that may occur in the blacklisted tokens' delete by ID route.
 * @param error The error that occurred.
 * @param res The response object
 * @returns {*}
 */
Handler.blacklistedTokens.handleDeleteSingleErrors = (error, res) => {
  produceUnknownError(error, res, 'delete a specific blacklisted token');
};

/**
 * Produces and responds with an unknown error given an action.
 * @param error The error that occurred.
 * @param res The response object.
 * @param action The action that was being performed when the error occurred.
 * @returns {*}
 */
produceUnknownError = (error, res, action) => {
  logger.error('An unknown error occurred when attempting to ' + action + '. ' + error);
  return res.status(status.INTERNAL_SERVER_ERROR).json(error);
};