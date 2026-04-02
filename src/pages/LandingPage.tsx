import { useState, useEffect } from 'react';
import { Lock, Activity, ArrowRight, CheckCircle, Globe, ShieldCheck, Zap, Clock, Users, Database, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Box, Flex, Stack, Text, Heading } from '../components/ui/core';

const API_BASE = 'http://localhost:3001';

interface LiveBlock {
  txHash: string;
  blockNumber: number;
  election: string;
  type: string;
  timestamp: string;
  status: string;
}

interface LiveStats {
  totalBlocks: number;
  totalTransactions: number;
  totalVotesCast: number;
  syncStatus: string;
  avgBlockTime: string;
  validatorNodes: number;
}

export const LandingPage = () => {
  const [recentBlocks, setRecentBlocks] = useState<LiveBlock[]>([]);
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [isLive, setIsLive] = useState(false);

  // Fetch live data from backend
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const [txResp, statsResp] = await Promise.all([
          fetch(`${API_BASE}/api/audit/transactions?limit=4`),
          fetch(`${API_BASE}/api/audit/stats`),
        ]);
        const txData = await txResp.json();
        const statsData = await statsResp.json();

        if (txData.success && txData.data.length > 0) {
          setRecentBlocks(txData.data);
          setIsLive(true);
        }
        if (statsData.success) {
          setStats(statsData.data);
        }
      } catch {
        // Backend not running — show fallback
        setIsLive(false);
      }
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const formatNum = (n: number) => n.toLocaleString();

  // Fallback blocks if backend is not running
  const fallbackBlocks = [
    { txHash: '0xa1b2c3d4...', blockNumber: 5842090, election: 'National General Election', type: 'Encrypted Vote', timestamp: new Date(Date.now() - 180000).toISOString(), status: 'confirmed' },
    { txHash: '0xe5f6a7b8...', blockNumber: 5842089, election: 'State Bond Proposal', type: 'Encrypted Vote', timestamp: new Date(Date.now() - 420000).toISOString(), status: 'confirmed' },
    { txHash: '0xc9d0e1f2...', blockNumber: 5842088, election: 'Municipal Elections', type: 'Encrypted Vote', timestamp: new Date(Date.now() - 900000).toISOString(), status: 'confirmed' },
  ];

  const displayBlocks = isLive ? recentBlocks.slice(0, 4) : fallbackBlocks;

  return (
    <Stack gap={32} className="pb-20">
      {/* Hero Section */}
      <Box as="section" id="hero" className="relative pt-20 overflow-hidden">
        {/* Background Decorative Shapes */}
        <Box className="absolute top-0 -left-20 w-96 h-96 bg-brand-primary/10 blur-[100px] rounded-full animate-pulse" />
        <Box className="absolute bottom-40 -right-20 w-80 h-80 bg-brand-secondary/10 blur-[100px] rounded-full animate-pulse delay-700" />

        <Flex align="center" gap={16} className="relative z-10 flex-col md:flex-row">
          <Stack gap={8} className="flex-1 text-center md:text-left">
            <Flex align="center" gap={2} className="inline-flex bg-white/5 border border-white/10 px-4 py-2 rounded-full animate-float">
              <Box className={`w-2 h-2 rounded-full ${isLive ? 'bg-brand-success' : 'bg-amber-400'} animate-pulse`} />
              <Text variant="xs" className="text-brand-primary">
                {isLive ? 'E-Voting Protocol v2.0 Live' : 'E-Voting Protocol v2.0 • Backend Offline'}
              </Text>
            </Flex>
            
            <Heading size="lg" as="h1">
              The Future of <br />
              <Text variant="gradient">Democratic Integrity</Text>
            </Heading>
            
            <Text variant="lead" className="max-w-2xl mx-auto md:mx-0">
              A secure, scalable, and tamper-proof blockchain-based e-voting system designed to eliminate logistical barriers and ensure 100% election integrity.
            </Text>
            
            <Flex gap={4} justify="start" className="flex-col sm:flex-row justify-center md:justify-start">
              <Link to="/elections">
                <button className="btn-primary w-full sm:w-auto h-14 text-lg">
                  Enter Voting Portal <ArrowRight size={22} />
                </button>
              </Link>
              <Link to="/audit">
                <button className="btn-secondary w-full sm:w-auto h-14 text-lg">
                  View Audit Trail
                </button>
              </Link>
            </Flex>
          </Stack>
          
          {/* ═══ LIVE ELECTION ANALYTICS WIDGET ═══ */}
          <Box className="flex-1 w-full max-w-xl">
            <Box className="glass-card p-8 relative overflow-hidden group bg-white/40 border-brand-surface/20">
              <Box className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Header */}
              <Flex align="center" justify="between" className="mb-6 relative z-10">
                <Heading size="xs" as="h3" className="flex items-center gap-2">
                  <Activity className="text-brand-primary" /> Live Election Analytics
                </Heading>
                <Flex align="center" gap={1.5} className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isLive ? 'bg-brand-success/10 text-brand-success' : 'bg-amber-100 text-amber-600'
                }`}>
                  <Box className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-brand-success animate-pulse' : 'bg-amber-400'}`} />
                  {isLive ? 'LIVE' : 'DEMO'}
                </Flex>
              </Flex>

              {/* Mini Stats Row */}
              {stats && (
                <Flex gap={3} className="mb-5 relative z-10 flex-wrap">
                  {[
                    { label: 'Blocks', value: formatNum(stats.totalBlocks), icon: Database },
                    { label: 'Votes', value: formatNum(stats.totalVotesCast), icon: Users },
                    { label: 'Nodes', value: String(stats.validatorNodes), icon: Globe },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <Flex key={i} align="center" gap={2} className="flex-1 min-w-[90px] p-2.5 bg-brand-surface/5 rounded-xl border border-brand-surface/10">
                        <Icon size={14} className="text-brand-primary shrink-0" />
                        <Stack gap={0}>
                          <Text variant="xs" className="text-[#50667a] uppercase tracking-wider font-bold leading-none" style={{ fontSize: '9px' }}>{s.label}</Text>
                          <Text weight="black" variant="sm" className="leading-tight">{s.value}</Text>
                        </Stack>
                      </Flex>
                    );
                  })}
                </Flex>
              )}
              
              {/* Recent Blocks */}
              <Stack gap={3} className="relative z-10">
                {displayBlocks.map((block, idx) => (
                  <Flex 
                    key={block.blockNumber + '-' + idx} 
                    align="center" 
                    justify="between" 
                    className="p-4 bg-brand-surface/10 border border-brand-surface/10 rounded-2xl hover:bg-brand-surface/20 transition-all duration-300 group/row"
                  >
                    <Flex align="center" gap={4}>
                      <Box className="w-11 h-11 bg-brand-primary/10 rounded-xl flex items-center justify-center group-hover/row:scale-110 transition-transform duration-300">
                        <Zap size={20} className="text-brand-primary" />
                      </Box>
                      <Stack gap={0.5}>
                        <Flex align="center" gap={2}>
                          <Text weight="bold" variant="sm">Block #{formatNum(block.blockNumber)}</Text>
                          <Box as="span" className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary">
                            {block.type === 'Encrypted Vote' ? 'Vote' : 'Verify'}
                          </Box>
                        </Flex>
                        <Flex align="center" gap={2}>
                          <Text variant="xs" className="text-[#50667a] font-mono">
                            {block.txHash.slice(0, 10)}...{block.txHash.slice(-4)}
                          </Text>
                          <Text variant="xs" className="text-[#50667a]">•</Text>
                          <Flex align="center" gap={1} className="text-[#50667a]">
                            <Clock size={10} />
                            <Text variant="xs">{timeAgo(block.timestamp)}</Text>
                          </Flex>
                        </Flex>
                      </Stack>
                    </Flex>
                    <CheckCircle className="text-brand-success shrink-0" size={18} />
                  </Flex>
                ))}
              </Stack>
              
              {/* Footer */}
              <Flex align="center" justify="between" className="mt-6 pt-6 border-t border-brand-surface/20 relative z-10">
                <Flex align="center" gap={2}>
                  <Text variant="xs" className="text-[#50667a] font-medium">Network Status</Text>
                </Flex>
                <Flex align="center" gap={2} className="text-brand-success font-bold text-sm">
                  <Box className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
                  {stats?.syncStatus || 'Optimal'}
                </Flex>
              </Flex>

              {/* Subtle link to audit */}
              <Link to="/audit" className="block mt-4 relative z-10">
                <Flex align="center" justify="center" gap={2} className="text-xs font-bold text-brand-primary hover:text-[#6e94b5] transition-colors uppercase tracking-wider">
                  <TrendingUp size={12} /> View Full Audit Trail <ArrowRight size={12} />
                </Flex>
              </Link>
            </Box>
          </Box>
        </Flex>
      </Box>

      {/* Features Section */}
      <Stack as="section" id="features" gap={16}>
        <Stack gap={4} className="text-center">
          <Heading size="md">Architected for <Text variant="gradient">Absolute Trust</Text></Heading>
          <Text variant="lead" className="max-w-2xl mx-auto">
            Overcoming the limitations of traditional voting with cutting-edge cryptography and decentralization.
          </Text>
        </Stack>
        
        <Box className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: <Lock size={32} className="text-brand-primary" />, 
              title: "End-to-End Encryption", 
              desc: "Votes are encrypted on your device and only decrypted during the final autonomous tally process."
            },
            { 
              icon: <ShieldCheck size={32} className="text-brand-secondary" />, 
              title: "Tamper-Proof Audit", 
              desc: "Every vote is a transaction on our immutable ledger, ensuring mathematical certainty of the results."
            },
            { 
              icon: <Globe size={32} className="text-brand-success" />, 
              title: "100% Accessibility", 
              desc: "Vote from anywhere in the world on any device, completely eliminating logistical and geographical barriers."
            }
          ].map((feature, i) => (
            <Box key={i} className="glass-card p-8 relative group bg-white/40 border-brand-surface/20 shadow-sm h-full">
              <Box className="mb-6 p-4 bg-brand-surface/10 rounded-2xl inline-block transition-transform duration-300">
                {feature.icon}
              </Box>
              <Heading size="sm" as="h3" className="mb-4">{feature.title}</Heading>
              <Text variant="lead" as="p" className="text-base">{feature.desc}</Text>
            </Box>
          ))}
        </Box>
      </Stack>

      {/* CTA Section */}
      <Box as="section" className="glass-card bg-brand-primary p-12 lg:p-20 text-center rounded-[40px] shadow-lg shadow-brand-primary/10 border-none">
        <Stack gap={8}>
          <Heading size="xl">BE THE CHANGE. VOTE SECURELY.</Heading>
          <Text className="text-white/80 text-xl max-w-2xl mx-auto font-medium">
            The power of democracy is now in your hands, protected by the power of blockchain math.
          </Text>
          <Box>
            <Link to="/dashboard" className="inline-block">
              <button className="bg-white text-brand-primary px-10 py-5 rounded-2xl font-bold text-xl hover:bg-brand-bg transition-all shadow-md hover:-translate-y-1 active:translate-y-0">
                Get Started Now
              </button>
            </Link>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
};
