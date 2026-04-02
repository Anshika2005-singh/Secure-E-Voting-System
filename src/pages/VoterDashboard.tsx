import { useState, useEffect } from 'react';
import { ShieldAlert, Vote, CheckCircle2, FileText, Calendar, ChevronRight, X, Smartphone, Key, Info, Loader2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Box, Flex, Stack, Text, Heading } from '../components/ui/core';

export const VoterDashboard = () => {
  const [verified, setVerified] = useState(false);
  const [analytics, setAnalytics] = useState({ totalVoters: '...', verifiedIdentities: '...', networkHealth: 'Querying...' });
  const [voterName, setVoterName] = useState('');
  
  // Verification Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [clientId, setClientId] = useState('');
  const [verificationStep, setVerificationStep] = useState<'aadhaar' | 'otp'>('aadhaar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if previously verified in this session
    const saved = localStorage.getItem('voter_verified');
    if (saved === 'true') {
      setVerified(true);
      setVoterName(localStorage.getItem('voter_name') || '');
    }

    // Simulating production API call to our new Node.js backend
    fetch('http://localhost:3001/api/analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(() => setAnalytics({ totalVoters: '142.5M', verifiedIdentities: '85.2M', networkHealth: 'Optimal' })); // Fallback
  }, []);

  const handleSendOtp = async () => {
    if (aadhaar.length !== 12) {
      setError('Aadhaar number must be 12 digits');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const resp = await fetch('http://localhost:3001/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_number: aadhaar }) // Matches AadhaarKYC param
      });
      const result = await resp.json();
      if (result.success) {
        setClientId(result.data.client_id);
        setVerificationStep('otp');
      } else {
        setError(result.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Server unreachable. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const resp = await fetch('http://localhost:3001/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, otp }) // Matches AadhaarKYC param
      });
      const result = await resp.json();
      if (result.success) {
        setVerified(true);
        setVoterName(result.data.full_name);
        localStorage.setItem('voter_verified', 'true');
        localStorage.setItem('voter_name', result.data.full_name);
        localStorage.setItem('voter_aadhaar', result.data.aadhaar_number);
        setIsModalOpen(false);
      } else {
        setError(result.message || 'Incorrect OTP');
      }
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const activeElections = [
    { id: 1, title: 'National General Election 2026', type: 'Federal', endDate: 'Nov 03, 2026', status: 'Live', voters: analytics.totalVoters },
    { id: 2, title: 'State Infrastructure Bond Proposal', type: 'State', endDate: 'May 15, 2026', status: 'Live', voters: '4.2M' },
    { id: 3, title: 'Municipal Corporation Elections – Ward 42', type: 'Municipal', endDate: 'Jun 20, 2026', status: 'Live', voters: '85K' }
  ];

  return (
    <Stack gap={12} className="max-w-5xl mx-auto py-8">
      {/* Header & Verification Profile */}
      <Flex direction="col" align="start" justify="between" gap={8} className="lg:flex-row">
          <Stack gap={2}>
            <Heading size="md" as="h1">Voter <Text variant="gradient">Portal</Text></Heading>
            <Flex align="center" gap={3}>
              <Text variant="sm">Network: <Text className="text-brand-success font-bold">{analytics.networkHealth}</Text></Text>
              <Box className="w-1 h-1 rounded-full bg-brand-surface/40" />
              <Text variant="sm">Identity: <Text className="text-brand-primary font-bold">{analytics.verifiedIdentities}</Text></Text>
              {voterName && (
                <>
                  <Box className="w-1 h-1 rounded-full bg-brand-surface/40" />
                  <Text variant="sm">User: <Text className="text-brand-primary font-bold">{voterName}</Text></Text>
                </>
              )}
            </Flex>
          </Stack>
        
        <Flex align="center" gap={6} className="glass-card p-6 w-full lg:w-auto bg-white/40 border-brand-surface/20">
          <Box className={`p-4 rounded-full transition-colors duration-500 ${verified ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-primary/10 text-brand-primary animate-pulse'}`}>
            <ShieldCheck size={32} />
          </Box>
          <Box className="flex-1">
            {verified ? (
              <Stack gap={1}>
                <Flex align="center" gap={2} className="font-bold text-lg text-brand-text">
                  Identity Verified <CheckCircle2 size={18} className="text-brand-success" />
                </Flex>
                <Text variant="xs" className="font-mono text-[#50667a] uppercase tracking-widest">Aadhaar Profile: Linked</Text>
                <button
                  onClick={() => {
                    localStorage.removeItem('voter_verified');
                    localStorage.removeItem('voter_name');
                    localStorage.removeItem('voter_aadhaar');
                    setVerified(false);
                    setVoterName('');
                    setAadhaar('');
                    setOtp('');
                    setVerificationStep('aadhaar');
                    setIsModalOpen(true);
                  }}
                  className="text-xs font-bold text-brand-primary hover:underline mt-1 text-left"
                >
                  Re-verify / Change Identity
                </button>
              </Stack>
            ) : (
              <Stack gap={3}>
                <Flex align="center" gap={2} className="font-bold text-lg text-brand-text">
                  <ShieldAlert size={18} className="text-brand-primary" /> Verification Required
                </Flex>
                <Box 
                  as="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-sm font-semibold text-brand-primary hover:text-[#6e94b5] transition-colors underline decoration-brand-primary/30 underline-offset-4 text-left"
                >
                  Verify Now using Aadhaar OTP
                </Box>
              </Stack>
            )}
          </Box>
        </Flex>
      </Flex>

      {/* Verification Modal */}
      {isModalOpen && (
        <Box className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Box className="glass-card w-full max-w-md bg-white p-8 relative shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => { setIsModalOpen(false); setVerificationStep('aadhaar'); setError(''); }}
              className="absolute top-4 right-4 p-2 hover:bg-brand-surface/10 rounded-full transition-colors"
            >
              <X size={20} className="text-[#50667a]" />
            </button>

            <Stack gap={8}>
              <Stack gap={2} className="text-center">
                <Box className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Smartphone size={32} className="text-brand-primary" />
                </Box>
                <Heading size="xs">Identity Verification</Heading>
                <Text variant="sm">Secure login powered by Aadhaar Data Vault</Text>
              </Stack>

              {error && (
                <Flex align="center" gap={2} className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                  <ShieldAlert size={16} /> {error}
                </Flex>
              )}

              {verificationStep === 'aadhaar' ? (
                <Stack gap={6}>
                  <Stack gap={2}>
                    <Text variant="sm" weight="bold">Aadhaar Number</Text>
                    <Box className="relative">
                      <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-[#50667a]">
                        <Smartphone size={18} />
                      </Box>
                      <input 
                        type="text" 
                        maxLength={12}
                        placeholder="XXXX XXXX XXXX"
                        className="input-primary !pl-12 !bg-brand-surface/5"
                        value={aadhaar}
                        onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                      />
                    </Box>
                    <Text variant="xs" className="flex items-center gap-1 text-brand-primary font-medium bg-brand-primary/5 p-2 rounded-lg">
                      <Info size={12} /> MOCK MODE: Enter any 12-digit number (e.g., 123456789012)
                    </Text>
                  </Stack>

                  <button 
                    className="btn-primary w-full h-14"
                    onClick={handleSendOtp}
                    disabled={loading || aadhaar.length !== 12}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Request OTP'}
                  </button>
                </Stack>
              ) : (
                <Stack gap={6}>
                  <Stack gap={2}>
                    <Text variant="sm" weight="bold">Enter 6-digit OTP</Text>
                    <Box className="relative">
                      <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-[#50667a]">
                        <Key size={18} />
                      </Box>
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="······"
                        className="input-primary !pl-12 !bg-brand-surface/5 text-center tracking-[0.5em] text-xl font-bold"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      />
                    </Box>
                    <Text variant="xs" className="text-center text-brand-primary font-medium bg-brand-primary/5 p-2 rounded-lg">
                      MOCK MODE: Use OTP <code className="bg-brand-primary/10 px-1 rounded">123456</code> to verify
                    </Text>
                  </Stack>

                  <button 
                    className="btn-primary w-full h-14"
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Verify & Continue'}
                  </button>

                  <button 
                    className="text-sm font-bold text-brand-primary"
                    onClick={() => setVerificationStep('aadhaar')}
                    disabled={loading}
                  >
                    Change Aadhaar Number
                  </button>
                </Stack>
              )}

              <Box className="p-4 bg-brand-surface/5 rounded-2xl">
                <Text variant="xs" className="text-center leading-relaxed">
                  By continuing, you agree to UIDAI terms of service. Your identity remains anonymous on the blockchain via ZK-Proofs.
                </Text>
              </Box>
            </Stack>
          </Box>
        </Box>
      )}

      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Elections */}
        <Stack gap={6} className="lg:col-span-2">
          <Flex align="center" justify="between">
            <Heading size="xs" as="h2" className="flex items-center gap-2">
              <Vote size={20} className="text-brand-primary" /> Active Elections
            </Heading>
            <Box as="span" className="text-sm text-brand-success font-medium bg-brand-success/10 px-3 py-1 rounded-full">
              {activeElections.length} Live
            </Box>
          </Flex>

          <Stack gap={4}>
            {activeElections.map(election => (
              <Box key={election.id} className="glass-card glass-card-hover p-6 group bg-white/40 border-brand-surface/20">
                <Flex direction="col" align="start" justify="between" gap={6} className="sm:flex-row sm:items-center">
                  <Stack gap={3}>
                    <Flex gap={2}>
                      <Box as="span" className="px-2.5 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-wider">
                        {election.type}
                      </Box>
                      <Box as="span" className="px-2.5 py-0.5 rounded-md bg-brand-surface/20 text-[#50667a] text-[10px] font-bold uppercase tracking-wider">
                        {election.voters} Voters
                      </Box>
                    </Flex>
                    <Heading size="xs" as="h3" className="group-hover:text-brand-primary transition-colors">{election.title}</Heading>
                    <Flex align="center" gap={4} className="text-sm text-[#50667a] font-medium">
                      <Flex align="center" gap={1.5}><Calendar size={14} /> Closes: {election.endDate}</Flex>
                      <Flex align="center" gap={1.5} className="text-brand-success">
                        <Box className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" /> {election.status}
                      </Flex>
                    </Flex>
                  </Stack>
                  
                  <Link to={verified ? "/elections" : "#"} className="w-full sm:w-auto">
                    <Box 
                      as="button"
                      className={`btn-primary w-full sm:w-auto !py-2.5 !px-5 text-sm ${!verified && 'opacity-30 cursor-not-allowed grayscale'}`}
                      disabled={!verified}
                    >
                      Cast Ballot <ChevronRight size={16} />
                    </Box>
                  </Link>
                </Flex>
              </Box>
            ))}
          </Stack>
        </Stack>

        {/* Voting History Sidebar */}
        <Stack gap={6}>
          <Heading size="xs" as="h2" className="flex items-center gap-2">
            <FileText size={20} className="text-brand-secondary" /> Voting History
          </Heading>
          
          <Stack gap={4} align="center" className="glass-card p-10 text-center bg-white/40 border-brand-surface/20">
            <Box className="w-16 h-16 bg-brand-surface/10 rounded-2xl flex items-center justify-center text-[#50667a]">
              <FileText size={32} />
            </Box>
            <Stack gap={1}>
              <Text weight="bold" className="text-[#50667a]">No History Found</Text>
              <Text variant="sm" className="leading-relaxed">
                Your past votes will appear here once as encrypted receipts.
              </Text>
            </Stack>
            <Link to="/verify">
              <Box as="button" className="text-xs font-bold text-brand-primary hover:underline tracking-wider uppercase">
                Verify Receipt Hash
              </Box>
            </Link>
          </Stack>
          
          <Box className="glass-card p-6 bg-brand-secondary/5 border-brand-secondary/10">
            <Heading size="xs" as="h4" className="mb-2 text-brand-text">Did you know?</Heading>
            <Text variant="sm" className="font-light leading-relaxed">
              Every vote you cast is cryptographically signed using your private key and recorded on the immutable ledger forever.
            </Text>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
};
