import { ethers, Wallet, Contract } from "ethers";
import { readPrivateKeysFromFile } from "./utils/readPrivateKeys";
import { createPermitSignature } from "./utils/permitSignature";
import { getTokenContract } from "./contracts/tokenContract";
import { sendToRelayers } from "./utils/flashbotsProvider";
import {
  getProvider,
  getSafeWallet,
  MULTI_BUILDER_TRANSFER_ADDRESS as CONTRACT_ADDRESS,
  TOKEN_ADDRESS,
  SPENDER_ADDRESS,
  PERMIT_DEADLINE as DEADLINE,
  PERMIT_VALUE as VALUE,
  BASE_GAS_LIMIT,
  GAS_PER_WALLET,
  CHAIN_ID,
} from "./config/index";

/**
 * The provider to use to connect to the Ethereum network.
 */
const provider = getProvider();

/**
 * The wallet to use to send transactions.
 */
const safeWallet = getSafeWallet();

/**
 * A function to send a batch of permit approvals to the MultiBuilderTransfer contract.
 * @param wallets The wallets to send the permit approvals for.
 * @param tokenContract The token contract to use to create the permit signature.
 */
async function sendBatchPermit(
  wallets: Wallet[],
  tokenContract: Contract
): Promise<void> {
  const owners: string[] = [];
  const vArray: number[] = [];
  const rArray: string[] = [];
  const sArray: string[] = [];

  for (const wallet of wallets) {
    const { v, r, s } = await createPermitSignature(
      wallet,
      SPENDER_ADDRESS,
      VALUE,
      tokenContract,
      DEADLINE
    );
    owners.push(wallet.address);
    vArray.push(v);
    rArray.push(r);
    sArray.push(s);
  }

  const batchPermitData = new ethers.utils.Interface([
    "function batchPermitApprove(address[] calldata owners, uint8[] calldata v, bytes32[] calldata r, bytes32[] calldata s)",
  ]).encodeFunctionData("batchPermitApprove", [owners, vArray, rArray, sArray]);

  provider.on("block", async (blockNumber: number) => {
    try {
      const block = await provider.getBlock("latest");

      const baseFeePerGas =
        block.baseFeePerGas ?? ethers.utils.parseUnits("10", "gwei");
      const maxPriorityFeePerGas = ethers.utils.parseUnits("2", "gwei");
      const maxFeePerGas = baseFeePerGas.add(maxPriorityFeePerGas);

      const gasLimit = BASE_GAS_LIMIT + wallets.length * GAS_PER_WALLET;

      const bundle = [
        {
          transaction: {
            chainId: CHAIN_ID,
            to: CONTRACT_ADDRESS,
            data: batchPermitData,
            type: 2,
            gasLimit: gasLimit,
            maxFeePerGas: maxFeePerGas,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
          },
          signer: safeWallet,
        },
      ];

      await sendToRelayers(bundle, blockNumber, provider);
    } catch (error) {
      console.error(
        `Error sending transaction bundle at block ${blockNumber}:`,
        error
      );
    }
  });
}

/**
 * The main function to call the sendBatchPermit function with the wallets and token contract.
 */
async function main(): Promise<void> {
  try {
    const privateKeys = readPrivateKeysFromFile("wallets.txt");
    const wallets = privateKeys.map((pk) => new ethers.Wallet(pk, provider));
    const tokenContract = getTokenContract(TOKEN_ADDRESS, provider);

    await sendBatchPermit(wallets, tokenContract);
  } catch (error) {
    console.error("An error occurred in the main function:", error);
  }
}

main().catch(console.error);
