import {  config } from './wagmi';
import { writeContract, readContract, waitForTransactionReceipt, getPublicClient } from '@wagmi/core';

const INSTITUTION_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_INSTITUTION_REGISTRY_ADDRESS;
const TRANSCRIPT_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_TRANSCRIPT_MANAGER_ADDRESS;

// Import ABI files
// Import contract artifacts (these are the full Hardhat/Truffle artifacts)
import InstitutionRegistryArtifact from '../contracts/InstitutionRegistry.json';
import TranscriptVerificationArtifact from '../contracts/TranscriptVerification.json';
import { parseAbiItem } from 'viem';

// Extract ABI from artifacts - since your files are in Hardhat/Truffle format
const InstitutionRegistryABI = InstitutionRegistryArtifact.abi;
const TranscriptVerificationABI = TranscriptVerificationArtifact.abi;



// Contract configurations
export const getInstitutionRegistryContract = () => ({
  address: INSTITUTION_REGISTRY_ADDRESS,
  abi: InstitutionRegistryABI,
});

export const getTranscriptManagerContract = () => ({
  address: TRANSCRIPT_MANAGER_ADDRESS,
  abi: TranscriptVerificationABI,
});

// Institution Registry Functions

export const registerInstitution = async (name, country, accreditedURL, email) => {
  try {
    const { hash } = await writeContract(config, {
      ...getInstitutionRegistryContract(),
      functionName: 'registerInstitution',
      args: [name, country, accreditedURL, email],
      gas: 16000000n, 
    });

    const receipt = await waitForTransactionReceipt(config, { hash });
    return receipt;
  } catch (error) {
    console.error('Error registering institution:', error);
    throw error;
  }
};

export const verifyInstitution = async (institutionAddress) => {
  try {
    const { hash } = await writeContract(config, {
      ...getInstitutionRegistryContract(),
      functionName: 'verifyInstitution',
      args: [institutionAddress],
    });

    const receipt = await waitForTransactionReceipt(config, { hash });
    return receipt;
  } catch (error) {
    console.error('Error verifying institution:', error);
    throw error;
  }
};

export const suspendInstitution = async (institutionAddress) => {
  try {
    const { hash } = await writeContract(config, {
      ...getInstitutionRegistryContract(),
      functionName: 'suspendInstitution',
      args: [institutionAddress],
    });

    const receipt = await waitForTransactionReceipt(config, { hash });
    return receipt;
  } catch (error) {
    console.error('Error suspending institution:', error);
    throw error;
  }
};

export const isInstitutionVerified = async (institutionAddress) => {
  try {
    const result = await readContract(config, {
      ...getInstitutionRegistryContract(),
      functionName: 'isInstitutionVerified',
      args: [institutionAddress],
    });
    return result;
  } catch (error) {
    console.error('Error checking institution verification:', error);
    
    // Handle the specific InstitutionDoesNotExist error
    if (error.message?.includes('InstitutionDoesNotExist') || 
        error.shortMessage?.includes('InstitutionDoesNotExist')) {
      console.log('Institution not registered yet');
      return false;
    }
    
    // For other errors, still return false but log the error
    return false;
  }
};

export const doesInstitutionExist = async (institutionAddress) => {
  try {
    // Try to get institution details - if it fails, institution doesn't exist
    await getInstitutionDetails(institutionAddress);
    return true;
  } catch (error) {
    if (error.message?.includes('InstitutionDoesNotExist') || 
        error.shortMessage?.includes('InstitutionDoesNotExist')) {
      return false;
    }
    throw error; // Re-throw other errors
  }
};

export const getInstitutionDetails = async (institutionAddress) => {
  try {
    const institution = await readContract(config, {
      ...getInstitutionRegistryContract(),
      functionName: 'getInstitutionDetails',
      args: [institutionAddress],
    });

    // Convert BigInt to Number where needed
    return {
      id: Number(institution.id),
      walletAddress: institution.walletAddress,
      name: institution.name,
      country: institution.country,
      accreditedURL: institution.accreditedURL,
      isVerified: institution.isVerified,
      dateRegistered: Number(institution.dateRegistered),
      email: institution.email
    };
  } catch (error) {
    console.error('Error getting institution details:', error);
    throw error;
  }
};

export const getInstitutionStats = async () => {
  try {
    const [numberOfInstitutions, numberOfVerifiedInstitutions] = await Promise.all([
      readContract(config, {
        ...getInstitutionRegistryContract(),
        functionName: 'numberOfInstitutions',
      }),
      readContract(config, {
        ...getInstitutionRegistryContract(),
        functionName: 'numberOfVerifiedInstitutions',
      })
    ]);

    return {
      totalInstitutions: Number(numberOfInstitutions),
      verifiedInstitutions: Number(numberOfVerifiedInstitutions)
    };
  } catch (error) {
    console.error('Error getting institution stats:', error);
    return { totalInstitutions: 0, verifiedInstitutions: 0 };
  }
};

// Transcript Manager Functions

// Degree type enum mapping (matches your smart contract)
export const DegreeType = {
  ASSOCIATE: 0,
  BACHELOR: 1,
  MASTER: 2,
  DOCTORATE: 3,
  CERTIFICATE: 4,
  DIPLOMA: 5,
  POSTDOCTORATE: 6
};

// Status enum mapping
export const TranscriptStatus = {
  ACTIVE: 0,
  REVOKED: 1
};

export const issueTranscript = async (
  studentId,
  ipfsCid,
  documentHash,
  degreeType,
  studentAddress,
  graduationYear
) => {
  try {
    const { hash } = await writeContract(config, {
      ...getTranscriptManagerContract(),
      functionName: 'issueTranscripts',
      args: [studentId, ipfsCid, documentHash, degreeType, studentAddress, graduationYear],
    });

    const receipt = await waitForTransactionReceipt(config, { hash });
    return receipt;
  } catch (error) {
    console.error('Error issuing transcript:', error);
    throw error;
  }
};

export const verifyTranscript = async (ipfsCid) => {
  try {
    const transcript = await readContract(config, {
      ...getTranscriptManagerContract(),
      functionName: 'verifyTranscript',
      args: [ipfsCid],
    });

    // Convert BigInt to Number where needed
    return {
      id: Number(transcript.id),
      studentId: transcript.studentId,
      issuedBy: transcript.issuedBy,
      documentHash: transcript.documenthash,
      degreeType: Number(transcript.degreeType),
      dateIssued: Number(transcript.dateIssued),
      ipfsCid: transcript.ipfscid,
      studentAddress: transcript.studentAddress,
      status: Number(transcript.status),
      graduationYear: Number(transcript.graduationyear)
    };
  } catch (error) {
    console.error('Error verifying transcript:', error);
    throw error;
  }
};

export const invalidateTranscript = async (transcriptId) => {
  try {
    const { hash } = await writeContract(config, {
      ...getTranscriptManagerContract(),
      functionName: 'inValidateTranscript',
      args: [transcriptId],
    });

    const receipt = await waitForTransactionReceipt(config, { hash });
    return receipt;
  } catch (error) {
    console.error('Error invalidating transcript:', error);
    throw error;
  }
};

export const getTranscriptDetails = async (transcriptId) => {
  try {
    const transcript = await readContract(config, {
      ...getTranscriptManagerContract(),
      functionName: 'getTranscriptDetails',
      args: [transcriptId],
    });

    return {
      id: Number(transcript.id),
      studentId: transcript.studentId,
      issuedBy: transcript.issuedBy,
      documentHash: transcript.documenthash,
      degreeType: Number(transcript.degreeType),
      dateIssued: Number(transcript.dateIssued),
      ipfsCid: transcript.ipfscid,
      studentAddress: transcript.studentAddress,
      status: Number(transcript.status),
      graduationYear: Number(transcript.graduationyear)
    };
  } catch (error) {
    console.error('Error getting transcript details:', error);
    throw error;
  }
};

export const getStudentTranscripts = async (studentAddress) => {
  try {
    const transcripts = await readContract(config, {
      ...getTranscriptManagerContract(),
      functionName: 'getStudentTranscripts',
      args: [studentAddress],
    });

    return transcripts.map(t => ({
      id: Number(t.id),
      studentId: t.studentId,
      issuedBy: t.issuedBy,
      documentHash: t.documenthash,
      degreeType: Number(t.degreeType),
      dateIssued: Number(t.dateIssued),
      ipfsCid: t.ipfscid,
      studentAddress: t.studentAddress,
      status: Number(t.status),
      graduationYear: Number(t.graduationyear)
    }));
  } catch (error) {
    console.error('Error getting student transcripts:', error);
    return [];
  }
};

export const checkCIDExists = async (cid) => {
  try {
    const exists = await readContract(config, {
      ...getTranscriptManagerContract(),
      functionName: 'existingCIDs',
      args: [cid],
    });
    return exists;
  } catch (error) {
    console.error('Error checking CID:', error);
    return false;
  }
};

export const getTranscriptCount = async () => {
  try {
    const count = await readContract(config, {
      ...getTranscriptManagerContract(),
      functionName: 'transcriptCount',
    });
    return Number(count);
  } catch (error) {
    console.error('Error getting transcript count:', error);
    return 0;
  }
};

// Utility functions for enum conversion
export const getDegreeTypeName = (degreeType) => {
  const names = [
    'ASSOCIATE',
    'BACHELOR', 
    'MASTER',
    'DOCTORATE',
    'CERTIFICATE',
    'DIPLOMA',
    'POSTDOCTORATE'
  ];
  return names[degreeType] || 'UNKNOWN';
};

export const getStatusName = (status) => {
  return status === 0 ? 'ACTIVE' : 'REVOKED';
};

// Fetch registered institutions from on-chain events and hydrate details
export const fetchRegisteredInstitutions = async () => {
  try {
    const publicClient = getPublicClient(config);
    const fromBlockEnv = process.env.NEXT_PUBLIC_REGISTRY_START_BLOCK;
    const startBlock = fromBlockEnv ? BigInt(fromBlockEnv) : 0n;

    const latest = await publicClient.getBlockNumber();
    const event = parseAbiItem('event InstitutionRegistered(address indexed walletAddress, uint256 id)');

    // RPCs like thirdweb limit eth_getLogs ranges. Use chunking (e.g., 5000 blocks per request)
    const CHUNK = 5000n;
    let fromBlock = startBlock;
    const logsAll = [];

    while (fromBlock <= latest) {
      const toBlock = fromBlock + CHUNK - 1n > latest ? latest : fromBlock + CHUNK - 1n;
      try {
        const logs = await publicClient.getLogs({
          address: INSTITUTION_REGISTRY_ADDRESS,
          event,
          fromBlock,
          toBlock,
        });
        logsAll.push(...logs);
      } catch (e) {
        console.warn(`getLogs failed for range ${fromBlock}-${toBlock}`, e?.shortMessage || e?.message || e);
      }
      fromBlock = toBlock + 1n;
    }

    const addresses = Array.from(
      new Set(
        logsAll
          .map((l) => l.args?.walletAddress)
          .filter(Boolean)
          .map((a) => a.toLowerCase())
      )
    );

    const details = await Promise.all(
      addresses.map(async (addr) => {
        try {
          const data = await getInstitutionDetails(addr);
          return { ...data, address: addr };
        } catch (e) {
          console.warn('Failed to get details for', addr, e);
          return { address: addr };
        }
      })
    );

    return details;
  } catch (error) {
    console.error('Error fetching registered institutions from events:', error);
    return [];
  }
};