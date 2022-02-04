const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { validators, schemas } = require('../helpers/validators/routesValidator');

router.post('/',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.isUserActive(),
  validators.notDeletedUser(),
  validators.notFirstPass(),
  validators.validateBody(schemas.bodySchemas.registerUser),
  usersController.registerUser
);

router.get('/',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.isUserActive(),
  validators.notDeletedUser(),
  validators.notFirstPass(),
  usersController.getUsers
);

router.get('/:user_id',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.isUserActive(),
  validators.notDeletedUser(),
  validators.notFirstPass(),
  validators.validateParams(schemas.paramsSchemas.userID),
  validators.belongsUser(),
  usersController.getUser
);

router.put('/:user_id',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.isUserActive(),
  validators.notDeletedUser(),
  validators.validateParams(schemas.paramsSchemas.userID),
  validators.validateBody(schemas.bodySchemas.updateUser),
  usersController.updateUser
);

router.delete('/:user_id',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.isUserActive(),
  validators.notDeletedUser(),
  validators.notFirstPass(),
  validators.validateParams(schemas.paramsSchemas.userID),
  usersController.deleteUser
);

module.exports = router;
