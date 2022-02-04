const express = require('express');
const router = express.Router();
const authorizationController = require('../controllers/authorization');
const { validators, schemas } = require('../helpers/validators/routesValidator');

router.post('/',
  validators.validateBody(schemas.bodySchemas.authorizeUserOrStation),
  authorizationController.authorize
); // Authorize route.

/*router.get('/',
  validators.validateBody(schemas.bodySchemas.verifyToken),
  authorizationController.verify
); // Verification route.*/

router.put('/',
  validators.validateBody(schemas.bodySchemas.refreshToken),
  authorizationController.refresh
); // Refresh token route

module.exports = router;