const Service = module.exports;
const Customer = require('../models/Customer');

/**
 * Collects connection information for this customer's administrator
 * @param customerID The customer's database identifier.
 * @returns {Promise<{address: String, node: String}>}
 */
Service.getConnectionInfo = async customerID => {
  const customer = await Customer.findOne({ _id: customerID }).exec();
  return { address: customer.customerAdminAddress, node: customer.customerAdminNode };
};

/**
 * Collects the Tessera public key of this customer's node.
 * @param customerID The database identifier of the customer.
 * @returns {Promise<String>} Returns the customer's tessera public key.
 */
Service.getTesseraPublicKey = async customerID => {
  const customer = await Customer.findOne({ _id: customerID }, { customerAdminTesseraPublicKey: true }).exec();
  return customer['customerAdminTesseraPublicKey'];
};