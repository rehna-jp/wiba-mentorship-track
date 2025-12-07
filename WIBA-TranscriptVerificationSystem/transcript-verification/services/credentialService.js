import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc as firestoreDoc, updateDoc } from 'firebase/firestore';
import { uploadToPinata, calculateFileHash } from '@/lib/pinata';
import { issueTranscript, getStudentTranscripts, invalidateTranscript } from '@/lib/contracts';
import { DegreeType } from '@/lib/contracts';

/**
 * Issue a credential/transcript
 */
export const issueCredential = async (
  studentAddress,
  credentialType,
  graduationYear,
  file,
  institutionAddress
) => {
  try {
    // 1. Calculate file hash
    const documentHash = await calculateFileHash(file);

    // 2. Upload to IPFS
    const ipfsResult = await uploadToPinata(file, {
      name: `transcript-${studentAddress}-${Date.now()}`,
      keyvalues: {
        studentAddress,
        institutionAddress,
        credentialType: credentialType.toString(),
        graduationYear: graduationYear.toString(),
      },
    });

    // 3. Generate student ID (you can customize this)
    const studentId = `STU-${Date.now()}`;

    // 4. Issue on blockchain
    const receipt = await issueTranscript(
      studentId,
      ipfsResult.ipfsHash,
      documentHash,
      credentialType, // This should match DegreeType enum
      studentAddress,
      graduationYear
    );

    // 5. Save to Firestore
    const credentialData = {
      studentId,
      studentAddress,
      institutionAddress,
      credentialType,
      graduationYear,
      documentHash,
      ipfsCid: ipfsResult.ipfsHash,
      ipfsUrl: ipfsResult.url,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'credentials'), credentialData);

    return {
      id: docRef.id,
      ...credentialData,
    };
  } catch (error) {
    console.error('Error issuing credential:', error);
    throw error;
  }
};

/**
 * Get credentials by student address
 */
export const getCredentialsByStudent = async (studentAddress) => {
  try {
    // Get from blockchain
    const blockchainTranscripts = await getStudentTranscripts(studentAddress);
    
    // Get from Firestore for additional metadata
    const q = query(
      collection(db, 'credentials'),
      where('studentAddress', '==', studentAddress)
    );
    const querySnapshot = await getDocs(q);
    const firestoreData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Merge data
    return firestoreData.length > 0 ? firestoreData : blockchainTranscripts.map(t => ({
      id: t.id.toString(),
      studentAddress: t.studentAddress,
      institutionAddress: t.issuedBy,
      credentialType: t.degreeType,
      graduationYear: t.graduationYear,
      ipfsCid: t.ipfsCid,
      documentHash: t.documentHash,
      status: t.status === 0 ? 'Active' : 'Revoked',
      createdAt: new Date(t.dateIssued * 1000).toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return [];
  }
};

/**
 * Get credentials by institution
 */
export const getCredentialsByInstitution = async (institutionAddress) => {
  try {
    const q = query(
      collection(db, 'credentials'),
      where('institutionAddress', '==', institutionAddress)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching institution credentials:', error);
    return [];
  }
};

/**
 * Revoke a credential
 */
export const revokeCredentialInDb = async (credentialId, reason) => {
  try {
    // Get credential to find transcript ID
    const credDoc = await firestoreDoc(db, 'credentials', credentialId);
    const credData = (await credDoc.get()).data();
    
    if (credData && credData.transcriptId) {
      // Revoke on blockchain
      await invalidateTranscript(credData.transcriptId);
    }

    // Update Firestore
    await updateDoc(firestoreDoc(db, 'credentials', credentialId), {
      status: 'Revoked',
      revokedAt: new Date().toISOString(),
      revocationReason: reason,
    });
  } catch (error) {
    console.error('Error revoking credential:', error);
    throw error;
  }
};

export default {
  issueCredential,
  getCredentialsByStudent,
  getCredentialsByInstitution,
  revokeCredentialInDb,
};