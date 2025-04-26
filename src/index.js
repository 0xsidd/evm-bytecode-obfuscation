const {
  obfuscateInternal,
  deadInstructions,
  obfuscateBytecode,
} = require("./obfuscation/obfuscator");
const { getContractByteCodeFromChain } = require("./services/blockchain");
const { decodeBytecode } = require("./utils/decoder");
const { removeLastInstruction } = require("./utils/instructions");
const { shiftJumpDest } = require("./utils/jumps");
const { findFunctions, findPushJumpSeq } = require("./analysis/functionFinder");
const fs = require("fs");

/**
 * EVM Bytecode Obfuscation & Analysis Toolkit
 *
 * This module provides tools for manipulating, analyzing, and obfuscating
 * EVM bytecode. It's useful for security research, development, and
 * understanding smart contract internals.
 */

/**
 * Command-line interface function for the toolkit
 * @param {string} localFileLocation - Path to the compiled Solidity JSON file
 * @param {string} deployedAddress - Ethereum contract address to fetch bytecode from
 * @param {boolean} isLocallyDeveloped - Whether contract is a local development
 * @param {string} seed - Seed for deterministic obfuscation
 * @param {string} outputFileName - Path to save obfuscated results
 * @returns {Promise<object>} - The obfuscation results
 */
async function cli(
  localFileLocation = "NA",
  deployedAddress = "NA",
  isLocallyDeveloped = true,
  seed = "NA",
  outputFileName = "NA"
) {
  let bytecode;
  let result = null;

  // For local file location, read the file and get the bytecode from the json file, it will be under the deployedBytecode key
  if (localFileLocation !== "NA") {
    console.log(`Reading bytecode from ${localFileLocation}`);
    const file = fs.readFileSync(localFileLocation, "utf8");
    const json = JSON.parse(file);
    bytecode = json.deployedBytecode;
    if (!bytecode) {
      throw new Error(
        "No deployedBytecode found in the file. Make sure it's a compiled Solidity JSON artifact."
      );
    }
  }

  // If it is from a deployed contract, we need to get the bytecode from the Ethereum blockchain
  if (deployedAddress !== "NA") {
    console.log(
      `Fetching bytecode from deployed contract at ${deployedAddress}`
    );
    bytecode = await getContractByteCodeFromChain(deployedAddress);
    if (!bytecode || bytecode === "0x") {
      throw new Error(
        `No bytecode found at address ${deployedAddress}. Make sure it's a contract address.`
      );
    }
  }

  // If no bytecode was obtained, error out
  if (!bytecode) {
    throw new Error("No bytecode was obtained from any source.");
  }

  // If it is locally developed then remove last instruction from the bytecode
  if (deployedAddress === "NA" && isLocallyDeveloped) {
    console.log("Removing last instruction for locally developed contract");
    bytecode = removeLastInstruction(bytecode);
  }

  // Finally obfuscate the bytecode
  console.log(`Obfuscating bytecode using seed: ${seed}`);
  result = obfuscateBytecode(seed, bytecode);

  // Write the obfuscated bytecode to a file
  if (outputFileName !== "NA") {
    console.log(`Writing results to ${outputFileName}`);
    fs.writeFileSync(outputFileName, JSON.stringify(result, null, 2));
  }

  return result;
}

module.exports = {
  // Analysis Tools
  decodeBytecode,
  findFunctions,
  findPushJumpSeq,

  // Manipulation Utilities
  removeLastInstruction,
  shiftJumpDest,

  // Obfuscation
  obfuscateInternal,
  obfuscateBytecode,

  // External Services
  getContractByteCodeFromChain,

  // CLI function
  cli,
};
