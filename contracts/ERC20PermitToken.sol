// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ERC20PermitToken is ERC20Permit, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    uint256 private constant ONE_MILLION = 1 * 10**6;

    constructor(
        string memory name,
        string memory symbol,
        address _initialTokenOwner
    ) ERC20Permit(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(PAUSER_ROLE, _msgSender());

        _mint(_initialTokenOwner, 200 * ONE_MILLION * 1 ether);
    }

    /**
     * @notice When Token contract is paused, no Token interactions are possible (e.g. approve, transfer, transferFrom or permit)
     * Requirements:
     *
     * - Caller must have PAUSER_ROLE
     */
    function pause() public {
        require(
            hasRole(PAUSER_ROLE, _msgSender()),
            "ERC20PresetMinterPauser: must have pauser role to pause"
        );
        _pause();
    }

    /**
     * @notice When Token contract is unpaused, all Token interactions can be executed (e.g. approve, transfer, transferFrom or permit)
     * Requirements:
     *
     * - Caller must have PAUSER_ROLE
     */
    function unpause() public {
        require(
            hasRole(PAUSER_ROLE, _msgSender()),
            "ERC20PresetMinterPauser: must have pauser role to unpause"
        );
        _unpause();
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
