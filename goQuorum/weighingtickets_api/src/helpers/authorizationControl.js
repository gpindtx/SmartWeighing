const jwt = require('jsonwebtoken');
const { loggers } = require('winston');
const logger = loggers.get('apiLogger');
const { jwtSettings } = require('../config/app/appConfig');

const jwtVerifyOptions = {
  expiresIn: jwtSettings.tokenTTL,
  algorithms: [jwtSettings.algorithm]
};

module.exports = {

  /**
   * Verifies that the given token is valid.
   * @param token The access token to verify.
   * @returns {Object} Holds key 'valid' stating validity (True | False) and 'decodedToken' with the token decoded or the error.
   */
  verifyAccessToken: token => {
    // TODO: If jwtSettings.auth_public_key is undefined, the verification request should be issued to the authentication server.
    try {
      const decodedToken = jwt.verify(token,
        `${jwtSettings.authPublicKey}\n`, jwtVerifyOptions);
      return {
        valid: true,
        token: decodedToken
      };
    } catch (error) {
      logger.info(
        `An error occurred while evaluating a token. Error: ${error.message}`);
      return {
        valid: false,
        token: error
      };
    }
  }
};