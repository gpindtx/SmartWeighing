const Service = module.exports;
const User = require('../models/User');
const bcrypt = require('bcrypt');
const fieldsValidator = require('../helpers/validators/fieldsValidator');
const userErrors = require('../helpers/errors/errors').users;

/**
 * Method that registers a new User in the database.
 * @param email The email of the user.
 * @param password The password of the user.
 * @param customerID The identifier of the customer this user is associated to. Only relevant if role === 'customer'
 * @param role The role of the user. Either 'admin' or 'customer'.
 * @param address The address of the user's node if it is an admin.
 * @param node The enode info of the user's node if it is an admin.
 * @param tesseraPublicKey The public key of the user's tessera node.
 * @returns {Promise<*>}
 */
Service.registerUser = async (
  email,
  password,
  customerID,
  role = 'customer',
  address = '',
  node = '',
  tesseraPublicKey = ''
) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  if (fieldsValidator.isEmailValid(email)) {
    let user = new User({
      email: email,
      password: hashedPassword,
      role: role
    });

    if (role === 'customer') user.customer = customerID;
    if (role === 'admin') {
      if (address === '' || node === '' || tesseraPublicKey === '') {
        const userModel = await User.findOne({ role: 'admin' }, {
          address: true,
          node: true,
          tesseraPublicKey: true
        }).exec();
        if (!userModel) throw userErrors.NodeAndAddressRequired();
        address = userModel.address;
        node = userModel.node;
        tesseraPublicKey = userModel.tesseraPublicKey;
      }
      user.address = address;
      user.node = node;
      user.tesseraPublicKey = tesseraPublicKey;
    }
    user = await user.save();
    return user._id;
  }

  throw userErrors.InvalidEmail(email);

};

/**
 * Retrieves all users of the customer.
 * @param customerID The identifier of the customer.
 * @returns {Promise<any>} An array of users.
 */
Service.getUsers = async (customerID) => {
  if (customerID === '')
    return await User.find({ role: 'admin' }, { password: false }).exec();
  return await User.find({ customer: customerID }, { password: false }).exec();
};

/**
 * Method that allows the query of a user by email.
 * @param email The email of the user to look for.
 * @returns {Promise<any>} The user that is associated with the given email.
 */
Service.getUserByEmail = async email => {
  const user = await User.findOne({ email: email }, { password: false }).exec();
  if (!user) throw userErrors.UnmatchedEmail(email);
  return user;
};

/**
 * Method that allows the query of a user by its database identifier.
 * @param userID The database identifier of the user to look for.
 * @returns {Promise<any>} The user that is associated with the given email.
 */
Service.getUserByID = async userID => {
  if (fieldsValidator.isEmailValid(userID)) throw userErrors.UnmatchedUserID(userID);
  const user = await User.findOne({ _id: userID }, { password: false }).exec();
  if (!user) throw userErrors.UnmatchedUserID(userID);
  return user;
};

/**
 * Method that allows the alteration of a user's password.
 * @param userID The identifier of the user.
 * @param newPassword The new password of the user.
 * @returns {Promise<void>}
 */
Service.updatePassword = async (userID, newPassword, oldPassword) => {
  let user;
  if (fieldsValidator.isEmailValid(userID))
    user = await User.findOne({ email: userID }).exec();
  else
    user = await User.findOne({ _id: userID }).exec();
  const compare = await bcrypt.compare(oldPassword, user.password);
  if (compare) {
    const newPasswordHashed = await bcrypt.hash(newPassword, 10);
    user.password = newPasswordHashed;
    user.first_pass = false;
    user.password_changed = true;
    return await user.save();
  }

  throw userErrors.UnmatchedPassword();

};

/**
 * Alters the password_changed state to false.
 * @param userID The user's database identifier.
 * @returns {Promise<void>}
 */
Service.alterPasswordChanged = async (userID) => {
  const user = await User.findOne({ _id: userID }).exec();
  if (!user) throw userErrors.UnmatchedUserID(userID);
  user.password_changed = false;
  await user.save();
};

/**
 * Method that blocks a given user.
 * @param userID The user identifier
 * @returns {Promise<void>}
 */
Service.blockUser = async userID => {
  if (fieldsValidator.isEmailValid(userID))
    return await User.updateOne({ email: userID }, { active: false }).exec();

  return await User.updateOne({ _id: userID }, { active: false });
};

/**
 * Method that blocks all users associated with a customer.
 * @param customerID The customer identifier.
 * @returns {Promise<void>} Nothing.
 */
Service.blockUsers = async customerID => {
  await User.updateMany({ customer: customerID }, { active: false }).exec();
};

/**
 * Method that unblocks a given user.
 * @param userID The user's identifier.
 * @returns {Promise<void>}
 */
Service.unblockUser = async userID => {
  if (fieldsValidator.isEmailValid(userID))
    return await User.updateOne({ email: userID }, { active: false }).exec();

  return await User.updateOne({ _id: userID }, { active: false }).exec();
};

/**
 * Method that unblocks all users associated with a customer.
 * @param customerID The customer's identifier Nothing..
 * @returns {Promise<void>}
 */
Service.unblockUsers = async customerID => {
  await User.updateMany({ customer: customerID }, { active: true }).exec();
};

/**
 * Method that allows the transition of a user into a 'deleted' state.
 * @param userID The ID of the user that should transition to a 'deleted' state.
 * @returns {Promise<void>} Nothing.
 */

Service.deleteUser = async userID => {
  const user = await User.findOne({ _id: userID }).exec();
  if (!user) throw userErrors.UnmatchedUserID(userID);
  user.deleted = true;
  await user.save();
};

/**
 * Method that checks if the user represented by identifier and the one represented by userID are the same user.
 * @param identifier The user's database ID or email.
 * @param userID The user's to compare databaseID
 * @returns {Promise<boolean>} True if they are the same user, False otherwise.
 */
Service.sameUser = async (identifier, userID) => {
  if (fieldsValidator.isEmailValid(identifier)) {
    const user = await User.findOne({ email: identifier }, { password: false }).exec();
    if (!user) throw userErrors.UnmatchedEmail(identifier);
    return user._id.toString() === userID;
  }

  return identifier === userID;
};

/**
 * Method that marks the users of a customer as deleted.
 * @param customerID The customer's identifier.
 * @returns {Promise<void>} Nothing.
 */
Service.deleteUsers = async customerID => {
  await User.updateMany({ customer: customerID }, { deleted: true }).exec();
};

/**
 * Method that permits the comparison of a password with another already stored.
 * @param email The email of the user that wishes to compare a password.
 * @param password The password to compare with the stored password.
 * @returns {Promise<boolean>} True if the passwords match, False otherwise.
 */
Service.comparePassword = async (email, password) => {
  const user = await User.findOne({ email: email }).exec();
  if (!user) throw userErrors.UnmatchedEmail(email);
  const compare = await bcrypt.compare(password, user.password);
  if (compare) return true;
  return false;
};

/**
 * Checks if a given user belongs to a given client.
 * @param userID The user's identifier or email.
 * @param customerID The customer's identifier.
 * @returns {Promise<boolean>}
 */
Service.existsUserInCustomer = async (userID, customerID) => {
  let user;
  if (fieldsValidator.isEmailValid(userID))
    user = await User.findOne({ email: userID, customer: customerID }).exec();
  else user = await User.findOne({ _id: userID, customer: customerID }).exec();
  if (user) return true;
  return false;
};

/**
 * Checks if the user with identifier (may be ID or email) is the same as the user with userID
 * @param identifier A user identifier or email.
 * @param userID The user's identifier to compare.
 * @returns {Promise<boolean>} True if they are the same user, False otherwise.
 */
Service.sameUser = async (identifier, userID) => {
  if (fieldsValidator.isEmailValid(identifier)) {
    const user = await User.findOne({ email: identifier }, { password: false }).exec();
    return user._id.toString() === userID;
  }

  return identifier === userID;
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
 * Collect the address and node for the network adminstrator.
 * @returns {Promise<{node: *, address: *}>}
 */
Service.getAdminConnectionInfo = async () => {
  const user = await User.findOne({ role: 'admin' }).exec();
  return { address: user.address, node: user.node };
};
