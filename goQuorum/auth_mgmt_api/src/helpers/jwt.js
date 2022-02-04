const jwt = require('jsonwebtoken');
const { loggers } = require('winston');
const logger = loggers.get('apiLogger');
const { jwtSettings } = require('../config/app/appConfig');

const options = {
  expiresIn: jwtSettings.tokenTTL
};
const jwtCreateOptions = {
  ...options,
  algorithm: jwtSettings.algorithm
};
const jwtVerifyOptions = {
  ...options,
  algorithms: [jwtSettings.algorithm]
};
const jwtRefreshOptions = {
  expiresIn: jwtSettings.refreshTokenTTL,
  algorithm: jwtSettings.algorithm
};

module.exports = {

  /**
   * Creates a new JWT access token valid for 30 minutes.
   * @param payload The payload that the token should possess.
   * @returns {string} The token signed by the server's private key.
   */
  newAccessToken: payload => {
    let message;
    if (payload.userID) message = `New token was created to the user "${payload.userID}"`;
    else message = `New token was created to the station "${payload.stationID}"`;
    logger.info(message);
    return jwt.sign(payload, jwtSettings.authPrivateKey, jwtCreateOptions);
  },

  /**
   * Creates a new JWT Refresh Token valid for one day.
   * @param payload The payload that the token should possess.
   * @returns {string} The refresh token signed by the server's refresh private key.
   */
  newRefreshToken: payload => {
    let message;
    if (payload.userID) message = `New refresh token was created to the user "${payload.userID}"`;
    else message = `New refresh token was created to the station "${payload.stationID}"`;
    return jwt.sign(payload, jwtSettings.authPrivateKeyRefresh, jwtRefreshOptions);
  },

  /**
   * Verifies that the received token is valid and decodes it.
   * @param token The token to validate.
   * @returns {{valid: boolean, token: *}} An object containing the result of the validation and the content of the token if the validation succeeds.
   */
  verifyAccessToken: token => {
    try {
      const decodedToken = jwt.verify(token, `${jwtSettings.authPublicKey}\n`, jwtVerifyOptions);
      return {
        valid: true,
        token: decodedToken
      };
    } catch (error) {
      return {
        valid: false,
        token: error
      };
    }
  },

  /**
   * Verifies that the received refresh token is valid and decodes it.
   * @param token The refresh token to validate.
   * @returns {{valid: boolean, token: *}} An object containing the result of the validation and the content of the refresh token if the validation succeeds.
   */
  verifyRefreshToken: token => {
    try {
      const decodedToken = jwt.verify(token, `${jwtSettings.authPublicKeyRefresh}\n`, jwtVerifyOptions);
      return {
        valid: true,
        token: decodedToken
      };
    } catch (error) {
      return {
        valid: false,
        token: error
      };
    }
  }

};