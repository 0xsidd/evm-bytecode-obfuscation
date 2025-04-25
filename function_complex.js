/**
 * !!! NOTICE: THIS FILE HAS BEEN RESTRUCTURED !!!
 * 
 * The code from this monolithic file has been reorganized into smaller,
 * more maintainable modules in the src/ directory.
 * 
 * Please use the new modular codebase going forward:
 * - Import from src/index.js
 * - See example.js for usage examples
 * - Read README.md for more information
 * 
 * This file is kept for reference but should be considered deprecated.
 */

const fs = require("fs");
const ethers = require("ethers");

const OPCODE_SIZES = {
  "0x00": 1,
  "0x01": 1,
  "0x02": 1,
  "0x03": 1,
  "0x04": 1,
  "0x05": 1,
  "0x06": 1,
  "0x07": 1,
  "0x08": 1,
  "0x09": 1,
  "0x0a": 1,
  "0x0b": 1,
  "0x0c": 1,
  "0x0d": 1,
  "0x0e": 1,
  "0x0f": 1,
  "0x10": 1,
  "0x11": 1,
  "0x12": 1,
  "0x13": 1,
  "0x14": 1,
  "0x15": 1,
  "0x16": 1,
  "0x17": 1,
  "0x18": 1,
  "0x19": 1,
  "0x1a": 1,
  "0x1b": 1,
  "0x1c": 1,
  "0x1d": 1,
  "0x1e": 1,
  "0x1f": 1,
  "0x20": 1,
  "0x21": 1,
  "0x22": 1,
  "0x23": 1,
  "0x24": 1,
  "0x25": 1,
  "0x26": 1,
  "0x27": 1,
  "0x28": 1,
  "0x29": 1,
  "0x2a": 1,
  "0x2b": 1,
  "0x2c": 1,
  "0x2d": 1,
  "0x2e": 1,
  "0x2f": 1,
  "0x30": 1,
  "0x31": 1,
  "0x32": 1,
  "0x33": 1,
  "0x34": 1,
  "0x35": 1,
  "0x36": 1,
  "0x37": 1,
  "0x38": 1,
  "0x39": 1,
  "0x3a": 1,
  "0x3b": 1,
  "0x3c": 1,
  "0x3d": 1,
  "0x3e": 1,
  "0x3f": 1,
  "0x40": 1,
  "0x41": 1,
  "0x42": 1,
  "0x43": 1,
  "0x44": 1,
  "0x45": 1,
  "0x46": 1,
  "0x47": 1,
  "0x48": 1,
  "0x49": 1,
  "0x4a": 1,
  "0x4b": 1,
  "0x4c": 1,
  "0x4d": 1,
  "0x4e": 1,
  "0x4f": 1,
  "0x50": 1,
  "0x51": 1,
  "0x52": 1,
  "0x53": 1,
  "0x54": 1,
  "0x55": 1,
  "0x56": 1,
  "0x57": 1,
  "0x58": 1,
  "0x59": 1,
  "0x5a": 1,
  "0x5b": 1,
  "0x5c": 1,
  "0x5d": 1,
  "0x5e": 1,
  "0x5f": 1,
  "0x60": 2,
  "0x61": 3,
  "0x62": 4,
  "0x63": 5,
  "0x64": 6,
  "0x65": 7,
  "0x66": 8,
  "0x67": 9,
  "0x68": 10,
  "0x69": 11,
  "0x6a": 12,
  "0x6b": 13,
  "0x6c": 14,
  "0x6d": 15,
  "0x6e": 16,
  "0x6f": 17,
  "0x70": 18,
  "0x71": 19,
  "0x72": 20,
  "0x73": 21,
  "0x74": 22,
  "0x75": 23,
  "0x76": 24,
  "0x77": 25,
  "0x78": 26,
  "0x79": 27,
  "0x7a": 28,
  "0x7b": 29,
  "0x7c": 30,
  "0x7d": 31,
  "0x7e": 32,
  "0x7f": 33,
  "0x80": 1,
  "0x81": 1,
  "0x82": 1,
  "0x83": 1,
  "0x84": 1,
  "0x85": 1,
  "0x86": 1,
  "0x87": 1,
  "0x88": 1,
  "0x89": 1,
  "0x8a": 1,
  "0x8b": 1,
  "0x8c": 1,
  "0x8d": 1,
  "0x8e": 1,
  "0x8f": 1,
  "0x90": 1,
  "0x91": 1,
  "0x92": 1,
  "0x93": 1,
  "0x94": 1,
  "0x95": 1,
  "0x96": 1,
  "0x97": 1,
  "0x98": 1,
  "0x99": 1,
  "0x9a": 1,
  "0x9b": 1,
  "0x9c": 1,
  "0x9d": 1,
  "0x9e": 1,
  "0x9f": 1,
  "0xa0": 1,
  "0xa1": 1,
  "0xa2": 1,
  "0xa3": 1,
  "0xa4": 1,
  "0xa5": 1,
  "0xa6": 1,
  "0xa7": 1,
  "0xa8": 1,
  "0xa9": 1,
  "0xaa": 1,
  "0xab": 1,
  "0xac": 1,
  "0xad": 1,
  "0xae": 1,
  "0xaf": 1,
  "0xf0": 1,
  "0xf1": 1,
  "0xf2": 1,
  "0xf3": 1,
  "0xf4": 1,
  "0xf5": 1,
  "0xfa": 1,
  "0xfd": 1,
  "0xfe": 1,
  "0xff": 1,
};

// Add opcode names mapping
const OPCODE_NAMES = {
  "0x00": "STOP",
  "0x01": "ADD",
  "0x02": "MUL",
  "0x03": "SUB",
  "0x04": "DIV",
  "0x05": "SDIV",
  "0x06": "MOD",
  "0x07": "SMOD",
  "0x08": "ADDMOD",
  "0x09": "MULMOD",
  "0x0a": "EXP",
  "0x0b": "SIGNEXTEND",
  "0x10": "LT",
  "0x11": "GT",
  "0x12": "SLT",
  "0x13": "SGT",
  "0x14": "EQ",
  "0x15": "ISZERO",
  "0x16": "AND",
  "0x17": "OR",
  "0x18": "XOR",
  "0x19": "NOT",
  "0x1a": "BYTE",
  "0x1b": "SHL",
  "0x1c": "SHR",
  "0x1d": "SAR",
  "0x20": "KECCAK256",
  "0x30": "ADDRESS",
  "0x31": "BALANCE",
  "0x32": "ORIGIN",
  "0x33": "CALLER",
  "0x34": "CALLVALUE",
  "0x35": "CALLDATALOAD",
  "0x36": "CALLDATASIZE",
  "0x37": "CALLDATACOPY",
  "0x38": "CODESIZE",
  "0x39": "CODECOPY",
  "0x3a": "GASPRICE",
  "0x3b": "EXTCODESIZE",
  "0x3c": "EXTCODECOPY",
  "0x3d": "RETURNDATASIZE",
  "0x3e": "RETURNDATACOPY",
  "0x3f": "EXTCODEHASH",
  "0x40": "BLOCKHASH",
  "0x41": "COINBASE",
  "0x42": "TIMESTAMP",
  "0x43": "NUMBER",
  "0x44": "PREVRANDAO",
  "0x45": "GASLIMIT",
  "0x46": "CHAINID",
  "0x47": "SELFBALANCE",
  "0x48": "BASEFEE",
  "0x49": "BLOBHASH",
  "0x4a": "BLOBBASEFEE",
  "0x50": "POP",
  "0x51": "MLOAD",
  "0x52": "MSTORE",
  "0x53": "MSTORE8",
  "0x54": "SLOAD",
  "0x55": "SSTORE",
  "0x56": "JUMP",
  "0x57": "JUMPI",
  "0x58": "PC",
  "0x59": "MSIZE",
  "0x5a": "GAS",
  "0x5b": "JUMPDEST",
  "0x5c": "TLOAD",
  "0x5d": "TSTORE",
  "0x5e": "MCOPY",
  "0x5f": "PUSH0",
  "0x60": "PUSH1",
  "0x61": "PUSH2",
  "0x62": "PUSH3",
  "0x63": "PUSH4",
  "0x64": "PUSH5",
  "0x65": "PUSH6",
  "0x66": "PUSH7",
  "0x67": "PUSH8",
  "0x68": "PUSH9",
  "0x69": "PUSH10",
  "0x6a": "PUSH11",
  "0x6b": "PUSH12",
  "0x6c": "PUSH13",
  "0x6d": "PUSH14",
  "0x6e": "PUSH15",
  "0x6f": "PUSH16",
  "0x70": "PUSH17",
  "0x71": "PUSH18",
  "0x72": "PUSH19",
  "0x73": "PUSH20",
  "0x74": "PUSH21",
  "0x75": "PUSH22",
  "0x76": "PUSH23",
  "0x77": "PUSH24",
  "0x78": "PUSH25",
  "0x79": "PUSH26",
  "0x7a": "PUSH27",
  "0x7b": "PUSH28",
  "0x7c": "PUSH29",
  "0x7d": "PUSH30",
  "0x7e": "PUSH31",
  "0x7f": "PUSH32",
  "0x80": "DUP1",
  "0x81": "DUP2",
  "0x82": "DUP3",
  "0x83": "DUP4",
  "0x84": "DUP5",
  "0x85": "DUP6",
  "0x86": "DUP7",
  "0x87": "DUP8",
  "0x88": "DUP9",
  "0x89": "DUP10",
  "0x8a": "DUP11",
  "0x8b": "DUP12",
  "0x8c": "DUP13",
  "0x8d": "DUP14",
  "0x8e": "DUP15",
  "0x8f": "DUP16",
  "0x90": "SWAP1",
  "0x91": "SWAP2",
  "0x92": "SWAP3",
  "0x93": "SWAP4",
  "0x94": "SWAP5",
  "0x95": "SWAP6",
  "0x96": "SWAP7",
  "0x97": "SWAP8",
  "0x98": "SWAP9",
  "0x99": "SWAP10",
  "0x9a": "SWAP11",
  "0x9b": "SWAP12",
  "0x9c": "SWAP13",
  "0x9d": "SWAP14",
  "0x9e": "SWAP15",
  "0x9f": "SWAP16",
  "0xa0": "LOG0",
  "0xa1": "LOG1",
  "0xa2": "LOG2",
  "0xa3": "LOG3",
  "0xa4": "LOG4",
  "0xf0": "CREATE",
  "0xf1": "CALL",
  "0xf2": "CALLCODE",
  "0xf3": "RETURN",
  "0xf4": "DELEGATECALL",
  "0xf5": "CREATE2",
  "0xfa": "STATICCALL",
  "0xfd": "REVERT",
  "0xfe": "INVALID",
  "0xff": "SELFDESTRUCT",
};

// Function to get PUSH instruction names
function getPushOpName(opcode) {
  const pushNumber = parseInt(opcode, 16) - 0x5f;
  return `PUSH${pushNumber}`;
}

/// decodeBytecode: provides detailed instructions for debugging or analysis
/**
 * @notice Decodes a hex EVM bytecode string into a list of instruction objects.
 * @param {string} bytecode The raw hex-encoded bytecode (with optional '0x').
 * @return {Array<Object>} Array of instruction entries, each containing:
 *   - index (number): sequence in program (0-based)
 *   - position (number): byte offset of the instruction
 *   - instruction (string): mnemonic name e.g., 'PUSH1', 'ADD', 'JUMP'
 *   - params (string[]): hex parameters for PUSH operations
 *   - decimalValue (number): numeric value of the PUSH parameter
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

/// removeLastInstruction: remove trailing code
/**
 * @notice Removes the last instruction (and its parameters) from bytecode.
 * @param {string} bytecode The hex string to trim (with or without '0x').
 * @return {string} A new hex string with the final opcode and its data removed.
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

/// findFunctions: locate function IDs in dispatch table
/**
 * @notice Finds all function selectors by scanning for 'DUP1' + 'PUSH4' patterns.
 * @param {string} bytecode The contract's hex bytecode.
 * @param {boolean} getFunctionSelectors Whether to get function selectors
 * @param {boolean} getBoth Whether to get both function selectors and jump points
 * @param {number} complexity The complexity for the obfuscated bytecode
 * @return {Array<Object>} List of selector details, each with:
 *   - position (number): byte offset of the PUSH4
 *   - selector (string): 0x-prefixed 4-byte function ID
 *   - selectorDecimal (number): decimal value of the ID
 *   - instruction (Object): the PUSH4 instruction entry
 *   - followingInstructions (Object[]): next three opcodes after PUSH4
 *   - context (Object[]): surrounding instructions for context
 */
function findFunctions(bytecode, complexity) {
  // First decode the entire bytecode to get detailed instruction information
  const decodedOps = decodeBytecode(bytecode);
  // fs.writeFileSync("decodeddddd.json", JSON.stringify(decodedOps, null, 2));
  const functions = [];

  // Look for patterns in the decoded operations
  for (let i = 0; i < decodedOps.length - 1; i++) {
    // Check for DUP1 followed by PUSH4 pattern
    if (
      decodedOps[i].instruction === "DUP1" &&
      i + 1 < decodedOps.length &&
      decodedOps[i + 1].instruction === "PUSH4"
    ) {
      const selectorInfo = decodedOps[i + 1];
      // This is likely a function selector
      const functionInfo = {
        position: selectorInfo.position,
        selector: selectorInfo.params[0],
        selectorDecimal: selectorInfo.decimalValue,
        instruction: selectorInfo,
        // The 3 following instructions after PUSH4 (typically EQ, PUSH2, JUMPI)
        followingInstructions: [],
        // Find surrounding context (next few instructions)
        context: [],
      };

      // Capture specifically the 3 key instructions that follow PUSH4
      // (typically EQ, PUSH2, JUMPI pattern)
      for (let j = i + 2; j < decodedOps.length && j < i + 5; j++) {
        functionInfo.followingInstructions.push(decodedOps[j]);
      }

      // Capture the next few instructions for context
      const contextSize = 5; // Get up to 5 more instructions for context
      for (
        let j = i + 2;
        j < decodedOps.length && j < i + 2 + contextSize;
        j++
      ) {
        functionInfo.context.push(decodedOps[j]);
      }

      functions.push(functionInfo);
    }
  }

  // Filter functions based on complexity
  const totalFunctions = functions.length;
  if (totalFunctions === 0) {
    return [];
  }

  // Calculate the number of functions to return based on complexity (4-24)
  // Map complexity range [4, 24] to proportion [~1/totalFunctions, 1]
  // Ensure at least 1 function is returned if available
  const numToReturn = Math.max(
    1,
    Math.ceil((totalFunctions * (complexity - 4)) / 20)
  );

  // Return the filtered subset of functions
  return functions.slice(0, numToReturn);
}

function findPushJumpSeq(bytecode, complexity) {
  const decoded = decodeBytecode(bytecode);
  const sequences = [];

  for (let i = 0; i < decoded.length - 1; i++) {
    const current = decoded[i];
    const next = decoded[i + 1];

    if (current.instruction.startsWith("PUSH") && next.instruction === "JUMP") {
      const sequence = {
        position: current.position,
        instruction: current,
        followingInstructions: [],
        context: [],
      };

      // Capture next 3 instructions after JUMP
      for (let j = i + 2; j < decoded.length && j < i + 5; j++) {
        sequence.followingInstructions.push(decoded[j]);
      }

      // Capture surrounding context (5 instructions)
      const contextStart = Math.max(0, i - 2);
      const contextEnd = Math.min(decoded.length, i + 3);
      sequence.context = decoded.slice(contextStart, contextEnd);

      sequences.push({
        position: current.position,
        instruction: current,
        followingInstructions: sequence.followingInstructions,
        context: sequence.context,
        destination: {
          hex: current.params[0],
          decimal: current.decimalValue,
        },
      });
    }
  }

  // Filter sequences based on complexity
  const totalSequences = sequences.length;
  if (totalSequences === 0) {
    return [];
  }

  // Calculate the number of sequences to return based on complexity (4-24)
  const numToReturn = Math.max(
    1,
    Math.ceil((totalSequences * (complexity - 4)) / 20)
  );

  // Return the filtered subset of sequences
  return sequences.slice(0, numToReturn);
}

/// modifyInstructionParams: change PUSH arguments
/**
 * @notice Modifies the parameters of an instruction at a given byte offset.
 * @param {string} bytecode The original hex bytecode.
 * @param {number} position The byte index of the opcode to update.
 * @param {string} newParams Hex string (without '0x') of replacement bytes.
 * @return {string} The new hex bytecode with updated instruction parameters.
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

/// getNextJumpdestPosition: compute insertion point
/**
 * @notice Calculates where to insert a new JUMPDEST opcode.
 * @param {string} bytecode The hex code to measure.
 * @param {number} [instructionPosition] Optional byte offset after which JUMPDEST will go.
 * @return {Object} Details for insertion:
 *   - position (number): decimal byte offset for new JUMPDEST
 *   - hexPosition (string): hex representation of this offset
 *   - afterInstruction (string): mnemonic at given position (if any)
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

/// addJumpDest: physically append the marker
/**
 * @notice Appends a JUMPDEST (0x5b) opcode to the end of the bytecode.
 * @param {string} bytecode The original hex code.
 * @return {Object} Updated code and insertion info:
 *   - bytecode (string): new hex with JUMPDEST added
 *   - position (number): where JUMPDEST was placed
 *   - hexPosition (string): hex offset
 */
function addJumpDest(bytecode) {
  // Calculate new JUMPDEST position at end
  const { position, hexPosition } = getNextJumpdestPosition(bytecode);
  const cleaned = bytecode.replace(/^0x/, "");
  // 5b is the opcode for JUMPDEST
  const newBytecode = "0x" + cleaned + "5b";
  return { bytecode: newBytecode, position, hexPosition };
}

/// concatBytecode: add a diversion
/**
 * @notice Obfuscates a function call by routing through custom detour code.
 * @param {string} bytecode The original hex bytecode.
 * @param {number} pushPosition Byte offset of the PUSH to rewrite.
 * @param {string} middleInstructions Hex string (no '0x') of custom opcodes to insert.
 * @return {string} New hex bytecode with detour and jump back inserted.
 */
function concatBytecode(bytecode, pushPosition, middleInstructions) {
  // 1. Locate the target PUSH instruction
  const decodedOps = decodeBytecode(bytecode);
  const targetOp = decodedOps.find((op) => op.position === pushPosition);
  // console.log("targetOp", targetOp);
  if (!targetOp || !targetOp.instruction.startsWith("PUSH")) {
    console.error("No PUSH instruction found at position", pushPosition);
    return bytecode;
  }
  const originalDest = targetOp.params[0]; // e.g. '0x0f'
  const pushOpcode = targetOp.opcode; // e.g. '0x61'
  const pushSize = OPCODE_SIZES[pushOpcode]; // total bytes of PUSH
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

function deadInstructions() {
  return "60ff50";
}

function obfuscateInternal(
  bytecode,
  toRemoveLastInstruction,
  complexity,
  functionObfuscation
) {
  // 1. Remove the last instruction from the bytecode
  let current = toRemoveLastInstruction
    ? removeLastInstruction(bytecode)
    : bytecode;

  console.log("current", current);

  // 2. Find all function selectors in the trimmed bytecode
  const selectors = functionObfuscation
    ? findFunctions(current, complexity)
    : findPushJumpSeq(current, complexity);

  // 3. Get dead (noop) instructions to insert
  const deadIns = deadInstructions();

  // 4. For each selector, reroute via obfuscation detour
  for (const sel of selectors) {
    const pushPosition = functionObfuscation
      ? sel.followingInstructions[1].position
      : sel.instruction.position;
    current = concatBytecode(current, pushPosition, deadIns);
    // }
  }

  // 5. Return the fully obfuscated bytecode
  return current;
}

function getDeterministicNumber(seed) {
  return seed
    .toString()
    .split("")
    .reduce((acc, char) => {
      // Using bitwise XOR and left shift for better distribution
      return (acc << 5) - acc + char.charCodeAt(0);
    }, 0);
}

function calculateComplexity(deterministicNumber) {
  // Map to 4-24 range using modulo 21 (0-20) + 4
  const raw = Math.abs(deterministicNumber) % 21;
  return raw + 4;
}

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

function shiftJumpDest(bytecode, shift) {
  // Find all PUSH-JUMP sequences
  const sequences = findPushJumpSeq(bytecode);
  console.log("sequences", sequences);
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


async function getContractByteCodeFromChain(address) {
  const rpc = 'https://eth-mainnet.g.alchemy.com/v2/ompKEiQMiRqiAdC68FwT7SAO7ryTf4hR';
  const provider = new ethers.JsonRpcProvider(rpc);
  const code = await provider.getCode(address);
  console.log("code", code);
  return code;
}

// getContractByteCodeFromChain("0x6B175474E89094C44Da98b954EedeAC495271d0F");

// const bytecode =
//   "0x608060405234801561001057600080fd5b50600436106100365760003560e01c806361bc221a1461003b5780637cf5dab014610059575b600080fd5b610043610089565b60405161005091906100be565b60405180910390f35b610073600480360381019061006e919061010a565b61008f565b60405161008091906100be565b60405180910390f35b60005481565b600060018261009e9190610166565b9050919050565b6000819050919050565b6100b8816100a5565b82525050565b60006020820190506100d360008301846100af565b92915050565b600080fd5b6100e7816100a5565b81146100f257600080fd5b50565b600081359050610104816100de565b92915050565b6000602082840312156101205761011f6100d9565b5b600061012e848285016100f5565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610171826100a5565b915061017c836100a5565b925082820190508082111561019457610193610137565b5b9291505056fea264697066735822122097706750e3cee4fda2e0d214d60e4501ca89d9447999530f67212f47feb9906364736f6c634300081b0033";

// // Example usage:
obfuscateBytecode("HEYYY", bytecode);

// function testJumpObfc() {
//   const res = obfuscateInternal(bytecode, true, 1, false);
//   console.log("res", res);
//   // const removed = removeLastInstruction(bytecode);
//   // const jumpSeq = findPushJumpSeq(removed);
//   // console.log("jumpSeq", jumpSeq);

//   //// test shift
//   // const bytecode = "0x6100005661001056";
//   // const res = shiftJumpDest(bytecode, 5);
//   // console.log("bef", bytecode);
//   // console.log("res", res);
// }

// testJumpObfc();
