const fs = require("fs");
const { removeLastInstruction } = require("../utils/instructions");
const {
  findFunctions,
  findPushJumpSeq,
} = require("../analysis/functionFinder");
const DeadInstructions = require("../constants/deadInstructions");
const { addJumpDest, shiftJumpDest } = require("../utils/jumps");
const { decodeBytecode } = require("../utils/decoder");
const { modifyInstructionParams } = require("../utils/instructions");

/**
 * Generates dead code instructions for obfuscation
 * @return {string} Hex string of opcodes that have no effect
 */
function deadInstructions(originalBytecode) {
  // generate random number between 0 to DeadInstructions.length -1
  const randomNumber = Math.floor(Math.random() * DeadInstructions.length);
  // const bytecode = DeadInstructions[randomNumber];
  const bytecode = DeadInstructions[randomNumber];
  const shifted = shiftJumpDest(originalBytecode, bytecode);
  // remove starting 0x from shifted if there is one
  return shifted.startsWith("0x") ? shifted.slice(2) : shifted; // PUSH1 0xff POP - pushes a value and then removes it
}

/**
 * Obfuscates a function call by routing through custom detour code.
 * @param {string} bytecode - The original hex bytecode
 * @param {number} pushPosition - Byte offset of the PUSH to rewrite
 * @param {string} middleInstructions - Hex string (no '0x') of custom opcodes to insert
 * @return {string} New hex bytecode with detour and jump back inserted
 */
function concatBytecode(bytecode, pushPosition, middleInstructions) {
  // 1. Locate the target PUSH instruction
  const decodedOps = decodeBytecode(bytecode);
  const targetOp = decodedOps.find((op) => op.position === pushPosition);

  if (!targetOp || !targetOp.instruction.startsWith("PUSH")) {
    console.error("No PUSH instruction found at position", pushPosition);
    return bytecode;
  }

  const originalDest = targetOp.params[0]; // e.g. '0x0f'
  const pushOpcode = targetOp.opcode; // e.g. '0x61'
  const pushSize = parseInt(pushOpcode.slice(2), 16) - 0x5f + 1; // total bytes of PUSH
  const paramSize = pushSize - 1; // number of param bytes

  // 2. Append a new JUMPDEST to the end of the bytecode
  const { bytecode: withJumpDest, hexPosition: jdHex } = addJumpDest(bytecode);

  // 3. Update the original PUSH to point to this new JUMPDEST
  const newPushParams = jdHex.slice(2).padStart(paramSize * 2, "0");
  let modified = modifyInstructionParams(
    withJumpDest,
    pushPosition,
    newPushParams
  );

  // 4. Build the appended segment: middle instructions, original PUSH, and JUMP
  const cleanedMod = modified.replace(/^0x/, "");
  const appendBytes = [
    // User's middle (junk) instructions
    ...middleInstructions.match(/.{1,2}/g),
    // PUSH original destination back to the real code
    pushOpcode.slice(2),
    ...originalDest.slice(2).match(/.{1,2}/g),
    // Unconditional jump back
    "56",
  ];

  // 5. Return the new obfuscated bytecode
  return "0x" + cleanedMod + appendBytes.join("");
}

/**
 * Core obfuscation logic that applies different techniques
 * @param {string} bytecode - The original bytecode
 * @param {boolean} toRemoveLastInstruction - Whether to remove last instruction
 * @param {number} complexity - Complexity level (4-24)
 * @param {boolean} functionObfuscation - Use function selector vs jump obfuscation
 * @return {string} Obfuscated bytecode
 */
function obfuscateInternal(
  bytecode,
  toRemoveLastInstruction,
  complexity,
  functionObfuscation
) {
  // 1. Remove the last instruction from the bytecode if requested
  let current = toRemoveLastInstruction
    ? removeLastInstruction(bytecode)
    : bytecode;

  // 2. Find all function selectors or PUSH-JUMP sequences in the bytecode
  const selectors = functionObfuscation
    ? findFunctions(current, complexity)
    : findPushJumpSeq(current, complexity);

  // 3. Get dead (noop) instructions to insert
  const deadIns = deadInstructions(current);

  // 4. For each selector, reroute via obfuscation detour
  for (const sel of selectors) {
    const pushPosition = functionObfuscation
      ? sel.followingInstructions[1].position
      : sel.instruction.position;

    current = concatBytecode(current, pushPosition, deadIns);
  }

  // 5. Return the fully obfuscated bytecode
  return current;
}

/**
 * Generate a deterministic number from a seed string
 * @param {string} seed - The seed string
 * @return {number} A deterministic number derived from the seed
 */
function getDeterministicNumber(seed) {
  return seed
    .toString()
    .split("")
    .reduce((acc, char) => {
      // Using bitwise XOR and left shift for better distribution
      return (acc << 5) - acc + char.charCodeAt(0);
    }, 0);
}

/**
 * Calculate a complexity value between 1-6 from a deterministic number
 * @param {number} deterministicNumber - The input number
 * @return {number} A complexity value between 1 and 6
 */
function calculateComplexity(deterministicNumber) {
  // Map to 1-6 range using modulo 6 (0-5) + 1
  const raw = Math.abs(deterministicNumber) % 6;
  return raw + 1;
}

/**
 * Main obfuscation function that generates multiple variants
 * @param {string} seed - The seed for deterministic behavior
 * @param {string} bytecode - The original bytecode to obfuscate
 * @return {Object} The obfuscation results with variants
 */
function obfuscateBytecode(seed, bytecode) {
  const deterministicNumber = getDeterministicNumber(seed);
  const baseComplexity = calculateComplexity(deterministicNumber);

  // function jump obfuscation
  const functionJumpObfuscatedBytecode = obfuscateInternal(
    bytecode,
    true,
    baseComplexity,
    true
  );

  // jump obfuscation
  const jumpObfuscatedBytecode = obfuscateInternal(
    functionJumpObfuscatedBytecode,
    false,
    baseComplexity,
    false
  );

  const result = {
    originalBytecode: bytecode,
    obfuscatedBytecode: jumpObfuscatedBytecode,
  };

  // Write to file
  fs.writeFileSync("obfuscation_results.json", JSON.stringify(result, null, 2));

  return result;
}

module.exports = {
  deadInstructions,
  concatBytecode,
  obfuscateInternal,
  getDeterministicNumber,
  calculateComplexity,
  obfuscateBytecode,
};
