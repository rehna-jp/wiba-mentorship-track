import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { verifyTranscript as verifyTranscriptOnChain } from '@/lib/contracts';
import { calculateFileHash } from '@/lib/pinata';

/**
 * Verify a credential by uploading the document file
 * @param {File} file - PDF file to verify
 * @returns {Promise<Object>} Verification result
 */
export const verifyByDocument = async (file) => {
  try {
    // Step 1: Calculate file hash
    console.log('Calculating document hash...');
    const documentHash = await calculateFileHash(file);
    console.log('Document hash:', documentHash);

    // Step 2: Query Firestore for credential by hash
    console.log('Searching for credential in database...');
    const q = query(
      collection(db, 'credentials'),
      where('documentHash', '==', documentHash)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('No credential found with this document hash');
      return {
        valid: false,
        message: 'Credential not found in database. This document may not be registered on the blockchain.',
      };
    }

    const credentialData = querySnapshot.docs[0].data();
    console.log('Credential found in database:', credentialData);

    // Step 3: Verify on blockchain using IPFS CID
    console.log('Verifying on blockchain with CID:', credentialData.ipfsCid);
    try {
      const blockchainTranscript = await verifyTranscriptOnChain(credentialData.ipfsCid);
      console.log('Blockchain result:', blockchainTranscript);

      // Check if transcript is active (status === 0 means ACTIVE)
      const isValid = blockchainTranscript.status === 0;

      if (!isValid) {
        return {
          valid: false,
          message: 'This credential has been revoked by the issuing institution.',
          credential: {
            ...credentialData,
            id: querySnapshot.docs[0].id,
          },
        };
      }

      return {
        valid: true,
        credential: {
          ...credentialData,
          id: querySnapshot.docs[0].id,
          blockchainId: blockchainTranscript.id,
        },
        blockchainData: blockchainTranscript,
      };
    } catch (blockchainError) {
      console.error('Blockchain verification error:', blockchainError);
      
      // If blockchain call fails but we have the credential in DB
      // Check the status from DB
      if (credentialData.status === 'Active') {
        return {
          valid: true,
          credential: {
            ...credentialData,
            id: querySnapshot.docs[0].id,
          },
          warning: 'Verified from database (blockchain query failed)',
        };
      }
      
      return {
        valid: false,
        message: 'Credential has been revoked or blockchain verification failed.',
        credential: credentialData,
      };
    }
  } catch (error) {
    console.error('Error verifying by document:', error);
    throw new Error('Failed to verify document: ' + error.message);
  }
};

/**
 * Verify a credential by IPFS CID
 * @param {string} ipfsCid - IPFS Content Identifier
 * @returns {Promise<Object>} Verification result
 */
export const verifyByIpfsCid = async (ipfsCid) => {
  try {
    // Step 1: Query blockchain first
    console.log('Verifying on blockchain with CID:', ipfsCid);
    
    try {
      const blockchainTranscript = await verifyTranscriptOnChain(ipfsCid);
      console.log('Blockchain result:', blockchainTranscript);

      // Step 2: Get additional data from Firestore
      const q = query(
        collection(db, 'credentials'),
        where('ipfsCid', '==', ipfsCid)
      );
      const querySnapshot = await getDocs(q);

      let credentialData;
      if (!querySnapshot.empty) {
        credentialData = querySnapshot.docs[0].data();
      } else {
        // Build credential data from blockchain response
        credentialData = {
          studentAddress: blockchainTranscript.studentAddress,
          institutionAddress: blockchainTranscript.issuedBy,
          credentialType: blockchainTranscript.degreeType,
          graduationYear: blockchainTranscript.graduationYear,
          ipfsCid: blockchainTranscript.ipfsCid,
          documentHash: blockchainTranscript.documentHash,
          status: blockchainTranscript.status === 0 ? 'Active' : 'Revoked',
          createdAt: new Date(blockchainTranscript.dateIssued * 1000).toISOString(),
          transactionHash: '',
          blockNumber: 0,
          ipfsUrl: `https://gateway.pinata.cloud/ipfs/${ipfsCid}`,
        };
      }

      // Check if credential is active
      const isValid = blockchainTranscript.status === 0;

      if (!isValid) {
        return {
          valid: false,
          message: 'This credential has been revoked by the issuing institution.',
          credential: credentialData,
        };
      }

      return {
        valid: true,
        credential: {
          ...credentialData,
          id: querySnapshot.empty ? blockchainTranscript.id.toString() : querySnapshot.docs[0].id,
          blockchainId: blockchainTranscript.id,
        },
        blockchainData: blockchainTranscript,
      };
    } catch (blockchainError) {
      console.error('Blockchain verification error:', blockchainError);
      
      // Fallback to Firestore only
      const q = query(
        collection(db, 'credentials'),
        where('ipfsCid', '==', ipfsCid)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return {
          valid: false,
          message: 'Credential not found. Please check the IPFS CID and try again.',
        };
      }

      const credentialData = querySnapshot.docs[0].data();

      if (credentialData.status === 'Active') {
        return {
          valid: true,
          credential: {
            ...credentialData,
            id: querySnapshot.docs[0].id,
          },
          warning: 'Verified from database (blockchain query failed)',
        };
      }

      return {
        valid: false,
        message: 'This credential has been revoked.',
        credential: credentialData,
      };
    }
  } catch (error) {
    console.error('Error verifying by IPFS CID:', error);
    throw new Error('Failed to verify credential: ' + error.message);
  }
};

/**
 * Get verification statistics
 * @returns {Promise<Object>} Verification statistics
 */
export const getVerificationStats = async () => {
  try {
    const credentialsRef = collection(db, 'credentials');
    const snapshot = await getDocs(credentialsRef);
    
    const stats = {
      totalCredentials: snapshot.size,
      activeCredentials: 0,
      revokedCredentials: 0,
      institutionCount: new Set(),
    };

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.status === 'Active') {
        stats.activeCredentials++;
      } else if (data.status === 'Revoked') {
        stats.revokedCredentials++;
      }
      stats.institutionCount.add(data.institutionAddress);
    });

    stats.institutionCount = stats.institutionCount.size;

    return stats;
  } catch (error) {
    console.error('Error getting verification stats:', error);
    return {
      totalCredentials: 0,
      activeCredentials: 0,
      revokedCredentials: 0,
      institutionCount: 0,
    };
  }
};

/**
 * Get credential details by ID
 * @param {string} credentialId - Credential document ID
 * @returns {Promise<Object>} Credential details
 */
export const getCredentialDetails = async (credentialId) => {
  try {
    const docRef = doc(db, 'credentials', credentialId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Credential not found');
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error('Error getting credential details:', error);
    throw error;
  }
};

/**
 * Search credentials by student address
 * @param {string} studentAddress - Student wallet address
 * @returns {Promise<Array>} Array of credentials
 */
export const searchCredentialsByStudent = async (studentAddress) => {
  try {
    const q = query(
      collection(db, 'credentials'),
      where('studentAddress', '==', studentAddress)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error searching credentials:', error);
    throw error;
  }
};

/**
 * Search credentials by institution
 * @param {string} institutionAddress - Institution wallet address
 * @returns {Promise<Array>} Array of credentials
 */
export const searchCredentialsByInstitution = async (institutionAddress) => {
  try {
    const q = query(
      collection(db, 'credentials'),
      where('institutionAddress', '==', institutionAddress)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error searching credentials:', error);
    throw error;
  }
};

/**
 * Batch verify multiple documents
 * @param {Array<File>} files - Array of PDF files
 * @returns {Promise<Array>} Array of verification results
 */
export const batchVerifyDocuments = async (files) => {
  try {
    const results = await Promise.all(
      files.map(async (file) => {
        try {
          const result = await verifyByDocument(file);
          return {
            fileName: file.name,
            ...result,
          };
        } catch (error) {
          return {
            fileName: file.name,
            valid: false,
            message: error.message,
          };
        }
      })
    );
    return results;
  } catch (error) {
    console.error('Error batch verifying documents:', error);
    throw error;
  }
};

/**
 * Verify multiple credentials by CIDs
 * @param {Array<string>} ipfsCids - Array of IPFS CIDs
 * @returns {Promise<Array>} Array of verification results
 */
export const batchVerifyByCids = async (ipfsCids) => {
  try {
    const results = await Promise.all(
      ipfsCids.map(async (cid) => {
        try {
          const result = await verifyByIpfsCid(cid);
          return {
            ipfsCid: cid,
            ...result,
          };
        } catch (error) {
          return {
            ipfsCid: cid,
            valid: false,
            message: error.message,
          };
        }
      })
    );
    return results;
  } catch (error) {
    console.error('Error batch verifying by CIDs:', error);
    throw error;
  }
};

/**
 * Get public verification link for a credential
 * @param {string} credentialId - Credential ID
 * @returns {string} Public verification URL
 */
export const getVerificationLink = (credentialId) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/verify?id=${credentialId}`;
};

/**
 * Generate QR code data for verification
 * @param {string} ipfsCid - IPFS CID
 * @returns {Object} QR code data
 */
export const generateVerificationQR = (ipfsCid) => {
  return {
    type: 'credential-verification',
    ipfsCid,
    verifyUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/verifier?cid=${ipfsCid}`,
    timestamp: new Date().toISOString(),
  };
};

export default {
  verifyByDocument,
  verifyByIpfsCid,
  getVerificationStats,
  getCredentialDetails,
  searchCredentialsByStudent,
  searchCredentialsByInstitution,
  batchVerifyDocuments,
  batchVerifyByCids,
  getVerificationLink,
  generateVerificationQR,
};