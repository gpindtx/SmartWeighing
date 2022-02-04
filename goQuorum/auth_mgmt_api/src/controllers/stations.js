const Controller = module.exports;
const status = require('http-status');
const stationService = require('../services/station');
const customerService = require('../services/customer');
const userService = require('../services/user');
const errorHandler = require('../helpers/errors/handler').stations;
const deployer = require('../helpers/deployer');
const Encoder = require('../helpers/databaseEncoder');

/**
 * @apiDefine customer Only a customer can call this route
 * @apiDefine adminOrCustomer An admin or a customer can call this route. Restrictions may apply to each entity.
 */

/**
 * @api {post} /stations Register a new station
 * @apiPermission customer
 * @apiName RegisterStation
 * @apiGroup Stations
 *
 * @apiParam {String} name The name of the station. [BODY_PARAM].
 * @apiParam {String} latitude The latitude of the station. Optional. [BODY_PARAM].
 * @apiParam {String} longitude The longitude of the station. Optional. [BODY_PARAM].
 * @apiParam {String} description A description on the station. Optional. [BODY_PARAM].
 * @apiParam {String} address The Quorum node address of this station. [BODY_PARAM].
 * @apiParam {String} node Quorum node information for this station (id/url). [BODY_PARAM].
 * @apiParam {String} publicKey The public key of this station.
 *
 * @apiSuccess {Object} stationID The stationID
 */
Controller.registerStation = async (req, res) => {
  const { customerID } = req.value.token;
  let { name, latitude, longitude, description, address, node, publicKey, tesseraPublicKey } = req.value.body;
  try {
    let customerTesseraPublicKey = await customerService.getCustomerTesseraKey(customerID);
    customerTesseraPublicKey = await Encoder.decrypt(customerTesseraPublicKey);
    const privateForNodes = [customerTesseraPublicKey, tesseraPublicKey];
    const connectionInfo = await userService.getAdminConnectionInfo();
    connectionInfo.address = await Encoder.decrypt(connectionInfo.address);
    connectionInfo.node = await Encoder.decrypt(connectionInfo.node);
    const transaction = await deployer.deployContract(connectionInfo.address, connectionInfo.node, privateForNodes);
    address = await Encoder.encrypt(address);
    node = await Encoder.encrypt(node);
    publicKey = await Encoder.encrypt(publicKey);
    tesseraPublicKey = await Encoder.encrypt(tesseraPublicKey);
    transaction.contractAddress = await Encoder.encrypt(transaction.contractAddress);
    const stationID = await stationService.registerStation(name, latitude, longitude, description, customerID, address, node, transaction.contractAddress, publicKey, tesseraPublicKey);
    return res.status(status.OK).json({
      stationID: stationID
    });
  } catch (error) {
    errorHandler.handleRegistrationErrors(error, res);
  }
};

/**
 * @api {get} /stations Get all stations associated with a customer
 * @apiPermission customer
 * @apiName GetStations
 * @apiGroup Stations
 *
 * @apiSuccess {Array} stations The array of stations that belongs to the logged customer.
 */
Controller.getStations = async (req, res) => {
  const { customerID } = req.value.token;
  try {
    const stations = await stationService.getStationsByCustomer(customerID);
    return res.status(status.OK).json(stations);
  } catch (error) {
    errorHandler.handleQueryAllErrors(error, res);
  }
};

/**
 * @api {get} /stations/:station_id Get a station by its ID
 * @apiName GetStation
 * @apiGroup Stations
 *
 * @apiParam {String} station_id The station's identifier. [URL PARAM].
 *
 * @apiSuccess {Station} station Returns the station info.
 */
Controller.getStation = async (req, res) => {
  const stationID = req.value.params.station_id;

  try {
    const station = await stationService.getStationByID(stationID);
    return res.status(status.OK).json(station);
  } catch (error) {
    errorHandler.handleQueryErrors(error, res);
  }
};

/**
 * @api {put} /stations/:station_id Update a station's state
 * @apiPermission adminOrCustomer
 * @apiName UpdateStation
 * @apiGroup Stations
 *
 * @apiParam {String} station_id The station's identifier. [URL PARAM].
 * @apiParam {String} name The station's name. [BODY PARAM].
 * @apiParam {String} latitude The station's latitude. [BODY PARAM].
 * @apiParam {String} description A description on the station. Optional. [BODY_PARAM].
 * @apiParam {String} address The Quorum node address of this station. [BODY_PARAM].
 * @apiParam {String} node Quorum node information for this station (id/url). [BODY_PARAM].
 * @apiParam {Boolean} block True if the station is to be blocked from communicating with the API, False to unblock. [BODY_PARAM].
 */
Controller.updateStation = async (req, res) => {
  let { name, latitude, longitude, description, address, node, block } = req.value.body;
  const stationID = req.value.params.station_id;
  const { customerID, role } = req.value.token;
  try {
    const exists = await stationService.existsStationInCustomer(stationID, customerID);
    if ((block === false || block === true) && (role !== 'admin' && !exists))
      return res.status(status.UNAUTHORIZED).json({
        message: 'The station with the specified ID can only be blocked by an administrator or by the associated customer.'
      });

    if (block === true)
      await stationService.blockStation(stationID);
    else if (block === false)
      await stationService.unblockStation(stationID);

    const updateAttributes = {};
    if (name) updateAttributes.name = name;
    if (latitude) updateAttributes.latitude = latitude;
    if (longitude) updateAttributes.longitude = longitude;
    if (description) updateAttributes.description = description;
    if (address) {
      address = await Encoder.encrypt(address);
      updateAttributes.address = address;
    }
    if (node) {
      node = await Encoder.encrypt(node);
      updateAttributes.node = node;
    }

    if (Object.keys(updateAttributes).length > 0)
      await stationService.updateStation(stationID, updateAttributes);

    return res.sendStatus(status.OK);
  } catch (error) {
    errorHandler.handleUpdateErrors(error, res);
  }

};

/**
 * @api {delete} /stations/:station_id Mark the station with station_id as deleted
 * @apiPermission adminOrCustomer
 * @apiName DeleteStation
 * @apiGroup Stations
 *
 * @apiParam {String} station_id The station's identifier. [URL PARAM].
 */
Controller.deleteStation = async (req, res) => {
  const stationID = req.params.station_id;
  try { // Validation that the logged customer holds the station or is an admin already occurred.
    await stationService.deleteStation(stationID);
    return res.sendStatus(status.OK);
  } catch (error) {
    errorHandler.handleDeleteErrors(error, res);
  }
};