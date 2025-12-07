import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { 
  mainnet, 
  polygon, 
  arbitrum, 
  sepolia 
} from 'wagmi/chains';

// For Wagmi v2, use getDefaultConfig from RainbowKit
export const config = getDefaultConfig({
  appName: 'TranscriptChain',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default-project-id',
  chains: [mainnet, polygon, arbitrum, sepolia],
  ssr: true, // If you're using Next.js SSR
});



// Export for use in providers
export const wagmiConfig = config;
export const chains = [mainnet, polygon, arbitrum, sepolia];