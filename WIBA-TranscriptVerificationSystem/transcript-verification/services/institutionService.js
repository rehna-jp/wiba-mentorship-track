import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { verifyInstitution as verifyInstitutionOnChain } from '@/lib/contracts';

/**
 * Verify an institution (Admin only - calls blockchain)
 */
export const verifyInstitutionAdmin = async (institutionAddress) => {
  try {
    // Call blockchain to verify
    const tx = await verifyInstitutionOnChain(institutionAddress);

    // Update Firestore
    const q = query(
      collection(db, 'institutions'),
      where('address', '==', institutionAddress)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, 'institutions', querySnapshot.docs[0].id);
      await updateDoc(docRef, {
        isVerified: true,
        verifiedAt: new Date().toISOString(),
      });
    }

    return tx;
  } catch (error) {
    console.error('Error verifying institution:', error);
    throw error;
  }
};

/**
 * Suspend an institution (Admin only)
 */
export const suspendInstitution = async (institutionAddress) => {
  try {
    const { suspendInstitution: suspendOnChain } = await import('@/lib/contracts');
    const tx = await suspendOnChain(institutionAddress);

    // Update Firestore
    const q = query(
      collection(db, 'institutions'),
      where('address', '==', institutionAddress)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, 'institutions', querySnapshot.docs[0].id);
      await updateDoc(docRef, {
        isVerified: false,
        suspendedAt: new Date().toISOString(),
        status: 'Suspended',
      });
    }

    return tx;
  } catch (error) {
    console.error('Error suspending institution:', error);
    throw error;
  }
};

/**
 * Reactivate a suspended institution
 */
export const reactivateInstitution = async (institutionAddress) => {
  try {
    const { verifyInstitution } = await import('@/lib/contracts');
    const tx = await verifyInstitution(institutionAddress);

    // Update Firestore
    const q = query(
      collection(db, 'institutions'),
      where('address', '==', institutionAddress)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, 'institutions', querySnapshot.docs[0].id);
      await updateDoc(docRef, {
        isVerified: true,
        reactivatedAt: new Date().toISOString(),
        status: 'Active',
      });
    }

    return tx;
  } catch (error) {
    console.error('Error reactivating institution:', error);
    throw error;
  }
};

/**
 * Get all institutions from Firestore
 */
export const getAllInstitutions = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'institutions'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching institutions:', error);
    throw error;
  }
};

/**
 * Register institution in Firestore (after blockchain registration)
 */
export const registerInstitutionInDb = async (institutionData) => {
  try {
    const docRef = await addDoc(collection(db, 'institutions'), {
      ...institutionData,
      createdAt: new Date().toISOString(),
      status: 'Pending',
      isVerified: false,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error registering institution in DB:', error);
    throw error;
  }
};