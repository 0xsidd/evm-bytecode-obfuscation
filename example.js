const {
  obfuscateBytecode,
  decodeBytecode,
  getContractByteCodeFromChain,
} = require("./src/index");

// Sample bytecode
const sampleBytecode =
  "0x608060405234801561001057600080fd5b50600436106100365760003560e01c806361bc221a1461003b5780637cf5dab014610059575b600080fd5b610043610089565b60405161005091906100be565b60405180910390f35b610073600480360381019061006e919061010a565b61008f565b60405161008091906100be565b60405180910390f35b60005481565b600060018261009e9190610166565b9050919050565b6000819050919050565b6100b8816100a5565b82525050565b60006020820190506100d360008301846100af565b92915050565b600080fd5b6100e7816100a5565b81146100f257600080fd5b50565b600081359050610104816100de565b92915050565b6000602082840312156101205761011f6100d9565b5b600061012e848285016100f5565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610171826100a5565b915061017c836100a5565b925082820190508082111561019457610193610137565b5b9291505056fea264697066735822122097706750e3cee4fda2e0d214d60e4501ca89d9447999530f67212f47feb9906364736f6c634300081b0033";

// Example usage
async function main() {
  console.log("=== EVM Bytecode Toolkit Example ===\n");

  // 1. Basic bytecode decoding
  console.log("Decoding bytecode instructions...");
  const decodedInstructions = decodeBytecode(sampleBytecode);
  console.log(`Decoded ${decodedInstructions.length} instructions\n`);

  // Print first 5 instructions
  console.log("First 5 instructions:");
  decodedInstructions.slice(0, 5).forEach((instruction) => {
    console.log(
      `Position: ${instruction.position}, Op: ${instruction.instruction}`
    );
    if (instruction.params.length > 0) {
      console.log(`  Parameter: ${instruction.params[0]}`);
    }
  });
  console.log();

  // 2. Obfuscate bytecode
  console.log("Obfuscating bytecode...");
  const obfuscationResult = obfuscateBytecode("EXAMPLE_SEED", sampleBytecode);
  console.log(
    `Created ${obfuscationResult.variants.length} obfuscated variants\n`
  );

  // 3. Fetch bytecode from chain (commented to avoid actual API calls)
  console.log(
    "To fetch bytecode from Ethereum mainnet, uncomment the following code:"
  );
  console.log(
    "// const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';"
  );
  console.log(
    "// const daiCode = await getContractByteCodeFromChain(daiAddress);"
  );

  console.log(
    "\nCheck obfuscation_results.json for the complete obfuscation output"
  );
}

// Run the example
main().catch(console.error);
