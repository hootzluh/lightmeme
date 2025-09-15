import "@nomicfoundation/hardhat-ethers";
import "dotenv/config";

const { LIGHTCHAIN_TESTNET_RPC, PRIVATE_KEY } = process.env;

export default {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: { type: "edr-simulated", chainId: 1337 },
    lightchainTestnet: {
      type: "http",
      url: LIGHTCHAIN_TESTNET_RPC || "https://light-testnet-rpc.lightchain.ai/",
      chainId: 504,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gas: "auto",
      gasPrice: "auto",
    },
  },
  solidity: {
    version: "0.8.20",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: { timeout: 20000 },
};
