# EigenLayer Rescue Operation

## Overview

This repository contains a set of tools designed to assist users who have had their wallets compromised and need to secure their EIGEN tokens. The solution leverages smart contract interactions and off-chain signatures to enable token transfers without requiring Ether in the compromised wallet.

## ⚠️ Important Notice

This tool is intended for use in emergency situations where a wallet has been compromised and immediate action is required to secure EIGEN tokens. Please use with caution and understand the implications of the operations performed.

## Features

- **Permit-based Approvals**: Utilizes EIP-2612 permit function to grant approvals without on-chain transactions.
- **Batch Operations**: Efficiently processes multiple wallets in a single transaction.
- **Gas-less Transfers**: Enables token transfers from compromised wallets without requiring Ether balance.
- **MEV Protection**: Implements Flashbots and multiple relayers to mitigate front-running risks.

## Prerequisites

- Node.js (v14 or later)
- Bun runtime
- Ethereum wallet with sufficient ETH for gas fees (for the safe wallet)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/codeesura/eigenlayer-rescue-operation.git
```

2. Navigate to the project directory:

```bash
cd eigenlayer-rescue-operation
```

3. Install dependencies:

```bash
bun install
```

4. Set up environment variables:
Create a `.env` file in the root directory and add the following:

```bash
RPC_URL=your_ethereum_rpc_url
PRIVATE_KEY_SAFE_WALLET=your_safe_wallet_private_key
```

## Usage

1. Add the private keys of the compromised wallets to `wallets.txt`, one per line.

2. Run the permit script to generate and submit permit signatures:

```bash
bun run start:permit
```

3. Once permits are processed, run the transfer script to move tokens to the safe wallet:

```bash
bun run start:transfer
```

## How It Works

1. **Permit Generation**: The `permit.ts` script generates EIP-2612 permit signatures for each compromised wallet, granting approval to the MultiBuilderTransfer contract.

2. **Batch Permit Submission**: The permits are submitted in batches to the Ethereum network using Flashbots and multiple relayers to prevent front-running.

3. **Token Transfer**: Once permits are processed, the `transfer.ts` script initiates a batch transfer of EIGEN tokens from the compromised wallets to a designated safe address.

## Security Considerations

- This tool interacts directly with Ethereum smart contracts. Ensure you understand the implications before use.
- Keep your safe wallet's private key secure and never share it.
- Verify all addresses and contract interactions before submitting transactions.

## Contributing

Contributions to improve the tool or fix bugs are welcome. Please submit a pull request with your proposed changes.

## Disclaimer

This tool is provided as-is without any warranties. Users are responsible for verifying the code and understanding the operations performed. The authors are not liable for any loss of funds or other damages resulting from the use of this tool.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.