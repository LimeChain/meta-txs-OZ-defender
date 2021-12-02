const { ethers } = require('hardhat');
const { signMetaTxRequest } = require('../src/signer');
const { readFileSync, writeFileSync } = require('fs');

const DEFAULT_QTY = 1;

function getInstance(name) {
  const address = JSON.parse(readFileSync('deploy.json'))[name];
  if (!address) throw new Error(`Contract ${name} not found in deploy.json`);
  return ethers.getContractFactory(name).then(f => f.attach(address));
}

async function main() {
  const forwarder = await getInstance('MinimalForwarder');
  const erc721Meta = await getInstance("ERC721Meta");
  const erc20Mock = await getInstance('ERC20Mock');

  const { QTY: qty, PRIVATE_KEY: signer } = process.env;
  const from = new ethers.Wallet(signer).address;

  console.log(`Signing approve of ${qty || DEFAULT_qty} as ${from}...`);
  const dataApprove = erc20Mock.interface.encodeFunctionData('approve', [erc721Meta.address, qty || DEFAULT_QTY]);
  const resultApprove = await signMetaTxRequest(signer, forwarder, {
    to: erc721Meta.address, from, data: dataApprove
  });

  writeFileSync('tmp/requestApprove.json', JSON.stringify(resultApprove, null, 2));
  console.log(`Signature: `, resultApprove.signature);
  console.log(`Request: `, resultApprove.request);

  console.log(`Signing buy of ${qty || DEFAULT_qty} as ${from}...`);
  const dataBuy = erc721Meta.interface.encodeFunctionData('buy', [qty || DEFAULT_QTY]);
  const resultBuy = await signMetaTxRequest(signer, forwarder, {
    to: erc721Meta.address, from, data: dataBuy
  });

  writeFileSync('tmp/requestBuy.json', JSON.stringify(resultBuy, null, 2));
  console.log(`Signature: `, resultBuy.signature);
  console.log(`Request: `, resultBuy.request);
}

if (require.main === module) {
  main().then(() => process.exit(0))
    .catch(error => { console.error(error); process.exit(1); });
}