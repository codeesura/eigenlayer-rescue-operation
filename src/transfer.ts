import { ethers } from "ethers";
import { readPrivateKeysFromFile } from "./utils/readPrivateKeys";
import { sendToRelayers } from "./utils/flashbotsProvider";
import {
  getProvider,
  getSafeWallet,
  MULTI_BUILDER_TRANSFER_ADDRESS,
  MINER_REWARD,
  GAS_PER_WALLET,
  BASE_GAS_LIMIT,
  CHAIN_ID,
  WALLETS_FILE_PATH,
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
 * A function to send a transfer to the MultiBuilderTransfer contract for each wallet in the list.
 * @param wallets The list of wallets to send transfers for.
 */
async function sendTransfer(wallets: ethers.Wallet[]): Promise<void> {
  provider.on("block", async (blockNumber: number) => {
    try {
      const block = await provider.getBlock("latest");

      const baseFeePerGas =
        block.baseFeePerGas ?? ethers.utils.parseUnits("10", "gwei");
      const maxPriorityFeePerGas = ethers.utils.parseUnits("2", "gwei");
      const maxFeePerGas = baseFeePerGas.add(maxPriorityFeePerGas);

      const gasLimit = BASE_GAS_LIMIT + wallets.length * GAS_PER_WALLET;

      const multiTransferData = new ethers.utils.Interface([
        "function multiTransferFrom(address[] calldata fromAddresses)",
      ]).encodeFunctionData("multiTransferFrom", [
        wallets.map((w) => w.address),
      ]);

      const bundle = [
        {
          transaction: {
            chainId: CHAIN_ID,
            to: MULTI_BUILDER_TRANSFER_ADDRESS,
            data: multiTransferData,
            type: 2,
            gasLimit: gasLimit,
            maxFeePerGas: maxFeePerGas,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
            value: MINER_REWARD,
          },
          signer: safeWallet,
        },
      ];

      await sendToRelayers(bundle, blockNumber, provider);
    } catch (error) {
      console.error(`Error in block ${blockNumber}:`, error);
    }
  });
}

/**
 * The main function to call the sendTransfer function with the wallets.
 */
async function main(): Promise<void> {
  try {
    const privateKeys = readPrivateKeysFromFile(WALLETS_FILE_PATH);
    const wallets = privateKeys.map((pk) => new ethers.Wallet(pk, provider));

    await sendTransfer(wallets);
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

main().catch(console.error);
