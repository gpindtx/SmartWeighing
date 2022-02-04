const mongoose = require('mongoose');
const { databaseSettings } = require('../config/app/appConfig');
const Helper = module.exports;

/**
 * Connect to the MongoDB database.
 * @param onConnected Function to execute if connection is successful.
 * @param onError Function to execute if connection is unsuccessful.
 */
Helper.connect = (onConnected, onError) => {
  let databaseURL = `mongodb://${databaseSettings.host}:${databaseSettings.port}/${databaseSettings.name}`;

  if (databaseSettings.username && databaseSettings.password)
    databaseURL = `mongodb://${databaseSettings.username}:${databaseSettings.password}@${databaseSettings.host}:${databaseSettings.port}/${databaseSettings.name}`;

  mongoose.connect(databaseURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    authSource: databaseSettings.authenticationSource
  })
    .then(() => {
      onConnected();
    })
    .catch(error => onError(error));
  mongoose.set('useFindAndModify', false);
};