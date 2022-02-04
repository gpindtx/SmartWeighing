const path = require('path');
const fs = require('fs');
const Web3 = require('web3');
const quorum = require('quorum-js');
const winston = require('winston');
const logger = winston.loggers.get('apiLogger');
const SOURCE_DIR = path.resolve(path.dirname(require.main.filename), '..');
const { contract } = require('../config/app/appConfig');
const Connection = module.exports;

Connection.connect = async node => {
  const abiPath = path.resolve(SOURCE_DIR, contract['abiPath'],
    contract['abiFilename']);

  let abi;
  try {
    abi = fs.readFileSync(abiPath);
    abi = JSON.parse(abi.toString());
  } catch (error) {
    console.log(
      'The ABI of the contract was not found. Please build the contract prior starting the server');
    logger.info(
      'The ABI of the contract was not found. Please build the contract prior starting the server');

  }

  let web3;
  try {
    web3 = new Web3(new Web3.providers.HttpProvider(
      node // NOTE: node has to the http url to the client's node.
    ));
    quorum.extend(web3);
  } catch (error) {
    console.log('An error occurred. ' + error);
    logger.error(`An error occurred on setting provider: ${error}`);
  }

  return {
    provider: web3,
    abi: abi
  };
};

