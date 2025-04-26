const { OPCODE_SIZES, OPCODE_NAMES } = require("../constants/opcodes");

/**
 * Get the name of a PUSH instruction from its opcode
 * @param {string} opcode - The hex opcode (e.g. "0x60")
 * @return {string} The instruction name (e.g. "PUSH1")
 */
function getPushOpName(opcode) {
  const pushNumber = parseInt(opcode, 16) - 0x5f;
  return `PUSH${pushNumber}`;
}

/**
 * Decodes a hex EVM bytecode string into a list of instruction objects.
 * @param {string} bytecode - The raw hex-encoded bytecode (with optional '0x')
 * @return {Array<Object>} Array of instruction entries with details
 */
function decodeBytecode(bytecode) {
  const cleaned = bytecode.replace(/^0x/, "");
  const bytes = cleaned.match(/.{1,2}/g) || [];
  const ops = [];
  let pc = 0;

  while (pc < bytes.length) {
    const opcodeHex = "0x" + bytes[pc];
    const size = OPCODE_SIZES[opcodeHex] || 1;
    const instructionBytes = bytes.slice(pc, pc + size);

    // Get instruction name
    let instructionName;
    if (opcodeHex >= "0x60" && opcodeHex <= "0x7f") {
      instructionName = getPushOpName(opcodeHex);
    } else {
      instructionName = OPCODE_NAMES[opcodeHex] || "INVALID";
    }

    // Build the operation entry, including both index and byte offset
    const entry = {
      index: ops.length,
      opcode: opcodeHex,
      instruction: instructionName,
      position: pc,
      params: [],
    };

    // Extract parameter for PUSH opcodes
    if (opcodeHex >= "0x60" && opcodeHex <= "0x7f") {
      const pushData = instructionBytes.slice(1).join("");
      const hexValue = pushData ? "0x" + pushData : null;
      entry.params = hexValue ? [hexValue] : [];

      // Add decimal representation for PUSH instructions
      if (hexValue) {
        entry.decimalValue = parseInt(hexValue, 16);
      }
    }

    ops.push(entry);
    pc += size;
  }

  return ops;
}

module.exports = {
  getPushOpName,
  decodeBytecode,
};
