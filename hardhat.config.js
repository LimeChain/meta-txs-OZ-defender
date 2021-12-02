require('dotenv').config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

module.exports = {
  solidity: "0.8.0",
  etherscan: {
    apiKey: process.env.API_KEY
  },
  networks: {
    local: {
      url: 'http://localhost:8545'
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      chainId: 80001,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      gas: 'auto',
      gasPrice: 'auto',
      gasMultiplier: 1.5,
    }
  }
};
