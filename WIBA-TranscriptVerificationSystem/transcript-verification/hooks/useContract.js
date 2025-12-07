import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import {
  getInstitutionRegistryContract,
  getTranscriptVerificationContract,
} from '@/lib/contracts';

export const useInstitutionRegistry = (needsSigner = false) => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isConnected } = useWeb3();

  useEffect(() => {
    const loadContract = async () => {
      if (needsSigner && !isConnected) {
        setLoading(false);
        return;
      }

      try {
        const contractInstance = await getInstitutionRegistryContract(needsSigner);
        setContract(contractInstance);
      } catch (error) {
        console.error('Error loading contract:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContract();
  }, [needsSigner, isConnected]);

  return { contract, loading };
};

export const useTranscriptVerification = (needsSigner = false) => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isConnected } = useWeb3();

  useEffect(() => {
    const loadContract = async () => {
      if (needsSigner && !isConnected) {
        setLoading(false);
        return;
      }

      try {
        const contractInstance = await getTranscriptVerificationContract(needsSigner);
        setContract(contractInstance);
      } catch (error) {
        console.error('Error loading contract:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContract();
  }, [needsSigner, isConnected]);

  return { contract, loading };
};