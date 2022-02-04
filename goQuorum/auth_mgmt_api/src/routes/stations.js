const express = require('express');
const router = express.Router();
const stationsController = require('../controllers/stations');
const { validators, schemas } = require('../helpers/validators/routesValidator');

router.post('/',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.isUserActive(),
  validators.notDeletedUser(),
  validators.notFirstPass(),
  validators.isCustomer(),
  validators.validateBody(schemas.bodySchemas.registerStation),
  stationsController.registerStation
);

router.get('/',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.isUserActive(),
  validators.notDeletedUser(),
  validators.notFirstPass(),
  validators.isCustomer(),
  stationsController.getStations
);

router.get('/:station_id',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.isUserActive(),
  validators.notDeletedUser(),
  validators.notFirstPass(),
  validators.validateParams(schemas.paramsSchemas.stationID),
  validators.belongsStation(),
  stationsController.getStation
);

router.put('/:station_id',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.isUserActive(),
  validators.notDeletedUser(),
  validators.notFirstPass(),
  validators.validateParams(schemas.paramsSchemas.stationID),
  validators.belongsStation(),
  validators.validateBody(schemas.bodySchemas.updateStation),
  stationsController.updateStation
)
;

router.delete('/:station_id',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.isUserActive(),
  validators.notDeletedUser(),
  validators.notFirstPass(),
  validators.validateParams(schemas.paramsSchemas.stationID),
  validators.belongsStation(),
  stationsController.deleteStation
);

module.exports = router;