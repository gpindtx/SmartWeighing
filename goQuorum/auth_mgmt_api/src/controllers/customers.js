const Controller = module.exports;
const status = require('http-status');
const errorDefinitions = require('../helpers/errors/definitions');
const customerService = require('../services/customer');
const userService = require('../services/user');
const stationService = require('../services/station');
const errorHandler = require('../helpers/errors/handler').customers;
const Encoder = require('../helpers/databaseEncoder');

/**
 * @apiDefine admin Administrator access only.
 * @apiDefine customer Customer access only.
 * @apiDefine both Both an Administrator and a Customer can call this route.
 */

/**
 * @api {post} /customers Register a new customer
 * @apiPermission admin
 * @apiName RegisterCustomer
 * @apiGroup Customers
 *
 * @apiParam {String} name The name of the customer. Required.
 * @apiParam {String} location The location of the customer. Optional.
 * @apiParam {String} description Some description about the customer. Optional.
 * @apiParam {String} companyID Some unique company identifier, if applicable. Defaults to the company's name.
 * @apiParam {String} email The email of the first user associated with this customer.
 * @apiParam {String} password The password for the user.
 *
 * @apiExample
 * body = {
 *   name: CompanyX,
 *   location: Portugal,
 *   email: user@companyx.pt
 *   password: example_password
 * }
 *
 * @apiSuccess {Object} ids Contains the customerID and the userID of the created customer and user.
 */
Controller.registerCustomer = async (req, res) => {
  let { name, location, description, companyID, address, node, tesseraPublicKey, email, password } = req.value.body;
  address = await Encoder.encrypt(address);
  node = await Encoder.encrypt(node);
  tesseraPublicKey = await Encoder.encrypt(tesseraPublicKey);
  try {
    const customerID = await customerService.registerCustomer(
      name,
      location,
      description,
      companyID,
      address,
      node,
      tesseraPublicKey
    );
    const userID = await userService.registerUser(email, password, customerID, 'customer');
    return res.status(status.OK).json({
      customerID: customerID,
      userID: userID
    });
  } catch (error) {
    errorHandler.handleRegistrationErrors(error, res);
  }
};

/**
 * @api {get} /customers Get ID, Name and companyID of all customers.
 * @apiPermission admin
 * @apiName GetCustomers
 * @apiGroup Customers
 *
 * @apiSuccess {Array} customers The array of existent customers.
 */
Controller.getCustomers = async (req, res) => {
  try {
    const customers = await customerService.getCustomers();
    return res.status(status.OK).json(customers);
  } catch (error) {
    errorHandler.handleQueryAllErrors(error, res);
  }

};

/**
 * @api {get} /customers/:customer_id Get customer by ID or Name.
 * @apiPermission both
 * @apiName GetCustomer
 * @apiGroup Customers
 *
 * @apiParam {String} customer_id Can be either the customer's ID or the customer's name. [URL PARAM].
 *
 * @apiSuccess {Object} customer The information on the requested customer.
 */
Controller.getCustomer = async (req, res) => {
  const customerID = req.value.params.customer_id;
  try {
    const customer = await customerService.getCustomerByID(customerID);
    return res.status(status.OK).json(customer);
  } catch (error) {
    if (error.name && error.name === errorDefinitions.unmatchedCustomerID) {
      try {
        const customer = await customerService.getCustomerByName(customerID);
        return res.status(status.OK).json(customer);
      } catch (error) {
        errorHandler.handleQueryErrors(error, res);
      }
    }

    errorHandler.handleQueryErrors(error, res);
  }
};

/**
 * @api {put} /customers/:customer_id Update customer by ID.
 * @apiPermission both
 * @apiName UpdateCustomer
 * @apiGroup Customers
 *
 * @apiParam {String} name The name of the company. Requires admin permission to update. [BODY PARAM]
 * @apiParam {String} companyID The identifier of the company. Requires admin permission to update. [BODY PARAM]
 * @apiParam {String} location The location of the company. [BODY PARAM]
 * @apiParam {String} A description of the company. [BODY PARAM]
 */
Controller.updateCustomer = async (req, res) => {
  const customerID = req.value.params.customer_id;
  const { name, companyID, location, description, block } = req.value.body;
  const { role } = req.value.token;
  if (role === 'customer' && (name || companyID || block)) return res.status(status.UNAUTHORIZED).json({
    message: 'You are not authorized to change your identification nor block you in the system. Please contact administration.'
  });

  if (block === true && role === 'admin') {
    try {
      await customerService.blockCustomer(customerID);
      await userService.blockUsers(customerID);
      await stationService.blockStations(customerID);
    } catch (error) {
      errorHandler.handleUpdateErrors(error, res);
    }
  } else if (block === false && role === 'admin') {
    try {
      await customerService.unblockCustomer(customerID);
      await userService.unblockUsers(customerID);
      await stationService.unblockStations(customerID);
    } catch (error) {
      errorHandler.handleUpdateErrors(error, res);
    }
  }

  const updateAttributes = {};
  if (name) updateAttributes.name = name;
  if (companyID) updateAttributes.companyID = companyID;
  if (location) updateAttributes.location = location;
  if (description) updateAttributes.description = description;
  if (Object.keys(updateAttributes).length > 0) {
    try {
      await customerService.updateCustomer(customerID, customerID, updateAttributes);
    } catch (error) {
      errorHandler.handleUpdateErrors(error, res);
    }
  }

  return res.sendStatus(status.OK);
};

/**
 * @api {delete} /customers/:customer_id Marks the customer and all associated entities as deleted.
 * @apiPermission admin
 * @apiName DeleteCustomer
 * @apiGroup Customers
 *
 * @apiParam {String} customer_id The customer's identifier. [URL PARAM]
 */
Controller.deleteCustomer = async (req, res) => {
  const customerID = req.value.params.customer_id;
  try {
    await customerService.deleteCustomer(customerID);
    await userService.deleteUsers(customerID);
    await stationService.deleteStations(customerID);

    return res.sendStatus(status.OK);
  } catch (error) {
    errorHandler.handleDeleteErrors(error, res);
  }
};