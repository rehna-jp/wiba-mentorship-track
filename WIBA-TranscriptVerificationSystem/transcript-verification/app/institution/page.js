'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { Building, ArrowLeft, Upload, AlertCircle, Search, FileText, Loader2, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { issueCredential, getCredentialsByInstitution, revokeCredentialInDb } from '@/services/credentialService';
import { registerInstitution, isInstitutionVerified, issueTranscript, DegreeType, getDegreeTypeName ,doesInstitutionExist} from '@/lib/contracts';
import { uploadToPinata, calculateFileHash } from '@/lib/pinata'; // Use your existing Pinata functions
import { isAddress } from 'viem';
import { validateFile } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function InstitutionPage() {
  const router = useRouter();
  const { account, isConnected } = useWeb3();
  const [activeTab, setActiveTab] = useState('register');
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [institutionStatus, setInstitutionStatus] = useState('unknown');
  
  // Registration form state
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    country: '',
    accreditedURL: '',
    email: ''
  });

  // Issue transcript form state
  const [transcriptForm, setTranscriptForm] = useState({
    studentId: '',
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
      setCheckingStatus(true);
      
      // First check if institution exists
      const exists = await doesInstitutionExist(account);
      
      if (!exists) {
        setInstitutionStatus('not-registered');
        return;
      }
      
      // If exists, check if verified
      const verified = await isInstitutionVerified(account);
      setInstitutionStatus(verified ? 'verified' : 'registered');
      
    } catch (error) {
      console.error('Error checking institution status:', error);
      setInstitutionStatus('unknown');
    } finally {
      setCheckingStatus(false);
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

   const renderStatusMessage = () => {
    if (checkingStatus) {
      return (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-3">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <p className="text-blue-700">Checking institution status...</p>
        </div>
      );
    }

    switch (institutionStatus) {
      case 'verified':
        return (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Institution Verified</p>
              <p className="text-sm text-green-700">
                Your institution is verified and you can issue transcripts on the blockchain.
              </p>
            </div>
          </div>
        );
      
      case 'registered':
        return (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900">Registration Pending Verification</p>
              <p className="text-sm text-yellow-700">
                Your institution is registered but awaiting admin verification. You cannot issue transcripts yet.
              </p>
            </div>
          </div>
        );
      
      case 'not-registered':
        return (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start space-x-3">
            <UserPlus className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-900">Institution Not Registered</p>
              <p className="text-sm text-orange-700">
                Please register your institution first to start using the transcript system.
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start space-x-3">
            <XCircle className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900">Status Unknown</p>
              <p className="text-sm text-gray-700">
                Unable to determine institution status. Please try refreshing.
              </p>
            </div>
          </div>
        );
    }
  };

  // Registration handlers
  const handleRegistrationChange = (e) => {
    setRegistrationForm({
      ...registrationForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();

    if (!registrationForm.name.trim() || !registrationForm.country.trim() || !registrationForm.email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Registering institution on blockchain...');

    try {
      console.log('Registering institution:', registrationForm);

      const receipt = await registerInstitution(
        registrationForm.name,
        registrationForm.country,
        registrationForm.accreditedURL || '',
        registrationForm.email
      );

      console.log('Registration transaction receipt:', receipt);
      
      toast.success('Institution registered successfully! Please wait for admin verification.', { id: toastId });
      
      // Reset form
      setRegistrationForm({
        name: '',
        country: '',
        accreditedURL: '',
        email: ''
      });


      // Check status again
      await checkInstitutionStatus();
      
    } catch (error) {
      console.error('Error registering institution:', error);
      
      let errorMessage = 'Failed to register institution';
      if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (error.message?.includes('InstitutionAlreadyRegistered')) {
        errorMessage = 'This wallet address is already registered as an institution';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  // Transcript handlers
  const handleTranscriptChange = (e) => {
    setTranscriptForm({
      ...transcriptForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    try {
      validateFile(file);
      setTranscriptForm({ ...transcriptForm, file });
    } catch (error) {
      toast.error(error.message);
      e.target.value = '';
    }
  };

  const handleTranscriptSubmit = async (e) => {
    e.preventDefault();

     if (institutionStatus !== 'verified') {
      toast.error('Only verified institutions can issue transcripts');
      return;
    }

    if (!isAddress(transcriptForm.studentAddress)) {
      toast.error('Invalid student wallet address');
      return;
    }

    if (!transcriptForm.studentId.trim()) {
      toast.error('Please enter student ID');
      return;
    }

    if (!transcriptForm.file) {
      toast.error('Please upload a transcript file');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Uploading transcript and issuing on blockchain...');

    try {
      // Step 1: Calculate file hash
      toast.loading('Calculating file hash...', { id: toastId });
      const documentHash = await calculateFileHash(transcriptForm.file);
      
      // Step 2: Upload file to Pinata IPFS
      toast.loading('Uploading file to IPFS...', { id: toastId });
      const pinataResult = await uploadToPinata(transcriptForm.file, {
        name: `Transcript_${transcriptForm.studentId}`,
        keyvalues: {
          studentId: transcriptForm.studentId,
          institution: account,
          degreeType: getDegreeTypeName(parseInt(transcriptForm.credentialType)),
          graduationYear: transcriptForm.graduationYear.toString()
        }
      });

      const ipfsCid = pinataResult.ipfsHash;
      console.log('Pinata upload result:', pinataResult);

      console.log('Issuing transcript with data:', {
        studentId: transcriptForm.studentId,
        ipfsCid,
        documentHash,
        degreeType: parseInt(transcriptForm.credentialType),
        studentAddress: transcriptForm.studentAddress,
        graduationYear: parseInt(transcriptForm.graduationYear)
      });

      // Step 3: Issue transcript on blockchain
      toast.loading('Issuing transcript on blockchain...', { id: toastId });
      const receipt = await issueTranscript(
        transcriptForm.studentId,
        ipfsCid,
        documentHash,
        parseInt(transcriptForm.credentialType),
        transcriptForm.studentAddress,
        parseInt(transcriptForm.graduationYear)
      );

      console.log('Blockchain transaction receipt:', receipt);

      // Step 4: Store in Firebase database
      toast.loading('Storing in database...', { id: toastId });
      await issueCredential(
        transcriptForm.studentAddress,
        parseInt(transcriptForm.credentialType),
        parseInt(transcriptForm.graduationYear),
        transcriptForm.file,
        account,
        transcriptForm.studentId,
        ipfsCid,
        receipt.transactionHash,
        pinataResult.url // Store the Pinata gateway URL
      );

      toast.success('Transcript issued successfully on blockchain!', { id: toastId });
      
      // Reset form
      setTranscriptForm({
        studentId: '',
        studentAddress: '',
        credentialType: 0,
        graduationYear: new Date().getFullYear(),
        file: null,
      });
      document.getElementById('fileInput').value = '';

      // Switch to manage tab to see the new credential
      setActiveTab('manage');
      
    } catch (error) {
      console.error('Error issuing transcript:', error);
      
      let errorMessage = 'Failed to issue transcript';
      if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (error.message?.includes('Only verified institutions')) {
        errorMessage = 'Only verified institutions can issue transcripts';
      } else if (error.message?.includes('CID already used')) {
        errorMessage = 'This transcript has already been issued';
      } else if (error.message?.includes('Pinata')) {
        errorMessage = 'Failed to upload file to IPFS. Please check your Pinata configuration.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (credentialId, transcriptId) => {
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
      (cred.studentId && cred.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      cred.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isIssueTabDisabled = institutionStatus !== 'verified';
  const isManageTabDisabled = institutionStatus !== 'verified';

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Not Connected</h2>
          <p className="text-gray-600">Please connect your wallet to access the institution portal</p>
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
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <Building className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Institution Portal</h1>
            </div>
            <p className="text-gray-600">Register your institution and manage academic transcripts</p>
            
            {renderStatusMessage() }
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 border-b border-gray-200 mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('register')}
              className={`pb-4 px-4 font-semibold transition whitespace-nowrap ${
                activeTab === 'register'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Register Institution
            </button>
            <button
              onClick={() => setActiveTab('issue')}
              disabled={isIssueTabDisabled}
              className={`pb-4 px-4 font-semibold transition whitespace-nowrap ${
                activeTab === 'issue'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 disabled:opacity-50'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Issue Transcript
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              disabled={isManageTabDisabled}
              className={`pb-4 px-4 font-semibold transition whitespace-nowrap ${
                activeTab === 'manage'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 disabled:opacity-50'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Manage Transcripts
            </button>
          </div>

          {/* Register Institution Tab */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegistrationSubmit} className="max-w-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Institution Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={registrationForm.name}
                    onChange={handleRegistrationChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Harvard University"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={registrationForm.country}
                    onChange={handleRegistrationChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., USA"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Accredited Website URL
                  </label>
                  <input
                    type="url"
                    name="accreditedURL"
                    value={registrationForm.accreditedURL}
                    onChange={handleRegistrationChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://your-institution.edu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={registrationForm.email}
                    onChange={handleRegistrationChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contact@institution.edu"
                    required
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> After registration, your institution will need to be verified by the administrator before you can issue transcripts. This process ensures the integrity of the system.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || institutionStatus !== 'not-registered'}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Registering on Blockchain...</span>
                    </>
                  ) : (
                    <span>{
                      institutionStatus === 'verified'
                        ? 'Already Verified'
                        : institutionStatus === 'registered'
                          ? 'Awaiting Verification'
                          : 'Register Institution'
                    }</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Issue Transcript Tab */}
          {activeTab === 'issue' && (
            <form onSubmit={handleTranscriptSubmit} className="max-w-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Student ID *
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={transcriptForm.studentId}
                    onChange={handleTranscriptChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., STU20240001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Student Wallet Address *
                  </label>
                  <input
                    type="text"
                    name="studentAddress"
                    value={transcriptForm.studentAddress}
                    onChange={handleTranscriptChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="0x..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Degree Type *
                  </label>
                  <select
                    name="credentialType"
                    value={transcriptForm.credentialType}
                    onChange={handleTranscriptChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value={DegreeType.BACHELOR}>Bachelor's Degree</option>
                    <option value={DegreeType.MASTER}>Master's Degree</option>
                    <option value={DegreeType.DOCTORATE}>PhD/Doctorate</option>
                    <option value={DegreeType.ASSOCIATE}>Associate Degree</option>
                    <option value={DegreeType.DIPLOMA}>Diploma</option>
                    <option value={DegreeType.CERTIFICATE}>Certificate</option>
                    <option value={DegreeType.POSTDOCTORATE}>Postdoctoral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Graduation Year *
                  </label>
                  <input
                    type="number"
                    name="graduationYear"
                    value={transcriptForm.graduationYear}
                    onChange={handleTranscriptChange}
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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
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
                        {transcriptForm.file ? transcriptForm.file.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">PDF files only, max 10MB</p>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Issue Transcript on Blockchain</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Manage Transcripts Tab */}
          {activeTab === 'manage' && (
            <div>
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by student ID, address, or credential ID..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={loadCredentials}
                  disabled={loading}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Refresh</span>}
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">Loading credentials...</p>
                </div>
              ) : filteredCredentials.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">
                    {searchQuery ? 'No matching credentials found' : 'No transcripts issued yet'}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setActiveTab('issue')}
                      className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Issue First Transcript
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto -mx-6 md:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Address</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Degree Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IPFS CID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredCredentials.map((cred) => (
                            <tr key={cred.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{cred.studentId || 'N/A'}</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-gray-500 font-mono text-sm">
                                {cred.studentAddress.slice(0, 8)}...{cred.studentAddress.slice(-6)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-gray-600">
                                {getDegreeTypeName(cred.credentialType)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-gray-600">{cred.graduationYear}</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                {cred.ipfsCid ? (
                                  <a 
                                    href={cred.ipfsUrl || `https://gateway.pinata.cloud/ipfs/${cred.ipfsCid}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 font-mono text-sm"
                                  >
                                    {cred.ipfsCid.slice(0, 8)}...{cred.ipfsCid.slice(-6)}
                                  </a>
                                ) : (
                                  <span className="text-gray-400 text-sm">N/A</span>
                                )}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    cred.status === 'Active'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {cred.status}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-gray-500 text-sm">
                                {new Date(cred.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                {cred.status === 'Active' && (
                                  <button
                                    onClick={() => handleRevoke(cred.id, cred.transcriptId)}
                                    className="text-red-600 hover:text-red-900 font-semibold text-sm"
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
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                      <p className="text-sm text-gray-600 mb-1">Total Issued</p>
                      <p className="text-2xl font-bold text-blue-600">{credentials.length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                      <p className="text-sm text-gray-600 mb-1">Active</p>
                      <p className="text-2xl font-bold text-green-600">
                        {credentials.filter((c) => c.status === 'Active').length}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                      <p className="text-sm text-gray-600 mb-1">Revoked</p>
                      <p className="text-2xl font-bold text-red-600">
                        {credentials.filter((c) => c.status === 'Revoked').length}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}