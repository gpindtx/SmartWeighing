const Joi = require('@hapi/joi');
const status = require('http-status');
const { verifyAccessToken, verifyRefreshToken } = require('../jwt');
const { loggers } = require('winston');
const logger = loggers.get('apiLogger');
const stationService = require('../../services/station');
const userService = require('../../services/user');
const blacklistedTokenService = require('../../services/blacklistedToken');
const errorDefinitions = require('../errors/definitions');
const fieldsValidator = require('./fieldsValidator');
const RouterValidator = module.exports;

RouterValidator.validators = {

  /**
   * Validates the header of a request based on the given schema.
   * @param schema
   * @returns {function(...[*]=)}
   */
  validateHeader: schema => {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.headers);
      if (error) {
        logger.info(`[TOKEN_NOT_FOUND] -> Unauthorized access attempt to ${req.originalUrl}`);
        return res.status(status.UNAUTHORIZED).json({
          message: 'JWT Access Token was not found in headers!'
        });
      }

      const token = value.authorization.split(' ')[1];
      blacklistedTokenService.getBlacklistedTokenByToken(token)
        .then(blacklistedToken => {
          logger.info(`[BLACKLISTED_TOKEN] -> Attempt to access with a blacklisted token. userID: ${blacklistedToken.user}. token: ${blacklistedToken.token}`);
          return res.status(status.UNAUTHORIZED).json({
            message: 'The token provided for authentication is blacklisted.',
            token: blacklistedToken.token
          });
        })
        .catch(error => {
          if (error.name && error.name === errorDefinitions.unmatchedBlacklistedTokenString) {
            const result = verifyAccessToken(token);
            if (result.valid) {
              userService.getUserByID(result.token.userID)
                .then(user => {
                  console.log();
                  if (user.password_changed) return res.status(status.UNAUTHORIZED).json({
                    message: 'You changed your password. You must request authorization again.'
                  });

                  if (!req.value) req.value = {};
                  req.value.token = result.token;
                  return next();
                });

            } else if (result.token.message === 'jwt expired') {
              logger.info(`[TOKEN_EXPIRED] -> Unauthorized access attempt to ${req.originalUrl}.`);
              return res.status(status.UNAUTHORIZED).json({
                message: 'JWT Access Token expired.'
              });
            } else {
              logger.info(`[TOKEN_INVALID] -> Unauthorized access atempt to ${req.originalUrl}`);
              return res.status(status.UNAUTHORIZED).json({
                message: 'JWT Access Token was invalid.'
              });
            }
          } else {
            return res.status(status.INTERNAL_SERVER_ERROR).json({
              message: 'An unknown error occurred',
              error: error
            });
          }
        });
    };
  },

  /**
   * Validates the body of the request based on the given schema.
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

      if (!req.value) req.value = {};
      req.value.body = value;
      next();
    };
  },

  /**
   * Validates the URL parameters of the request based on the given schema.
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
   * Validates the Query parameters of the request based on the given schema.
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
   * Checks if the "logged" user is an Admin.
   * @returns {function(*, *, *): *}
   */
  isAdmin: () => {
    return (req, res, next) => {
      if (!(req.value && req.value.token && req.value.token.role === 'admin'))
        return res.status(status.UNAUTHORIZED).json({
          message: 'Only an Administrator can perform this operation.'
        });
      next();
    };
  },

  /**
   * Checks if the "logged" user is an admin or the customer requested.
   * @returns {function(*, *, *): *}
   */
  isAdminOrSelfCustomer: () => {
    return (req, res, next) => {
      if (!(req.value && req.value.token && (req.value.token.role === 'admin' || req.value.token.customerID === req.value.params.customer_id)))
        return res.status(status.UNAUTHORIZED).json({
          message: 'Only an Administrator or the entity itself can perform this operation'
        });
      next();
    };
  },

  /**
   * Checks if the logged user is a customer.
   * @returns {function(...[*]=)}
   */
  isCustomer: () => {
    return (req, res, next) => {
      if (!(req.value && req.value.token && req.value.token.role === 'customer')) return res.status(status.BAD_REQUEST).json({
        message: 'route only available for customers.'
      });

      next();
    };
  },

  /**
   * Checks if the "logged" user is the customer requested.
   * @returns {function(...[*]=)}
   */
  isSelfCustomer: () => {
    return (req, res, next) => {
      if (!(req.value && req.value.token && req.value.token.customerID === req.value.params.customer_id))
        return res.status(status.UNAUTHORIZED).json({
          message: 'Only the entity itself can perform this operation'
        });
      next();
    };
  },

  /**
   * Checks if the customer of the user in params and the logged user are the same
   * @returns {function(...[*]=)}
   */
  sameCustomer: () => {
    return (req, res, next) => {
      const customerID = req.value.token.customerID;
      userService.getUserByID(req.value.params.user_id)
        .then(user => {
          if (!(user && user.customer && user.customer === customerID))
            return res.status(status.UNAUTHORIZED).json({
              message: 'Route only accessible to a user of the same customer.'
            });
          next();
        })
        .catch(error => {
          if (error.name && error.name === errorDefinitions.unmatchedUserID)
            return res.status(status.BAD_REQUEST).json({
              message: error.toString()
            });

          return res.status(status.INTERNAL_SERVER_ERROR).json(error);
        });
    };
  },

  /**
   * Checks if the logged user and the user in params are the same.
   * @returns {function(...[*]=)}
   */
  isSelfUser: () => {
    return (req, res, next) => {
      if (!(req.value && req.value.token && req.value.token.userID === req.value.params.user_id))
        return res.status(status.UNAUTHORIZED).json({
          message: 'Only the user itself can use this route.'
        });
      next();
    };
  },

  /**
   * Checks if the token to blacklist belongs to the "logged" user.
   * @returns {function(...[*]=)}
   */
  validateBlacklistOperation: () => {
    return (req, res, next) => {
      let tokenToBlacklist = req.value.body.token;
      const loggedToken = req.value.token;

      let tokenValidation;
      tokenValidation = verifyAccessToken(tokenToBlacklist);
      if (!tokenValidation.valid) {
        tokenValidation = verifyRefreshToken(tokenToBlacklist);
      }

      if (!tokenValidation.valid) return res.status(status.BAD_REQUEST).json({
        message: 'The provided token is not valid',
        details: tokenValidation.token.details
      });

      if (!loggedToken.customerID === tokenValidation.token.customerID) return res.status(status.BAD_REQUEST).json({
        message: 'You can only blacklist your own customer\'s tokens.'
      });

      next();
    };
  },

  /**
   * Checks that the station belongs to the logged customer
   * @returns {function(...[*]=)}
   */
  belongsStation: () => {
    return (req, res, next) => {
      if (req.value.token.role === 'customer') {
        const customerID = req.value.token.customerID;
        stationService.getStationByID(req.value.params.station_id)
          .then(station => {
            if (!(station && station.customer.toString() === customerID)) return res.status(status.BAD_REQUEST).json({
              message: 'The station with id ' + req.value.params.station_id + ' is not associated with the logged customer.'
            });

            return next();
          })
          .catch(error => {
            if (error.name && error.name === errorDefinitions.unmatchedStationID) return res.status(status.BAD_REQUEST).json({
              message: 'The station with id ' + req.value.params.station_id + ' is not associated with the logged customer.'
            });

            return res.status(status.INTERNAL_SERVER_ERROR).json(error);
          });
      } else if (!(req.method === 'GET' || req.method === 'PUT' || req.method === 'DELETE')) {
        return res.status(status.UNAUTHORIZED).json({
          message: 'You are not authorized to access this route.'
        });
      } else {
        return next();
      }
    };
  },

  /**
   * Checks that the user belongs to the logged customer
   * @returns {function(...[*]=)}
   */
  belongsUser: () => {
    return (req, res, next) => {
      const customerID = req.value.token.customerID;
      let functionToCall;
      if (fieldsValidator.isEmailValid(req.value.params.user_id)) functionToCall = userService.getUserByEmail;
      else functionToCall = userService.getUserByID;
      functionToCall(req.value.params.user_id)
        .then(user => {
          if (!(user && (user.customer === '' || user.customer === customerID))) return res.status(status.BAD_REQUEST).json({
            message: 'The user with id ' + req.value.params.user_id + ' is not associated with the logged customer'
          });

          next();
        })
        .catch(error => {
          if (error.name && error.name === errorDefinitions.unmatchedUserID) return res.status(status.BAD_REQUEST).json({
            message: 'The user with id ' + req.value.params.user_id + ' is not associated with the logged customer.'
          });

          return res.status(status.INTERNAL_SERVER_ERROR).json(error);
        });
    };
  },

  /**
   * Middleware that checks if the user is active (allowed to communicate) in the API.
   * @returns {function(...[*]=)}
   */
  isUserActive: () => {
    return (req, res, next) => {
      const { userID } = req.value.token;
      userService.getUserByID(userID)
        .then(user => {
          if (!user.active) {
            return res.status(status.UNAUTHORIZED).json({
              message: 'Your access to the API is blocked. Please contact a system administrator.'
            });
          }

          next();
        })
        .catch(error => {
          return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: 'An unknown error occurred.',
            error: error
          });
        });
    };
  },

  /**
   * Middleware that checks if the user is not deleted in the context of the API.
   * @returns {function(...[*]=)}
   */
  notDeletedUser: () => {
    return (req, res, next) => {
      const { userID } = req.value.token;
      userService.getUserByID(userID)
        .then(user => {
          if (user.deleted)
            return res.status(status.UNAUTHORIZED).json({
              message: 'Your account has been deleted from the API. Please contact a system administrator.'
            });

          next();
        })
        .catch(error => {
          return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: 'An unknown error occurred.',
            error: error
          });
        });
    };
  },

  /**
   * Middleware that checks if the user still has the password assigned to him or not.
   * @returns {function(...[*]=)}
   */
  notFirstPass: () => {
    return (req, res, next) => {
      const { userID } = req.value.token;
      userService.getUserByID(userID)
        .then(user => {
          if (user.first_pass)
            return res.status(status.UNAUTHORIZED).json({
              message: 'Please update your password prior communicating with the API.'
            });

          next();
        })
        .catch(error => {
          return res.status(status.INTERNAL_SERVER_ERROR).json({
            message: 'An unknown error occurred',
            error: error
          });
        });
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
    registerCustomer: Joi.object({
      name: Joi.string().required(),
      location: Joi.string(),
      description: Joi.string(),
      address: Joi.string().required(),
      node: Joi.string().required(),
      tesseraPublicKey: Joi.string().required(),
      companyID: Joi.string(),
      email: Joi.string().required(),
      password: Joi.string().required(),
    }),
    updateCostumer: Joi.object({
      name: Joi.string(),
      location: Joi.string(),
      companyID: Joi.string(),
      description: Joi.string(),
      block: Joi.boolean().strict()
    }),
    registerUser: Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
      address: Joi.string(),
      node: Joi.string(),
      tesseraPublicKey: Joi.string(),
      loginEmail: Joi.string(),
      loginPassword: Joi.string()
    }),
    updateUser: Joi.object({
      newPassword: Joi.string(),
      oldPassword: Joi.string(),
      block: Joi.boolean().strict()
    }),
    registerStation: Joi.object({
      name: Joi.string().required(),
      latitude: Joi.string(),
      longitude: Joi.string(),
      description: Joi.string(),
      address: Joi.string().required(),
      node: Joi.string().required(),
      tesseraPublicKey: Joi.string().required(),
      publicKey: Joi.string().required()
    }),
    updateStation: Joi.object({
      name: Joi.string(),
      latitude: Joi.string(),
      longitude: Joi.string(),
      description: Joi.string(),
      address: Joi.string(),
      node: Joi.string(),
      block: Joi.boolean().strict()
    }),
    registerBlacklistedToken: Joi.object({
      token: Joi.string().required()
    }),
    authorizeUserOrStation: Joi.object({
      email: Joi.string(),
      password: Joi.string(),
      identifier: Joi.string(),
      message: Joi.string(),
      signature: Joi.string()
    }),
    verifyToken: Joi.object({
      token: Joi.string().required()
    }),
    refreshToken: Joi.object({
      token: Joi.string().required()
    })
  },
  querySchemas: {
    userID: Joi.object({
      user_id: Joi.string()
    })
  },
  paramsSchemas: {
    customerID: Joi.object({
      customer_id: Joi.string().required()
    }),
    userID: Joi.object({
      user_id: Joi.string().required()
    }),
    stationID: Joi.object({
      station_id: Joi.string().required()
    }),
    blacklistedTokenID: Joi.object({
      token_id: Joi.string().required()
    }),
    blacklistedToken: Joi.object({
      token: Joi.string().required()
    })
  }
};