# EVM Bytecode Toolkit

A toolkit for analyzing, manipulating, and obfuscating Ethereum Virtual Machine (EVM) bytecode. This library provides tools for security research, development, and understanding smart contract internals.

## Structure

The codebase is organized into the following modules:

```
src/
├── constants/       # Constants like opcode sizes and names
├── utils/           # Core utilities for bytecode manipulation
├── analysis/        # Analysis tools for bytecode patterns
├── obfuscation/     # Obfuscation techniques
├── services/        # External services (blockchain interactions)
└── index.js         # Main entry point
```

## Features

- **Bytecode Decoding**: Convert raw EVM bytecode into human-readable instructions
- **Function Detection**: Identify function selectors in contract bytecode
- **Jump Analysis**: Find and analyze PUSH-JUMP patterns
- **Bytecode Manipulation**: Remove or modify instructions
- **Obfuscation**: Apply various obfuscation techniques to bytecode
- **Blockchain Integration**: Fetch deployed bytecode from Ethereum mainnet

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/evm-bytecode-toolkit.git
cd evm-bytecode-toolkit

# Install dependencies
npm install

# Make the CLI globally available (optional)
npm link
```

## Command Line Interface

The toolkit includes a user-friendly command-line interface for obfuscating bytecode:

```bash
# Interactive mode with guided prompts
npm run cli -- --interactive

# Using command line arguments
npm run cli -- --file ./path/to/Contract.json --seed "myseed" --output ./results.json

# Or if installed globally
evm-obfuscator --file ./path/to/Contract.json
```

### CLI Options

| Option | Description |
|--------|-------------|
| `-i, --interactive` | Run in interactive mode with prompts |
| `-f, --file <path>` | Path to compiled Solidity JSON file with bytecode |
| `-a, --address <address>` | Ethereum contract address to fetch bytecode from |
| `-l, --local` | Specify if bytecode is from a locally compiled contract (default: true) |
| `-s, --seed <seed>` | Seed string for deterministic obfuscation |
| `-o, --output <path>` | Path to save obfuscated bytecode results |
| `-h, --help` | Display help information |
| `-v, --version` | Display version information |

## API Usage

```javascript
const { 
  decodeBytecode,
  obfuscateBytecode,
  findFunctions
} = require('./src/index');

// Decode bytecode to instructions
const decoded = decodeBytecode("0x608060405234...");

// Find function selectors
const functions = findFunctions("0x608060405234...", 10);

// Obfuscate bytecode with a seed
const result = obfuscateBytecode("MYSEED", "0x608060405234...");
```

See `example.js` for more detailed usage examples.

## License

MIT 