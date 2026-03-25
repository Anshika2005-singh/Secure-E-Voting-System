import { useState } from 'react';
import { Search, ShieldCheck, CheckCircle2, AlertTriangle, Lock, Calendar, Hash } from 'lucide-react';
import { Box, Flex, Stack, Text, Heading } from '../components/ui/core';

export const VoteVerification = () => {
  const [searchHash, setSearchHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [error, setError] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchHash.trim()) return;

    setIsVerifying(true);
    setError('');
    setVerificationResult(null);

    // Simulate blockchain node query delay
    setTimeout(() => {
      const storedReceiptStr = localStorage.getItem('voteReceipt');
      
      if (storedReceiptStr) {
        const storedReceipt = JSON.parse(storedReceiptStr);
        if (storedReceipt.hash === searchHash.trim()) {
          setVerificationResult(storedReceipt);
          setIsVerifying(false);
          return;
        }
      }

      // If not matching our stored recent receipt, mock a not-found or validate dummy
      // For any hash starting with 0x and length > 40, we mock a valid response just to demo,
      // but without specific candidate detail to show anonymity if it wasn't the exact stored one.
      if (searchHash.startsWith('0x') && searchHash.length > 20) {
        setVerificationResult({
          hash: searchHash,
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          candidateName: 'Encrypted (Zero-Knowledge)',
          party: 'Encrypted',
          blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
        });
      } else {
        setError('No record found on the ledger for the provided cryptographic hash.');
      }
      setIsVerifying(false);
    }, 1500);
  };

  return (
    <Stack gap={10} className="max-w-4xl mx-auto py-8">
      <Stack gap={4} className="text-center max-w-2xl mx-auto">
        <Flex align="center" justify="center" gap={2} className="text-brand-primary font-bold text-xs uppercase tracking-[0.2em] mb-2">
          <ShieldCheck size={16} /> Cryptographic Audit
        </Flex>
        <Heading size="lg" as="h1">Verify Your <Text variant="gradient">Vote</Text></Heading>
        <Text variant="lead">
          Enter your unique transaction hash receipt below to query the immutable blockchain ledger and verify your ballot was counted.
        </Text>
      </Stack>

      <Box className="glass-card p-8 bg-white/40 border-brand-surface/20 mx-auto w-full max-w-3xl">
        <form onSubmit={handleVerify} className="w-full">
          <Stack gap={6}>
            <Box className="relative">
              <Box className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-surface">
                <Hash size={24} />
              </Box>
              <input
                type="text"
                value={searchHash}
                onChange={(e) => setSearchHash(e.target.value)}
                placeholder="Enter your 0x... receipt hash"
                className="w-full pl-12 pr-4 py-5 bg-white/60 border-2 border-brand-surface/20 rounded-xl text-lg font-mono placeholder:text-brand-surface/50 placeholder:font-sans focus:outline-none focus:border-brand-primary/50 focus:bg-white transition-all text-brand-text shadow-inner"
              />
            </Box>
            
            <button
              type="submit"
              disabled={isVerifying || !searchHash.trim()}
              className={`btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 ${(isVerifying || !searchHash.trim()) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            >
              {isVerifying ? (
                <>
                  <Box className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Querying Blockchain Nodes...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Verify Transaction
                </>
              )}
            </button>
          </Stack>
        </form>
      </Box>

      {error && (
        <Flex align="center" gap={4} className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4">
          <AlertTriangle size={24} className="shrink-0" />
          <Text>{error}</Text>
        </Flex>
      )}

      {verificationResult && (
        <Stack gap={8} className="max-w-3xl mx-auto w-full animate-in fade-in zoom-in duration-500">
          <Flex align="center" gap={4} className="p-6 bg-brand-success/10 border border-brand-success/20 rounded-2xl text-brand-success">
            <CheckCircle2 size={32} className="shrink-0" />
            <Box>
              <Heading size="sm" as="h3" className="mb-1">Verification Successful</Heading>
              <Text variant="sm" className="text-brand-success/80">
                This transaction hash exists on the ledger and represents a valid, counted vote.
              </Text>
            </Box>
          </Flex>

          <Box className="glass-card p-8 bg-white/50 border-brand-primary/20 relative overflow-hidden">
            <Box className="absolute top-0 right-0 p-8 opacity-5">
              <Lock size={160} />
            </Box>
            
            <Stack gap={8} className="relative z-10">
              <Box>
                <Text variant="xs" className="text-brand-surface uppercase tracking-[0.2em] font-bold mb-2">Cryptographic Receipt</Text>
                <Box className="bg-brand-surface/10 p-4 rounded-xl font-mono text-brand-primary break-all text-sm border border-brand-surface/20">
                  {verificationResult.hash}
                </Box>
              </Box>

              <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Stack gap={1}>
                  <Flex align="center" gap={2} className="text-brand-surface"><Calendar size={16} /> <Text variant="xs" className="uppercase font-bold tracking-wider">Timestamp</Text></Flex>
                  <Text weight="medium">{new Date(verificationResult.timestamp).toLocaleString()}</Text>
                </Stack>
                <Stack gap={1}>
                  <Flex align="center" gap={2} className="text-brand-surface"><Lock size={16} /> <Text variant="xs" className="uppercase font-bold tracking-wider">Block Height</Text></Flex>
                  <Text weight="medium">#{verificationResult.blockNumber || '8,423,912'}</Text>
                </Stack>
                
                {verificationResult.candidateName !== 'Encrypted (Zero-Knowledge)' ? (
                   <Stack gap={1} className="md:col-span-2 mt-4 p-4 bg-white/60 rounded-xl border border-brand-surface/10">
                      <Flex align="center" gap={2} className="text-brand-primary mb-2"><ShieldCheck size={16} /> <Text variant="xs" className="uppercase font-bold tracking-wider">Your Selection (Local Decryption)</Text></Flex>
                      <Heading size="xs" as="h4">{verificationResult.candidateName}</Heading>
                      <Text variant="sm" className="text-[#50667a]">{verificationResult.party}</Text>
                      <Text variant="xs" className="text-brand-surface mt-2 italic">Note: Only you can see this plaintext choice. The network only sees ZK-proofs.</Text>
                   </Stack>
                ) : (
                  <Stack gap={1} className="md:col-span-2 mt-4 p-4 bg-brand-surface/10 rounded-xl border border-brand-surface/20 text-center">
                    <Lock size={24} className="mx-auto mb-2 text-brand-surface" />
                    <Heading size="xs" as="h4" className="text-brand-surface">Encrypted Payload</Heading>
                    <Text variant="xs" className="text-[#50667a]">
                      The contents of this ballot are hidden by zero-knowledge proofs. It was compiled successfully.
                    </Text>
                  </Stack>
                )}
              </Box>
            </Stack>
          </Box>
        </Stack>
      )}
    </Stack>
  );
};
