const { OPCODE_SIZES } = require("../constants/opcodes");
const { decodeBytecode } = require("./decoder");

/**
 * Removes the last instruction (and its parameters) from bytecode.
 * @param {string} bytecode - The hex string to trim (with or without '0x')
 * @return {string} A new hex string with the final opcode and its data removed
 */
function removeLastInstruction(bytecode) {
  const cleaned = bytecode.replace(/^0x/, "");
  const bytes = cleaned.match(/.{1,2}/g) || [];

  // Track the start positions of all instructions
  const instructionPositions = [];
  let pc = 0;

  while (pc < bytes.length) {
    instructionPositions.push(pc);
    const opcodeHex = "0x" + bytes[pc];
    const size = OPCODE_SIZES[opcodeHex] || 1;
    pc += size;
  }

  // If we have at least one instruction
  if (instructionPositions.length > 1) {
    // Get the position of the last instruction
    const lastInstructionPos =
      instructionPositions[instructionPositions.length - 1];

    // Check if second-to-last instruction has complete parameters
    if (instructionPositions.length > 2) {
      const secondLastInstructionPos =
        instructionPositions[instructionPositions.length - 2];
      const secondLastOpcode = "0x" + bytes[secondLastInstructionPos];
      const expectedSize = OPCODE_SIZES[secondLastOpcode] || 1;

      // Calculate how many bytes we actually have for this instruction
      const actualSize = lastInstructionPos - secondLastInstructionPos;

      // If it's a PUSH instruction and has incomplete parameters
      if (
        secondLastOpcode >= "0x60" &&
        secondLastOpcode <= "0x7f" &&
        actualSize < expectedSize
      ) {
        // Create a new bytecode with padding for the incomplete PUSH instruction
        const bytecodeBefore = bytes.slice(
          0,
          secondLastInstructionPos + actualSize
        );

        // Add padding zeros to complete the PUSH instruction
        const paddingNeeded = expectedSize - actualSize;
        const padding = Array(paddingNeeded).fill("00");

        return "0x" + [...bytecodeBefore, ...padding].join("");
      }
    }

    // Regular case: just remove the last instruction
    const newBytes = bytes.slice(0, lastInstructionPos);
    return newBytes.length > 0 ? "0x" + newBytes.join("") : "0x";
  }

  // If there is only one instruction or none, return "0x"
  return "0x";
}

/**
 * Modifies the parameters of an instruction at a given byte offset.
 * @param {string} bytecode - The original hex bytecode
 * @param {number} position - The byte index of the opcode to update
 * @param {string} newParams - Hex string (without '0x') of replacement bytes
 * @return {string} The new hex bytecode with updated instruction parameters
 */
function modifyInstructionParams(bytecode, position, newParams) {
  // Decode the bytecode
  const cleaned = bytecode.replace(/^0x/, "");
  const bytes = cleaned.match(/.{1,2}/g) || [];
  const decodedOps = decodeBytecode(bytecode);

  // Find the instruction at the specified position
  let targetOp = null;
  let targetIndex = -1;

  for (let i = 0; i < decodedOps.length; i++) {
    if (decodedOps[i].position === position) {
      targetOp = decodedOps[i];
      targetIndex = i;
      break;
    }
  }

  if (!targetOp) {
    console.error("No instruction found at position", position);
    return bytecode;
  }

  // Get the opcode and its size
  const opcode = targetOp.opcode;
  const opcodeSize = OPCODE_SIZES[opcode] || 1;

  // For instructions with parameters (like PUSH), replace the parameters
  if (opcodeSize > 1) {
    // Format the new params to match the expected size
    const paramSize = opcodeSize - 1; // Subtract 1 for the opcode itself

    // Convert newParams to byte array
    const newParamsBytes = newParams.match(/.{1,2}/g) || [];

    // Ensure the new params are the correct size
    if (newParamsBytes.length !== paramSize) {
      console.error(
        `New params size (${newParamsBytes.length}) does not match required size (${paramSize}) for ${targetOp.instruction}`
      );
      return bytecode;
    }

    // Build the modified bytecode
    const bytecodeBefore = bytes.slice(0, position + 1); // Include the opcode
    const bytecodeAfter = bytes.slice(position + opcodeSize); // Skip the original params

    const modifiedBytecode = [
      ...bytecodeBefore,
      ...newParamsBytes,
      ...bytecodeAfter,
    ];

    return "0x" + modifiedBytecode.join("");
  } else {
    // For instructions without parameters, there's nothing to modify
    console.error(
      "The instruction at position",
      position,
      "has no parameters to modify"
    );
    return bytecode;
  }
}

module.exports = {
  removeLastInstruction,
  modifyInstructionParams,
};
