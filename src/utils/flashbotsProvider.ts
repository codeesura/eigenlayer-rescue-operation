import {
  FlashbotsBundleProvider,
  FlashbotsBundleResolution,
} from "@flashbots/ethers-provider-bundle";
import { ethers } from "ethers";
import { RELAYER_URLS } from "../config";

/**
 * A function to send a bundle to multiple relayers.
 *
 * @param bundle The bundle to send.
 * @param blockNumber The block number to send the bundle in.
 * @param provider The provider to use to connect to the Ethereum network.
 */
export async function sendToRelayers(
  bundle: Array<any>,
  blockNumber: number,
  provider: ethers.providers.JsonRpcProvider
) {
  const promises = RELAYER_URLS.map(async (relayerUrl) => {
    try {
      // Create a new flashbots provider using the given relayer URL and provider.
      const flashbotsProvider = await FlashbotsBundleProvider.create(
        provider,
        ethers.Wallet.createRandom(),
        relayerUrl
      );

      // Simulate the bundle on the relayer.
      const simulationResult = await flashbotsProvider.simulate(
        bundle,
        blockNumber + 1
      );

      if ("error" in simulationResult) {
        // Log the error message if the simulation failed.
        console.error(
          `Simulation failed at ${relayerUrl}:`,
          simulationResult.error.message
        );
        return;
      }

      // Log the simulation result.
      console.log(`Simulation result from ${relayerUrl}:`, simulationResult);

      // Send the bundle to the relayer.
      const flashbotsTransactionResponse = await flashbotsProvider.sendBundle(
        bundle,
        blockNumber + 1
      );

      if ("wait" in flashbotsTransactionResponse) {
        // Wait for the bundle to be included and log the result.
        const resolution = await flashbotsTransactionResponse.wait();

        if (resolution === FlashbotsBundleResolution.BundleIncluded) {
          console.log(
            `Transaction included via relayer: ${relayerUrl} in block ${
              blockNumber + 1
            }`
          );
          process.exit(0);
        } else if (
          resolution === FlashbotsBundleResolution.BlockPassedWithoutInclusion
        ) {
          console.log(
            `Block passed without inclusion for relayer: ${relayerUrl}`
          );
        } else if (
          resolution === FlashbotsBundleResolution.AccountNonceTooHigh
        ) {
          console.log(`Account nonce too high for relayer: ${relayerUrl}`);
        }
      } else {
        // Log an error message if the bundle could not be sent.
        console.log(`Failed to send bundle to ${relayerUrl}.`);
      }
    } catch (error) {
      // Log any errors that occur.
      console.error(`Error with relayer ${relayerUrl}:`, error);
    }
  });

  // Wait for all promises to resolve.
  await Promise.all(promises);
}
