'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import PortalCard from '@/components/PortalCard';
import { Shield, CheckCircle, Lock, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const portals = [
    {
      title: 'Admin Portal',
      description: 'Register and manage educational institutions',
      icon: Shield,
      color: 'purple',
      path: '/admin',
    },
    {
      title: 'Institution Portal',
      description: 'Issue and manage academic credentials',
      icon: FileText,
      color: 'blue',
      path: '/institution',
    },
    {
      title: 'Student Portal',
      description: 'View and share your credentials',
      icon: CheckCircle,
      color: 'green',
      path: '/student',
    },
    {
      title: 'Verifier Portal',
      description: 'Verify transcript authenticity instantly',
      icon: Lock,
      color: 'orange',
      path: '/verifier',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Decentralized Transcript Verification
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
            Blockchain-powered credential verification. Issue once, verify anywhere, instantly.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push('/verifier')}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
            >
              Verify Now
            </button>
            <button
              onClick={() => router.push('/institution')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition text-lg font-semibold border-2 border-blue-600"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Portal Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {portals.map((portal, index) => (
            <PortalCard
              key={portal.path}
              {...portal}
              onClick={() => router.push(portal.path)}
              delay={index * 100}
            />
          ))}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="text-center animate-slide-up">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Instant Verification</h3>
            <p className="text-gray-600">Verify credentials in seconds, not days</p>
          </div>
          <div className="text-center animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Tamper-Proof</h3>
            <p className="text-gray-600">Blockchain-secured, impossible to forge</p>
          </div>
          <div className="text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Decentralized Storage</h3>
            <p className="text-gray-600">IPFS storage ensures permanent access</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600 mb-2">1,234</p>
            <p className="text-gray-600">Credentials Issued</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-purple-600 mb-2">45</p>
            <p className="text-gray-600">Verified Institutions</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-green-600 mb-2">98.7%</p>
            <p className="text-gray-600">Verification Success</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-orange-600 mb-2">&lt;2s</p>
            <p className="text-gray-600">Average Verify Time</p>
          </div>
        </div>
      </main>
    </div>
  );
}