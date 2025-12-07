'use client';

import { useState, useEffect } from 'react';
import { User, ExternalLink, Copy, Download, AlertCircle, FileText, RefreshCw } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { getCredentialsByStudent } from '@/services/credentialService';
import { credentialTypes } from '@/lib/utils';
import { copyToClipboard } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function StudentPortal() {
  const { account, isConnected } = useWeb3();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && account) {
      loadCredentials();
    }
  }, [isConnected, account]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const data = await getCredentialsByStudent(account);
      setCredentials(data);
    } catch (error) {
      console.error('Error loading credentials:', error);
      toast.error('Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text, label) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success(`${label} copied to clipboard!`);
    } else {
      toast.error('Failed to copy');
    }
  };

  const handleViewOnIPFS = (ipfsUrl) => {
    window.open(ipfsUrl, '_blank');
  };

  const handleDownload = (ipfsUrl, credentialId) => {
    const link = document.createElement('a');
    link.href = ipfsUrl;
    link.download = `credential-${credentialId}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Not Connected</h2>
        <p className="text-gray-600">Please connect your wallet to view your credentials</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <User className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Credentials</h1>
          </div>
          <p className="text-gray-600">View and share your academic credentials</p>
        </div>
        <button
          onClick={loadCredentials}
          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="loading-spinner mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading credentials...</p>
        </div>
      ) : credentials.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No credentials found</p>
          <p className="text-gray-500 mt-2">Your issued credentials will appear here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {credentials.map((cred, index) => (
            <div
              key={cred.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {credentialTypes[cred.credentialType]}
                  </h3>
                  <p className="text-gray-600 font-mono text-sm">
                    Institution: {cred.institutionAddress.slice(0, 10)}...{cred.institutionAddress.slice(-8)}
                  </p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    cred.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {cred.status}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Credential ID</p>
                  <p className="font-mono text-sm text-gray-900">{cred.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Graduation Year</p>
                  <p className="font-semibold text-gray-900">{cred.graduationYear}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Issue Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(cred.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">IPFS CID</p>
                  <p className="font-mono text-xs text-gray-900">{cred.ipfsCid}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Document Hash</p>
                  <p className="font-mono text-xs text-gray-900 break-all">{cred.documentHash}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleViewOnIPFS(cred.ipfsUrl)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View on IPFS</span>
                </button>
                <button
                  onClick={() => handleDownload(cred.ipfsUrl, cred.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => handleCopy(cred.ipfsCid, 'IPFS CID')}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy CID</span>
                </button>
                <button
                  onClick={() => handleCopy(cred.documentHash, 'Document Hash')}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Hash</span>
                </button>
              </div>

              {cred.transactionHash && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Blockchain Verification</p>
                  <a
                    href={`https://mumbai.polygonscan.com/tx/${cred.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm font-mono flex items-center space-x-2 hover:underline"
                  >
                    <span>{cred.transactionHash.slice(0, 10)}...{cred.transactionHash.slice(-8)}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      {!loading && credentials.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">How to Share Your Credentials</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>Copy CID:</strong> Share the IPFS content identifier with anyone</li>
                <li>• <strong>Copy Hash:</strong> Provide the document hash for verification</li>
                <li>• <strong>View on IPFS:</strong> Access your document from any IPFS gateway</li>
                <li>• <strong>Verify:</strong> Employers can verify using the Verifier Portal</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {!loading && credentials.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Total Credentials</p>
            <p className="text-3xl font-bold text-green-600">{credentials.length}</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Active</p>
            <p className="text-3xl font-bold text-blue-600">
              {credentials.filter((c) => c.status === 'Active').length}
            </p>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Institutions</p>
            <p className="text-3xl font-bold text-purple-600">
              {new Set(credentials.map(c => c.institutionAddress)).size}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}