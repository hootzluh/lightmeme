import { ethers } from "ethers";
import fs from "fs";

async function main() {
  // Load the contract ABI and bytecode
  const contractPath = "./artifacts/contracts/MemeTokenFactory.sol/MemeTokenFactory.json";
  const contractData = JSON.parse(fs.readFileSync(contractPath, "utf8"));

  // Get the provider and signer
  const provider = new ethers.JsonRpcProvider(process.env.LIGHTCHAIN_TESTNET_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("Deploying MemeTokenFactory...");
  console.log("Deploying from address:", wallet.address);

  // Create contract factory
  const Factory = new ethers.ContractFactory(
    contractData.abi,
    contractData.bytecode,
    wallet
  );

  // Deploy the contract
  const factory = await Factory.deploy();
  await factory.waitForDeployment();

  console.log("MemeTokenFactory deployed to:", await factory.getAddress());
}

main().catch((error) => {
  console.error("Deployment error:", error);
  process.exit(1);
});
