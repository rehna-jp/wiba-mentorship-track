'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  useAccount, 
  useConnect, 
  useDisconnect, 
  useChainId,
  useSwitchChain,
  useConfig
} from 'wagmi';
import { mainnet, polygon, arbitrum, sepolia } from 'wagmi/chains';
import toast from 'react-hot-toast';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  // Wagmi v2 hooks
  const { address, isConnected, status } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { chainId } = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const config = useConfig();

  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

  // Format address helper
  const formatAddress = useCallback((addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  }, []);

  // Connect function using Wagmi v2
  const connect = useCallback(async (connectorId = 'metaMask') => {
    setIsConnectingWallet(true);
    
    try {
      console.log('🚀 Connecting with connector:', connectorId);
      
      const connector = connectors.find(c => c.id === connectorId);
      if (!connector) {
        throw new Error(`Connector ${connectorId} not found`);
      }

      await connectAsync({ connector });
      toast.success(`Wallet connected`);
      
      console.log('✅ Wagmi v2 connection complete');
      
    } catch (error) {
      console.error('❌ Connection failed:', error);
      
      if (error.message?.includes('User rejected') || error.name === 'UserRejectedRequestError') {
        toast.error('Connection rejected by user');
      } else {
        toast.error(error.message || 'Failed to connect wallet');
      }
    } finally {
      setIsConnectingWallet(false);
    }
  }, [connectAsync, connectors]);

  // Disconnect function
  const disconnect = useCallback(async () => {
    console.log('🔌 Disconnecting...');
    
    try {
      await disconnectAsync();
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Error disconnecting wallet');
    }
  }, [disconnectAsync]);

  // Switch network function
  const switchToNetwork = useCallback(async (chainId) => {
    try {
      if (switchChainAsync) {
        await switchChainAsync({ chainId });
        toast.success(`Switched network`);
      } else {
        toast.error('Network switching not supported');
      }
    } catch (error) {
      console.error('Network switch error:', error);
      toast.error('Failed to switch network');
    }
  }, [switchChainAsync]);

  // Check if desired network is connected
  const isCorrectNetwork = useCallback((desiredChainId) => {
    return chainId === desiredChainId;
  }, [chainId]);

  // Get connection status
  const isConnecting = status === 'connecting' || status === 'reconnecting' || isConnectingWallet;

  // Auto-handle connection state changes
  useEffect(() => {
    if (isConnected && address) {
      console.log('✅ Wallet connected:', address);
      console.log('🌐 Current chain ID:', chainId);
    } else if (!isConnected && status === 'disconnected') {
      console.log('🔌 Wallet disconnected');
    }
  }, [isConnected, address, chainId, status]);

  const value = {
    // Account info
    account: address,
    isConnected,
    isConnecting,
    
    // Network info
    chainId,
    
    // Methods
    connect,
    disconnect,
    switchNetwork: switchToNetwork,
    isCorrectNetwork,
    formatAddress,
    
    // Additional info
    connectors
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};