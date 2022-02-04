const Errors = module.exports;
const errorDefinitions = require('./definitions');
Errors.users = {};
Errors.customers = {};
Errors.stations = {};
Errors.blacklistedTokens = {};
Errors.app = {};

/* ----------------- USER ERRORS -------------------- */

Errors.users.InvalidEmail = email => {
  const error = {
    name: errorDefinitions.invalidEmail,
    message: 'The provided email is invalid',
    value: email,
  };
  error.toString = () => {
    return formatError(error.name, error.message, 'Email', error.value);
  };
  return error;
};

Errors.users.NodeAndAddressRequired = () => {
  const error = {
    name: errorDefinitions.nodeAndAddressRequired,
    message: 'For the registration of the first administrator a node and address must be provided.',
    value: ''
  };
  error.toString = () => {
    return formatError(error.name, error.message, '', error.value);
  };
  return error;
};

Errors.users.UnmatchedEmail = email => {
  const error = {
    name: errorDefinitions.unmatchedEmail,
    message: 'The provided email does not match with a known email in the database',
    value: email,
  };
  error.toString = () => {
    return formatError(error.name, error.message, 'Email', error.value);
  };
  return error;
};

Errors.users.UnmatchedUserID = userID => {
  const error = {
    name: errorDefinitions.unmatchedUserID,
    message: 'The provided userID does not match with a known user in the database',
    value: userID
  };
  error.toString = () => {return formatError(error.name, error.message, 'userID', error.value);};
  return error;
};

Errors.users.UnmatchedPassword = () => {
  const error = {
    name: errorDefinitions.unmatchedPassword,
    message: 'The old password you provided did not match with our records',
    value: ''
  };
  error.toString = () => {return formatError(error.name, error.message, '', '');};
  return error;
};

/* ----------------- CUSTOMER ERRORS -------------------- */

Errors.customers.UnmatchedCustomerID = customerID => {
  const error = {
    name: errorDefinitions.unmatchedCustomerID,
    message: 'The provided customerID does not match with a known customer in the database',
    value: customerID
  };
  error.toString = () => {return formatError(error.name, error.message, 'customerID', error.value);};
  return error;
};

Errors.customers.UnmatchedCustomerName = customerName => {
  const error = {
    name: errorDefinitions.unmatchedCustomerName,
    message: 'The provided customer name does not match with a known customer in the database',
    value: customerName
  };
  error.toString = () => {return formatError(error.name, error.message, 'customerName', error.value);};
  return error;
};

Errors.customers.OneMustBeProvided = () => {
  const error = {
    name: errorDefinitions.oneMustBeProvided,
    message: 'Either customerID or customerName must be provided to perform the query',
    value: ''
  };
  error.toString = () => {return formatError(error.name, error.message, '', error.value);};
  return error;
};

/* ----------------- STATION ERRORS -------------------- */

Errors.stations.UnmatchedStationID = stationID => {
  const error = {
    name: errorDefinitions.unmatchedStationID,
    message: 'The provided stationID does not match with a known station in the database',
    value: stationID
  };
  error.toString = () => {return formatError(error.name, error.message, 'stationID', error.value);};
  return error;
};

/* ----------------- BLACKLISTEDTOKENS ERRORS -------------------- */

Errors.blacklistedTokens.UnmatchedBlacklistedTokenID = blacklistedTokenID => {
  const error = {
    name: errorDefinitions.unmatchedBlacklistedTokenID,
    message: 'The provided blacklistedTokenID does not match with a known blacklistedToken in the database',
    value: blacklistedTokenID
  };
  error.toString = () => {return formatError(error.name, error.message, 'blacklistedTokenID', error.value);};
  return error;
};

Errors.blacklistedTokens.UnmatchedBlacklistedTokenString = blacklistedToken => {
  const error = {
    name: errorDefinitions.unmatchedBlacklistedTokenString,
    message: 'The provided blacklisted token does not match with a known blacklistedToken in the database',
    value: blacklistedToken
  };
  error.toString = () => {return formatError(error.name, error.message, 'blacklistedToken', error.value);};
  return error;
};

/* ----------------- MISCELLANEOUS ERRORS -------------------- */

/* ------------------ HELPER FUNCTIONS ------------------------ */

formatError = (name, message, indicator, value) => {
  let error = '[' + name + '] -> ' + message;
  if (indicator !== '') error += '. ' + indicator + ': ' + value;
  return error;
};