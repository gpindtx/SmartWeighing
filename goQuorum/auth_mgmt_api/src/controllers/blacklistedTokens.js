const Controller = module.exports;
const status = require('http-status');
const blacklistedTokensService = require('../services/blacklistedToken');
const errorHandler = require('../helpers/errors/handler').blacklistedTokens;
const errorDefinitions = require('../helpers/errors/definitions');
const { verifyAccessToken, verifyRefreshToken } = require('../helpers/jwt');

/**
 * @apiDefine admin Only an admin may call this route.
 * @apiDefine adminOrCustomer An administrator or a customer can call this route.
 */

/**
 * @api {post} /blacklisted_tokens Blacklist a token.
 * @apiPermission adminOrCustomer
 * @apiName BlacklistToken
 * @apiGroup BlacklistedTokens
 *
 * @apiParam {String} token The token to blacklist. [BODY_PARAM]
 */
Controller.registerBlacklistedToken = async (req, res) => {
  const { token } = req.value.body;
  const { customerID, userID } = req.value.token;
  try {
    let validationResult = await verifyAccessToken(token);
    if (!validationResult.valid) {
      if (validationResult.token.message === 'jwt expired')
        return res.status(status.OK).json({
          message: 'Token has already expired. No need to blacklist.'
        });

      validationResult = await verifyRefreshToken(token);
      if (!validationResult.valid) {
        if (validationResult.message === 'jwt expired')
          return res.status(status.OK).json({
            message: 'Token has already expired. No need to blacklist.'
          });

        return res.status(status.BAD_REQUEST).json({
          message: 'The token is invalid',
          error: validationResult.token
        });
      }
    }

    await blacklistedTokensService.blacklistToken(token, validationResult.token.exp, userID, customerID);
    return res.sendStatus(status.OK);
  } catch (error) {
    errorHandler.handleRegistrationErrors(error, res);
  }
};

/**
 * @api {get} /blacklisted_tokens Get All blacklisted tokens.
 * @apiPermission admin
 * @apiName GetBlacklistedTokens
 * @apiGroup BlacklistedTokens
 *
 * @apiParam {String} user_id A user identifier to refine the search. [QUERY_STRING_PARAM]
 *
 * @apiSuccess {Array} tokens The blacklisted tokens requested.
 */
Controller.getBlacklistedTokens = async (req, res) => {
  let userID = req.value.query.user_id;
  if (!userID) userID = '';
  try {
    const tokens = await blacklistedTokensService.getBlacklistedTokens(userID);
    return res.status(status.OK).json(tokens);
  } catch (error) {
    errorHandler.handleQueryAllErrors(error, res);
  }

};

/**
 * @api {get} /blacklisted_tokens/:token_id Get token by tokenID or by the token itself.
 * @apiPermission admin
 * @apiName GetBlacklistedToken
 * @apiGroup BlacklistedTokens
 *
 * @apiParam {String} token_id The tokenID or the token itself. [URL_PARAM]
 *
 * @apiSuccess {BlacklistedToken} blacklistedToken The token requested.
 */
Controller.getBlacklistedToken = async (req, res) => {
  const blacklistedTokenID = req.value.params.token_id;
  try {
    const token = await blacklistedTokensService.getBlacklistedTokenByID(blacklistedTokenID);
    return res.status(status.OK).json(token);
  } catch (error) {
    if (error.name && error.name === errorDefinitions.unmatchedBlacklistedTokenID) {
      try {
        const token = await blacklistedTokensService.getBlacklistedTokenByToken(blacklistedTokenID);
        return res.status(status.OK).json(token);
      } catch (error) {
        errorHandler.handleQuerySingleErrors(error, res);
      }
    }
  }
};

/**
 * @api {delete} /blacklisted_tokens/:token_id Delete token by ID
 * @apiPermission admin
 * @apiName DeleteBlacklistedToken
 * @apiGroup BlacklistedTokens
 *
 * @apiParam {String} token_id The identifier of the token to be deleted.
 */
Controller.deleteBlacklistedToken = async (req, res) => {
  const blacklistedTokenID = req.value.params.token_id;
  try {
    await blacklistedTokensService.deleteBlacklistedToken(blacklistedTokenID);
    return res.sendStatus(status.OK);
  } catch (error) {
    errorHandler.handleDeleteSingleErrors(error, res);
  }
};

/**
 * @api {delete} /blacklisted_tokens Delete expired blacklisted tokens
 * @apiPermission admin
 * @apiName DeleteExpiredBlacklistedTokens
 * @apiGroup BlacklistedTokens
 */
Controller.deleteBlacklistedTokens = async (req, res) => {
  try {
    await blacklistedTokensService.deleteExpiredTokens(Date.now());
    return res.sendStatus(status.OK);
  } catch (error) {
    errorHandler.handleDeleteAllErrors(error, res);
  }
};