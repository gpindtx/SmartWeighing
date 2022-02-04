const Web3 = require('web3');
const compiledContract = require('../config/smartContract/WeighingTickets.json');
const Deployer = module.exports;

Deployer.deployContract = async (address, node, privateForNodes) => {
  const web3 = new Web3(new Web3.providers.HttpProvider(node));
  const contractInterface = compiledContract.abi;
  const bytecode = compiledContract.evm.bytecode.object;
  
  const result = await new web3.eth.Contract(contractInterface).deploy({ data: '0x' + bytecode })
    .send({ from: address, gas: 1759218604, privateFor: privateForNodes });
  return { contractAddress: result.options.address };
};