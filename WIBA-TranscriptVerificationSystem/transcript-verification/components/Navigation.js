'use client';

import { useState } from 'react';
import { Shield, Menu, X, GraduationCap, Search, User } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import WalletConnect from './WalletConnect';
import Link from 'next/link';
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 hover:opacity-80 transition"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              TranscriptChain
            </span>
            <span className="text-xl font-bold text-gray-900 sm:hidden">
              TC
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/verifier" 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition px-3 py-2 rounded-lg hover:bg-blue-50"
            >
              <Search className="w-4 h-4" />
              <span>Verify</span>
            </Link>
            <Link 
              href="/student" 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition px-3 py-2 rounded-lg hover:bg-blue-50"
            >
              <GraduationCap className="w-4 h-4" />
              <span>My Credentials</span>
            </Link>
            <Link 
              href="/institution" 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition px-3 py-2 rounded-lg hover:bg-blue-50"
            >
              <User className="w-4 h-4" />
              <span>Institution</span>
            </Link>
          </div>

          {/* Desktop Wallet Connect */}
          <div className="hidden md:block">
            <ConnectButton 
              showBalance={false}
              accountStatus="address"
              chainStatus="icon"
            />
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-4 md:hidden">
            <div className="scale-75">
              <ConnectButton 
                showBalance={false}
                accountStatus="address"
                chainStatus="icon"
              />
            </div>
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white py-4">
            <div className="flex flex-col space-y-4 px-2">
              <Link
                href="/verifier"
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 font-medium transition px-4 py-3 rounded-lg hover:bg-blue-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search className="w-5 h-5" />
                <span>Verify Transcript</span>
              </Link>
              <Link
                href="/student"
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 font-medium transition px-4 py-3 rounded-lg hover:bg-blue-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <GraduationCap className="w-5 h-5" />
                <span>My Credentials</span>
              </Link>
              <Link
                href="/institution"
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 font-medium transition px-4 py-3 rounded-lg hover:bg-blue-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-5 h-5" />
                <span>Institution Portal</span>
              </Link>
              
              {/* Admin link - only show if user is admin */}
              <Link
                href="/admin"
                className="flex items-center space-x-3 text-purple-600 hover:text-purple-700 font-medium transition px-4 py-3 rounded-lg hover:bg-purple-50 border border-purple-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Shield className="w-5 h-5" />
                <span>Admin Portal</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}