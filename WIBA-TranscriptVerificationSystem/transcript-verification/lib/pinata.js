import axios from 'axios';
import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';

export const calculateFileHash = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const wordArray = CryptoJS.lib.WordArray.create(e.target.result);
      const hash = CryptoJS.SHA256(wordArray).toString();
      // Convert to bytes32 format for Solidity
      const bytes32Hash = ethers.utils.hexZeroPad('0x' + hash, 32);
      resolve(bytes32Hash);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const uploadToPinata = async (file, metadata = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const pinataMetadata = JSON.stringify({
      name: metadata.name || file.name,
      keyvalues: metadata.keyvalues || {},
    });
    formData.append('pinataMetadata', pinataMetadata);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': `multipart/form-data`,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        },
      }
    );

    return {
      ipfsHash: response.data.IpfsHash,
      pinSize: response.data.PinSize,
      timestamp: response.data.Timestamp,
      url: `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${response.data.IpfsHash}`,
    };
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
};

export const getFromPinata = (ipfsHash) => {
  return `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${ipfsHash}`;
};