'use client';

import { useWeb3 } from '@/contexts/Web3Context';
import { Lock, LogOut, Wallet } from 'lucide-react';

export default function WalletConnect() {
  const { 
    account, 
    isConnecting, 
    isConnected, 
    connect, 
    disconnect,
    formatAddress 
  } = useWeb3();

  // Connected state
  if (isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-700 font-medium">
            {formatAddress(account)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          title="Disconnect Wallet"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Not connected
  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Wallet className="w-4 h-4" />
      <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
    </button>
  );
}