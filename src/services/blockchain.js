const ethers = require('ethers');

/**
 * Fetches the deployed bytecode of a contract from Ethereum mainnet
 * @param {string} address - The contract address to fetch
 * @return {Promise<string>} The deployed bytecode as a hex string
 */
async function getContractByteCodeFromChain(address) {
  const rpc = 'https://eth-mainnet.g.alchemy.com/v2/ompKEiQMiRqiAdC68FwT7SAO7ryTf4hR';
  const provider = new ethers.JsonRpcProvider(rpc);
  const code = await provider.getCode(address);
  console.log("Retrieved bytecode for", address);
  return code;
}

module.exports = {
  getContractByteCodeFromChain
}; 