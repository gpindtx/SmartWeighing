const Controller = module.exports;
const status = require('http-status');
const { newAccessToken, newRefreshToken, verifyAccessToken, verifyRefreshToken } = require('../helpers/jwt');
const userService = require('../services/user');
const stationService = require('../services/station');
const stationAuthentication = require('../helpers/stationAuthAlgorithm');
const errorHandler = require('../helpers/errors/handler').authorization;

/**
 * @api {post} /authorization Generate access and refresh tokens for API access.
 * @apiName AuthorizeUser
 * @apiGroup Authorization
 *
 * @apiParam {String} email The email of the user requesting access. (body param).
 * @apiParam {String} password The password of the user requesting access. (body param).
 *
 * @apiExample
 * body = {
 *   email: example@example.com,
 *   password: example
 * }
 *
 * @apiSuccess {Object} tokens Contains the accessToken and the refreshToken
 *
 */
Controller.authorize = async (req, res) => {
  const { email, password, identifier, message, signature } = req.value.body;
  if ((!email || !password) && (!identifier || !message || !signature))
    return res.status(status.BAD_REQUEST).jsonp({
      message: 'You must provide email and password to authorize user or identifier, message and signature to authorize stations'
    });
  if (!!(email && password)) {
    try {
      const compare = await userService.comparePassword(email, password);
      if (compare) {
        const user = await userService.getUserByEmail(email);
        const payload = {
          userID: user._id,
          customerID: user.customer,
          role: user.role
        };

        const accessToken = await newAccessToken(payload);
        const refreshToken = await newRefreshToken(payload);
        await userService.alterPasswordChanged(user._id);

        return res.status(status.OK).json({
          accessToken: accessToken,
          refreshToken: refreshToken
        });
      }

      return res.status(status.UNAUTHORIZED).json({
        message: 'Password did not match for the provided email.'
      });
    } catch (error) {
      errorHandler.handleAuthorizationErrors(error, res);
    }
  }

  try {
    const { valid, decryptedIdentifier } = await stationAuthentication.authenticate(identifier, message, signature);
    if (valid) {
      const station = await stationService.getStationByID(decryptedIdentifier);
      const payload = {
        stationID: station._id,
        customerID: station.customer,
        role: 'customer'
      };
      const accessToken = await newAccessToken(payload);
      const refreshToken = await newRefreshToken(payload);
      return res.status(status.OK).json({
        accessToken: accessToken,
        refreshToken: refreshToken
      });
    }

    return res.status(status.UNAUTHORIZED).jsonp({
      message: 'The signature provided did not verify with the given message.'
    });
  } catch (error) {
    errorHandler.handleAuthorizationErrors(error, res);
  }
};

/*// TODO: Think if this route makes sense. Decoding tokens without authentication and returning them? What for?
Controller.verify = async (req, res) => {
  const { token } = req.value.body;
  try {
    const validationResult = await verifyAccessToken(token);
    if (validationResult.valid) return res.status(status.OK).json(validationResult.token);

    return res.status(status.BAD_REQUEST).json({
      message: 'The provided access token is not valid.',
      error: validationResult.token
    });
  } catch (error) {
    errorHandler.handleVerificationErrors(error, res);
  }
};*/

/**
 * @api {put} /authorization Refresh an access token.
 * @apiName RefreshUser
 * @apiGroup Authorization
 *
 * @apiParam {String} token The refresh token to be used ot refresh. (body param).
 *
 * @apiSuccess {String} token The access token refreshed.
 *
 */
Controller.refresh = async (req, res) => {
  const { token } = req.value.body;
  const validationResult = await verifyRefreshToken(token);
  if (!validationResult.valid) return res.status(status.UNAUTHORIZED).json({
    message: 'The provided refresh token is invalid.',
    error: validationResult.token
  });
  const payload = {
    customerID: validationResult.token.customerID,
    role: validationResult.token.role
  };
  if (validationResult.token.userID) {
    const user = await userService.getUserByID(validationResult.token.userID);
    if (user.password_changed) return res.status(status.UNAUTHORIZED).json({
      message: 'You have to request new tokens since you changed your password.'
    });
    payload.userID = validationResult.token.userID;
  }

  payload.stationID = validationResult.token.stationID;

  try {
    const refreshedAccessToken = newAccessToken(payload);
    return res.status(status.OK).json({
      token: refreshedAccessToken
    });
  } catch (error) {
    errorHandler.handleRefreshError(error, res);
  }
};