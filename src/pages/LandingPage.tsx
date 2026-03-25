import { Lock, Activity, ArrowRight, CheckCircle, Globe, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Box, Flex, Stack, Text, Heading } from '../components/ui/core';

export const LandingPage = () => {
  return (
    <Stack gap={32} className="pb-20">
      {/* Hero Section */}
      <Box as="section" className="relative pt-20 overflow-hidden">
        {/* Background Decorative Shapes */}
        <Box className="absolute top-0 -left-20 w-96 h-96 bg-brand-primary/10 blur-[100px] rounded-full animate-pulse" />
        <Box className="absolute bottom-40 -right-20 w-80 h-80 bg-brand-secondary/10 blur-[100px] rounded-full animate-pulse delay-700" />

        <Flex align="center" gap={16} className="relative z-10 flex-col md:flex-row">
          <Stack gap={8} className="flex-1 text-center md:text-left">
            <Flex align="center" gap={2} className="inline-flex bg-white/5 border border-white/10 px-4 py-2 rounded-full animate-float">
              <Box className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
              <Text variant="xs" className="text-brand-primary">E-Voting Protocol v2.0 Live</Text>
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
          
          <Box className="flex-1 w-full max-w-xl">
            <Box className="glass-card p-8 relative overflow-hidden group bg-white/40 border-brand-surface/20">
              <Box className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Heading size="xs" as="h3" className="mb-8 flex items-center gap-2">
                <Activity className="text-brand-primary" /> Live Election Analytics
              </Heading>
              
              <Stack gap={4} className="relative z-10">
                {[1, 2, 3].map((item) => (
                  <Flex key={item} align="center" justify="between" className="p-4 bg-brand-surface/10 border border-brand-surface/10 rounded-2xl hover:bg-brand-surface/20 transition-colors">
                    <Flex align="center" gap={4}>
                      <Box className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                        <Zap size={22} className="text-brand-primary" />
                      </Box>
                      <Box>
                        <Text weight="bold">Block #{10243 + item}</Text>
                        <Text variant="sm" as="div">Verified & Encrypted</Text>
                      </Box>
                    </Flex>
                    <CheckCircle className="text-brand-success" size={20} />
                  </Flex>
                ))}
              </Stack>
              
              <Flex align="center" justify="between" className="mt-8 pt-8 border-t border-brand-surface/20">
                <Text variant="sm">Network Status</Text>
                <Flex align="center" gap={2} className="text-brand-success font-bold">
                  <Box className="w-2 h-2 rounded-full bg-brand-success" />
                  Optimal
                </Flex>
              </Flex>
            </Box>
          </Box>
        </Flex>
      </Box>

      {/* Features Section */}
      <Stack as="section" gap={16}>
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
