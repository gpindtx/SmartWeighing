const express = require('express');
const router = express.Router();
const ticketsController = require('../controllers/tickets');
const { validators, schemas } = require('../helpers/validators/routesValidator');

router.get('/',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.validateQuery(schemas.querySchemas.filterTickets),
  validators.isUser(),
  validators.isUserActive(),
  validators.isUserNotDeleted(),
  ticketsController.getTickets);

router.get('/:ticket_id',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.validateParams(schemas.paramsSchemas.ticketID),
  validators.isUser(),
  validators.isUserActive(),
  validators.isUserNotDeleted(),
  ticketsController.getTicket);

router.post('/',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.validateBody(schemas.bodySchemas.weighingTicket),
  validators.isStation(),
  validators.isStationActive(),
  validators.isStationNotDeleted(),
  ticketsController.registerTicket);

router.put('/:ticket_id',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.validateParams(schemas.paramsSchemas.ticketID),
  validators.isUser(),
  validators.isUserActive(),
  validators.isUserNotDeleted(),
  ticketsController.updateTicket);

router.delete('/:ticket_id',
  validators.validateHeader(schemas.headerSchemas.accessToken),
  validators.validateParams(schemas.paramsSchemas.ticketID),
  validators.isUser(),
  validators.isUserActive(),
  validators.isUserNotDeleted(),
  ticketsController.deleteTicket);

module.exports = router;

