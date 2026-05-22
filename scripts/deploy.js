const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const LibraryManagement = await hre.ethers.getContractFactory("LibraryManagement");
  const library = await LibraryManagement.deploy();
  await library.waitForDeployment();

  const address = await library.getAddress();
  const artifact = await hre.artifacts.readArtifact("LibraryManagement");
  const frontendDir = path.join(__dirname, "..", "frontend", "src", "contracts");

  fs.mkdirSync(frontendDir, { recursive: true });
  fs.writeFileSync(
    path.join(frontendDir, "libraryManagement.json"),
    JSON.stringify({ address, abi: artifact.abi }, null, 2)
  );

  console.log(`LibraryManagement deployed to ${address}`);
  console.log("Contract metadata written to frontend/src/contracts/libraryManagement.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
