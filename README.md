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

## Usage

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

## Installation

```bash
# Install dependencies
npm install

# Run the example
npm start
```

## License

MIT 