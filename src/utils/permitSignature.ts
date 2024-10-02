import { ethers } from "ethers";
import { EIP712_DOMAIN, EIP712_TYPES } from "../config";
/**
 * A function to create a permit signature for the given wallet, spender, value, token contract, and deadline.
 * @param wallet The wallet to sign the permit with.
 * @param spender The address of the spender.
 * @param value The value of the permit.
 * @param tokenContract The token contract to use to create the permit signature.
 * @param deadline The deadline for the permit.
 * @returns An object with the v, r, and s components of the signature.
 */
export async function createPermitSignature(
  wallet: ethers.Wallet,
  spender: string,
  value: ethers.BigNumber,
  tokenContract: ethers.Contract,
  deadline: ethers.BigNumber
): Promise<{ v: number; r: string; s: string }> {
  // Get the nonce for the wallet from the token contract
  const nonce = await tokenContract.nonces(wallet.address);

  // Create the message for the permit signature
  const message = {
    owner: wallet.address,
    spender: spender,
    value: value.toString(),
    nonce: nonce.toString(),
    deadline: deadline.toString(),
  };

  // Sign the message with the wallet
  const signature = await wallet._signTypedData(
    EIP712_DOMAIN,
    EIP712_TYPES,
    message
  );

  // Split the signature into its v, r, and s components
  const { v, r, s } = ethers.utils.splitSignature(signature);

  // Return the signature components
  return { v, r, s };
}
