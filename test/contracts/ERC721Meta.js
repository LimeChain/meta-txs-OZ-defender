const { expect } = require("chai").use(require('chai-as-promised'));
const { ethers } = require("hardhat");
const { signMetaTxRequest } = require("../../src/signer");
const { signWithPermit } = require("../../src/signerPermit");
const { relay } = require('../../autotasks/relay');

async function deploy(name, ...params) {
  const Contract = await ethers.getContractFactory(name);
  return await Contract.deploy(...params).then(f => f.deployed());
}

describe("autotasks/relay", function () {
  beforeEach(async function () {
    this.forwarder = await deploy('MinimalForwarder');
    this.erc20Mock = await deploy('ERC20Mock', this.forwarder.address, 1000);
    this.erc721Meta = await deploy("ERC721Meta", this.forwarder.address, this.erc20Mock.address);
    this.accounts = await ethers.getSigners();
    this.signer = this.accounts[0];
    this.erc20WithPermit = await deploy('ERC20PermitToken', 'Tkn name', 'EP20', this.signer.address);
  });

  it("should approve and buy via a meta-tx", async function () {
    const { forwarder, erc20Mock, erc721Meta, signer } = this;
    const qtyToBuy = "1";

    const { request: requestApprove, signature: signatureApprove } = await signMetaTxRequest(signer.provider, forwarder, {
      from: signer.address,
      to: erc20Mock.address,
      data: erc20Mock.interface.encodeFunctionData('approve', [erc721Meta.address, ethers.utils.parseEther(qtyToBuy)]),
    });

    const allowanceBefore = (await erc20Mock.allowance(signer.address, erc721Meta.address)).toString();

    expect(+allowanceBefore).to.equal(0);

    const txApprove = await relay(forwarder, requestApprove, signatureApprove);
    await txApprove.wait();

    const allowanceAfter = (await erc20Mock.allowance(signer.address, erc721Meta.address)).toString();

    expect(+allowanceAfter).to.equal(qtyToBuy * 10 ** 18);

    const { request: requestBuy, signature: signatureBuy } = await signMetaTxRequest(signer.provider, forwarder, {
      from: signer.address,
      to: erc721Meta.address,
      data: erc721Meta.interface.encodeFunctionData('buy', [1]),
    });

    await relay(forwarder, requestBuy, signatureBuy);

    const ERC721Owner = (await erc721Meta.ownerOf(1)).toString();
    const balanceERC721Contract = (await erc20Mock.balanceOf(erc721Meta.address)).toString();

    expect(ERC721Owner).to.equal(signer.address);
    expect(+balanceERC721Contract).to.equal(qtyToBuy * 10 ** 18);
  });

  it("should buy with permit a meta-tx", async function () {
    const { forwarder, erc20WithPermit, erc721Meta, signer } = this;
    const qtyToBuy = "1";
    const hardhatChainId = 31337;

    const signature = await signWithPermit(erc721Meta.address, erc20WithPermit, signer.provider, signer.address, hardhatChainId, qtyToBuy);

    const { request: requestMetaTxPermit, signature: signatureMetaTxPermit } = await signMetaTxRequest(signer.provider, forwarder, {
      from: signer.address,
      to: erc721Meta.address,
      data: erc721Meta.interface.encodeFunctionData('buyWithPermit', [erc20WithPermit.address, qtyToBuy, signature.deadline, signature.v, signature.r, signature.s]),
    });

    await relay(forwarder, requestMetaTxPermit, signatureMetaTxPermit);

    const ERC721Owner = (await erc721Meta.ownerOf(1)).toString();
    const balanceERC721Contract = (await erc20WithPermit.balanceOf(erc721Meta.address)).toString();

    expect(ERC721Owner).to.equal(signer.address);
    expect(+balanceERC721Contract).to.equal(+qtyToBuy);
  });

  it("refuses to send incorrect signature", async function () {
    const { forwarder, erc721Meta, signer } = this;

    const { request, signature } = await signMetaTxRequest(signer.provider, forwarder, {
      from: signer.address,
      to: erc721Meta.address,
      data: erc721Meta.interface.encodeFunctionData('buy', [1]),
      nonce: 5,
    });

    const whitelist = [erc721Meta.address]
    await expect(relay(forwarder, request, signature, whitelist)).to.be.rejectedWith(/invalid/i);
  });
});
