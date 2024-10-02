import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

// Network configuration
export const CHAIN_ID = 1; // Ethereum mainnet
export const RPC_URL = process.env.RPC_URL || "https://eth.llamarpc.com/";

// Contract addresses
export const MULTI_BUILDER_TRANSFER_ADDRESS =
  "0x101Bf704B0beA595c1f3693bBd703909065c9d48";
export const TOKEN_ADDRESS = "0xec53bF9167f50cDEB3Ae105f56099aaaB9061F83";

// Transaction configuration
export const MINER_REWARD = ethers.utils.parseEther("0.0005");
export const GAS_PER_WALLET = 30000;
export const BASE_GAS_LIMIT = 21000;

// Permit configuration
export const SPENDER_ADDRESS = MULTI_BUILDER_TRANSFER_ADDRESS;
export const PERMIT_VALUE = ethers.utils.parseEther("1000");
export const PERMIT_DEADLINE = ethers.constants.MaxUint256;

// File paths
export const WALLETS_FILE_PATH = "wallets.txt";

// Relayer URLs
export const RELAYER_URLS = [
  "https://rpc.titanbuilder.xyz",
  "https://mevshare-rpc.beaverbuild.org",
  "https://rsync-builder.xyz",
  "https://rpc.flashbots.net",
];

// EIP-712 Domain
export const EIP712_DOMAIN = {
  name: "EIGEN",
  version: "1",
  chainId: CHAIN_ID,
  verifyingContract: TOKEN_ADDRESS,
};

// EIP-712 Types
export const EIP712_TYPES = {
  Permit: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
};

// Function to get provider
export function getProvider() {
  return new ethers.providers.JsonRpcProvider(RPC_URL);
}

// Function to get safe wallet
export function getSafeWallet() {
  const provider = getProvider();
  const privateKey = process.env.PRIVATE_KEY_SAFE_WALLET;
  if (!privateKey) {
    throw new Error(
      "Safe wallet private key not found in environment variables"
    );
  }
  return new ethers.Wallet(privateKey, provider);
}
