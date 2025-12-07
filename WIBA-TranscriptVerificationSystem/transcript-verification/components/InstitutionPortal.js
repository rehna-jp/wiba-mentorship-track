'use client';

import { useState, useEffect } from 'react';
import { Building, Upload, AlertCircle, Search, FileText, RefreshCw } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { issueCredential, getCredentialsByInstitution, revokeCredentialInDb } from '@/services/credentialService';
import { isInstitutionVerified } from '@/lib/contracts';
import { isValidAddress } from '@/lib/web3';
import { validateFile, credentialTypes } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function InstitutionPortal() {
  const { account, isConnected } = useWeb3();
  const [activeTab, setActiveTab] = useState('issue');
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    studentAddress: '',
    credentialType: 0,
    graduationYear: new Date().getFullYear(),
    file: null,
  });

  useEffect(() => {
    if (isConnected && account) {
      checkInstitutionStatus();
      if (activeTab === 'manage') {
        loadCredentials();
      }
    }
  }, [isConnected, account, activeTab]);

  const checkInstitutionStatus = async () => {
    try {
      const verified = await isInstitutionVerified(account);
      setIsVerified(verified);
      if (!verified) {
        toast.error('Your institution is not verified. Contact admin.');
      }
    } catch (error) {
      console.error('Error checking institution status:', error);
    }
  };

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const data = await getCredentialsByInstitution(account);
      setCredentials(data);
    } catch (error) {
      console.error('Error loading credentials:', error);
      toast.error('Failed to load credentials');
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    try {
      validateFile(file);
      setFormData({ ...formData, file });
      toast.success('File selected: ' + file.name);
    } catch (error) {
      toast.error(error.message);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isVerified) {
      toast.error('Only verified institutions can issue credentials');
      return;
    }

    if (!isValidAddress(formData.studentAddress)) {
      toast.error('Invalid student wallet address');
      return;
    }

    if (!formData.file) {
      toast.error('Please upload a transcript file');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Issuing credential...');

    try {
      await issueCredential(
        formData.studentAddress,
        parseInt(formData.credentialType),
        parseInt(formData.graduationYear),
        formData.file,
        account
      );

      toast.success('Credential issued successfully!', { id: toastId });
      setFormData({
        studentAddress: '',
        credentialType: 0,
        graduationYear: new Date().getFullYear(),
        file: null,
      });
      document.getElementById('fileInput').value = '';
    } catch (error) {
      console.error('Error issuing credential:', error);
      toast.error(error.message || 'Failed to issue credential', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (credentialId) => {
    if (!confirm('Are you sure you want to revoke this credential?')) return;

    const reason = prompt('Please enter revocation reason:');
    if (!reason) return;

    const toastId = toast.loading('Revoking credential...');
    try {
      await revokeCredentialInDb(credentialId, reason);
      toast.success('Credential revoked', { id: toastId });
      loadCredentials();
    } catch (error) {
      toast.error('Failed to revoke credential', { id: toastId });
    }
  };

  const filteredCredentials = credentials.filter(
    (cred) =>
      cred.studentAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Not Connected</h2>
        <p className="text-gray-600">Please connect your wallet to access the institution portal</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <Building className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Institution Portal</h1>
        </div>
        <p className="text-gray-600">Issue and manage academic credentials</p>
        {!isVerified && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-900">Institution Not Verified</p>
              <p className="text-sm text-yellow-700">Contact the administrator to verify your institution</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('issue')}
          className={`pb-4 px-6 font-semibold transition ${
            activeTab === 'issue'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Issue Credential
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`pb-4 px-6 font-semibold transition ${
            activeTab === 'manage'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Manage Credentials
        </button>
      </div>

      {/* Issue Credential Tab */}
      {activeTab === 'issue' && (
        <form onSubmit={handleSubmit} className="max-w-2xl bg-white p-8 rounded-xl shadow-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student Wallet Address *
              </label>
              <input
                type="text"
                name="studentAddress"
                value={formData.studentAddress}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="0x..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Credential Type *
              </label>
              <select
                name="credentialType"
                value={formData.credentialType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value={0}>Bachelor's Degree</option>
                <option value={1}>Master's Degree</option>
                <option value={2}>PhD</option>
                <option value={3}>Diploma</option>
                <option value={4}>Certificate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Graduation Year *
              </label>
              <input
                type="number"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1900"
                max={new Date().getFullYear() + 10}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Transcript (PDF) *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer file-drop-zone">
                <input
                  id="fileInput"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <label htmlFor="fileInput" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    {formData.file ? (
                      <span className="text-blue-600 font-semibold">{formData.file.name}</span>
                    ) : (
                      'Click to upload or drag and drop'
                    )}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">PDF files only, max 10MB</p>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !isVerified}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="loading-spinner w-5 h-5 border-2"></div>
                  <span>Issuing Credential...</span>
                </>
              ) : (
                <span>Issue Credential</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Manage Credentials Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by credential ID or student address..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
            <div className="text-center py-12 bg-white rounded-xl">
              <div className="loading-spinner mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading credentials...</p>
            </div>
          ) : filteredCredentials.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No credentials found</p>
              <p className="text-gray-500 mt-2">Issue your first credential to get started</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Credential ID</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Student Address</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Type</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Year</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Issued</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCredentials.map((cred) => (
                        <tr key={cred.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                          <td className="py-4 px-6 font-mono text-sm text-gray-900">{cred.id}</td>
                          <td className="py-4 px-6 font-mono text-sm text-gray-600">
                            {cred.studentAddress.slice(0, 6)}...{cred.studentAddress.slice(-4)}
                          </td>
                          <td className="py-4 px-6 text-gray-600">{credentialTypes[cred.credentialType]}</td>
                          <td className="py-4 px-6 text-gray-600">{cred.graduationYear}</td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                cred.status === 'Active'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {cred.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-600">
                            {new Date(cred.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6">
                            {cred.status === 'Active' && (
                              <button
                                onClick={() => handleRevoke(cred.id)}
                                className="text-red-600 hover:text-red-700 font-semibold transition"
                              >
                                Revoke
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
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Total Issued</p>
                  <p className="text-3xl font-bold text-blue-600">{credentials.length}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Active</p>
                  <p className="text-3xl font-bold text-green-600">
                    {credentials.filter((c) => c.status === 'Active').length}
                  </p>
                </div>
                <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                  <p className="text-sm text-gray-600 mb-1">Revoked</p>
                  <p className="text-3xl font-bold text-red-600">
                    {credentials.filter((c) => c.status === 'Revoked').length}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}