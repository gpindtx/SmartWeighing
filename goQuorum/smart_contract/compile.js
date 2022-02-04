const path = require('path')
const fs = require('fs-extra')
const solc = require('solc')

const buildFolderPath = path.resolve(__dirname, 'build');
const abiFolderPath = path.resolve(__dirname, 'build', 'abi');
if(fs.existsSync(buildFolderPath)) {
    fs.removeSync(buildFolderPath)
}

if(fs.existsSync(abiFolderPath)) {
    fs.removeSync(abiFolderPath)
}

const contractPath = path.resolve(__dirname, 'contracts', 'v3', 'WeighingTickets.sol');
const sourceCode = fs.readFileSync(contractPath, 'utf8');

const compileConfigurations = {
    language: 'Solidity',
    sources: {
        'WeighingTickets.sol': {
            content: sourceCode
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': [ '*' ]
            }
        }
    }
}

const output = JSON.parse(solc.compile(JSON.stringify(compileConfigurations)))
let enter = true

if(output.errors) {
    output.errors.forEach(error => {
        console.log(error.formattedMessage)
        if(error.severity != 'warning') enter = false;
    })
}

if(enter) {
    fs.ensureDirSync(buildFolderPath)
    fs.ensureDirSync(abiFolderPath)
    const contracts = output.contracts["WeighingTickets.sol"]
    for(let contractName in contracts) {
        fs.outputJSONSync(
            path.resolve(buildFolderPath, contractName + '.json'),
            contracts[contractName]
        )
        fs.outputJSONSync(
            path.resolve(abiFolderPath, contractName + '.json'),
            contracts[contractName].abi
        )
    }
}