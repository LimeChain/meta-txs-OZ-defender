import { ethers } from 'ethers';
import { createInstance } from './forwarder';
import { signMetaTxRequest } from './signer';
import { signWithPermit } from "./signerPermit";

async function validateTx(qty) {
  if (!qty) throw new Error(`Quantity cannot be zero`);
  if (!window.ethereum) throw new Error(`User wallet not found`);

  await window.ethereum.enable();
  const userProvider = new ethers.providers.Web3Provider(window.ethereum);
  const userNetwork = await userProvider.getNetwork();
  if (userNetwork.chainId !== 80001) throw new Error(`Please switch to Mumbai for signing`);

  return {
    signer: userProvider.getSigner(),
    userNetwork
  };
}

async function sendMetaTx(action, erc721Meta, erc20Mock, provider, signer, qty, deadline = '', v = '', r = '', s = '') {
  console.log(`Sending approve meta-tx to set qty=${qty}`);
  const url = process.env.REACT_APP_WEBHOOK_URL;
  if (!url) throw new Error(`Missing relayer url`);

  const forwarder = createInstance(provider);
  const from = await signer.getAddress();

  let data, to;

  const ACTIONS = {
    approve: () => {
      data = erc20Mock.interface.encodeFunctionData('approve', [erc721Meta.address, ethers.utils.parseEther(qty)]);
      to = erc20Mock.address;
    },
    buy: () => {
      data = erc721Meta.interface.encodeFunctionData('buy', [qty]);
      to = erc721Meta.address;
    },
    buyWithPermit: () => {
      data = erc721Meta.interface.encodeFunctionData('buyWithPermit', [erc20Mock.address, qty, deadline, v, r, s]);
      to = erc721Meta.address;
    },
  }

  ACTIONS[action]();

  const request = await signMetaTxRequest(signer.provider, forwarder, { to, from, data });

  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(request),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function approve(erc721Meta, erc20, provider, qty) {
  const { signer } = await validateTx(qty);
  return sendMetaTx("approve", erc721Meta, erc20, provider, signer, qty);
}

export async function buy(erc721Meta, erc20, provider, qty) {
  const { signer } = await validateTx(qty);
  return sendMetaTx("buy", erc721Meta, erc20, provider, signer, qty);
}

export async function buyPermit(erc721Meta, erc20WithPermit, provider, qty) {
  const { signer, userNetwork } = await validateTx(qty);
  const userAddress = await signer.getAddress();
  
  const signature = await signWithPermit(erc721Meta.address, erc20WithPermit, signer.provider, userAddress, userNetwork.chainId, qty);

  return sendMetaTx('buyWithPermit', erc721Meta, erc20WithPermit, provider, signer, qty, signature.deadline, signature.v, signature.r, signature.s);
}
