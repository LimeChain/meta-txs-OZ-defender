// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract ERC20Mock is ERC20, ERC2771Context {
    constructor(MinimalForwarder forwarder, uint256 amount)
        ERC2771Context(address(forwarder))
        ERC20("ERC20Mock", "E20M")
    {
        _mint(msg.sender, amount * 10**18);
    }

    function _msgSender()
        internal
        view
        override(Context, ERC2771Context)
        returns (address)
    {
        return ERC2771Context._msgSender();
    }

    function _msgData()
        internal
        view
        override(Context, ERC2771Context)
        returns (bytes memory)
    {
        return ERC2771Context._msgData();
    }
}
