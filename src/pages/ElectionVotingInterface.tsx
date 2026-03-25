import { useState } from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2, ShieldAlert, Cpu, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
// import { ethers } from 'ethers'; // Production: npm install ethers
import { Box, Flex, Stack, Text, Heading } from '../components/ui/core';

export const ElectionVotingInterface = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [voteStatus, setVoteStatus] = useState<'idle' | 'encrypting' | 'submitting' | 'confirmed'>('idle');
  const [generatedHash, setGeneratedHash] = useState<string>('');

  const candidates = [
    { id: 'c1', name: 'Dr. Sarah Chen', party: 'Progressive Future', platform: 'Sustainable tech and universal basic income for the digital age.' },
    { id: 'c2', name: 'Marcus Johnson', party: 'Liberty Coalition', platform: 'Free market expansion and tax reform to drive innovation.' },
    { id: 'c3', name: 'Elena Rodriguez', party: 'Earth First', platform: 'Aggressive climate action and green energy transition for all.' }
  ];

  const handleVote = () => {
    if (!selectedCandidate) return;
    
    setVoteStatus('encrypting');
    
    // Simulate encryption delay
    setTimeout(() => {
      setVoteStatus('submitting');
      
      // Simulate blockchain tx delay
      setTimeout(() => {
         /** 
          * PRODUCTION MODE: 
          * const provider = new ethers.BrowserProvider(window.ethereum);
          * const signer = await provider.getSigner();
          * const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
          * const tx = await contract.vote(selectedCandidate);
          * await tx.wait();
          * const newHash = tx.hash;
          */

         const newHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
         setGeneratedHash(newHash);
         const candidate = candidates.find(c => c.id === selectedCandidate);
         
         if (candidate) {
           localStorage.setItem('voteReceipt', JSON.stringify({
             hash: newHash,
             timestamp: new Date().toISOString(),
             candidateName: candidate.name,
             party: candidate.party,
             blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
           }));
         }
         
         setVoteStatus('confirmed');
      }, 2000);
    }, 1500);
  };

  if (voteStatus === 'confirmed') {
    return (
      <Stack align="center" gap={8} className="max-w-2xl mx-auto py-20 text-center animate-in fade-in zoom-in duration-500">
        <Box className="inline-flex p-6 bg-brand-success/10 rounded-full mb-8 shadow-sm">
          <CheckCircle2 className="text-brand-success" size={80} />
        </Box>
        <Heading size="lg" as="h2">VOTE SEALED.</Heading>
        <Text variant="lead" className="mb-12 max-w-md mx-auto">
          Your choice has been cryptographically sealed and written to the VoteChain ledger forever.
        </Text>
        
        <Stack gap={6} className="glass-card p-8 text-left relative overflow-hidden bg-white/40 border-brand-surface/20 w-full">
          <Box className="absolute top-0 right-0 p-4 opacity-5">
            <Lock size={120} />
          </Box>
          <Box>
            <Heading size="xs" as="h3" className="mb-4 flex items-center gap-2 text-brand-primary uppercase tracking-widest">
              <ShieldCheck size={16} /> Cryptographic Receipt
            </Heading>
            <Box className="bg-brand-surface/20 p-4 rounded-xl font-mono text-brand-primary break-all text-xs border border-brand-surface/20 shadow-inner select-all">
              {generatedHash}
            </Box>
          </Box>
          <Text variant="sm" weight="medium">
            Save this hash to verify your vote in the audit trail once the election concludes. This is your personal verification key.
          </Text>
        </Stack>
        
        <Flex gap={4} justify="center" className="mt-12 flex-col sm:flex-row">
          <Link to="/verify">
            <button className="btn-primary px-10 py-4 bg-brand-surface/80 hover:bg-brand-surface text-brand-text border-transparent hover:border-transparent">Verify Receipt</button>
          </Link>
          <Link to="/dashboard">
            <button className="btn-primary px-10 py-4">Return to Dashboard</button>
          </Link>
        </Flex>
      </Stack>
    );
  }

  return (
    <Stack gap={12} className="max-w-4xl mx-auto py-8 lg:py-12">
      <Flex direction="col" justify="between" gap={6} className="md:flex-row md:items-end">
        <Stack gap={4} className="max-w-2xl">
          <Flex align="center" gap={2} className="text-brand-success font-bold text-xs uppercase tracking-[0.2em]">
            <ShieldCheck size={16} /> End-to-End Encrypted Session
          </Flex>
          <Heading size="md" as="h1">National General <Text variant="gradient">Election 2026</Text></Heading>
          <Text variant="lead">
            Select one candidate. Your selection will be encrypted locally on this device before being submitted as a zero-knowledge proof.
          </Text>
        </Stack>
        
        <Flex align="center" gap={3} className="glass-card p-4 bg-white/40 border-brand-primary/20 shrink-0">
          <Cpu className="text-brand-primary shrink-0" size={20} />
          <Box className="text-xs font-bold uppercase tracking-widest leading-tight">
            Node: IN-DL-04<br />
            <Text className="text-brand-primary font-black">Sync: 100%</Text>
          </Box>
        </Flex>
      </Flex>

      <Stack gap={6}>
        {candidates.map(candidate => (
          <Box 
            key={candidate.id} 
            onClick={() => voteStatus === 'idle' && setSelectedCandidate(candidate.id)}
            className={`glass-card p-8 cursor-pointer relative group overflow-hidden transition-all duration-300
              ${selectedCandidate === candidate.id ? 'ring-2 ring-brand-primary bg-brand-primary/10' : 'bg-white/40 hover:bg-white/60 border-brand-surface/20'}
              ${voteStatus !== 'idle' && selectedCandidate !== candidate.id ? 'opacity-20 blur-[1px]' : 'opacity-100'}
            `}
          >
            <Flex justify="between" align="start" className="mb-4 relative z-10">
              <Stack gap={1}>
                <Text variant="xs" className="text-brand-primary tracking-[0.2em]">{candidate.party}</Text>
                <Heading size="sm" as="h3">{candidate.name}</Heading>
              </Stack>
              <Flex align="center" justify="center" className={`w-8 h-8 rounded-full border-2 transition-all duration-300
                ${selectedCandidate === candidate.id ? 'border-brand-primary bg-brand-primary text-white shadow-sm scale-110' : 'border-brand-surface'}`}>
                {selectedCandidate === candidate.id && <CheckCircle2 size={16} />}
              </Flex>
            </Flex>
            <Text variant="lead" className="text-lg relative z-10 font-light">{candidate.platform}</Text>
            
            {/* Background Accent */}
            <Box className={`absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-brand-primary/10 to-transparent transition-opacity duration-500
              ${selectedCandidate === candidate.id ? 'opacity-100' : 'opacity-0'}`} />
          </Box>
        ))}
      </Stack>

      <Box className="sticky bottom-8 left-0 right-0 z-40">
        <Flex direction="col" align="center" justify="between" gap={8} className="glass-card p-6 shadow-xl border-brand-surface/30 bg-brand-bg/80 backdrop-blur-2xl md:flex-row">
          <Flex align="center" gap={4} className="text-[#50667a] italic">
            <Box className={`p-2 rounded-lg ${voteStatus !== 'idle' ? 'bg-brand-primary/20 animate-spin-slow' : 'bg-brand-surface/10'}`}>
              <ShieldAlert className={voteStatus !== 'idle' ? 'text-brand-primary' : ''} size={20} />
            </Box>
            <Text variant="sm">
              {voteStatus === 'idle' ? 'Selections are final once mathematically sealed.' : 
               voteStatus === 'encrypting' ? 'Performing SHA-256 Local Encryption...' : 
               'Broadcasting ZK-Proof to Validator Nodes...'}
            </Text>
          </Flex>
          
          <Box 
            as="button"
            className={`btn-primary h-14 px-10 text-lg group ${(!selectedCandidate || voteStatus !== 'idle') && 'opacity-50 grayscale pointer-events-none'}`}
            onClick={handleVote}
            disabled={!selectedCandidate || voteStatus !== 'idle'}
          >
            {voteStatus !== 'idle' ? 'SECURELY PROCESSING...' : 'SEAL & SUBMIT BALLOT'}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Box>
        </Flex>
      </Box>
    </Stack>
  );
};
