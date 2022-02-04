const Web3 = require('web3')
const compiledContract = require('./build/WeighingTickets.json')
const fs = require('fs-extra')
const { config } = require('./config')

const web3 = new Web3(new Web3.providers.HttpProvider(config.provider))

const deploy = async () => {
    const accounts = await web3.eth.getAccounts()
    const interface = compiledContract.abi
    const bytecode = compiledContract.evm.bytecode.object

    console.log("Deploying from account: ", accounts[0])

    const result = await new web3.eth.Contract(interface)
        .deploy({data: '0x' + bytecode})
        .send({from: accounts[0], gas: 1759218604})
    
    console.log("Contract deployed to: ", result.options.address)

    fs.writeFileSync(config.api_connection_dir + "address.txt", result.options.address)
    fs.outputJSONSync(config.api_connection_dir + "WeighingTickets.json", interface)
}

deploy()