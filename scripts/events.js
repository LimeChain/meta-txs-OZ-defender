const { ethers } = require('hardhat');
const { readFileSync } = require('fs');

function getInstance(name) {
  const address = JSON.parse(readFileSync('deploy.json'))[name];
  if (!address) throw new Error(`Contract ${name} not found in deploy.json`);
  return ethers.getContractFactory(name).then(f => f.attach(address));
}

async function main() {
  const erc721Meta = await getInstance("ERC721Meta");
  const events = await erc721Meta.queryFilter(erc721Meta.filters.LogPurchased());
  console.log(events.map(e => `[${e.blockNumber}] ${e.args.who} => ${e.args.name}`).join('\n'));
}

if (require.main === module) {
  main().then(() => process.exit(0))
    .catch(error => { console.error(error); process.exit(1); });
}