import { ShieldCheck, Activity, Users, Database, CheckCircle2, Search, ArrowUpRight } from 'lucide-react';
import { Box, Flex, Stack, Text, Heading } from '../components/ui/core';

export const AdminDashboard = () => {
  return (
    <Stack gap={12} className="max-w-7xl mx-auto py-8">
      {/* Header */}
      <Flex direction="col" align="start" justify="between" gap={6} className="lg:flex-row lg:items-center">
        <Stack gap={2}>
          <Heading size="md" as="h1" className="tracking-tighter uppercase italic">
            Blockchain <Text variant="gradient">Audit Trail</Text>
          </Heading>
          <Text variant="sm" className="italic">Real-time cryptographic verification of the public VoteChain ledger.</Text>
        </Stack>
        <Flex align="center" gap={3} className="glass-card px-6 py-3 bg-brand-success/5 border-brand-success/20 shadow-lg shadow-brand-success/5">
          <Box className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
          <Box>
            <Text weight="bold" variant="sm" className="text-white leading-none">Network Status</Text>
            <Text variant="xs" className="text-brand-success uppercase tracking-widest mt-1 block">Fully Synchronized</Text>
          </Box>
        </Flex>
      </Flex>

      {/* Stats Grid */}
      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Blocks', value: '1,245,091', icon: Database, color: 'text-brand-primary' },
          { label: 'Registered Voters', value: '142.5M', icon: Users, color: 'text-brand-secondary' },
          { label: 'Votes Cast', value: '89.2M', icon: Activity, color: 'text-brand-success' },
          { label: 'Network Integrity', value: '100%', icon: ShieldCheck, color: 'text-brand-primary' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Box key={i} className="glass-card p-6 glass-card-hover group relative overflow-hidden bg-white/40 border-brand-surface/20">
              <Box className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={120} />
              </Box>
              <Flex align="center" justify="between" className="mb-4 relative z-10">
                <Text variant="xs" className="text-[#50667a] tracking-widest">{stat.label}</Text>
                <Box className={`p-2 rounded-lg bg-brand-surface/10 ${stat.color}`}>
                  <Icon size={18} />
                </Box>
              </Flex>
              <Text weight="black" className="text-3xl relative z-10">{stat.value}</Text>
            </Box>
          );
        })}
      </Box>

      {/* Transactions Section */}
      <Stack gap={6}>
        <Flex direction="col" align="center" justify="between" gap={4} className="sm:flex-row">
          <Heading size="xs" as="h2" className="flex items-center gap-2">
            <Activity size={24} className="text-brand-primary" /> Recent Ledger Transactions
          </Heading>
          <Box className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <Box 
              as="input" 
              type="text" 
              placeholder="Search Tx Hash..." 
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary/50"
            />
          </Box>
        </Flex>
        
        <Box className="glass-card overflow-hidden border-white/5 bg-white/[0.02]">
          <Box className="overflow-x-auto">
            <Box as="table" className="w-full text-left border-collapse">
              <Box as="thead">
                <Box as="tr" className="bg-white/5 border-b border-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  <Box as="th" className="px-6 py-5">Tx Hash</Box>
                  <Box as="th" className="px-6 py-5">Block Height</Box>
                  <Box as="th" className="px-6 py-5">Type</Box>
                  <Box as="th" className="px-6 py-5">Status</Box>
                  <Box as="th" className="px-6 py-5">Action</Box>
                </Box>
              </Box>
              <Box as="tbody" className="divide-y divide-brand-surface/20">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <Box as="tr" key={i} className="group hover:bg-brand-bg transition-colors">
                    <Box as="td" className="px-6 py-5">
                      <Flex align="center" gap={2}>
                        <Text variant="sm" className="font-mono text-brand-primary">
                          0x{Math.random().toString(16).slice(2, 10)}...{Math.random().toString(16).slice(2, 6)}
                        </Text>
                      </Flex>
                    </Box>
                    <Box as="td" className="px-6 py-5">
                      <Text weight="medium">#{1245091 - i}</Text>
                    </Box>
                    <Box as="td" className="px-6 py-5 text-[#50667a] text-sm">Encrypted Vote</Box>
                    <Box as="td" className="px-6 py-5">
                      <Flex as="span" align="center" gap={1.5} className="text-brand-success text-xs font-bold px-2.5 py-1 rounded-full bg-brand-success/10 w-fit">
                        <CheckCircle2 size={12} /> Verified
                      </Flex>
                    </Box>
                    <Box as="td" className="px-6 py-5">
                      <Box as="button" className="p-2 text-[#50667a] hover:text-brand-primary transition-colors">
                        <ArrowUpRight size={18} />
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
          <Box className="p-6 border-t border-brand-surface/20 bg-brand-surface/5 text-center">
            <Box as="button" className="text-sm font-bold text-[#50667a] hover:text-brand-text transition-colors uppercase tracking-widest">
              Load More Block Data
            </Box>
          </Box>
        </Box>
      </Stack>
    </Stack>
  );
};
