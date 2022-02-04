const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const ROOT_DIR = path.resolve(path.dirname(require.main.filename), '..', '..');

module.exports = {
  serverSettings: {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 8080,
    // serverPublicKey: process.env.IDENTITY_PUBLIC_KEY || fs.readFileSync(path.join(__dirname, '..', 'identity', 'identity.crt.pem')),
    // serverPrivateKey: process.env.IDENTITY_PRIVATE_KEY || fs.readFileSync(path.join(__dirname, '..', 'identity', 'identity.key.pem')),
    // caCertificate: process.env.CA_CERTIFICATE || fs.readFileSync(path.join(__dirname, '..', 'identity', 'ca.crt.pem'))
  },

  jwtSettings: {
    algorithm: process.env.JWT_ALGORITHM || 'RS256',
    tokenTTL: process.env.TOKEN_TTL || '7200s', // access token has by default 2 hours of validity
    refreshTokenTTL: process.env.REFRESH_TOKEN_TTL || '86400s', // refresh token has by default 1 day of validity.
    authPublicKey: process.env.AUTH_PUBLIC_KEY ||
      fs.readFileSync(path.join(__dirname, '..', 'jwt', 'jwt.pub.key')) // Auth server's public key for access token verification
  },

  databaseSettings: {
    name: process.env.DB_NAME || 'sw_auth',
    host: process.env.DB_HOST || 'mongo',
    port: process.env.DB_PORT || 27017,
    username: process.env.DB_USER || 'reader',
    password: process.env.DB_PASS || 'reader_pass',
    authenticationSource: process.env.DB_AUTH_SOURCE || 'sw_auth'
  },

  appSettings: {
    conversionFactor: process.env.CONVERSION_FACTOR || 100,
    validGroupKeys: process.env.VALID_GROUP_KEYS || [
      'terminalSerialNumber',
      'scaleSerialNumber',
      'scaleStatus',
      'timestamp',
      'terminalRestartValue'],
    validDateFormats: process.env.VALID_DATE_FORMATS || [
      'simple_date',
      'simple_date_hour',
      'full_date',
      'timestamp'
    ],
    appPSK: process.env.API_PSK || 'af3ec64876d242fb199df8dc50cec0673eebf164d9b38fb7443e30de0017eec0'
  },

  logging: {
    accessLogFilename: process.env.ACCESS_LOG_FILENAME || 'access.log',
    accessLogPath: process.env.ACCESS_LOG_PATH || path.join(ROOT_DIR, 'log'),
    accessLogFormat: process.env.ACCESS_LOG_FORMAT || 'combined',
    apiLogFilename: process.env.API_LOG_FILENAME || 'api-%DATE%.log',
    apiLogPath: process.env.API_LOG_PATH || path.join(ROOT_DIR, 'log')
  },

  network: {
    id: process.env.NETWORK_ID || 10,
    name: process.env.NETWORK_NAME || 'test_development'
  },

  contract: {
    name: 'WeighingTickets',
    abiPath: 'connection',
    abiFilename: 'WeighingTickets.json'
  }

};

