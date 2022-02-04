const express = require('express');
const router = express.Router();
const blacklistedTokensController = require('../controllers/blacklistedTokens');
const { validators, schemas } = require('../helpers/validators/routesValidator');

router.post('/',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.isUserActive(),
  validators.notDeletedUser(),
  validators.notFirstPass(),
  validators.validateBody(schemas.bodySchemas.registerBlacklistedToken),
  validators.validateBlacklistOperation(),
  blacklistedTokensController.registerBlacklistedToken
);

router.get('/',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.isUserActive(),
  validators.notDeletedUser(),
  validators.notFirstPass(),
  validators.isAdmin(),
  validators.validateQuery(schemas.querySchemas.userID),
  blacklistedTokensController.getBlacklistedTokens
);

router.get('/:token_id',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.isUserActive(),
  validators.notDeletedUser(),
  validators.notFirstPass(),
  validators.isAdmin(),
  validators.validateParams(schemas.paramsSchemas.blacklistedTokenID),
  blacklistedTokensController.getBlacklistedToken
);

router.delete('/:token_id',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.isUserActive(),
  validators.notDeletedUser(),
  validators.notFirstPass(),
  validators.isAdmin(),
  validators.validateParams(schemas.paramsSchemas.blacklistedTokenID),
  blacklistedTokensController.deleteBlacklistedToken
);

router.delete('/',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.isUserActive(),
  validators.notDeletedUser(),
  validators.notFirstPass(),
  validators.isAdmin(),
  blacklistedTokensController.deleteBlacklistedTokens
);

module.exports = router;