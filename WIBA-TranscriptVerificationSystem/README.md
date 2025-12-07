# 🎓 TranscriptChain - Decentralized Transcript Verification System

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![Foundry](https://img.shields.io/badge/Foundry-Latest-red?style=for-the-badge)](https://getfoundry.sh/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-627EEA?style=for-the-badge&logo=ethereum)](https://ethereum.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> A blockchain-powered platform for issuing and verifying academic credentials with instant, cryptographically-secure, tamper-proof verification.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Smart Contracts](#smart-contracts)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

CredChain revolutionizes credential verification by leveraging blockchain technology to provide:

- **⚡ Instant Verification** - Verify credentials in seconds, not days
- **🔒 Tamper-Proof** - Blockchain-secured credentials that cannot be forged
- **🌐 Decentralized** - IPFS storage ensures documents are always accessible
- **💰 Cost-Effective** - Minimal transaction fees on Ethereum
- **🔍 Transparent** - Public verification without compromising privacy

### The Problem We Solve

Traditional credential verification suffers from:
- ❌ Slow processes (3-14 days)
- ❌ High costs for manual verification
- ❌ Susceptibility to fraud and fake degrees
- ❌ Lack of global standardization
- ❌ Document loss and accessibility issues

### Our Solution

✅ Blockchain-based credentials issued once, verified anywhere, instantly  
✅ Cryptographically secured and permanently stored on IPFS  
✅ Global accessibility 24/7 with no intermediaries  
✅ Cost-effective with transparent verification process  

---

## ✨ Features

### 🛡️ **Admin Portal**
- Register and verify educational institutions
- Manage institution status (active/suspended)
- Monitor platform statistics
- Access control with admin authentication

### 🏛️ **Institution Portal**
- Issue academic credentials on blockchain
- Upload and encrypt transcripts to IPFS
- Manage issued credentials
- Revoke credentials if necessary
- Track issuance history

### 👨‍🎓 **Student Portal**
- View all issued credentials
- Download transcripts from IPFS
- Share credentials via CID or hash
- Access blockchain verification links
- Track credential status

### 🔍 **Verifier Portal** (Public)
- Verify credentials by uploading PDF
- Verify credentials by IPFS CID
- Instant cryptographic verification
- Download verification reports
- No login required for transparency

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Admin   │  │Institution│  │ Student  │  │ Verifier │   │
│  │  Portal  │  │  Portal   │  │  Portal  │  │  Portal  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│   Firebase   │ │ Ethereum │ │Pinata (IPFS) │
│              │ │  Sepolia │ │              │
│ • Auth       │ │          │ │ • Documents  │
│ • Firestore  │ │ • Hashes │ │ • Metadata   │
│ • Storage    │ │ • Status │ │ • Gateway    │
└──────────────┘ └──────────┘ └──────────────┘
```

### Data Flow

1. **Credential Issuance**
   ```
   Institution → Upload PDF → Encrypt → 
   Upload to IPFS → Calculate Hash → 
   Store on Blockchain → Save Metadata → 
   Notify Student
   ```

2. **Credential Verification**
   ```
   Verifier → Upload PDF/Enter CID → 
   Calculate Hash → Query Blockchain → 
   Check Status → Display Results → 
   Access Document on IPFS
   ```

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3.4
- **Web3**: ethers.js v6
- **State Management**: React Context API
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### **Blockchain**
- **Network**: Ethereum Sepolia Testnet
- **Smart Contracts**: Solidity ^0.8.20
- **Development**: Foundry
- **Testing**: Forge
- **Deployment**: Forge Script
- **Wallet**: MetaMask

### **Backend Services**
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage (backup)
- **Functions**: Cloud Functions (optional)

### **Storage**
- **Primary**: Pinata Cloud (IPFS)
- **Backup**: Firebase Storage
- **Encryption**: AES-256

### **Development Tools**
- **Package Manager**: npm/yarn
- **Version Control**: Git
- **Deployment**: Vercel (frontend)
- **Testing**: Foundry (Forge, Anvil, Cast)

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 or **yarn** >= 1.22.0
- **Foundry** (latest version)
- **Git**
- **MetaMask** browser extension
- **Firebase Account** (free tier)
- **Pinata Account** (free tier)
- **Ethereum Sepolia Testnet** ETH tokens

### Install Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Getting Test ETH (Sepolia)

1. Visit any of these faucets:
   - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
   - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
   - [Chainlink Sepolia Faucet](https://faucets.chain.link/sepolia)
2. Enter your wallet address
3. Receive free test ETH

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/credchain.git
cd credchain
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Foundry Dependencies

```bash
forge install
```

### 4. Create Environment File

```bash
cp .env.example .env.local
```

---

## ⚙️ Configuration

### 1. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Follow the setup wizard

#### Enable Services
1. **Authentication**
   - Go to Authentication → Sign-in method
   - Enable Email/Password

2. **Firestore Database**
   - Go to Firestore Database
   - Create database (Start in production mode)

3. **Storage**
   - Go to Storage
   - Get started

#### Get Configuration
1. Go to Project Settings → General
2. Scroll to "Your apps"
3. Click Web icon (</>) to add web app
4. Copy configuration values

### 2. Pinata Setup

1. Sign up at [Pinata Cloud](https://pinata.cloud)
2. Go to API Keys section
3. Click "New Key"
4. Enable all permissions
5. Create key and save:
   - API Key
   - API Secret
   - JWT token

### 3. Environment Variables

Update `.env.local` with your values:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxx

# Pinata Configuration
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key
NEXT_PUBLIC_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud

# Blockchain Configuration (Ethereum Sepolia)
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_INSTITUTION_REGISTRY_ADDRESS=0xYourRegistryAddress
NEXT_PUBLIC_TRANSCRIPT_MANAGER_ADDRESS=0xYourManagerAddress

# Admin Configuration
NEXT_PUBLIC_ADMIN_ADDRESS=0xYourAdminWalletAddress

# For Smart Contract Deployment (Keep Secret!)
PRIVATE_KEY=your_wallet_private_key_without_0x
ETHERSCAN_API_KEY=your_etherscan_api_key
```

---

## 📜 Smart Contracts

### Contract Addresses (Sepolia Testnet)

```javascript
InstitutionRegistry: 0xYourRegistryAddress
TranscriptManager: 0xYourManagerAddress
```

### Compile Contracts

```bash
forge build
```

### Deploy Contracts

Create `script/Deploy.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/institutionRegistry.sol";
import "../src/TranscriptManager.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address admin = vm.envAddress("NEXT_PUBLIC_ADMIN_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy InstitutionRegistry
        institutionRegistry registry = new institutionRegistry(admin);
        console.log("InstitutionRegistry deployed at:", address(registry));

        // Deploy TranscriptManager
        TranscriptManager manager = new TranscriptManager(address(registry));
        console.log("TranscriptManager deployed at:", address(manager));

        vm.stopBroadcast();
    }
}
```

Deploy to Sepolia:

```bash
forge script script/Deploy.s.sol:DeployScript --rpc-url $NEXT_PUBLIC_ETHEREUM_RPC_URL --broadcast --verify -vvvv
```

### Verify Contracts on Etherscan

Verification happens automatically with `--verify` flag, or manually:

```bash
forge verify-contract <CONTRACT_ADDRESS> <CONTRACT_NAME> --chain sepolia --watch
```

Example:
```bash
forge verify-contract 0xYourAddress institutionRegistry --chain sepolia --watch
```

### Contract Functions

#### InstitutionRegistry
```solidity
- registerInstitution(name, country, accreditedURL, email)
- VerifyInstitution(address)
- suspendInstitution(address)
- isInstitutionVerified(address) view
- getInstitutionDetails(address) view
- numberOfInstitutions() view
- numberOfVerifiedInstitutions() view
```

#### TranscriptManager
```solidity
- issueTranscripts(studentId, cid, documentHash, degreeType, studentAddress, graduationYear)
- verifyTranscript(cid) view
- inValidateTranscript(transcriptId)
- getTranscriptDetails(transcriptId) view
- getStudentTranscripts(address) view
- transcriptCount() view
```

---

## 📁 Project Structure

```
credchain/
├── public/                      # Static assets
├── src/
│   ├── app/                     # Next.js app directory
│   │   ├── layout.js           # Root layout with providers
│   │   ├── page.js             # Home page
│   │   ├── globals.css         # Global styles
│   │   ├── admin/
│   │   │   └── page.js         # Admin portal
│   │   ├── institution/
│   │   │   └── page.js         # Institution portal
│   │   ├── student/
│   │   │   └── page.js         # Student portal
│   │   └── verifier/
│   │       └── page.js         # Verifier portal
│   │
│   ├── components/              # React components
│   │   ├── Navigation.js       # Header navigation
│   │   ├── WalletConnect.js    # Wallet connection button
│   │   ├── PortalCard.js       # Portal selection cards
│   │   ├── AdminPortal.js      # Admin dashboard
│   │   ├── InstitutionPortal.js # Institution dashboard
│   │   ├── StudentPortal.js    # Student dashboard
│   │   ├── VerifierPortal.js   # Verification interface
│   │   └── MetaMaskDebugger.js # Debugging tool
│   │
│   ├── contexts/                # React contexts
│   │   ├── Web3Context.js      # Web3 wallet state
│   │   └── AuthContext.js      # Firebase auth state
│   │
│   ├── lib/                     # Core libraries
│   │   ├── firebase.js         # Firebase initialization
│   │   ├── web3.js             # Web3 utilities
│   │   ├── pinata.js           # IPFS utilities
│   │   ├── contracts.js        # Smart contract interactions
│   │   └── utils.js            # Helper functions
│   │
│   ├── services/                # Business logic
│   │   ├── credentialService.js     # Credential operations
│   │   ├── institutionService.js    # Institution operations
│   │   └── verificationService.js   # Verification logic
│   │
│   └── hooks/                   # Custom React hooks
│       ├── useWeb3.js
│       ├── useAuth.js
│       └── useContract.js
│
├── contracts/                   # Solidity contracts (Foundry src/)
│   ├── institutionRegistry.sol
│   └── TranscriptManager.sol
│
├── script/                      # Foundry deployment scripts
│   └── Deploy.s.sol
│
├── test/                        # Foundry test files
│   ├── institutionRegistry.t.sol
│   └── TranscriptManager.t.sol
│
├── .env.local                   # Environment variables (gitignored)
├── .env.example                 # Environment template
├── .gitignore
├── foundry.toml                # Foundry configuration
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind configuration
├── package.json
└── README.md
```

---

## 📖 Usage Guide

### For Administrators

1. **Connect Admin Wallet**
   - Click "Connect Wallet" in navigation
   - Approve MetaMask connection
   - Ensure you're on Sepolia Testnet

2. **Navigate to Admin Portal**
   - Click "Admin Portal" card on homepage
   - Or visit `/admin`

3. **Verify Institution**
   - Institution must first register themselves
   - Click "Verify" button next to pending institution
   - Confirm transaction in MetaMask
   - Wait for blockchain confirmation

4. **Manage Institutions**
   - View all registered institutions
   - Suspend institutions if needed
   - Reactivate suspended institutions

### For Institutions

1. **Register Institution** (One-time)
   ```javascript
   // Call contract directly
   await registerInstitution(
     "University Name",
     "Country",
     "https://accreditation-url.com",
     "contact@university.edu"
   );
   ```

2. **Issue Credentials**
   - Navigate to Institution Portal
   - Click "Issue Credential" tab
   - Fill in student details:
     * Student wallet address
     * Degree type (Associate, Bachelor, Master, Doctorate, etc.)
     * Graduation year
   - Upload transcript PDF (max 10MB)
   - Click "Issue Credential"
   - Approve transaction in MetaMask

3. **Manage Credentials**
   - Switch to "Manage Credentials" tab
   - Search credentials by ID or student address
   - View all issued credentials
   - Revoke if necessary (fraud, error, etc.)

### For Students

1. **View Credentials**
   - Connect wallet
   - Navigate to Student Portal
   - See all your issued credentials

2. **Share Credentials**
   - Click "Copy CID" to share IPFS identifier
   - Click "Copy Hash" for document verification
   - Click "View on IPFS" to access document
   - Share link with employers/verifiers

3. **Download Credentials**
   - Click "Download" button
   - PDF saves to your computer
   - Can also access from any IPFS gateway

### For Verifiers (Public Access)

1. **Navigate to Verifier Portal**
   - No wallet connection required
   - Public verification for transparency

2. **Verify by Document Upload**
   - Click "Upload Document" tab
   - Drag and drop or select PDF
   - Click "Verify Document"
   - Results show instantly

3. **Verify by IPFS CID**
   - Click "Enter IPFS CID" tab
   - Paste CID from student
   - Click "Verify Credential"
   - Full details displayed

4. **Download Report**
   - After successful verification
   - Click "Download Report"
   - Get detailed verification report

---

## 🔌 API Reference

### Web3 Functions

```javascript
// Connect wallet
const { address, provider, signer } = await connectWallet();

// Switch network to Sepolia
await switchNetwork(11155111);

// Check if address is valid
const isValid = isValidAddress("0x...");

// Format address for display
const formatted = formatAddress("0x1234..."); // "0x1234...5678"
```

### Contract Functions

```javascript
// Institution Registry
await registerInstitution(name, country, url, email);
await verifyInstitution(address);
await suspendInstitution(address);
const isVerified = await isInstitutionVerified(address);
const details = await getInstitutionDetails(address);

// Transcript Manager
await issueTranscript(studentId, cid, hash, type, address, year);
const transcript = await verifyTranscript(cid);
await invalidateTranscript(transcriptId);
const transcripts = await getStudentTranscripts(address);
```

### Service Functions

```javascript
// Credential Service
await issueCredential(studentAddress, type, year, file, institutionAddress);
const credentials = await getCredentialsByStudent(address);
await revokeCredentialInDb(credentialId, reason);

// Verification Service
const result = await verifyByDocument(file);
const result = await verifyByIpfsCid(cid);
const stats = await getVerificationStats();
```

---

## 🚀 Deployment

### Deploy Frontend to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add Environment Variables**
   - Go to Vercel Dashboard
   - Select your project
   - Settings → Environment Variables
   - Add all variables from `.env.local`

4. **Deploy Production**
   ```bash
   vercel --prod
   ```



---

## 🧪 Testing

### Run Foundry Tests

```bash
# Run all tests
forge test

# Run with verbosity
forge test -vvv

# Run specific test
forge test --match-test testRegisterInstitution

# Run with gas report
forge test --gas-report

# Run with coverage
forge coverage
```

### Test Structure

```solidity
// test/institutionRegistry.t.sol
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/institutionRegistry.sol";

contract InstitutionRegistryTest is Test {
    institutionRegistry public registry;
    address admin = address(1);
    
    function setUp() public {
        registry = new institutionRegistry(admin);
    }
    
    function testRegisterInstitution() public {
        // Test implementation
    }
}
```

### Run Local Node (Anvil)

```bash
# Start local Ethereum node
anvil

# Deploy to local node
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url http://localhost:8545 \
  --broadcast
```

### Foundry Commands

```bash
# Compile contracts
forge build

# Clean build artifacts
forge clean

# Format code
forge fmt

# Check for compilation errors
forge compile --force

# Interact with contracts
cast call <CONTRACT_ADDRESS> "functionName()" --rpc-url $RPC_URL

# Send transaction
cast send <CONTRACT_ADDRESS> "functionName()" --private-key $PRIVATE_KEY

# Get balance
cast balance <ADDRESS> --rpc-url $RPC_URL
```

### Manual Testing Checklist

- [ ] MetaMask connects to Sepolia
- [ ] Network switches automatically
- [ ] Admin can verify institutions
- [ ] Institution can issue credentials
- [ ] Student can view credentials
- [ ] Verifier can verify by document
- [ ] Verifier can verify by CID
- [ ] Credentials display correctly
- [ ] IPFS links work
- [ ] Etherscan links work
- [ ] Download report works
- [ ] Responsive design on mobile

---

## 🐛 Troubleshooting

### MetaMask Connection Issues

**Problem**: Wallet won't connect

**Solutions**:
1. Install MetaMask: https://metamask.io/download/
2. Unlock MetaMask
3. Refresh page
4. Check browser console (F12) for errors
5. Try incognito mode
6. Clear browser cache

**Problem**: Wrong network

**Solution**: Add Sepolia network to MetaMask:
- Network Name: Sepolia
- RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
- Chain ID: 11155111
- Currency Symbol: ETH
- Block Explorer: https://sepolia.etherscan.io

### Transaction Failures

**Problem**: Transaction fails

**Solutions**:
1. Check you have enough Sepolia ETH
2. Increase gas limit
3. Check network congestion on [Etherscan](https://sepolia.etherscan.io)
4. Verify contract addresses in `.env.local`

### Foundry Issues

**Problem**: `forge: command not found`

**Solution**:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

**Problem**: Compilation errors

**Solution**:
```bash
forge clean
forge build --force
```

**Problem**: Test failures

**Solution**:
```bash
forge test -vvvv  # Run with maximum verbosity to see errors
```

### IPFS Upload Issues

**Problem**: Upload fails

**Solutions**:
1. Check Pinata API keys
2. Verify file size (<10MB)
3. Ensure file is PDF
4. Check Pinata dashboard for quota

### Firebase Errors

**Problem**: Permission denied

**Solutions**:
1. Check Firestore rules
2. Ensure user is authenticated
3. Verify Firebase config in `.env.local`

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Style

- Follow existing code style
- Use meaningful variable names
- Add comments for complex logic
- Write Foundry tests for smart contracts
- Write unit tests for frontend features

### Commit Messages

```
feat: Add credential revocation feature
fix: Fix MetaMask connection issue on Sepolia
docs: Update README with Foundry instructions
style: Format code with Prettier
test: Add Forge tests for transcript manager
chore: Update dependencies
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- Precious - * Developer* - [@yourgithub](https://github.com/rehna-jp)

---

## 🙏 Acknowledgments

- [Foundry](https://getfoundry.sh/) - Blazing fast smart contract development
- [Ethereum](https://ethereum.org/) - Blockchain infrastructure
- [Pinata](https://pinata.cloud/) - IPFS pinning service
- [Firebase](https://firebase.google.com/) - Backend services
- [Ethers.js](https://docs.ethers.org/) - Ethereum library
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

---

## 📞 Support

- **Documentation**: [Link to docs]
- **Issues**: [GitHub Issues]()
- **Email**: 
- **Discord**: [Join our community]()

---

## 🗺️ Roadmap

### Version 2.0 ()
- [ ] Multi-signature credential issuance
- [ ] Credential expiration dates
- [ ] Batch credential issuance
- [ ] QR code verification
- [ ] Mobile app (React Native)

### Version 3.0 ()
- [ ] Integration with university SIS systems
- [ ] Credential templates
- [ ] Analytics dashboard
- [ ] API for third-party integrations
- [ ] Multi-language support
- [ ] Layer 2 scaling solution integration

---

## ⭐ Star History

If you find this project useful, please consider giving it a star!

---

## 🔗 Quick Links

- **Live Demo**: [https://credchain.vercel.app](https://credchain.vercel.app)
- **Sepolia Contracts**: [View on Etherscan](https://sepolia.etherscan.io)
- **Foundry Docs**: [https://book.getfoundry.sh](https://book.getfoundry.sh)
- **Ethers.js Docs**: [https://docs.ethers.org](https://docs.ethers.org)

---

**Made with ❤️ for the future of credential verification**

**Powered by Foundry 🔨 | Built on Ethereum ⟠**