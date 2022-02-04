const fs = require('fs');
const path = require('path');
const ROOT_DIR = path.resolve(path.dirname(require.main.filename), '..', '..');

module.exports = {
  serverSettings: {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 8080,
//    serverPublicKey: process.env.SERVER_PUBLIC_KEY || fs.readFileSync(path.join(__dirname, '..', 'identity', 'identity.crt.pem')),
//     serverPrivateKey: process.env.SERVER_PRIVATE_KEY || fs.readFileSync(path.join(__dirname, '..', 'identity', 'identity.key.pem')),
//     serverPrivateKeyPassword: process.env.SERVER_PRIVATE_KEY_PASSWORD || '',
//     caCertificate: process.env.CA_CERTIFICATE || fs.readFileSync(path.join(__dirname, '..', 'identity', 'ca.crt.pem'))
  },

  jwtSettings: {
    algorithm: process.env.JWT_ALGORITHM || 'RS256',
    tokenTTL: process.env.TOKEN_TTL || '7200s', // 2 hours of validity for the access token
    refreshTokenTTL: process.env.REFRESH_TOKEN_TTL || '86400s', // 1 day of validity for the refresh token
    authPublicKey: process.env.AUTH_PUBLIC_KEY || fs.readFileSync(path.join(__dirname, '..', 'jwt', 'jwt.pub.key')),
    authPrivateKey: process.env.AUTH_PRIVATE_KEY || fs.readFileSync(path.join(__dirname, '..', 'jwt', 'jwt.key')),
    authPublicKeyRefresh: process.env.AUTH_PUBLIC_KEY_REFRESH || fs.readFileSync(path.join(__dirname, '..', 'jwt', 'jwtRefresh.pub.key')),
    authPrivateKeyRefresh: process.env.AUTH_PRIVATE_KEY_REFRESH || fs.readFileSync(path.join(__dirname, '..', 'jwt', 'jwtRefresh.key'))
  },

  appSettings: {
    appPSK: process.env.API_PSK || 'af3ec64876d242fb199df8dc50cec0673eebf164d9b38fb7443e30de0017eec0'
  },

  databaseSettings: {
    name: process.env.DB_NAME || 'sw_auth',
    host: process.env.DB_HOST || 'mongo',
    port: process.env.DB_PORT || 27017,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    authenticationSource: process.env.DB_AUTH_SOURCE || 'admin'
  },

  logging: {
    accessLogFilename: process.env.ACCESS_LOG_FILENAME || 'access.log',
    accessLogPath: process.env.ACCESS_LOG_PATH || path.join(ROOT_DIR, 'log'),
    accessLogFormat: process.env.ACCESS_LOG_FORMAT || 'combined',
    apiLogFilename: process.env.API_LOG_FILENAME || 'api-%DATE%.log',
    apiLogPath: process.env.API_LOG_PATH || path.join(ROOT_DIR, 'log')
  }
};