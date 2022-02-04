const Service = module.exports;
const BlacklistedToken = require('../models/BlacklistedToken');
const blacklistedTokenErrors = require('../helpers/errors/errors').blacklistedTokens;

/**
 * Method that blacklists a token.
 * @param token The token to be blacklisted.
 * @param expirationTimestamp The expiration date, in timestamp, of the token.
 * @param userID The identifier of the User that requested this token.
 * @returns {Promise<*>} The database identifier of the blacklisted token.
 */
Service.blacklistToken = async (token, expirationTimestamp, userID, customerID) => {
  let blacklistedToken = new BlacklistedToken({
    token: token,
    expiration: expirationTimestamp,
    user: userID,
    customer: customerID
  });
  blacklistedToken = await blacklistedToken.save();
  return blacklistedToken._id;
};

/**
 * Method to query a blacklisted token by its actual token string value.
 * @param token The token string value.
 * @returns {Promise<any>} The blacklisted token that matches the given token.
 */
Service.getBlacklistedTokenByToken = async (token) => {
  const blacklistedToken = await BlacklistedToken.findOne({ token: token }).exec();
  if (!blacklistedToken) throw blacklistedTokenErrors.UnmatchedBlacklistedTokenString(token);
  return blacklistedToken;
};

/**
 * Method to query a blacklisted token by its ID.
 * @param tokenID The database identifier of the blacklisted token.
 * @returns {Promise<any>} The blacklisted token that matches the given ID.
 */
Service.getBlacklistedTokenByID = async tokenID => {
  const blacklistedToken = await BlacklistedToken.findOne({ _id: tokenID }).exec();
  if (!blacklistedToken) throw blacklistedTokenErrors.UnmatchedBlacklistedTokenID(tokenID);
  return blacklistedToken;
};

/**
 * Method to get all blacklisted tokens or all blacklisted tokens belonging to a specific user.
 * @param userID The user's identifier.
 * @returns {Promise<any>} An array of blacklisted tokens.
 */
Service.getBlacklistedTokens = async (userID = '') => {
  if (userID !== '')
    return await BlacklistedToken.find({ user: userID }).exec();

  return await BlacklistedToken.find().exec();
};

/**
 * Method that deletes a specific blacklisted token.
 * @param tokenID The identifier of the blacklisted token.
 * @returns {Promise<any>}
 */
Service.deleteBlacklistedToken = async tokenID => {
  return await BlacklistedToken.deleteOne({ _id: tokenID }).exec();
};

/**
 * Method that deletes all expired blacklisted tokens from the database.
 * @param compareTimestamp The timestamp to compare the tokens (usually it is the current timestamp).
 * @returns {Promise<any>} Nothing.
 */
Service.deleteExpiredTokens = async compareTimestamp => {
  return await BlacklistedToken.deleteMany({ expiration: { $lte: compareTimestamp } }).exec();
};