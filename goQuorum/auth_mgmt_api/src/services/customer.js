const Service = module.exports;
const Customer = require('../models/Customer');
const customerErrors = require('../helpers/errors/errors').customers;

/**
 * Registers a new customer in the customers collection.
 * @param name The name of the customer/company. Mandatory.
 * @param location The location of the company. Optional.
 * @param description A description of the customer. Optional.
 * @param companyID A more suitable companyID, if needed. Optional. By default assumes the customer's name.
 * @param adminAddress The address of the administrator node of the customer.
 * @param adminNode The enode info of the administrator node of the customer.
 * @param adminTesseraPublicKey The public key of the tessera node of the customer.
 * @returns {Promise<*>} Returns the database identifier of the customer.
 */
Service.registerCustomer = async (
  name,
  location = '',
  description = '',
  companyID = '',
  adminAddress,
  adminNode,
  adminTesseraPublicKey
) => {
  if (companyID === '') companyID = name;
  let customer = new Customer({
    name: name,
    location: location,
    description: description,
    companyID: companyID,
    addresses: [],
    customerAdminAddress: adminAddress,
    customerAdminNode: adminNode,
    customerAdminTesseraPublicKey: adminTesseraPublicKey,
    active: true,
    deleted: false
  });
  customer = await customer.save();
  return customer._id;
};

/**
 * Querys a customer by its ID.
 * @param customerID The Customer's identifier.
 * @returns {Promise<any>} Returns the customer information.
 */
Service.getCustomerByID = async customerID => {
  const customer = await Customer.findById(customerID).exec();
  if (!customer) throw customerErrors.UnmatchedCustomerID(customerID);
  return customer;
};

/**
 * Querys a customer by its Name.
 * @param customerName The unique customer's name.
 * @returns {Promise<any>} Returns the customer information
 */
Service.getCustomerByName = async customerName => {
  const customer = await Customer.find({ name: customerName }).exec();
  if (!customer) throw customerErrors.UnmatchedCustomerName(customerName);
  return customer;
};

/**
 * Gets information of all the customers existent in the system.
 * @returns {Promise<any>} Returns the _id, name and companyID of all existent customers.
 */
Service.getCustomers = async () => {
  return await Customer.find({}, { _id: true, name: true, companyID: true }).exec();
};

/**
 * Checks for the existence of customer with customerID.
 * @param customerID The database identifier of the customer.
 * @returns {Promise<boolean>} True if the customer exists, False otherwise.
 */
Service.existsCustomer = async customerID => {
  const customer = await Customer.findOne({ _id: customerID }, { _id: true }).exec();
  if (customer) return true;
  return false;
};

/**
 * Updates the customer with the relevant information.
 * @param customerID The customer's identifier.
 * @param customerName The customer's name.
 * @param updateAttributes An object containing the attributes to be updated.
 * @returns {Promise<void>} Nothing.
 */
Service.updateCustomer = async (customerID = '', customerName = '', updateAttributes) => {
  const customer = extractCustomer(customerID, customerName);
  for (const key of Object.keys(updateAttributes)) {
    customer[key] = updateAttributes[key];
  }
  return await customer.save();
};

/**
 * Turns the customer into a blocked state.
 * @param customerID The identifier of the customer.
 * @returns {Promise<void>} Nothing.
 */
Service.blockCustomer = async customerID => {
  const customer = await Customer.findOne({ _id: customerID }).exec();
  if (!customer) throw customerErrors.UnmatchedCustomerID(customerID);
  customer.active = false;
  await customer.save();
};

/**
 * Method that unblocks the customer.
 * @param customerID The customer's identifier.
 * @returns {Promise<void>} Nothing.
 */
Service.unblockCustomer = async customerID => {
  const customer = await Customer.findOne({ _id: customerID }).exec();
  if (!customer) throw customerErrors.UnmatchedCustomerID(customerID);
  customer.active = true;
  await customer.save();
};

/**
 * Turns the customer into a deleted state.
 * @param customerID The Identifier of the customer.
 * @param customerName The name of the customer.
 * @returns {Promise<void>} Nothing.
 */
Service.deleteCustomer = async (customerID = '', customerName = '') => {
  // Assumes that its users and stations were already deleted.
  const customer = extractCustomer(customerID, customerName);
  customer.deleted = true;
  await customer.save();

};

/**
 * Collects the customer's admin tessera key.
 * @param customerID The customer's database identifier.
 * @returns {Promise<boolean|{type: StringConstructor, required: boolean}>}
 */
Service.getCustomerTesseraKey = async customerID => {
  const customer = await Customer.findOne({ _id: customerID }, { customerAdminTesseraPublicKey: true }).exec();
  return customer.customerAdminTesseraPublicKey;
};

/**
 * Extracts a customer from the database by either ID or name. Internal to this module.
 * @param customerID The identifier of the customer.
 * @param customerName The name of the customer.
 * @returns {Promise<*>} The customer information.
 */
extractCustomer = async (customerID = '', customerName = '') => {
  let customer;
  if (customerID && customerID !== '') {
    customer = await Customer.findOne({ _id: customerID }).exec();
    if (!customer) throw customerErrors.UnmatchedCustomerID(customerID);
  } else if (customerName && customerName !== '') {
    customer = await Customer.findOne({ name: customerName }).exec();
    if (!customer) throw customerErrors.UnmatchedCustomerName(customerName);
  } else {
    throw customerErrors.OneMustBeProvided();
  }

  return customer;
};