const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customers');
const { validators, schemas } = require('../helpers/validators/routesValidator');

router.post('/',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.isAdmin(),
  validators.isUserActive(),
  validators.notDeletedUser(),
  validators.notFirstPass(),
  validators.validateBody(schemas.bodySchemas.registerCustomer),
  customersController.registerCustomer
);

router.get('/',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.isAdmin(),
  validators.isUserActive(),
  validators.notDeletedUser(),
  validators.notFirstPass(),
  customersController.getCustomers
);

router.get('/:customer_id',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.isUserActive(),
  validators.notDeletedUser(),
  validators.notFirstPass(),
  validators.validateParams(schemas.paramsSchemas.customerID),
  validators.isAdminOrSelfCustomer(),
  customersController.getCustomer
);

router.put('/:customer_id',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.isUserActive(),
  validators.notDeletedUser(),
  validators.notFirstPass(),
  validators.validateParams(schemas.paramsSchemas.customerID),
  validators.validateBody(schemas.bodySchemas.updateCostumer),
  validators.isSelfCustomer(),
  customersController.updateCustomer
);

router.delete('/:customer_id',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.isUserActive(),
  validators.notDeletedUser(),
  validators.notFirstPass(),
  validators.validateParams(schemas.paramsSchemas.customerID),
  validators.isAdmin(),
  customersController.deleteCustomer
);

module.exports = router;