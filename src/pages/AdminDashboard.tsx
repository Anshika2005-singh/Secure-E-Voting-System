import { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, Activity, Users, Database, CheckCircle2, Search, 
  ArrowUpRight, Loader2, RefreshCw, Filter, Clock, Hash, Cpu, 
  Eye, X, Copy, ChevronLeft, ChevronRight, Zap, Globe
} from 'lucide-react';
import { Box, Flex, Stack, Text, Heading } from '../components/ui/core';

interface Transaction {
  txHash: string;
  voteId: string;
  blockNumber: number;
  timestamp: string;
  election: string;
  type: string;
  candidateEncrypted: string;
  voterHash: string;
  zkProof: string;
  gasUsed: number;
  status: string;
  confirmations: number;
  nodeId: string;
}

interface AuditStats {
  totalBlocks: number;
  totalTransactions: number;
  totalVotesCast: number;
  registeredVoters: number;
  networkHealth: string;
  networkIntegrity: string;
  avgBlockTime: string;
  avgGasUsed: number;
  latestBlock: number;
  electionBreakdown: Record<string, number>;
  uptime: string;
  validatorNodes: number;
  syncStatus: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const API_BASE = 'http://localhost:3001';

export const AdminDashboard = () => {
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [electionFilter, setElectionFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copied, setCopied] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // ─── Fetch Stats ─────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const resp = await fetch(`${API_BASE}/api/audit/stats`);
      const result = await resp.json();
      if (result.success) setStats(result.data);
    } catch { /* fallback silently */ }
  }, []);

  // ─── Fetch Transactions ──────────────────────────────────────────
  const fetchTransactions = useCallback(async (page = 1, searchTerm = search, election = electionFilter) => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
        ...(searchTerm && { search: searchTerm }),
        ...(election !== 'all' && { election }),
      });
      const resp = await fetch(`${API_BASE}/api/audit/transactions?${params}`);
      const result = await resp.json();
      if (result.success) {
        setTransactions(result.data);
        setPagination(result.pagination);
      }
    } catch { /* fallback silently */ }
  }, [search, electionFilter, pagination.limit]);

  // ─── Initial Load ────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchStats(), fetchTransactions(1)]);
      setIsLoading(false);
    };
    load();
  }, []);

  // ─── Auto-refresh every 8 seconds ────────────────────────────────
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchStats();
      fetchTransactions(pagination.page);
    }, 8000);
    return () => clearInterval(interval);
  }, [autoRefresh, pagination.page, fetchStats, fetchTransactions]);

  // ─── Search handler ──────────────────────────────────────────────
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions(1, search, electionFilter);
  };

  const handleFilterChange = (election: string) => {
    setElectionFilter(election);
    fetchTransactions(1, search, election);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStats(), fetchTransactions(pagination.page)]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const formatNum = (n: number) => n.toLocaleString();
  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // ─── Loading State ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <Stack align="center" justify="center" gap={4} className="py-32 animate-pulse">
        <Loader2 size={40} className="animate-spin text-brand-primary" />
        <Text variant="sm" className="text-[#50667a]">Syncing with blockchain nodes...</Text>
      </Stack>
    );
  }

  return (
    <Stack gap={10} className="max-w-7xl mx-auto py-8">
      {/* ═══ HEADER ═══ */}
      <Flex direction="col" align="start" justify="between" gap={6} className="lg:flex-row lg:items-center">
        <Stack gap={2}>
          <Heading size="md" as="h1">
            Blockchain <Text variant="gradient">Audit Trail</Text>
          </Heading>
          <Text variant="sm" className="text-[#50667a]">
            Real-time cryptographic verification of the public VoteChain ledger.
          </Text>
        </Stack>
        <Flex gap={3} align="center">
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border ${
              autoRefresh 
                ? 'bg-brand-success/10 text-brand-success border-brand-success/20' 
                : 'bg-brand-surface/10 text-[#50667a] border-brand-surface/20'
            }`}
          >
            <Zap size={14} className={autoRefresh ? 'animate-pulse' : ''} />
            {autoRefresh ? 'LIVE' : 'PAUSED'}
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary/10 text-brand-primary text-xs font-bold hover:bg-brand-primary/20 transition-all border border-brand-primary/20"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Flex align="center" gap={3} className="glass-card px-5 py-3 bg-brand-success/5 border-brand-success/20">
            <Box className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
            <Stack gap={0}>
              <Text weight="bold" variant="xs" className="leading-none">{stats?.syncStatus}</Text>
              <Text variant="xs" className="text-brand-success uppercase tracking-widest mt-0.5">
                Block #{stats ? formatNum(stats.latestBlock) : '...'}
              </Text>
            </Stack>
          </Flex>
        </Flex>
      </Flex>

      {/* ═══ STATS GRID ═══ */}
      <Box className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Blocks', value: stats ? formatNum(stats.totalBlocks) : '...', icon: Database, color: 'text-brand-primary', bg: 'bg-brand-primary' },
          { label: 'Transactions', value: stats ? formatNum(stats.totalTransactions) : '...', icon: Activity, color: 'text-[#e67e22]', bg: 'bg-[#e67e22]' },
          { label: 'Votes Cast', value: stats ? formatNum(stats.totalVotesCast) : '...', icon: CheckCircle2, color: 'text-brand-success', bg: 'bg-brand-success' },
          { label: 'Validator Nodes', value: stats ? String(stats.validatorNodes) : '...', icon: Globe, color: 'text-brand-secondary', bg: 'bg-brand-secondary' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Box key={i} className="glass-card p-5 relative overflow-hidden bg-white/40 border-brand-surface/20 group hover:shadow-lg transition-all duration-300">
              <Box className="absolute -right-3 -bottom-3 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">
                <Icon size={100} />
              </Box>
              <Flex align="center" justify="between" className="mb-3 relative z-10">
                <Text variant="xs" className="text-[#50667a] uppercase tracking-widest font-bold">{stat.label}</Text>
                <Box className={`p-2 rounded-xl ${stat.bg}/10 ${stat.color}`}>
                  <Icon size={16} />
                </Box>
              </Flex>
              <Text weight="black" className="text-2xl lg:text-3xl relative z-10">{stat.value}</Text>
            </Box>
          );
        })}
      </Box>

      {/* ═══ SECONDARY STATS ROW ═══ */}
      <Flex gap={4} className="flex-wrap">
        {[
          { label: 'Avg Block Time', value: stats?.avgBlockTime || '—', icon: Clock },
          { label: 'Avg Gas Used', value: stats ? formatNum(stats.avgGasUsed) : '—', icon: Zap },
          { label: 'Network Uptime', value: stats?.uptime || '—', icon: Activity },
          { label: 'Integrity', value: stats?.networkIntegrity || '—', icon: ShieldCheck },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <Flex key={i} align="center" gap={3} className="glass-card px-5 py-3 flex-1 min-w-[180px] bg-white/30 border-brand-surface/15">
              <Icon size={16} className="text-brand-primary shrink-0" />
              <Stack gap={0}>
                <Text variant="xs" className="text-[#50667a] uppercase tracking-wider font-bold">{item.label}</Text>
                <Text weight="bold" variant="sm">{item.value}</Text>
              </Stack>
            </Flex>
          );
        })}
      </Flex>

      {/* ═══ ELECTION BREAKDOWN ═══ */}
      {stats?.electionBreakdown && Object.keys(stats.electionBreakdown).length > 0 && (
        <Stack gap={4}>
          <Heading size="xs" as="h2" className="flex items-center gap-2">
            <Cpu size={20} className="text-brand-primary" /> Votes by Election
          </Heading>
          <Flex gap={4} className="flex-wrap">
            {Object.entries(stats.electionBreakdown).map(([name, count]) => (
              <Box 
                key={name} 
                onClick={() => handleFilterChange(name === electionFilter ? 'all' : name)}
                className={`glass-card px-5 py-4 flex-1 min-w-[220px] cursor-pointer transition-all duration-300 ${
                  electionFilter === name 
                    ? 'ring-2 ring-brand-primary bg-brand-primary/10 border-brand-primary/30' 
                    : 'bg-white/30 border-brand-surface/15 hover:bg-white/50'
                }`}
              >
                <Text variant="xs" className="text-[#50667a] uppercase tracking-wider font-bold mb-1">{name}</Text>
                <Text weight="black" className="text-xl">{count} <Text variant="xs" className="text-[#50667a] font-bold">votes</Text></Text>
              </Box>
            ))}
          </Flex>
        </Stack>
      )}

      {/* ═══ TRANSACTIONS TABLE ═══ */}
      <Stack gap={5}>
        <Flex direction="col" align="start" justify="between" gap={4} className="sm:flex-row sm:items-center">
          <Heading size="xs" as="h2" className="flex items-center gap-2">
            <Activity size={20} className="text-brand-primary" /> Ledger Transactions
            <Box as="span" className="text-xs font-bold text-[#50667a] bg-brand-surface/15 px-2.5 py-1 rounded-lg ml-2">
              {pagination.total} total
            </Box>
          </Heading>

          <Flex gap={3} align="center" className="w-full sm:w-auto">
            {/* Election Filter */}
            <Flex align="center" gap={1} className="relative">
              <Filter size={14} className="text-[#50667a]" />
              <select
                value={electionFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="bg-white/40 border border-brand-surface/20 rounded-xl text-xs font-bold px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 appearance-none pr-8 text-brand-text"
              >
                <option value="all">All Elections</option>
                <option value="National General Election 2026">National General</option>
                <option value="State Infrastructure Bond Proposal">State Bond</option>
                <option value="Municipal Corporation Elections – Ward 42">Municipal</option>
              </select>
            </Flex>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#50667a]" size={14} />
              <input
                type="text"
                placeholder="Search Tx, Vote ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/40 border border-brand-surface/20 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-brand-text placeholder:text-brand-surface/50"
              />
            </form>
          </Flex>
        </Flex>

        {/* Table */}
        <Box className="glass-card overflow-hidden border-brand-surface/20 bg-white/30">
          <Box className="overflow-x-auto">
            <Box as="table" className="w-full text-left border-collapse">
              <Box as="thead">
                <Box as="tr" className="bg-brand-surface/5 border-b border-brand-surface/15 text-[10px] font-bold uppercase tracking-[0.2em] text-[#50667a]">
                  <Box as="th" className="px-5 py-4">Tx Hash</Box>
                  <Box as="th" className="px-5 py-4">Block</Box>
                  <Box as="th" className="px-5 py-4">Election</Box>
                  <Box as="th" className="px-5 py-4">Type</Box>
                  <Box as="th" className="px-5 py-4">Time</Box>
                  <Box as="th" className="px-5 py-4">Status</Box>
                  <Box as="th" className="px-5 py-4 text-center">Action</Box>
                </Box>
              </Box>
              <Box as="tbody" className="divide-y divide-brand-surface/10">
                {transactions.length === 0 ? (
                  <Box as="tr">
                    <Box as="td" colSpan={7} className="px-5 py-12 text-center">
                      <Stack align="center" gap={3}>
                        <Database size={32} className="text-brand-surface/30" />
                        <Text variant="sm" className="text-[#50667a]">No transactions found</Text>
                        <Text variant="xs" className="text-brand-surface/50">Try adjusting your search or filter</Text>
                      </Stack>
                    </Box>
                  </Box>
                ) : (
                  transactions.map((tx) => (
                    <Box as="tr" key={tx.txHash} className="group hover:bg-brand-primary/[0.03] transition-colors">
                      <Box as="td" className="px-5 py-4">
                        <Flex align="center" gap={2}>
                          <Text variant="sm" className="font-mono text-brand-primary font-medium">
                            {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-6)}
                          </Text>
                        </Flex>
                      </Box>
                      <Box as="td" className="px-5 py-4">
                        <Text weight="bold" variant="sm" className="font-mono">#{formatNum(tx.blockNumber)}</Text>
                      </Box>
                      <Box as="td" className="px-5 py-4">
                        <Text variant="xs" weight="bold" className="text-[#50667a] max-w-[160px] truncate block">
                          {tx.election}
                        </Text>
                      </Box>
                      <Box as="td" className="px-5 py-4">
                        <Box as="span" className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                          tx.type === 'Encrypted Vote' 
                            ? 'bg-brand-primary/10 text-brand-primary' 
                            : 'bg-brand-secondary/10 text-brand-secondary'
                        }`}>
                          {tx.type}
                        </Box>
                      </Box>
                      <Box as="td" className="px-5 py-4">
                        <Flex align="center" gap={1.5} className="text-[#50667a]">
                          <Clock size={12} />
                          <Text variant="xs" weight="medium">{timeAgo(tx.timestamp)}</Text>
                        </Flex>
                      </Box>
                      <Box as="td" className="px-5 py-4">
                        <Flex as="span" align="center" gap={1.5} className="text-brand-success text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-success/10 w-fit uppercase tracking-wider">
                          <CheckCircle2 size={10} /> Verified
                        </Flex>
                      </Box>
                      <Box as="td" className="px-5 py-4 text-center">
                        <button 
                          onClick={() => setSelectedTx(tx)}
                          className="p-2 text-[#50667a] hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          </Box>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Flex align="center" justify="between" className="px-5 py-4 border-t border-brand-surface/15 bg-brand-surface/[0.03]">
              <Text variant="xs" className="text-[#50667a] font-medium">
                Page {pagination.page} of {pagination.totalPages} • {pagination.total} records
              </Text>
              <Flex gap={2}>
                <button
                  onClick={() => fetchTransactions(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-primary/10 text-brand-primary transition-all"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <button
                  onClick={() => fetchTransactions(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-primary/10 text-brand-primary transition-all"
                >
                  Next <ChevronRight size={14} />
                </button>
              </Flex>
            </Flex>
          )}
        </Box>
      </Stack>

      {/* ═══ TRANSACTION DETAIL MODAL ═══ */}
      {selectedTx && (
        <Box className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Box className="glass-card w-full max-w-2xl bg-white p-8 relative shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 p-2 hover:bg-brand-surface/10 rounded-full transition-colors"
            >
              <X size={20} className="text-[#50667a]" />
            </button>

            <Stack gap={6}>
              {/* Header */}
              <Stack gap={2}>
                <Flex align="center" gap={2} className="text-brand-primary">
                  <ShieldCheck size={20} />
                  <Text variant="xs" weight="bold" className="uppercase tracking-[0.2em]">Transaction Details</Text>
                </Flex>
                <Heading size="xs" as="h3">Block #{formatNum(selectedTx.blockNumber)}</Heading>
              </Stack>

              {/* Status Badge */}
              <Flex align="center" gap={3} className="p-4 bg-brand-success/5 border border-brand-success/20 rounded-2xl">
                <CheckCircle2 size={24} className="text-brand-success" />
                <Stack gap={0}>
                  <Text weight="bold" className="text-brand-success">Confirmed</Text>
                  <Text variant="xs" className="text-[#50667a]">{selectedTx.confirmations} confirmation{selectedTx.confirmations !== 1 ? 's' : ''} • Node: {selectedTx.nodeId}</Text>
                </Stack>
              </Flex>

              {/* Fields */}
              <Stack gap={4}>
                {[
                  { label: 'Transaction Hash', value: selectedTx.txHash, mono: true, copyable: true },
                  { label: 'Vote ID', value: selectedTx.voteId, mono: true, copyable: true },
                  { label: 'Election', value: selectedTx.election, mono: false },
                  { label: 'Type', value: selectedTx.type, mono: false },
                  { label: 'Timestamp', value: new Date(selectedTx.timestamp).toLocaleString(), mono: false },
                  { label: 'Voter Hash (Anonymous)', value: selectedTx.voterHash, mono: true },
                  { label: 'Candidate (Encrypted)', value: selectedTx.candidateEncrypted, mono: true },
                  { label: 'ZK-Proof', value: selectedTx.zkProof, mono: true, copyable: true },
                  { label: 'Gas Used', value: formatNum(selectedTx.gasUsed), mono: false },
                ].map((field) => (
                  <Stack key={field.label} gap={1}>
                    <Text variant="xs" className="text-[#50667a] uppercase tracking-wider font-bold">{field.label}</Text>
                    <Flex align="center" gap={2}>
                      <Box className={`flex-1 p-3 rounded-xl text-sm break-all ${
                        field.mono 
                          ? 'font-mono bg-brand-surface/5 border border-brand-surface/10 text-brand-primary' 
                          : 'bg-brand-surface/5 text-brand-text font-medium'
                      }`}>
                        {field.value}
                      </Box>
                      {field.copyable && (
                        <button
                          onClick={() => copyText(field.value, field.label)}
                          className="p-2 text-[#50667a] hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all shrink-0"
                          title="Copy"
                        >
                          {copied === field.label ? <CheckCircle2 size={16} className="text-brand-success" /> : <Copy size={16} />}
                        </button>
                      )}
                    </Flex>
                  </Stack>
                ))}
              </Stack>

              {/* Footer */}
              <Box className="p-4 bg-brand-surface/5 rounded-2xl text-center">
                <Text variant="xs" className="text-[#50667a] leading-relaxed">
                  This transaction is permanently recorded on the VoteChain ledger. 
                  Voter identity is protected through zero-knowledge proofs — only encrypted hashes are stored.
                </Text>
              </Box>
            </Stack>
          </Box>
        </Box>
      )}
    </Stack>
  );
};
