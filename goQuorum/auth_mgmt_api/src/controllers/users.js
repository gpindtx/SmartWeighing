const Controller = module.exports;
const status = require('http-status');
const userService = require('../services/user');
const errorHandler = require('../helpers/errors/handler').users;
const errorDefinitions = require('../helpers/errors/definitions');
const Encoder = require('../helpers/databaseEncoder');

/**
 * @apiDefine customer Only an user associates with the same customer can call this route.
 * @apiDefine adminOrCustomer An Administrator or a Customer can call this route.
 */

/**
 * @api {post} /users Register a new user in the database.
 * @apiPermission adminOrCustomer
 * @apiName RegisterUSer
 * @apiGroup Users
 *
 * @apiParam {String} email The email of the user. [BODY PARAM]
 * @apiParam {String} password the password of the user. [BODY PARAM]
 * @apiParam {String} address The address of the user (Only valid if it is an admin).
 * @apiParam {String} node The enode info of the user's node (Only valid if it is an admin).
 *
 * @apiSuccess {Object} userID Returns the userID.
 */
Controller.registerUser = async (req, res) => {
  const { email, password } = req.value.body;
  const { customerID, role } = req.value.token;

  try {
    let userID;
    if (role === 'admin') {
      let { loginEmail, loginPassword, address, node, tesseraPublicKey } = req.value.body;
      if (!loginEmail || !loginPassword) return res.status(status.BAD_REQUEST).json({
        message: 'To register an Admin you have to provide authentication details'
      });
      const compare = await userService.comparePassword(loginEmail, loginPassword);
      if (compare) {
        address = await Encoder.encrypt(address);
        node = await Encoder.encrypt(node);
        tesseraPublicKey = await Encoder.encrypt(tesseraPublicKey);
        userID = await userService.registerUser(email, password, '', 'admin', address, node, tesseraPublicKey);
      } else return res.status(status.UNAUTHORIZED).json({
        message: 'Login password did not match login email.'
      });
    } else {
      userID = await userService.registerUser(email, password, customerID, 'customer');
    }

    return res.status(status.OK).json({
      userID: userID
    });
  } catch (error) {
    errorHandler.handleRegistrationErrors(error, res);
  }

};

/**
 * @api {get} /users Gets all users of logged customer.
 * @apiPermission adminOrCustomer
 * @apiName GetUsers
 * @apiGroup Users
 *
 * @apiSuccess {Array} users The array of users that belong to the requested customer.
 */
Controller.getUsers = async (req, res) => {
  const { customerID } = req.value.token;
  if (customerID !== '') {
    try {
      const users = await userService.getUsers(customerID);
      return res.status(status.OK).json(users);
    } catch (error) {
      errorHandler.handleQueryAllErrors(error, res);
    }
  }

  try {
    const users = await userService.getUsers('');
    return res.status(status.OK).json(users);
  } catch (error) {
    errorHandler.handleQueryAllErrors(error, res);
  }
};

/**
 * @api {get} users/:user_id Gets a user by its ID or by its email.
 * @apiDefine adminOrCustomer
 * @apiName GetUser
 * @apiGroup Users
 *
 * @apiParam {String} user_id The identifier or the email of the user to look for. [URL PARAM]
 *
 * @apiSuccess {User} Returns the user info.
 */
Controller.getUser = async (req, res) => {
  const userID = req.value.params.user_id;
  try {
    const user = await userService.getUserByID(userID);
    return res.status(status.OK).json(user);
  } catch (error) {
    if (error.name && error.name === errorDefinitions.unmatchedUserID) {
      try {
        const user = await userService.getUserByEmail(userID);
        return res.status(status.OK).json(user);
      } catch (error) {
        errorHandler.handleQueryErrors(error, res);
      }
    }

    errorHandler.handleQueryErrors(error, res);
  }
};

/**
 * @api {put} /users/:user_id Updates a user given its database identifier.
 * @apiPermission adminOrCustomer
 * @apiName UpdateUser
 * @apiGroup Users
 *
 * @apiParam {String} user_id The user's identifier. [URL PARAM]
 * @apiParam {String} newPassword The user's new password, optional. [BODY PARAM].
 * @apiParam {Boolean} block True to block user, False to unblock user. [BODY PARAM].
 */
Controller.updateUser = async (req, res) => {
  const { newPassword, oldPassword, block } = req.value.body;
  const userIDParam = req.value.params.user_id;
  const { userID, customerID, role } = req.value.token;
  try {
    const exists = await userService.existsUserInCustomer(userIDParam, customerID);
    const sameUser = await userService.sameUser(userIDParam, userID);
    if ((block === true || block === false) && (role !== 'admin' && !exists))
      return res.status(status.UNAUTHORIZED).json({
        message: 'The user specified in the URL cannot be manipulated by the logged user.'
      });

    if (newPassword && !sameUser)
      return res.status(status.UNAUTHORIZED).json({
        message: 'Only the user itself has the authority to change its password.'
      });

    if (block === true) {
      await userService.blockUser(userIDParam);
    } else if (block === false) {
      await userService.unblockUser(userIDParam);
    }

    if (newPassword) {
      await userService.updatePassword(userID, newPassword, oldPassword);
    }
    return res.sendStatus(status.OK);
  } catch (error) {
    errorHandler.handleUpdateErrors(error, res);
  }

};

/**
 * @api {delete} /users/:user_id Marks the user with user_id as deleted.
 * @apiPermission adminOrCustomer
 * @apiName DeleteUser
 * @apiGroup Users
 *
 * @apiParam {String} user_id The user's identifier. [URL PARAM].
 */
Controller.deleteUser = async (req, res) => {
  const userID = req.value.params.user_id;
  const { customerID, role } = req.value.token;

  try {
    const exists = await userService.existsUserInCustomer(userID, customerID);
    if (exists || role === 'admin') {
      await userService.deleteUser(userID);
      return res.sendStatus(status.OK);
    }

    return res.status(status.UNAUTHORIZED).json({
      message: 'Only an Admin or the Customer associated with this user can call this route.'
    });
  } catch (error) {
    errorHandler.handleDeleteErrors(error, res);
  }
};