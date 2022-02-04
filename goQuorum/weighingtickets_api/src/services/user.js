const Service = module.exports;
const User = require('../models/User');

/**
 * Collects information necessary to connect to this user's node.
 * @param userID The user's database identifier.
 * @returns {Promise<{address: String, node: String}>}
 */
Service.getConnectionInfo = async userID => {
  const user = await User.findOne({ _id: userID }, { address: true, node: true, _id: false }).exec();
  return { address: user.address, node: user.node };
};

/**
 * Collects information necessary to receive the administrator's node address.
 * @returns {Promise<*>}
 */
Service.getAdminAddress = async () => {
  const user = await User.findOne({ role: 'admin' }, { address: true }).exec();
  return user.address;
};

/**
 * Collect the address and node for the network adminstrator.
 * @returns {Promise<{node: *, address: *}>}
 */
Service.getAdminConnectionInfo = async () => {
  const user = await User.findOne({ role: 'admin' }).exec();
  return { address: user.address, node: user.node };
};

/**
 * Collect the tessera public key of the administrator node.
 * @returns {Promise<boolean|{type: StringConstructor, required: boolean}|StringConstructor>}
 */
Service.getAdminTesseraPublicKey = async () => {
  const user = await User.findOne({ role: 'admin' }, { tesseraPublicKey: true }).exec();
  return user.tesseraPublicKey;
};

/**
 * Checks if a user is blocked from communicating with the APIs.
 * @param userID The user's database identifier.
 * @returns {Promise<boolean>} True if the user is blocked, False otherwise.
 */
Service.isUserBlocked = async userID => {
  const user = await User.findOne({ _id: userID }).exec();
  return !user.active;
};

/**
 * Checks if a user is deleted.
 * @param userID The user's database identifier.
 * @returns {Promise<boolean>} True if the user is deleted, False otherwise.
 */
Service.isUserDeleted = async userID => {
  const user = await User.findOne({ _id: userID }).exec();
  return user.deleted;
};

/**
 * Checks if the user hasn't changed the password since the last time he logged in or if it isn't his first password.
 * @param userID The user's database identifier.
 * @returns {Promise<boolean>} True if all is OK, False otherwise.
 */
Service.notChangedAndNotFirstPass = async userID => {
  const user = User.findOne({ _id: userID }).exec();
  return !(user.first_pass && user.password_changed);
};

/**
 * Collects and returns the customer associated with this user.
 * @param userEmail The user's email.
 * @returns {Promise<string>}
 */
Service.getCustomerIDByEmail = async userEmail => {
  const user = await User.findOne({ email: userEmail }, { customer: true }).exec();
  if (!user) return '';
  return user.customer;
};