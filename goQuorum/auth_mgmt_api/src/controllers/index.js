const Controller = module.exports;
const status = require('http-status');

/**
 * @api {get} / Index page of this API.
 * @apiName IndexPage
 * @apiGroup Index
 *
 * @apiSuccess (200 - OK) Returns a welcome message.
 */
Controller.getIndex = (req, res) => {
  return res.status(status.OK).json({
    message: 'Index page of the Entity & Authorization Management API.'
  });
};