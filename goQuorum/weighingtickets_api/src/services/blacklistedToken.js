const Service = module.exports;
const BlacklistedToken = require('../models/BlacklistedToken');

/**
 * Method to query a blacklisted token by its actual token string value.
 * @param token The token string value.
 * @returns {Promise<any>} The blacklisted token that matches the given token.
 */
Service.getBlacklistedTokenByToken = async (token) => {
  const blacklistedToken = await BlacklistedToken.findOne({ token: token }).exec();
  if (!blacklistedToken) throw { name: 'UnmatchedBlacklistedToken' };
  return blacklistedToken;
};