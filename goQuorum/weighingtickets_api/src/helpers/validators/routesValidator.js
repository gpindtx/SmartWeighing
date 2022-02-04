const Joi = require('@hapi/joi');
const status = require('http-status');
const { verifyAccessToken } = require('../authorizationControl');
const { loggers } = require('winston');
const logger = loggers.get('apiLogger');
const RouterValidator = module.exports;
const userService = require('../../services/user');
const stationService = require('../../services/station');
const blacklistedTokenService = require('../../services/blacklistedToken');

RouterValidator.validators = {
  /**
   * Validates the header using the given schema.
   * @param schema
   * @returns {function(...[*]=)}
   */
  validateHeader: schema => {
    return (req, res, next) => {

      const { error, value } = schema.validate(req.headers);
      if (error) {
        logger.info(
          `[TOKEN_NOT_FOUND] -> Unauthorized access attempt to ${req.originalUrl}.`);
        return res.status(status.UNAUTHORIZED).json({
          message: 'JWT Access Token was not found in headers!'
        });
      }

      const token = value.authorization.split(' ')[1];
      blacklistedTokenService.getBlacklistedTokenByToken(token)
        .then(blacklistedToken => {
          logger.info(`[BLACKLISTED_TOKEN] -> Attempt to access with a blacklisted token. token: ${blacklistedToken}`);
          return res.status(status.UNAUTHORIZED).jsonp({
            message: 'The token provided for authentication is blacklisted.',
            token: blacklistedToken
          });
        }).catch(error => {
        if (error.name && error.name === 'UnmatchedBlacklistedToken') {
          const verifyResult = verifyAccessToken(token);

          if (verifyResult.valid) {
            const { userID } = verifyResult.token;
            if (userID) {
              userService.notChangedAndNotFirstPass(userID)
                .then(ok => {
                  if (!ok) return res.status(status.UNAUTHORIZED).json({
                    message: 'You changed your password or still have the first password. You must request authorization again or change if it is your first password.'
                  });
                  if (!req.value) req.value = {};
                  req.value.token = verifyResult.token;
                  return next();
                }).catch(error => {
                return res.status(status.INTERNAL_SERVER_ERROR).jsonp({
                  message: error.message,
                  error: error
                });
              });
            } else {
              if (!req.value) req.value = {};
              req.value.token = verifyResult.token;
              return next();
            }
          } else if (verifyResult.token.message === 'jwt expired') {
            logger.info(
              `[TOKEN_EXPIRED] -> Unauthorized access attempt to ${req.originalUrl}.`);
            return res.status(status.UNAUTHORIZED).json({
              message: 'JWT Access Token expired'
            });
          } else {
            logger.info(
              `[TOKEN_INVALID] -> Unauthorized access attempt to ${req.originalUrl}.`);
            return res.status(status.UNAUTHORIZED).json({
              message: 'JWT Access Token was invalid.'
            });
          }
        }
      });
    };
  },

  /**
   * Validates the body of a request given a schema
   * @param schema
   * @returns {function(...[*]=)}
   */
  validateBody: schema => {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(status.BAD_REQUEST).json({
          message: error.details
        });
      }

      if (!req.value) {
        req.value = {};
      }
      req.value.body = value;
      next();
    };
  },

  /**
   * Validates the parameters of a request given a schema
   * @param schema
   * @returns {function(...[*]=)}
   */
  validateParams: schema => {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.params);
      if (error) {
        return res.status(status.BAD_REQUEST).json({
          message: error.details
        });
      }
      if (!req.value) req.value = {};
      req.value.params = value;
      next();
    };
  },

  /**
   * Validate the query parameters of a request given a schema
   * @param schema
   * @returns {function(...[*]=)}
   */
  validateQuery: schema => {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.query);
      if (error) {
        return res.status(status.BAD_REQUEST).json({
          message: error.details
        });
      }
      if (!req.value) req.value = {};
      req.value.query = value;
      next();
    };
  },

  /**
   * Checks if the token belongs to a user.
   * @returns {function(...[*]=)}
   */
  isUser: () => {
    return (req, res, next) => {
      if (req.value && req.value.token) {
        if (!req.value.token.userID) return res.status(status.UNAUTHORIZED).jsonp({
          message: 'Only users can call this route.'
        });

        return next();
      }

      return res.status(status.INTERNAL_SERVER_ERROR).jsonp({
        message: 'Somehow the token wasn\'t decoded first.'
      });
    };
  },

  /**
   * Checks if the token belongs to a station.
   * @returns {function(...[*]=)}
   */
  isStation: () => {
    return (req, res, next) => {
      if (req.value && req.value.token) {
        if (!req.value.token.stationID) return res.status(status.UNAUTHORIZED).jsonp({
          message: 'Only stations can call this route.'
        });

        return next();
      }

      return res.status(status.INTERNAL_SERVER_ERROR).jsonp({
        message: 'Somehow the token wasn\'t decoded first.'
      });
    };
  },

  /**
   * Checks if the requesting user is blocked.
   * @returns {function(...[*]=)}
   */
  isUserActive: () => {
    return (req, res, next) => {
      if (req.value && req.value.token) {
        const { userID } = req.value.token;
        userService.isUserBlocked(userID)
          .then(isBlocked => {
            if (isBlocked) return res.status(status.UNAUTHORIZED).jsonp({
              message: 'You are blocked from communicating with the APIs. Please contact the system administrator.'
            });
            return next();
          }).catch(error => {
          return res.status(status.INTERNAL_SERVER_ERROR).jsonp({
            message: error.message,
            error: error
          });
        });
      } else {
        return res.status(status.UNAUTHORIZED).jsonp({
          message: 'Token must be decoded first.'
        });
      }
    };
  },

  /**
   * Checks if the requesting user is deleted.
   * @returns {function(...[*]=)}
   */
  isUserNotDeleted: () => {
    return (req, res, next) => {
      if (req.value && req.value.token) {
        const { userID } = req.value.token;
        userService.isUserDeleted(userID)
          .then(isDeleted => {
            if (isDeleted) return res.status(status.UNAUTHORIZED).jsonp({
              message: 'You are deleted from the API. Please contact the system administrator.'
            });
            return next();
          }).catch(error => {
          return res.status(status.INTERNAL_SERVER_ERROR).jsonp({
            message: error.message,
            error: error
          });
        });
      } else {
        return res.status(status.UNAUTHORIZED).jsonp({
          message: 'Token must be decoded first.'
        });
      }
    };
  },

  /**
   * Checks if the requesting station is blocked.
   * @returns {function(...[*]=)}
   */
  isStationActive: () => {
    return (req, res, next) => {
      if (req.value && req.value.token) {
        const { stationID } = req.value.token;
        stationService.isStationBlocked(stationID)
          .then(isBlocked => {
            if (isBlocked) return res.status(status.UNAUTHORIZED).jsonp({
              message: 'You are blocked from communicating with the API. Please contact the system administrator.'
            });

            return next();
          }).catch(error => {
          return res.status(status.INTERNAL_SERVER_ERROR).jsonp({
            message: error.message,
            error: error
          });
        });
      } else {
        return res.status(status.UNAUTHORIZED).jsonp({
          message: 'Token must be decoded first.'
        });
      }
    };
  },

  /**
   * Checks if the requesting station is deleted.
   * @returns {function(...[*]=)}
   */
  isStationNotDeleted: () => {
    return (req, res, next) => {
      if (req.value && req.value.token) {
        const { stationID } = req.value.token;
        stationService.isStationDeleted(stationID)
          .then(isDeleted => {
            if (isDeleted) return res.status(status.UNAUTHORIZED).jsonp({
              message: 'You are deleted from the API. Please contact the system administrator.'
            });

            return next();
          }).catch(error => {
          return res.status(status.INTERNAL_SERVER_ERROR).jsonp({
            message: error.message,
            error: error
          });
        });
      } else {
        return res.status(status.UNAUTHORIZED).jsonp({
          message: 'Token must be decoded first.'
        });
      }
    };
  }
};

RouterValidator.schemas = {
  headerSchemas: {
    accessToken: Joi.object({
      authorization: Joi.string().required()
    }).options({ allowUnknown: true })
  },
  bodySchemas: {
    weighingTicket: Joi.object({
      scaleSerialNumber: Joi.string().required(),
      timestamp: Joi.number(),
      terminalSerialNumber: Joi.string().required(),
      terminalRestartValue: Joi.string(),
      scaleStatus: Joi.string().required(),
      scaleGross: Joi.number().required(),
      scaleNet: Joi.number().required(),
      cells: Joi.array().items(Joi.object({
        cellSerialNumber: Joi.string().required(),
        cellWeight: Joi.number().required()
      }))
    })
  },
  paramsSchemas: {
    ticketID: Joi.object({
      ticket_id: Joi.string().required()
    })
  },
  querySchemas: {
    filterTickets: Joi.object({
      count: Joi.string(),
      customer: Joi.string(),
      stations: Joi.string(),
      from_date: Joi.any(),
      until_date: Joi.any(),
      from_weight: Joi.number(),
      until_weight: Joi.number(),
      scale_serial_number: Joi.string(),
      terminal_serial_number: Joi.string(),
      scale_status: Joi.string(),
      terminal_restart_value: Joi.string(),
      group_by: Joi.string(),
      date_type: Joi.string()
    })
  }
};