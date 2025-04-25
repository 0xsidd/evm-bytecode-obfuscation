const { decodeBytecode } = require('../utils/decoder');

/**
 * Finds all function selectors by scanning for 'DUP1' + 'PUSH4' patterns.
 * @param {string} bytecode - The contract's hex bytecode
 * @param {number} complexity - The complexity for filtering (4-24 range)
 * @return {Array<Object>} List of selector details with context
 */
function findFunctions(bytecode, complexity) {
  // First decode the entire bytecode to get detailed instruction information
  const decodedOps = decodeBytecode(bytecode);
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

/**
 * Finds all PUSH-JUMP instruction sequences in bytecode
 * @param {string} bytecode - The contract's hex bytecode
 * @param {number} complexity - The complexity level (4-24)
 * @return {Array<Object>} List of jump sequences with context
 */
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

module.exports = {
  findFunctions,
  findPushJumpSeq
}; 