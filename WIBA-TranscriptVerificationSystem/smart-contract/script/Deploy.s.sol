// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/institutionRegistry.sol";
import "../src/transcriptManager.sol";

contract DeployScript is Script {
    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying contracts with address:", deployer);
        console.log("Account balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy InstitutionRegistry with deployer as admin
        institutionRegistry registry = new institutionRegistry(deployer);
        console.log("InstitutionRegistry deployed at:", address(registry));

        // 2. Deploy TranscriptManager with registry address
        TranscriptManager transcriptManager = new TranscriptManager(address(registry));
        console.log("TranscriptManager deployed at:", address(transcriptManager));

        vm.stopBroadcast();

        // Log deployment info
        console.log("\n=== Deployment Summary ===");
        console.log("Admin Address:", deployer);
        console.log("InstitutionRegistry:", address(registry));
        console.log("TranscriptManager:", address(transcriptManager));
        console.log("========================\n");

        // Save deployment addresses to file
       
    }
}

contract DeployTestnet is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying to TESTNET...");
        console.log("Deployer:", deployer);
        console.log("Balance:", deployer.balance);

        require(deployer.balance > 0.01 ether, "Insufficient balance for deployment");

        vm.startBroadcast(deployerPrivateKey);

        institutionRegistry registry = new institutionRegistry(deployer);
        console.log("InstitutionRegistry deployed at:", address(registry));

        TranscriptManager transcriptManager = new TranscriptManager(address(registry));
        console.log("TranscriptManager deployed at:", address(transcriptManager));

        vm.stopBroadcast();

        console.log("\n=== TESTNET DEPLOYMENT COMPLETE ===");
        console.log("Network: Ethereum Sepolia (Chain ID: )");
        console.log("InstitutionRegistry:", address(registry));
        console.log("TranscriptManager:", address(transcriptManager));
        console.log("Admin:", deployer);
        console.log("\nAdd these addresses to your .env file:");
        console.log(string.concat("INSTITUTION_REGISTRY_ADDRESS=", vm.toString(address(registry))));
        console.log(string.concat("TRANSCRIPT_MANAGER_ADDRESS=", vm.toString(address(transcriptManager))));
    }
}


// Helper script to setup initial institutions for testing
contract SetupTestInstitutions is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address registryAddress = vm.envAddress("INSTITUTION_REGISTRY_ADDRESS");

        require(registryAddress != address(0), "Set INSTITUTION_REGISTRY_ADDRESS in .env");

        

        // Create test institution addresses
        address testInst1 = vm.addr(1);
        address testInst2 = vm.addr(2);
        address testInst3 = vm.addr(3);

        console.log("Setting up test institutions...");

        vm.startBroadcast(deployerPrivateKey);

        // Register test institutions (they need to call this themselves normally)
        // This is just for testing - in production, institutions register themselves
        
        console.log("Test Institution 1:", testInst1);
        console.log("Test Institution 2:", testInst2);
        console.log("Test Institution 3:", testInst3);

        // Note: Institutions must register themselves
        // Admin can only verify them after they register

        vm.stopBroadcast();

        console.log("\nInstitutions must register themselves by calling:");
        console.log("registry.registerInstitution(name, country, accreditedURL, email)");
        console.log("\nThen admin can verify them with:");
        console.log("registry.VerifyInstitution(institutionAddress)");
    }
}

//Register an institution
contract RegisterInstitution is Script {
    function run() external {
        uint256 pk = vm.envUint("INSTITUTION_PRIVATE_KEY");
        address registryAddr = vm.envAddress("INSTITUTION_REGISTRY_ADDRESS");

        institutionRegistry registry = institutionRegistry(registryAddr);

        vm.startBroadcast(pk);
        registry.registerInstitution(
            "University of Lagos",
            "Nigeria",
            "https://unilag.edu.ng",
            "admin@unilag.edu.ng"
        );
        vm.stopBroadcast();

        console.log("Registered from:", vm.addr(pk));
    }
}

// Script to verify an institution
contract VerifyInstitution is Script {
    function run() external {
        uint256 adminPrivateKey = vm.envUint("PRIVATE_KEY");
        address registryAddress = vm.envAddress("INSTITUTION_REGISTRY_ADDRESS");
        address institutionToVerify = vm.envAddress("INSTITUTION_ADDRESS");

        require(registryAddress != address(0), "Set INSTITUTION_REGISTRY_ADDRESS");
        require(institutionToVerify != address(0), "Set INSTITUTION_ADDRESS");

        institutionRegistry registry = institutionRegistry(registryAddress);

        console.log("Verifying institution:", institutionToVerify);

        vm.startBroadcast(adminPrivateKey);

        registry.verifyInstitution(institutionToVerify);

        vm.stopBroadcast();

        console.log("Institution verified successfully!");
        
        // Get and display institution details
        institutionRegistry.Institution memory inst = registry.getInstitutionDetails(institutionToVerify);
        console.log("\nInstitution Details:");
        console.log("Name:", inst.name);
        console.log("Country:", inst.country);
        console.log("Verified:", inst.isVerified);
    }
}

// Script to issue a test transcript
contract IssueTestTranscript is Script {
    function run() external {
        uint256 institutionPrivateKey = vm.envUint("INSTITUTION_PRIVATE_KEY");
        address transcriptManagerAddress = vm.envAddress("TRANSCRIPT_MANAGER_ADDRESS");
        address studentAddress = vm.envAddress("STUDENT_ADDRESS");

        require(transcriptManagerAddress != address(0), "Set TRANSCRIPT_MANAGER_ADDRESS");
        require(studentAddress != address(0), "Set STUDENT_ADDRESS");

        TranscriptManager manager = TranscriptManager(transcriptManagerAddress);

        console.log("Issuing test transcript...");
        console.log("Student:", studentAddress);

        bytes32 docHash = keccak256("Test Transcript Document Content");
        string memory cid = "QmTestCID123456789";

        vm.startBroadcast(institutionPrivateKey);

        manager.issueTranscripts(
            "TEST001",
            cid,
            docHash,
            TranscriptManager.DegreeType.BACHELOR,
            studentAddress,
            2024
        );

        vm.stopBroadcast();

        console.log("Transcript issued successfully!");
        console.log("IPFS CID:", cid);
        console.log("Document Hash:", vm.toString(docHash));
    }
}