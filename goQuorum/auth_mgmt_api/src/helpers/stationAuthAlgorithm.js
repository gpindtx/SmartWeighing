const StationAuthentication = module.exports;
const { jwtSettings } = require('../config/app/appConfig');
const { exec } = require('child_process');
const stationService = require('../services/station');
const { loggers } = require('winston');
const logger = loggers.get('apiLogger');
const path = require('path');
const path_to_crypto = path.resolve(__dirname, '__crypto');
const Encoder = require('../helpers/databaseEncoder');

promisifyCommand = command => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) return reject(error);
      if (stderr) return reject(stderr);
      return resolve(stdout);
    });
  });
};

StationAuthentication.authenticate = async (identifier, message, signature) => {
  // TODO: Use certificates instead of only public keys.
  try {
    let decryptedIdentifier = await promisifyCommand(
      `cd ${path_to_crypto} && python3 crypto.py decrypt "${identifier}" "${jwtSettings.authPrivateKey}"`
    );
    decryptedIdentifier = decryptedIdentifier.replace(/^\s+|\s+$/g, '');
    let stationPublicKey = await stationService.getPublicKey(decryptedIdentifier);
    stationPublicKey = await Encoder.decrypt(stationPublicKey);
    let valid = await promisifyCommand(
      `cd ${path_to_crypto} && python3 crypto.py verify "${message}" "${signature}" "${stationPublicKey}"`
    );
    valid = valid.trim() === 'true';
    return { valid: valid, decryptedIdentifier: decryptedIdentifier };
  } catch (error) {
    logger.error(error);
  }

};