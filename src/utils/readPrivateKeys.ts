import fs from "fs";

/**
 * Reads a list of private keys from a file, one per line.
 * @param filePath The path to the file containing the private keys.
 * @returns An array of strings, each representing a private key.
 */
export function readPrivateKeysFromFile(filePath: string): string[] {
  // Read the file into a string
  const data = fs.readFileSync(filePath, "utf8");

  // Split the string into an array of strings, one per line
  // and filter out any empty lines
  return data.split("\n").filter((line) => line.trim());
}
