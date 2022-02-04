const Service = module.exports;
const Station = require('../models/Station');

/**
 * Collects the required connection information for a given station.
 * @param stationID The station's database identifier
 * @returns {Promise<{address: String, node: String}>}
 */
Service.getConnectionInfo = async stationID => {
  const station = await Station.findOne({ _id: stationID }).exec();
  return { address: station.address, node: station.node };
};

/**
 * Collects the contract address for this station
 * @param stationID The station's database identifier.
 * @returns {Promise<String>} The station's contract address.
 */
Service.getContractAddress = async stationID => {
  const station = await Station.findOne({ _id: stationID }, { contractAddress: true }).exec();
  return station.contractAddress;
};

/**
 * Collects the tessera public key for this station's node.
 * @param stationID The station's database identifier
 * @returns {Promise<String>} The station's node's tessera public key.
 */
Service.getTesseraPublicKey = async stationID => {
  const station = await Station.findOne({ _id: stationID }, { tesseraPublicKey: true }).exec();
  return station.tesseraPublicKey;
};

/**
 * Collects all the station IDs and contractAddresses that are associated with the given customer.
 * @param customerID The customer's database identifier.
 * @returns {Promise<*>} An array of objects, where each object has the station ID and its contractAddress.
 */
Service.getCustomerStations = async customerID => {
  let stations;
  if (customerID === '') {
    stations = await Station.find({}, { _id: true, contractAddress: true }).exec();
  } else {
    stations = await Station.find({ customer: customerID }, { _id: true, contractAddress: true }).exec();
  }
  return stations;
};

/**
 * Collects the contract addresses of all given station IDS.
 * @param stationIDS The database identifiers of the stations.
 * @returns {Promise<[]>} Returns the array og objects with the station identifier and its contract address each.
 */
Service.getContractAddresses = async stationIDS => {
  const result = [];
  for (let stationID of stationIDS)
    result.push({
      '_id': stationID,
      'contractAddress': await Service.getContractAddress(stationID)
    });
  return result;
};

/**
 * Checks if a station is blocked from communicating with the APIs.
 * @param stationID The station's database identifier.
 * @returns {Promise<boolean>} True if the station is blocked, False otherwise.
 */
Service.isStationBlocked = async stationID => {
  const station = await Station.findOne({ _id: stationID }).exec();
  return !station.active;
};

/**
 * Checks if a station is deleted.
 * @param stationID The station's database identifier.
 * @returns {Promise<boolean>} True if the station is deleted, False otherwise.
 */
Service.isStationDeleted = async stationID => {
  const station = await Station.findOne({ _id: stationID }).exec();
  return station.deleted;
};