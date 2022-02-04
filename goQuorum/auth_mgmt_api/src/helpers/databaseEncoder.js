const crypto = require('crypto');
const { appSettings } = require('../config/app/appConfig');

const ALGORITHM = 'aes-256-gcm';
const INPUT_ENCODING = 'utf8';
const OUTPUT_ENCODING = 'hex';
const IV_LENGTH = 16;

const Encoder = module.exports;

/**
 * Method that encrypts using AES-256-GCM the given text.
 * @param text The text to encrypt
 * @returns {Promise<string>} Resolves to the hex-encoded ciphertext or rejects with an error.
 */
Encoder.encrypt = async text => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(appSettings.appPSK, 'hex'), iv);
  let ciphered = cipher.update(text, INPUT_ENCODING, OUTPUT_ENCODING);
  ciphered += cipher.final(OUTPUT_ENCODING);
  return iv.toString(OUTPUT_ENCODING) + ':' + cipher.getAuthTag().toString(OUTPUT_ENCODING) + ':' + ciphered;
};

/**
 * Method that decrypts a ciphertext using AES-256-GCM.
 * @param ciphertext The hex-encoded ciphertext to decrypt.
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