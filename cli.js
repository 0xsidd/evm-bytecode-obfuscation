#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { cli } = require('./src/index');

// Configure the command-line interface
program
  .name('evm-obfuscator')
  .description('EVM Bytecode Obfuscation & Analysis Toolkit')
  .version('1.0.0')
  .option('-i, --interactive', 'Run in interactive mode with prompts')
  .option('-f, --file <path>', 'Path to compiled Solidity JSON file with bytecode')
  .option('-a, --address <address>', 'Ethereum contract address to fetch bytecode from')
  .option('-l, --local', 'Specify if bytecode is from a locally compiled contract', true)
  .option('-s, --seed <seed>', 'Seed string for deterministic obfuscation')
  .option('-o, --output <path>', 'Path to save obfuscated bytecode results')
  .parse(process.argv);

// ANSI color setup for pretty console output
const error = text => console.log(chalk.red('ERROR: ') + text);
const success = text => console.log(chalk.green('SUCCESS: ') + text);
const info = text => console.log(chalk.blue('INFO: ') + text);
const title = text => console.log(chalk.yellow.bold('\n' + text + '\n'));

// Main function
async function main() {
  title('EVM BYTECODE OBFUSCATOR');
  
  const options = program.opts();
  let params = {
    localFileLocation: 'NA',
    deployedAddress: 'NA',
    isLocallyDeveloped: true,
    seed: 'NA',
    outputFileName: 'NA'
  };

  // If interactive mode or missing required parameters, prompt for input
  if (options.interactive || 
      (!options.file && !options.address)) {
    
    // Get parameters via interactive prompts
    params = await promptForParameters(options);
  } else {
    // Use command line arguments
    params.localFileLocation = options.file || 'NA';
    params.deployedAddress = options.address || 'NA';
    params.isLocallyDeveloped = options.local !== false;
    params.seed = options.seed || generateRandomSeed();
    params.outputFileName = options.output || 'obfuscation_results.json';
  }

  try {
    // Validate parameters
    validateParameters(params);
    
    // Log the configuration
    info('Configuration:');
    console.log(JSON.stringify(params, null, 2));
    
    // Run the obfuscation process
    info('Starting obfuscation process...');
    await cli(
      params.localFileLocation,
      params.deployedAddress,
      params.isLocallyDeveloped,
      params.seed,
      params.outputFileName
    );

    success(`Obfuscation completed successfully!`);
    success(`Results saved to: ${path.resolve(params.outputFileName)}`);
  } catch (err) {
    error(err.message);
    console.error(err);
    process.exit(1);
  }
}

/**
 * Prompt user for parameters interactively
 */
async function promptForParameters(options) {
  const questions = [];
  
  // Source selection
  questions.push({
    type: 'list',
    name: 'source',
    message: 'Where is your bytecode from?',
    choices: [
      { name: 'Local compiled Solidity file', value: 'local' },
      { name: 'Deployed contract on Ethereum', value: 'deployed' },
    ]
  });

  // For local file
  questions.push({
    type: 'input',
    name: 'localFileLocation',
    message: 'Enter path to the compiled Solidity JSON file:',
    when: answers => ['local', 'both'].includes(answers.source),
    validate: input => {
      if (!input) return 'Path is required';
      if (!fs.existsSync(input)) return 'File does not exist';
      return true;
    }
  });

  // For deployed contract
  questions.push({
    type: 'input',
    name: 'deployedAddress',
    message: 'Enter the Ethereum contract address:',
    when: answers => ['deployed', 'both'].includes(answers.source),
    validate: input => {
      if (!input) return 'Address is required';
      if (!/^0x[a-fA-F0-9]{40}$/.test(input)) return 'Invalid Ethereum address format';
      return true;
    }
  });

  // Is local development
  questions.push({
    type: 'confirm',
    name: 'isLocallyDeveloped',
    message: 'Is this a locally developed contract?',
    default: true,
    when: answers => ['local', 'both'].includes(answers.source)
  });

  // Seed for obfuscation
  questions.push({
    type: 'input',
    name: 'seed',
    message: 'Enter a seed for deterministic obfuscation (leave empty for random):',
    default: options.seed || generateRandomSeed()
  });

  // Output file
  questions.push({
    type: 'input',
    name: 'outputFileName',
    message: 'Enter path to save obfuscated bytecode results:',
    default: options.output || 'obfuscation_results.json'
  });

  // Run the interactive prompts
  const answers = await inquirer.prompt(questions);
  
  // Process answers
  const params = {
    localFileLocation: ['local', 'both'].includes(answers.source) ? answers.localFileLocation : 'NA',
    deployedAddress: ['deployed', 'both'].includes(answers.source) ? answers.deployedAddress : 'NA',
    isLocallyDeveloped: answers.isLocallyDeveloped !== false,
    seed: answers.seed,
    outputFileName: answers.outputFileName
  };

  return params;
}

/**
 * Validate parameters before running
 */
function validateParameters(params) {
  // Check if at least one source is provided
  if (params.localFileLocation === 'NA' && params.deployedAddress === 'NA') {
    throw new Error('You must provide either a local file or a deployed contract address');
  }
  
  // Check if local file exists
  if (params.localFileLocation !== 'NA' && !fs.existsSync(params.localFileLocation)) {
    throw new Error(`Local file not found: ${params.localFileLocation}`);
  }
  
  // Validate Ethereum address format
  if (params.deployedAddress !== 'NA' && !/^0x[a-fA-F0-9]{40}$/.test(params.deployedAddress)) {
    throw new Error(`Invalid Ethereum address format: ${params.deployedAddress}`);
  }
  
  // Make sure output directory exists
  const outputDir = path.dirname(params.outputFileName);
  if (outputDir !== '.' && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
}

/**
 * Generate a random seed string
 */
function generateRandomSeed() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Run the main function
main().catch(err => {
  error('An unexpected error occurred:');
  console.error(err);
  process.exit(1);
}); 