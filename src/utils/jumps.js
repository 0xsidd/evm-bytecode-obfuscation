const { OPCODE_SIZES } = require("../constants/opcodes");
const { decodeBytecode } = require("./decoder");
const { modifyInstructionParams } = require("./instructions");

/**
 * Calculates where to insert a new JUMPDEST opcode.
 * @param {string} bytecode - The hex code to measure
 * @param {number} [instructionPosition] - Optional byte offset after which JUMPDEST will go
 * @return {Object} Details for insertion with position and hexPosition
 */
function getNextJumpdestPosition(bytecode, instructionPosition) {
  // When no instructionPosition is provided, return end-of-bytecode position
  if (instructionPosition === undefined) {
    const cleaned = bytecode.replace(/^0x/, "");
    const bytes = cleaned.match(/.{1,2}/g) || [];
    const position = bytes.length;
    const hexPosition = "0x" + position.toString(16).padStart(4, "0");
    return { position, hexPosition };
  }
  // Decode to find the specified instruction
  const decodedOps = decodeBytecode(bytecode);
  let targetOp = null;
  for (const op of decodedOps) {
    if (op.position === instructionPosition) {
      targetOp = op;
      break;
    }
  }
  if (!targetOp) {
    console.error("No instruction found at position", instructionPosition);
    return null;
  }
  // Compute next position after this instruction
  const opcodeSize = OPCODE_SIZES[targetOp.opcode] || 1;
  const nextPosition = instructionPosition + opcodeSize;
  const hexPosition = "0x" + nextPosition.toString(16).padStart(4, "0");
  return {
    position: nextPosition,
    hexPosition,
    afterInstruction: targetOp.instruction,
  };
}

/**
 * Appends a JUMPDEST (0x5b) opcode to the end of the bytecode.
 * @param {string} bytecode - The original hex code
 * @return {Object} Updated code and insertion info
 */
function addJumpDest(bytecode) {
  // Calculate new JUMPDEST position at end
  const { position, hexPosition } = getNextJumpdestPosition(bytecode);
  const cleaned = bytecode.replace(/^0x/, "");
  // 5b is the opcode for JUMPDEST
  const newBytecode = "0x" + cleaned + "5b";
  return { bytecode: newBytecode, position, hexPosition };
}

/**
 * Shifts all jump destinations by adding an offset
 * @param {string} bytecode - The original bytecode
 * @param {number} shift - The amount to shift destinations by
 * @return {string} Modified bytecode with updated jump destinations
 */
function shiftJumpDest(originalBytecode, bytecode) {
  const { findPushJumpSeq } = require("../analysis/functionFinder");

  // Find all PUSH-JUMP sequences
  const originalSequences = decodeBytecode(originalBytecode);
  const lastPosition = originalSequences[originalSequences.length - 1].position;
  const shift = lastPosition + 2;
  const sequences = findPushJumpSeq(bytecode, 24); // Use maximum complexity to get all sequences
  let modifiedBytecode = bytecode;

  // Iterate through each sequence and modify the PUSH destination
  for (const seq of sequences) {
    const pushInstruction = seq.instruction;
    const pushPosition = pushInstruction.position;
    const originalDestDecimal = pushInstruction.decimalValue || 0; // Handle potential null/undefined

    // Calculate the new destination
    const newDestDecimal = originalDestDecimal + shift;

    // Determine the size of the PUSH parameter in bytes
    const paramSize = parseInt(pushInstruction.opcode, 16) - 0x5f;

    // Convert the new destination to hex and pad it
    // Ensure the result is non-negative before converting
    const nonNegativeDest = Math.max(0, newDestDecimal);
    const newDestHex = nonNegativeDest.toString(16);
    const newDestHexPadded = newDestHex.padStart(paramSize * 2, "0");

    // Modify the bytecode with the new destination parameter
    modifiedBytecode = modifyInstructionParams(
      modifiedBytecode,
      pushPosition,
      newDestHexPadded
    );
  }

  return modifiedBytecode;
}

module.exports = {
  getNextJumpdestPosition,
  addJumpDest,
  shiftJumpDest,
};
