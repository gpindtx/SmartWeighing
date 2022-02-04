const Service = module.exports;
const Station = require('../models/Station');
const mongoose = require('mongoose');
const stationErrors = require('../helpers/errors/errors').stations;

/**
 * Method that registers a new station associated with a given customer.
 * @param name The name of the station.
 * @param latitude The latitude of the station. Optional.
 * @param longitude The longitude of the station. Optional.
 * @param description The description of the station. Optional.
 * @param customerID The customer's database identifier.
 * @param address The address of its node in the blockchain network.
 * @param node Blockchain network's ndoe information for this station.
 * @param contractAddress The address of the deployed contract
 * @param publicKey The station's public key for auth purposes.
 * @param tesseraPublicKey The public key of the station's tessera node.
 * @returns {Promise<*>} The database identifier of the station.
 */
Service.registerStation = async (name, latitude = '', longitude = '', description = '', customerID, address, node, contractAddress, publicKey, tesseraPublicKey) => {
  let station = new Station({
    name: name,
    latitude: latitude,
    longitude: longitude,
    description: description,
    customer: customerID,
    address: address,
    node: node,
    contractAddress: contractAddress,
    tesseraPublicKey: tesseraPublicKey,
    publicKey: publicKey,
    active: true,
    deleted: false
  });
  station = await station.save();
  return station._id;
};

/**
 * Querys for the station by its ID.
 * @param stationID The identifier of the station.
 * @returns {Promise<any>} Returns the information of the station.
 */
Service.getStationByID = async stationID => {
  const station = await Station.findOne({ _id: stationID }).exec();
  if (!station) throw stationErrors.UnmatchedStationID(stationID);
  return station;
};

/**
 * Querys for stations associated with the customer.
 * @param customerID The identifier of the customer to search for.
 * @returns {Promise<any>} Returns all the stations associated with the customer.
 */
Service.getStationsByCustomer = async customerID => {
  return await Station.find({ customer: customerID }).exec();
};

/**
 * Updates parameters of the station.
 * @param stationID The identifier of the station to be updated.
 * @param updateAttributes An object containing key - value pairs to update in the Station model.
 * @returns {Promise<void>} Nothing.
 */
Service.updateStation = async (stationID, updateAttributes) => {
  const station = await Station.findById(stationID).exec();
  if (!station) throw stationErrors.UnmatchedStationID(stationID);
  for (const key of Object.keys(updateAttributes)) {
    station[key] = updateAttributes[key];
  }
  await station.save();
};

/**
 * Method that blocks the given station.
 * @param stationID The station's identifier.
 * @returns {Promise<void>}
 */
Service.blockStation = async stationID => {
  await Station.updateOne({ _id: stationID }, { active: false }).exec();
};

/**
 * Method that blocks all stations associated with a customer.
 * @param customerID The customer's identifier.
 * @returns {Promise<void>} Nothing.
 */
Service.blockStations = async customerID => {
  await Station.updateMany({ customer: customerID }, { active: false }).exec();
};

/**
 * Method that unblocks the given station.
 * @param stationID The station's identifier.
 * @returns {Promise<void>}
 */
Service.unblockStation = async stationID => {
  await Station.updateOne({ _id: stationID }, { active: true }).exec();
};

/**
 * Method that unblocks all stations associated with a customer.
 * @param customerID The customer's identifier.
 * @returns {Promise<void>} Nothing.
 */
Service.unblockStations = async customerID => {
  await Station.updateMany({ customer: customerID }, { active: true }).exec();
};

/**
 * Put a station in the deleted state.
 * @param stationID The station's identifier.
 * @returns {Promise<void>} Nothing.
 */
Service.deleteStation = async stationID => {
  const station = await Station.findById(stationID).exec();
  if (!station) throw stationErrors.UnmatchedStationID(stationID);
  station.deleted = true;
  await station.save();
};

/**
 * Method that deletes all stations associated with a customer.
 * @param customerID The customer identifier.
 * @returns {Promise<void>} Nothing.
 */
Service.deleteStations = async customerID => {
  await Station.updateMany({ customer: customerID }, { deleted: true }).exec();
};

/**
 * Checks if a given station belongs to a given customer.
 * @param stationID The station's identifier.
 * @param customerID The customer's identifier.
 * @returns {Promise<boolean>} True if the station exists, False otherwise.
 */
Service.existsStationInCustomer = async (stationID, customerID) => {
  const station = await Station.findOne({ _id: stationID, customer: customerID }).exec();
  if (station) return true;
  return false;
};

/**
 * Collects and returns a station's public key from the database given its ID.
 * @param stationID The station's identifier.
 * @returns {Promise<*>} Resolves to the station's public key or throws an UnmatchedStationID error.
 */
Service.getPublicKey = async stationID => {
  const station = await Station.findOne({ _id: stationID }, { publicKey: true }).exec();
  if (!station) throw stationErrors.UnmatchedStationID(stationID);
  return station.publicKey;
};