const crypto = require('crypto');
const { appSettings } = require('../config/app/appConfig');

const ALGORITHM = 'aes-256-gcm';
const INPUT_ENCODING = 'utf8';
const OUTPUT_ENCODING = 'hex';

const Encoder = module.exports;

/**
 * Method that decrypts a ciphertext using AES-256-GCM.
 * @param ciphertext The base64-encoded ciphertext to decrypt.
 * @returns {Promise<*>} Resolves to the original plaintext or rejects with an error.
 */
Encoder.decrypt = async ciphertext => {
  const components = ciphertext.split(':');
  const iv_from_ciphertext = Buffer.from(components.shift(), OUTPUT_ENCODING);
  const authTag = Buffer.from(components.shift(), OUTPUT_ENCODING);
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(appSettings.appPSK, 'hex'), iv_from_ciphertext);
  decipher.setAuthTag(authTag);
  let deciphered = decipher.update(components.join(':'), OUTPUT_ENCODING, INPUT_ENCODING);
  deciphered += decipher.final(INPUT_ENCODING);
  return deciphered;
};