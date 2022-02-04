const status = require('http-status');
const Controller = module.exports;

/**
 * @api {get} / Index page of this API.
 * @apiName IndexPage
 * @apiGroup Index
 */
Controller.indexPage = async (req, res) => {
  return res.status(status.OK).json({
    message: 'Welcome to the Index page.'
  });
};