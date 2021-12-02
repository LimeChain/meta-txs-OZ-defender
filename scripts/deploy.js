const hre = require('hardhat');
const { ethers } = require('hardhat');
const { writeFileSync } = require('fs');

async function deploy(name, ...params) {
  const Contract = await ethers.getContractFactory(name);
  return await Contract.deploy(...params).then(f => f.deployed());
}

const tokensAmount = 1000;

async function main() {
  const forwarder = await deploy('MinimalForwarder');
  await forwarder.deployed();

  const erc20Mock = await deploy("ERC20Mock", forwarder.address, tokensAmount);
  await erc20Mock.deployed();

  const erc20PermitToken = await deploy("ERC20PermitToken", 'ERC20 Permit', 'EPT', '0x0acd619eD093720d6a70A70f53414A2A05AC8DdE');
  await erc20PermitToken.deployed();

  const erc721Meta = await deploy("ERC721Meta", forwarder.address, erc20Mock.address);
  await erc721Meta.deployed();

  writeFileSync('deploy.json', JSON.stringify({
    MinimalForwarder: forwarder.address,
    ERC20Mock: erc20Mock.address,
    ERC20PermitToken: erc20PermitToken.address,
    ERC721Meta: erc721Meta.address,
  }, null, 2));

  console.log(`
    MinimalForwarder: ${forwarder.address}\n
    ERC721Meta: ${erc721Meta.address}\n
    ERC20: ${erc20Mock.address}\n
    ERC20PermitToken: ${erc20PermitToken.address}
  `);
}

if (require.main === module) {
  main().then(() => process.exit(0))
    .catch(error => { console.error(error); process.exit(1); });
}