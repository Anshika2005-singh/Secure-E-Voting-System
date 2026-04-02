import { useState, useEffect } from 'react';
import { 
  ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Cpu, Lock, 
  Smartphone, Key, Info, Loader2, AlertTriangle, Vote, Calendar, 
  Users, ChevronRight, Fingerprint, Hash, Copy, ExternalLink, Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Flex, Stack, Text, Heading } from '../components/ui/core';

// ─── Election & Candidate Data ───────────────────────────────────────
interface Candidate {
  id: string;
  name: string;
  party: string;
  symbol: string;
  platform: string;
}

interface Election {
  id: string;
  title: string;
  type: 'Federal' | 'State' | 'Local' | 'Municipal';
  endDate: string;
  status: 'Live' | 'Upcoming' | 'Closed';
  totalVoters: string;
  constituency: string;
  candidates: Candidate[];
}

const ELECTIONS: Election[] = [
  {
    id: 'e1',
    title: 'National General Election 2026',
    type: 'Federal',
    endDate: 'Nov 03, 2026',
    status: 'Live',
    totalVoters: '142.5M',
    constituency: 'All India – Lok Sabha',
    candidates: [
      { id: 'c1', name: 'Dr. Sarah Chen', party: 'Progressive Future', symbol: '🌿', platform: 'Sustainable tech and universal basic income for the digital age.' },
      { id: 'c2', name: 'Marcus Johnson', party: 'Liberty Coalition', symbol: '🦅', platform: 'Free market expansion and tax reform to drive innovation.' },
      { id: 'c3', name: 'Elena Rodriguez', party: 'Earth First', symbol: '🌍', platform: 'Aggressive climate action and green energy transition for all.' },
      { id: 'c4', name: 'Rajesh Kumar', party: 'National Democratic Front', symbol: '🏛️', platform: 'Strong governance, national security, and infrastructure development.' },
    ]
  },
  {
    id: 'e2',
    title: 'State Infrastructure Bond Proposal',
    type: 'State',
    endDate: 'May 15, 2026',
    status: 'Live',
    totalVoters: '4.2M',
    constituency: 'Delhi NCR – State Legislature',
    candidates: [
      { id: 's1', name: 'Vote YES', party: 'In Favor', symbol: '✅', platform: 'Approve ₹50,000 Cr infrastructure bond for roads, metros, and smart city projects.' },
      { id: 's2', name: 'Vote NO', party: 'Against', symbol: '❌', platform: 'Oppose the bond citing fiscal responsibility and existing budget overruns.' },
    ]
  },
  {
    id: 'e3',
    title: 'Municipal Corporation Elections – Ward 42',
    type: 'Municipal',
    endDate: 'Jun 20, 2026',
    status: 'Live',
    totalVoters: '85K',
    constituency: 'Ward 42 – South Delhi MCD',
    candidates: [
      { id: 'm1', name: 'Priya Sharma', party: 'Clean City Alliance', symbol: '🏗️', platform: 'Waste management reform, green parks, and sustainable urban planning.' },
      { id: 'm2', name: 'Anil Gupta', party: 'People\'s Welfare Party', symbol: '🤝', platform: 'Affordable housing, water supply improvement, and community centres.' },
      { id: 'm3', name: 'Fatima Khan', party: 'Independent', symbol: '⭐', platform: 'Transparency in ward funds, CCTV coverage, and women\'s safety initiatives.' },
    ]
  },
];

// ─── Step Definitions ────────────────────────────────────────────────
type VotingStep = 'verify' | 'select-election' | 'select-candidate' | 'confirm' | 'processing' | 'receipt';

const STEP_CONFIG = [
  { key: 'verify' as const, label: 'Identity', icon: Fingerprint },
  { key: 'select-election' as const, label: 'Election', icon: Vote },
  { key: 'select-candidate' as const, label: 'Candidate', icon: Users },
  { key: 'confirm' as const, label: 'Confirm', icon: ShieldCheck },
  { key: 'receipt' as const, label: 'Receipt', icon: Hash },
];

export const ElectionVotingInterface = () => {
  const navigate = useNavigate();

  // ─── Flow State ──────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<VotingStep>('verify');
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  // ─── Vote Outcome ────────────────────────────────────────────────
  const [generatedHash, setGeneratedHash] = useState('');
  const [voteId, setVoteId] = useState('');
  const [blockNumber, setBlockNumber] = useState(0);
  const [voteTimestamp, setVoteTimestamp] = useState('');

  // ─── Aadhaar Verification ────────────────────────────────────────
  const [isVerified, setIsVerified] = useState(false);
  const [voterName, setVoterName] = useState('');
  const [voterAadhaar, setVoterAadhaar] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [clientId, setClientId] = useState('');
  const [verificationStep, setVerificationStep] = useState<'aadhaar' | 'otp'>('aadhaar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedVerified = localStorage.getItem('voter_verified');
    const savedName = localStorage.getItem('voter_name');
    const savedAadhaar = localStorage.getItem('voter_aadhaar');
    if (savedVerified === 'true' && savedName && savedAadhaar) {
      setIsVerified(true);
      setVoterName(savedName);
      setVoterAadhaar(savedAadhaar);
      setCurrentStep('select-election');
    }
  }, []);

  // ─── Aadhaar OTP Handlers ────────────────────────────────────────
  const handleSendOtp = async () => {
    if (aadhaar.length !== 12) { setError('Aadhaar number must be 12 digits'); return; }
    setLoading(true); setError('');
    try {
      const resp = await fetch('http://localhost:3001/api/otp/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_number: aadhaar })
      });
      const result = await resp.json();
      if (result.success) {
        setClientId(result.data.client_id);
        setVerificationStep('otp');
      } else {
        setError(result.message || 'Failed to send OTP');
      }
    } catch { setError('Server unreachable. Make sure backend is running.'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setError('OTP must be 6 digits'); return; }
    setLoading(true); setError('');
    try {
      const resp = await fetch('http://localhost:3001/api/otp/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, otp })
      });
      const result = await resp.json();
      if (result.success) {
        setIsVerified(true);
        setVoterName(result.data.full_name);
        setVoterAadhaar(result.data.aadhaar_number);
        localStorage.setItem('voter_verified', 'true');
        localStorage.setItem('voter_name', result.data.full_name);
        localStorage.setItem('voter_aadhaar', result.data.aadhaar_number);
        setCurrentStep('select-election');
      } else {
        setError(result.message || 'Incorrect OTP');
      }
    } catch { setError('Verification failed'); }
    finally { setLoading(false); }
  };

  // ─── Election & Candidate Selection ──────────────────────────────
  const handleSelectElection = (election: Election) => {
    setSelectedElection(election);
    setSelectedCandidate(null);
    setCurrentStep('select-candidate');
  };

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidate(candidateId);
  };

  const handleProceedToConfirm = () => {
    if (selectedCandidate && selectedElection) {
      setCurrentStep('confirm');
    }
  };

  // ─── Vote Submission ─────────────────────────────────────────────
  const handleCastVote = async () => {
    if (!selectedCandidate || !selectedElection || !isVerified) return;

    setCurrentStep('processing');

    // Step 1: Encrypt (simulated)
    await new Promise(r => setTimeout(r, 1800));

    // Step 2: Generate receipt
    const newHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const newVoteId = 'VC-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const newBlock = Math.floor(Math.random() * 1000000) + 5000000;
    const timestamp = new Date().toISOString();

    setGeneratedHash(newHash);
    setVoteId(newVoteId);
    setBlockNumber(newBlock);
    setVoteTimestamp(timestamp);

    const candidate = selectedElection.candidates.find(c => c.id === selectedCandidate);

    if (candidate) {
      localStorage.setItem('voteReceipt', JSON.stringify({
        hash: newHash,
        voteId: newVoteId,
        timestamp,
        candidateName: candidate.name,
        party: candidate.party,
        electionTitle: selectedElection.title,
        blockNumber: newBlock,
      }));
    }

    // Record on backend
    try {
      await fetch('http://localhost:3001/api/voter/record-vote', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          aadhaar_number: voterAadhaar,
          txHash: newHash,
          voteId: newVoteId,
          election: selectedElection.title,
          candidateEncrypted: `enc_0x${candidate?.id || 'unknown'}`,
          blockNumber: newBlock,
        })
      });
    } catch (e) { console.error('Failed to record vote:', e); }

    // Clear session verification
    localStorage.removeItem('voter_verified');
    localStorage.removeItem('voter_name');
    localStorage.removeItem('voter_aadhaar');

    // Brief delay then show receipt
    await new Promise(r => setTimeout(r, 1500));
    setCurrentStep('receipt');
  };

  // ─── Copy Hash Utility ───────────────────────────────────────────
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Step Index for Stepper ──────────────────────────────────────
  const getStepIndex = () => {
    const map: Record<VotingStep, number> = {
      'verify': 0, 'select-election': 1, 'select-candidate': 2,
      'confirm': 3, 'processing': 3, 'receipt': 4,
    };
    return map[currentStep];
  };

  // ─── Stepper Component ──────────────────────────────────────────
  const renderStepper = () => {
    const activeIndex = getStepIndex();
    return (
      <Flex align="center" justify="center" gap={0} className="w-full max-w-3xl mx-auto mb-10">
        {STEP_CONFIG.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === activeIndex;
          const isCompleted = i < activeIndex;
          const isLast = i === STEP_CONFIG.length - 1;

          return (
            <Flex key={step.key} align="center" className="flex-1 last:flex-initial">
              <Flex direction="col" align="center" gap={2} className="relative z-10 min-w-[60px]">
                <Box className={`
                  w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 relative
                  ${isCompleted ? 'bg-brand-success text-white shadow-lg shadow-brand-success/30' : ''}
                  ${isActive ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30 scale-110' : ''}
                  ${!isActive && !isCompleted ? 'bg-brand-surface/15 text-brand-surface/50' : ''}
                `}>
                  {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={18} />}
                  {isActive && (
                    <Box className="absolute inset-0 rounded-full bg-brand-primary/30 animate-ping" />
                  )}
                </Box>
                <Text variant="xs" weight={isActive ? 'bold' : 'medium'} className={`
                  transition-colors duration-300 whitespace-nowrap
                  ${isActive ? 'text-brand-primary' : isCompleted ? 'text-brand-success' : 'text-brand-surface/50'}
                `}>
                  {step.label}
                </Text>
              </Flex>
              {!isLast && (
                <Box className={`
                  flex-1 h-0.5 mx-1 rounded-full transition-all duration-500
                  ${isCompleted ? 'bg-brand-success' : 'bg-brand-surface/15'}
                `} />
              )}
            </Flex>
          );
        })}
      </Flex>
    );
  };

  // ═══════════════════════════════════════════════════════════════════
  // STEP 1: AADHAAR VERIFICATION
  // ═══════════════════════════════════════════════════════════════════
  const renderVerifyStep = () => (
    <Stack gap={8} className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Stack gap={2} className="text-center">
        <Box className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-2">
          <Fingerprint size={40} className="text-brand-primary" />
        </Box>
        <Heading size="sm" as="h2">Verify Your Identity</Heading>
        <Text variant="lead" className="max-w-sm mx-auto">
          Secure Aadhaar-based authentication before casting your vote
        </Text>
      </Stack>

      {error && (
        <Flex align="center" gap={2} className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm animate-in shake duration-300">
          <AlertTriangle size={16} /> {error}
        </Flex>
      )}

      <Box className="glass-card p-8 bg-white/60 border-brand-surface/20 shadow-xl">
        {verificationStep === 'aadhaar' ? (
          <Stack gap={6}>
            <Stack gap={2}>
              <Text variant="sm" weight="bold">Aadhaar Number</Text>
              <Box className="relative">
                <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-[#50667a]">
                  <Smartphone size={18} />
                </Box>
                <input 
                  type="text" maxLength={12} placeholder="XXXX XXXX XXXX"
                  className="input-primary !pl-12 !bg-brand-surface/5"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                />
              </Box>
              <Text variant="xs" className="flex items-center gap-1 text-brand-primary font-medium bg-brand-primary/5 p-2 rounded-lg">
                <Info size={12} /> MOCK MODE: Enter any 12-digit number (e.g., 123456789012)
              </Text>
            </Stack>
            <button className="btn-primary w-full h-14" onClick={handleSendOtp} disabled={loading || aadhaar.length !== 12}>
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
                  type="text" maxLength={6} placeholder="······"
                  className="input-primary !pl-12 !bg-brand-surface/5 text-center tracking-[0.5em] text-xl font-bold"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
              </Box>
              <Text variant="xs" className="text-center text-brand-primary font-medium bg-brand-primary/5 p-2 rounded-lg">
                MOCK MODE: Use OTP <code className="bg-brand-primary/10 px-1 rounded">123456</code> to verify
              </Text>
            </Stack>
            <button className="btn-primary w-full h-14" onClick={handleVerifyOtp} disabled={loading || otp.length !== 6}>
              {loading ? <Loader2 className="animate-spin" /> : 'Verify & Continue'}
            </button>
            <button className="text-sm font-bold text-brand-primary" onClick={() => setVerificationStep('aadhaar')} disabled={loading}>
              Change Aadhaar Number
            </button>
          </Stack>
        )}
      </Box>

      <button onClick={() => navigate('/dashboard')} className="text-sm text-[#50667a] hover:text-brand-primary transition-colors flex items-center justify-center gap-2">
        <ArrowLeft size={14} /> Back to Dashboard
      </button>
    </Stack>
  );

  // ═══════════════════════════════════════════════════════════════════
  // STEP 2: ELECTION SELECTION
  // ═══════════════════════════════════════════════════════════════════
  const renderElectionStep = () => (
    <Stack gap={8} className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
      {/* Identity Banner */}
      <Flex align="center" gap={4} className="glass-card p-4 bg-brand-success/5 border-brand-success/20">
        <CheckCircle2 className="text-brand-success shrink-0" size={22} />
        <Stack gap={0} className="flex-1">
          <Text variant="sm" weight="bold" className="text-brand-success">Identity Verified</Text>
          <Text variant="xs">Voting as: <Text weight="bold">{voterName}</Text> • Aadhaar: ****{voterAadhaar.slice(-4)}</Text>
        </Stack>
      </Flex>

      <Stack gap={2} className="text-center">
        <Heading size="sm" as="h2">Choose an <Text variant="gradient">Election</Text></Heading>
        <Text variant="lead">Select the election you wish to cast your ballot in</Text>
      </Stack>

      <Stack gap={5}>
        {ELECTIONS.filter(e => e.status === 'Live').map(election => (
          <Box 
            key={election.id}
            onClick={() => handleSelectElection(election)}
            className="glass-card glass-card-hover p-7 cursor-pointer group bg-white/50 border-brand-surface/20 hover:border-brand-primary/30 transition-all duration-400"
          >
            <Flex direction="col" gap={5}>
              <Flex justify="between" align="start" className="flex-wrap gap-3">
                <Stack gap={2}>
                  <Flex gap={2} className="flex-wrap">
                    <Box as="span" className="px-3 py-1 rounded-lg bg-brand-primary/10 text-brand-primary text-[11px] font-bold uppercase tracking-wider">
                      {election.type}
                    </Box>
                    <Box as="span" className="px-3 py-1 rounded-lg bg-brand-success/10 text-brand-success text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Box className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" /> {election.status}
                    </Box>
                  </Flex>
                  <Heading size="xs" as="h3" className="group-hover:text-brand-primary transition-colors">{election.title}</Heading>
                </Stack>
                <Box className="p-3 bg-brand-primary/5 rounded-2xl group-hover:bg-brand-primary/10 group-hover:scale-110 transition-all duration-300">
                  <ChevronRight size={24} className="text-brand-primary" />
                </Box>
              </Flex>

              <Flex gap={6} className="flex-wrap text-sm text-[#50667a]">
                <Flex align="center" gap={2}>
                  <Calendar size={14} className="text-brand-primary" /> Closes: {election.endDate}
                </Flex>
                <Flex align="center" gap={2}>
                  <Users size={14} className="text-brand-primary" /> {election.totalVoters} Voters
                </Flex>
                <Flex align="center" gap={2}>
                  <Vote size={14} className="text-brand-primary" /> {election.candidates.length} Candidates
                </Flex>
              </Flex>

              <Text variant="xs" className="text-[#50667a] font-medium">{election.constituency}</Text>
            </Flex>
          </Box>
        ))}
      </Stack>
    </Stack>
  );

  // ═══════════════════════════════════════════════════════════════════
  // STEP 3: CANDIDATE SELECTION
  // ═══════════════════════════════════════════════════════════════════
  const renderCandidateStep = () => {
    if (!selectedElection) return null;

    return (
      <Stack gap={8} className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
        {/* Election Header */}
        <Stack gap={3}>
          <Flex align="center" gap={2} className="text-brand-success font-bold text-xs uppercase tracking-[0.2em]">
            <ShieldCheck size={16} /> End-to-End Encrypted Session
          </Flex>
          <Heading size="md" as="h1">{selectedElection.title}</Heading>
          <Text variant="lead">
            Select one candidate. Your selection will be encrypted locally before being submitted as a zero-knowledge proof.
          </Text>
          <Flex align="center" gap={3} className="mt-1">
            <Flex align="center" gap={2} className="text-sm text-[#50667a]">
              <Calendar size={14} /> Closes: {selectedElection.endDate}
            </Flex>
            <Box className="w-1 h-1 rounded-full bg-brand-surface/40" />
            <Flex align="center" gap={2} className="text-sm text-[#50667a]">
              <Users size={14} /> {selectedElection.candidates.length} Candidates
            </Flex>
          </Flex>
        </Stack>

        {/* Candidate Cards */}
        <Stack gap={5}>
          {selectedElection.candidates.map(candidate => (
            <Box 
              key={candidate.id}
              onClick={() => handleSelectCandidate(candidate.id)}
              className={`glass-card p-7 cursor-pointer relative group overflow-hidden transition-all duration-300
                ${selectedCandidate === candidate.id ? 'ring-2 ring-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/10' : 'bg-white/40 hover:bg-white/60 border-brand-surface/20'}
              `}
            >
              <Flex justify="between" align="start" className="relative z-10">
                <Flex align="start" gap={5}>
                  <Box className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-all duration-300
                    ${selectedCandidate === candidate.id ? 'bg-brand-primary/20 scale-110' : 'bg-brand-surface/10'}
                  `}>
                    {candidate.symbol}
                  </Box>
                  <Stack gap={1}>
                    <Text variant="xs" className="text-brand-primary tracking-[0.2em] uppercase font-bold">{candidate.party}</Text>
                    <Heading size="sm" as="h3">{candidate.name}</Heading>
                    <Text variant="sm" className="text-[#50667a] font-light mt-1">{candidate.platform}</Text>
                  </Stack>
                </Flex>
                <Flex align="center" justify="center" className={`w-8 h-8 rounded-full border-2 transition-all duration-300 shrink-0 ml-4
                  ${selectedCandidate === candidate.id ? 'border-brand-primary bg-brand-primary text-white shadow-sm scale-110' : 'border-brand-surface'}`}>
                  {selectedCandidate === candidate.id && <CheckCircle2 size={16} />}
                </Flex>
              </Flex>
              <Box className={`absolute top-0 right-0 w-40 h-full bg-gradient-to-l from-brand-primary/10 to-transparent transition-opacity duration-500
                ${selectedCandidate === candidate.id ? 'opacity-100' : 'opacity-0'}`} />
            </Box>
          ))}
        </Stack>

        {/* Bottom Action Bar */}
        <Flex justify="between" align="center" gap={4} className="glass-card p-5 bg-brand-bg/80 backdrop-blur-2xl border-brand-surface/30 shadow-xl sticky bottom-8 z-40 flex-wrap">
          <button onClick={() => { setCurrentStep('select-election'); setSelectedCandidate(null); }}
            className="flex items-center gap-2 text-sm font-bold text-[#50667a] hover:text-brand-primary transition-colors px-4 py-3">
            <ArrowLeft size={16} /> Change Election
          </button>
          <button
            className={`btn-primary h-14 px-10 text-lg group ${!selectedCandidate && 'opacity-50 grayscale pointer-events-none'}`}
            onClick={handleProceedToConfirm}
            disabled={!selectedCandidate}
          >
            Review & Confirm <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </Flex>
      </Stack>
    );
  };

  // ═══════════════════════════════════════════════════════════════════
  // STEP 4: CONFIRMATION
  // ═══════════════════════════════════════════════════════════════════
  const renderConfirmStep = () => {
    if (!selectedElection || !selectedCandidate) return null;
    const candidate = selectedElection.candidates.find(c => c.id === selectedCandidate);
    if (!candidate) return null;

    return (
      <Stack gap={8} className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
        <Stack gap={2} className="text-center">
          <Box className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-2">
            <ShieldCheck size={40} className="text-brand-primary" />
          </Box>
          <Heading size="sm" as="h2">Confirm Your Vote</Heading>
          <Text variant="lead">Review your selections below. This action is final and cannot be undone.</Text>
        </Stack>

        <Box className="glass-card p-8 bg-white/60 border-brand-surface/20 shadow-xl">
          <Stack gap={6}>
            {/* Election Info */}
            <Stack gap={2}>
              <Text variant="xs" className="text-brand-surface uppercase tracking-[0.2em] font-bold">Election</Text>
              <Flex align="center" gap={3}>
                <Box className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                  <Vote size={20} className="text-brand-primary" />
                </Box>
                <Stack gap={0}>
                  <Text weight="bold">{selectedElection.title}</Text>
                  <Text variant="xs" className="text-[#50667a]">{selectedElection.constituency}</Text>
                </Stack>
              </Flex>
            </Stack>

            <Box className="h-px bg-brand-surface/15" />

            {/* Candidate Info */}
            <Stack gap={2}>
              <Text variant="xs" className="text-brand-surface uppercase tracking-[0.2em] font-bold">Your Selection</Text>
              <Flex align="center" gap={4} className="p-5 bg-brand-primary/5 rounded-2xl border border-brand-primary/15">
                <Box className="w-14 h-14 rounded-2xl bg-brand-primary/15 flex items-center justify-center text-2xl shrink-0">
                  {candidate.symbol}
                </Box>
                <Stack gap={0}>
                  <Heading size="xs" as="h3" className="text-brand-primary">{candidate.name}</Heading>
                  <Text variant="sm" className="text-[#50667a]">{candidate.party}</Text>
                </Stack>
              </Flex>
            </Stack>

            <Box className="h-px bg-brand-surface/15" />

            {/* Voter Info */}
            <Stack gap={2}>
              <Text variant="xs" className="text-brand-surface uppercase tracking-[0.2em] font-bold">Voter Identity</Text>
              <Flex align="center" gap={3}>
                <Box className="w-10 h-10 rounded-xl bg-brand-success/10 flex items-center justify-center">
                  <Fingerprint size={20} className="text-brand-success" />
                </Box>
                <Stack gap={0}>
                  <Text weight="bold">{voterName}</Text>
                  <Text variant="xs" className="text-[#50667a]">Aadhaar: ****{voterAadhaar.slice(-4)}</Text>
                </Stack>
              </Flex>
            </Stack>
          </Stack>
        </Box>

        {/* Warning */}
        <Flex align="start" gap={3} className="p-4 bg-amber-50 border border-amber-200/50 rounded-2xl">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <Stack gap={1}>
            <Text variant="sm" weight="bold" className="text-amber-800">Final Confirmation</Text>
            <Text variant="xs" className="text-amber-700">
              Once submitted, your vote will be cryptographically sealed on the blockchain and cannot be changed or reversed. 
              Make sure your selection is correct.
            </Text>
          </Stack>
        </Flex>

        {/* Action Buttons */}
        <Flex justify="between" gap={4} className="flex-col sm:flex-row">
          <button 
            onClick={() => setCurrentStep('select-candidate')}
            className="flex items-center justify-center gap-2 text-sm font-bold text-[#50667a] hover:text-brand-primary transition-colors px-6 py-4 rounded-xl border border-brand-surface/20 hover:border-brand-primary/30 bg-white/40"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          <button
            className="btn-primary h-14 px-12 text-lg group flex-1 sm:flex-initial"
            onClick={handleCastVote}
          >
            <Lock size={18} /> SEAL & SUBMIT BALLOT <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </Flex>
      </Stack>
    );
  };

  // ═══════════════════════════════════════════════════════════════════
  // STEP 4b: PROCESSING ANIMATION
  // ═══════════════════════════════════════════════════════════════════
  const renderProcessingStep = () => (
    <Stack align="center" gap={8} className="max-w-lg mx-auto py-20 text-center animate-in fade-in zoom-in duration-500">
      <Box className="relative">
        <Box className="w-28 h-28 rounded-full bg-brand-primary/10 flex items-center justify-center">
          <Cpu size={48} className="text-brand-primary animate-pulse" />
        </Box>
        <Box className="absolute inset-0 w-28 h-28 rounded-full border-4 border-brand-primary/20 border-t-brand-primary animate-spin" />
      </Box>
      <Stack gap={3}>
        <Heading size="sm" as="h2">Processing Your Vote</Heading>
        <Text variant="lead" className="max-w-md mx-auto">
          Encrypting ballot with SHA-256, generating zero-knowledge proof, and broadcasting to validator nodes...
        </Text>
      </Stack>
      <Stack gap={2} className="w-full max-w-xs">
        <Flex justify="between" className="text-xs font-bold text-[#50667a] uppercase tracking-wider">
          <Text>Encryption</Text> <Text className="text-brand-success">✓</Text>
        </Flex>
        <Flex justify="between" className="text-xs font-bold text-[#50667a] uppercase tracking-wider">
          <Text>ZK-Proof Generation</Text> <Loader2 size={12} className="animate-spin text-brand-primary" />
        </Flex>
        <Flex justify="between" className="text-xs font-bold text-[#50667a]/40 uppercase tracking-wider">
          <Text>Blockchain Broadcast</Text> <Text>—</Text>
        </Flex>
      </Stack>
    </Stack>
  );

  // ═══════════════════════════════════════════════════════════════════
  // STEP 5: RECEIPT
  // ═══════════════════════════════════════════════════════════════════
  const renderReceiptStep = () => {
    const candidate = selectedElection?.candidates.find(c => c.id === selectedCandidate);

    return (
      <Stack align="center" gap={8} className="max-w-2xl mx-auto py-12 text-center animate-in fade-in zoom-in duration-500">
        <Box className="inline-flex p-6 bg-brand-success/10 rounded-full shadow-lg shadow-brand-success/10">
          <CheckCircle2 className="text-brand-success" size={72} />
        </Box>
        <Heading size="lg" as="h2">VOTE SEALED.</Heading>
        <Text variant="lead" className="max-w-md mx-auto">
          Your choice has been cryptographically sealed and written to the VoteChain ledger forever.
        </Text>
        
        {/* Receipt Card */}
        <Stack gap={6} className="glass-card p-8 text-left relative overflow-hidden bg-white/60 border-brand-primary/20 w-full shadow-xl">
          <Box className="absolute top-0 right-0 p-4 opacity-5">
            <Lock size={120} />
          </Box>

          {/* Vote ID */}
          <Stack gap={2}>
            <Flex align="center" gap={2} className="text-brand-primary uppercase tracking-widest text-xs font-bold">
              <ShieldCheck size={14} /> Unique Vote ID
            </Flex>
            <Flex align="center" gap={3}>
              <Box className="flex-1 bg-brand-primary/10 p-4 rounded-xl font-mono text-brand-primary text-lg font-bold tracking-wider select-all">
                {voteId}
              </Box>
              <button 
                onClick={() => copyToClipboard(voteId)}
                className="p-3 bg-brand-primary/10 rounded-xl hover:bg-brand-primary/20 transition-colors text-brand-primary"
                title="Copy Vote ID"
              >
                {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              </button>
            </Flex>
          </Stack>

          {/* Hash */}
          <Stack gap={2}>
            <Flex align="center" gap={2} className="text-brand-surface uppercase tracking-widest text-xs font-bold">
              <Hash size={14} /> Transaction Hash
            </Flex>
            <Box className="bg-brand-surface/10 p-4 rounded-xl font-mono text-brand-primary break-all text-xs border border-brand-surface/20 shadow-inner select-all">
              {generatedHash}
            </Box>
          </Stack>

          {/* Details Grid */}
          <Box className="grid grid-cols-2 gap-4 mt-2">
            <Stack gap={1} className="p-4 bg-brand-surface/5 rounded-xl">
              <Text variant="xs" className="text-brand-surface uppercase tracking-wider font-bold">Election</Text>
              <Text variant="sm" weight="bold">{selectedElection?.title}</Text>
            </Stack>
            <Stack gap={1} className="p-4 bg-brand-surface/5 rounded-xl">
              <Text variant="xs" className="text-brand-surface uppercase tracking-wider font-bold">Candidate</Text>
              <Text variant="sm" weight="bold">{candidate?.name || 'Encrypted'}</Text>
            </Stack>
            <Stack gap={1} className="p-4 bg-brand-surface/5 rounded-xl">
              <Flex align="center" gap={1}>
                <Clock size={12} className="text-brand-surface" />
                <Text variant="xs" className="text-brand-surface uppercase tracking-wider font-bold">Timestamp</Text>
              </Flex>
              <Text variant="sm" weight="medium">{new Date(voteTimestamp).toLocaleString()}</Text>
            </Stack>
            <Stack gap={1} className="p-4 bg-brand-surface/5 rounded-xl">
              <Text variant="xs" className="text-brand-surface uppercase tracking-wider font-bold">Block Height</Text>
              <Text variant="sm" weight="bold" className="font-mono">#{blockNumber.toLocaleString()}</Text>
            </Stack>
          </Box>

          <Text variant="sm" weight="medium" className="text-center italic text-[#50667a] mt-2">
            Save your Vote ID and hash to verify your vote in the audit trail once the election concludes.
          </Text>
        </Stack>
        
        {/* Actions */}
        <Flex gap={4} justify="center" className="mt-8 flex-col sm:flex-row w-full max-w-md">
          <Link to="/verify" className="flex-1">
            <button className="btn-primary w-full px-8 py-4 bg-brand-surface/80 hover:bg-brand-surface text-brand-text border-transparent hover:border-transparent flex items-center justify-center gap-2">
              <ExternalLink size={16} /> Verify Receipt
            </button>
          </Link>
          <Link to="/dashboard" className="flex-1">
            <button className="btn-primary w-full px-8 py-4 flex items-center justify-center gap-2">
              Return to Dashboard <ArrowRight size={16} />
            </button>
          </Link>
        </Flex>
      </Stack>
    );
  };

  // ═══════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <Stack gap={0} className="py-8 lg:py-12">
      {currentStep !== 'processing' && renderStepper()}

      {currentStep === 'verify' && renderVerifyStep()}
      {currentStep === 'select-election' && renderElectionStep()}
      {currentStep === 'select-candidate' && renderCandidateStep()}
      {currentStep === 'confirm' && renderConfirmStep()}
      {currentStep === 'processing' && renderProcessingStep()}
      {currentStep === 'receipt' && renderReceiptStep()}
    </Stack>
  );
};
