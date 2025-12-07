'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { Shield, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { registerInstitutionInDb, getAllInstitutions, suspendInstitution, reactivateInstitution, verifyInstitutionAdmin } from '@/services/institutionService';
import { fetchRegisteredInstitutions, getInstitutionDetails } from '@/lib/contracts';
import { isAddress } from 'viem';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const router = useRouter();
  const { account, isConnected } = useWeb3();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [formData, setFormData] = useState({
    address: '',
    name: '',
    country: '',
    accreditedURL: '',
    email: ''
  });

  useEffect(() => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }
    
    // Check if user is admin
    const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase();
    const userIsAdmin = account?.toLowerCase() === adminAddress;
    setIsAdmin(userIsAdmin);
    
    if (!userIsAdmin) {
      toast.error('Access denied: Admin only');
      router.push('/');
      return;
    }

    loadInstitutions();
  }, [isConnected, account, router]);

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      // Fetch on-chain registered institutions
      const onChain = await fetchRegisteredInstitutions();

      // Fetch DB institutions to mark which are already saved
      const db = await getAllInstitutions();
      const dbSet = new Set((db || []).map(i => (i.address || '').toLowerCase()));

      const merged = (onChain || []).map(i => ({
        id: i.id,
        address: (i.walletAddress || i.address || '').toLowerCase(),
        name: i.name || '',
        country: i.country || '',
        accreditedURL: i.accreditedURL || '',
        email: i.email || '',
        isVerified: !!i.isVerified,
        status: i.isVerified ? 'Verified' : 'Pending',
        inDatabase: dbSet.has((i.walletAddress || i.address || '').toLowerCase())
      }));

      setInstitutions(merged);
    } catch (error) {
      console.error('Error loading institutions:', error);
      toast.error('Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Add verified institution to database using on-chain details
  const handleAddToDatabase = async (institutionAddress) => {
    try {
      setSubmitting(true);
      const toastId = toast.loading('Adding institution to database...');

      const details = await getInstitutionDetails(institutionAddress);
      await registerInstitutionInDb({
        address: institutionAddress,
        name: details?.name || '',
        country: details?.country || '',
        accreditedURL: details?.accreditedURL || '',
        email: details?.email || '',
        addedBy: account,
        isVerified: true,
        status: 'Active'
      });

      toast.success('Institution added to database', { id: toastId });
      await loadInstitutions();
    } catch (error) {
      console.error('Error adding institution to database:', error);
      toast.error(error?.message || 'Failed to add to database');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOnChain = async (institutionAddress) => {
    if (!confirm('Are you sure you want to verify this institution on blockchain?')) return;

    const toastId = toast.loading('Verifying institution on blockchain...');
    try {
      // Verify institution on blockchain
      const receipt = await verifyInstitutionAdmin(institutionAddress);
      console.log('Verification transaction receipt:', receipt);
      
      toast.success('Institution verified on blockchain!', { id: toastId });

      // Refresh list and auto-add to database if missing
      await loadInstitutions();
      const inst = institutions.find(i => i.address.toLowerCase() === institutionAddress.toLowerCase());
      if (!inst || !inst.inDatabase) {
        await handleAddToDatabase(institutionAddress);
      }
    } catch (error) {
      console.error('Error verifying institution on blockchain:', error);
      let errorMessage = 'Failed to verify institution on blockchain';
      
      if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction was rejected';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (error.message?.includes('InstitutionAlreadyVerified')) {
        errorMessage = 'Institution is already verified';
      } else if (error.message?.includes('InstitutionDoesNotExist')) {
        errorMessage = 'Institution not found on blockchain';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { id: toastId });
    }
  };

  const handleSuspend = async (institutionAddress) => {
    if (!confirm('Are you sure you want to suspend this institution?')) return;

    const toastId = toast.loading('Suspending institution...');
    try {
      await suspendInstitution(institutionAddress);
      toast.success('Institution suspended in database', { id: toastId });
      loadInstitutions();
    } catch (error) {
      toast.error('Failed to suspend institution', { id: toastId });
    }
  };

  const handleReactivate = async (institutionAddress) => {
    const toastId = toast.loading('Reactivating institution...');
    try {
      await reactivateInstitution(institutionAddress);
      toast.success('Institution reactivated', { id: toastId });
      loadInstitutions();
    } catch (error) {
      toast.error('Failed to reactivate institution', { id: toastId });
    }
  };

  // Show loading while checking admin status
  if (isConnected && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <Loader2 className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Not Connected</h2>
          <p className="text-gray-600">Please connect your wallet to access the admin portal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/')}
          className="text-blue-600 hover:text-blue-700 mb-6 flex items-center space-x-2 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Shield className="w-8 h-8 text-purple-600" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Portal</h1>
              </div>
              <p className="text-gray-600">Manage institutions registered on-chain: verify and add to database</p>
              <p className="text-sm text-orange-600 mt-1">
                Institutions must self-register on-chain. Admin verifies and adds to the database.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading institutions...</p>
            </div>
          ) : institutions.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No institutions registered on-chain yet</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-6 md:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Wallet Address</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On-Chain Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Database</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {institutions.map((inst) => (
                        <tr key={inst.address} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="font-medium text-gray-900">{inst.name || '—'}</div>
                            <div className="text-gray-500 text-sm">{inst.email || '—'}</div>
                            <div className="text-gray-500 text-sm font-mono md:hidden">
                              {inst.address.slice(0, 6)}...{inst.address.slice(-4)}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-500 font-mono text-sm hidden md:table-cell">
                            {inst.address.slice(0, 8)}...{inst.address.slice(-6)}
                          </td>
                          <td className="px-4 py-4 text-gray-600">{inst.country || '—'}</td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${inst.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {inst.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {inst.inDatabase ? (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Present</span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Missing</span>
                            )}
                          </td>
                          <td className="px-4 py-4 space-y-2 sm:space-y-0 sm:space-x-2">
                            {!inst.isVerified && (
                              <button
                                onClick={() => handleVerifyOnChain(inst.address)}
                                className="text-blue-600 hover:text-blue-900 font-semibold text-sm block sm:inline-block mb-2 sm:mb-0"
                                disabled={submitting}
                              >
                                Verify on Chain
                              </button>
                            )}

                            {inst.isVerified && !inst.inDatabase && (
                              <button
                                onClick={() => handleAddToDatabase(inst.address)}
                                className="text-purple-600 hover:text-purple-900 font-semibold text-sm block sm:inline-block"
                                disabled={submitting}
                              >
                                Add to Database
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
                  <p className="text-sm text-gray-600 mb-1">Total On-Chain</p>
                  <p className="text-2xl font-bold text-purple-600">{institutions.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                  <p className="text-sm text-gray-600 mb-1">Verified</p>
                  <p className="text-2xl font-bold text-green-600">
                    {institutions.filter((i) => i.isVerified).length}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                  <p className="text-sm text-gray-600 mb-1">In Database</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {institutions.filter((i) => i.inDatabase).length}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}