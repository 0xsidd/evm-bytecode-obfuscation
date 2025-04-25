const fs = require("fs");
const { removeLastInstruction } = require("../utils/instructions");
const {
  findFunctions,
  findPushJumpSeq,
} = require("../analysis/functionFinder");
const { addJumpDest, shiftJumpDest } = require("../utils/jumps");
const { decodeBytecode } = require("../utils/decoder");
const { modifyInstructionParams } = require("../utils/instructions");

/**
 * Generates dead code instructions for obfuscation
 * @return {string} Hex string of opcodes that have no effect
 */
function deadInstructions(originalBytecode) {
  const bytecode = '60116100095660ff505b50';
  const shifted = shiftJumpDest(originalBytecode,bytecode);
  // remove starting 0x from shifted if there is one
  return shifted.startsWith('0x') ? shifted.slice(2) : shifted; // PUSH1 0xff POP - pushes a value and then removes it
}

/**
 * Obfuscates a function call by routing through custom detour code.
 * @param {string} bytecode - The original hex bytecode
 * @param {number} pushPosition - Byte offset of the PUSH to rewrite
 * @param {string} middleInstructions - Hex string (no '0x') of custom opcodes to insert
 * @return {string} New hex bytecode with detour and jump back inserted
 */
function concatBytecode(bytecode, pushPosition, middleInstructions) {
  console.log('middleInstructions',middleInstructions);
  
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

  console.log("current", current);

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
  
      console.log('deadIns',deadIns);
      
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
 * Calculate a complexity value between 4-24 from a deterministic number
 * @param {number} deterministicNumber - The input number
 * @return {number} A complexity value between 4 and 24
 */
function calculateComplexity(deterministicNumber) {
  // Map to 4-24 range using modulo 21 (0-20) + 4
  const raw = Math.abs(deterministicNumber) % 21;
  return raw + 4;
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

  // Generate variants
  const variants = [-3, -2, -1, 0, 1].map((offset) => {
    const raw = baseComplexity + offset;
    return Math.min(Math.max(raw, 4), 24);
  });

  // Create result object
  const result = {
    original: bytecode,
    variants: variants.map((complexity, index) => ({
      complexity,
      // Use function obfuscation for the first 2 variants, jump obfuscation for the rest
      bytecode: obfuscateInternal(bytecode, true, complexity, index < 2),
    })),
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
