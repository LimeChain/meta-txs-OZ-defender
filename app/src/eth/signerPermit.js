const { splitSignature } = require("@ethersproject/bytes");

const signWithPermit = async (
    sellerAddress,
    tokenContract,
    signer,
    from,
    chainId,
    value
) => {
    const nonce = await tokenContract.nonces(from);
    const verifierContractName = await tokenContract.name();
    const verifierContractAddress = tokenContract.address;
    const deadline = +new Date() + 60 * 60;

    const EIP712Domain = [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
    ];
    const domain = {
        name: verifierContractName,
        version: "1",
        chainId: chainId,
        verifyingContract: verifierContractAddress,
    };
    const Permit = [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
    ];

    const message = {
        owner: from.toString(),
        spender: sellerAddress.toString(),
        value: value.toString(),
        nonce: nonce.toString(),
        deadline: deadline.toString(),
    };

    const data = JSON.stringify({
        types: {
            EIP712Domain,
            Permit,
        },
        domain,
        primaryType: "Permit",
        message,
    });

    const signatureLike = await signer.send("eth_signTypedData_v4", [
        userAddress,
        data,
    ]);

    const signature = await splitSignature(signatureLike);

    return {
        v: signature.v,
        r: signature.r,
        s: signature.s,
        deadline: deadline,
    };
};

module.exports = {
    signWithPermit
};


