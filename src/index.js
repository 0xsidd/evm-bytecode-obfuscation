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

async function cli(
  localFileLocation = "NA",
  deployedAddress = "NA",
  isLocallyDeveloped = true,
  seed = "NA",
  outputFileName = "NA"
) {
  let bytecode;
  // for local file location, read the file and get the bytecode from the json file, it will be under the deployedBytecode key
  if (localFileLocation != "NA") {
    const file = fs.readFileSync(localFileLocation, "utf8");
    const json = JSON.parse(file);
    bytecode = json.deployedBytecode;
    if (!bytecode) {
      throw new Error("No bytecode found in the file");
    }

    // if it is from a deployed contract, we need to get the bytecode from the Ethereum blockchain
    if (deployedAddress != "NA") {
      bytecode = await getContractByteCodeFromChain(deployedAddress);
    }

    // if it is locally developed than remove last ibstruction from the bytecode
    if (deployedAddress == "NA" && isLocallyDeveloped) {
      bytecode = removeLastInstruction(bytecode);
    }

    // finally obfuscate the bytecode
    const obfuscated = obfuscateBytecode(seed, bytecode);
    console.log(obfuscated);

    // write the obfuscated bytecode to a file
    if (outputFileName != "NA") {
      fs.writeFileSync(outputFileName, obfuscated);
    }
  }
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

  // External Services
  getContractByteCodeFromChain,
};
