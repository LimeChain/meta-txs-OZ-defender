// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "./IERC20Permit.sol";

contract ERC721Meta is ERC721, ERC2771Context {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address erc20;

    constructor(MinimalForwarder forwarder, address _erc20)
        ERC2771Context(address(forwarder))
        ERC721("ERC721MetaTxs", "EMTXS")
    {
        erc20 = _erc20;
    }

    event LogPurchased(address receiver, uint256[] _mintedTokens);

    function buy(uint256 quantity) public {
        require(quantity <= 40, "The requested quantity exceeds the limit.");

        uint256 newTokenId;
        uint256[] memory mintedTokens = new uint256[](quantity);

        address receiver = _msgSender(); // Changed from msg.sender
        for (uint256 i = 0; i < quantity; i++) {
            _tokenIds.increment();
            newTokenId = _tokenIds.current();
            mintedTokens[i] = newTokenId;
            IERC20(erc20).transferFrom(receiver, address(this), 1 * 10**18);
            _safeMint(receiver, newTokenId);
        }

        emit LogPurchased(receiver, mintedTokens);
    }

    function buyWithPermit(
        address _tokenAddress,
        uint256 _quantity,
        uint256 _deadline,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) public {
        require(_quantity <= 40, "The requested quantity exceeds the limit.");

        uint256 newTokenId;
        uint256[] memory mintedTokens = new uint256[](_quantity);
        address receiver = _msgSender(); // Changed from msg.sender

        IERC20Permit(_tokenAddress).permit(
            receiver,
            address(this),
            _quantity,
            _deadline,
            _v,
            _r,
            _s
        );

        for (uint256 i = 0; i < _quantity; i++) {
            _tokenIds.increment();
            newTokenId = _tokenIds.current();
            mintedTokens[i] = newTokenId;
            IERC20(_tokenAddress).transferFrom(receiver, address(this), 1);
            _safeMint(receiver, newTokenId);
        }

        emit LogPurchased(receiver, mintedTokens);
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
