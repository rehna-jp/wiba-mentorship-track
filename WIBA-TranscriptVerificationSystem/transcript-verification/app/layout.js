'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import {Providers} from './providers';
import {initializeApp} from 'firebase/app';
import {useEffect} from 'react';

const inter = Inter({ subsets: ['latin'] });


export default function RootLayout({ children }) {
   useEffect(() => {
    // Initialize Firebase only on client side
    if (typeof window !== 'undefined') {
      const firebaseConfig = { 
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
       };
      initializeApp(firebaseConfig);
    }
  }, []);

  return (
    <html lang="en">
       <head>
        {/* Add metadata manually */}
        <title>TranscriptChain - Decentralized Transcript Verification</title>
        <meta name="description" content="Blockchain-powered credential verification system" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Providers>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}