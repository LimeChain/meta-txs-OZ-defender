/* eslint-disable no-unused-vars */
import { ethers } from 'ethers';
require('dotenv').config();

const MAIN_ENDPOINT = "https://rpc-mumbai.maticvigil.com";
const CHAIN_ID = 80001;

export function createProvider() {
  return new ethers.providers.JsonRpcProvider(MAIN_ENDPOINT, CHAIN_ID);
}