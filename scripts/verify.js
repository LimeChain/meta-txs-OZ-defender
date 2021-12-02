
const hre = require('hardhat');
const fs = require('fs');
require('dotenv').config();

const tokensAmount = 1000;

async function main() {
    const contracts = JSON.parse(
        fs.readFileSync(`./deploy.json`, 'utf-8')
    );

    await hre.run('verify:verify', {
        address: contracts.MinimalForwarder,
        constructorArguments: [],
    });

    await hre.run('verify:verify', {
        address: contracts.ERC20Mock,
        constructorArguments: [
            contracts.MinimalForwarder,
            tokensAmount
        ],
    });

    await hre.run('verify:verify', {
        address: contracts.ERC20PermitToken,
        constructorArguments: [
            'ERC20 Permit',
            'EPT',
            '0x0acd619eD093720d6a70A70f53414A2A05AC8DdE'
        ],
    });

    await hre.run('verify:verify', {
        address: contracts.ERC721Meta,
        constructorArguments: [
            contracts.MinimalForwarder,
            contracts.ERC20Mock
        ],
    });

}

if (require.main === module) {
    main().then(() => process.exit(0))
        .catch(error => { console.error(error); process.exit(1); });
}