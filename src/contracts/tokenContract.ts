import { ethers } from "ethers";

/**
 * The ABI for the token contract.
 */
export const tokenAbi: string[] = [
  /**
   * The function to get the current nonce for a given owner.
   * @param owner The address of the owner.
   * @returns The current nonce for the given owner.
   */
  "function nonces(address owner) view returns (uint256)",

  /**
   * The function to get the name of the token.
   * @returns The name of the token.
   */
  "function name() view returns (string)",

  /**
   * The function to permit a spender to spend a given value of tokens on behalf of the owner.
   * @param owner The address of the owner of the tokens.
   * @param spender The address of the spender.
   * @param value The value of tokens to be spent.
   * @param deadline The deadline for the permit to be valid.
   * @param v The v component of the signature.
   * @param r The r component of the signature.
   * @param s The s component of the signature.
   */
  "function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
];

/**
 * A function to create a new instance of the token contract.
 * @param tokenAddress The address of the token contract.
 * @param provider The provider to use to connect to the Ethereum network.
 * @returns A new instance of the token contract.
 */
export function getTokenContract(
  tokenAddress: string,
  provider: ethers.providers.JsonRpcProvider
): ethers.Contract {
  return new ethers.Contract(tokenAddress, tokenAbi, provider);
}
