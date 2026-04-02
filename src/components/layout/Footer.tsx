import { Link } from 'react-router-dom';
import { ShieldCheck, Globe, Info, ExternalLink, Mail } from 'lucide-react';
import { Box, Flex, Stack, Text, Heading } from '../ui/core';

export const Footer = () => {
  return (
    <Box as="footer" className="border-t border-brand-surface/40 bg-brand-bg/80 backdrop-blur-xl mt-auto">
      <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Box className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <Stack gap={6} className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 group">
              <Box className="bg-brand-primary p-2 rounded-lg shadow-sm group-hover:shadow-brand-primary/20 transition-all duration-300">
                <ShieldCheck color="white" size={24} />
              </Box>
              <Text weight="bold" className="text-xl tracking-tight">
                VoteChain <Text variant="gradient">India</Text>
              </Text>
            </Link>
            <Text variant="sm" className="max-w-sm leading-relaxed">
              Empowering democracy through cryptographic certainty. Our blockchain-based voting protocol ensures 100% election integrity, transparency, and accessibility for every citizen.
            </Text>
            <Flex gap={4}>
              {[Info, ExternalLink, Globe, Mail].map((Icon, i) => (
                <Box 
                  key={i} 
                  as="a" 
                  href="#" 
                  className="p-2 transition-colors duration-200 bg-brand-surface/10 rounded-lg hover:bg-brand-surface/30 hover:text-brand-primary text-[#50667a]"
                >
                  <Icon size={20} />
                </Box>
              ))}
            </Flex>
          </Stack>

          <Box>
            <Heading size="xs" as="h4" className="mb-6">Quick Links</Heading>
            <Stack as="ul" gap={4}>
              {[
                { name: 'Home', path: '/' },
                { name: 'Voter Dashboard', path: '/dashboard' },
                { name: 'Active Elections', path: '/elections' },
                { name: 'Audit Trail', path: '/audit' }
              ].map((link) => (
                <Box as="li" key={link.name}>
                  <Link to={link.path} className="text-[#50667a] hover:text-brand-primary transition-colors duration-200 text-sm">
                    {link.name}
                  </Link>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box>
            <Heading size="xs" as="h4" className="mb-6">Resources</Heading>
            <Stack as="ul" gap={4}>
              {[
                { name: 'Whitepaper', path: '/' },
                { name: 'Technical Specs', path: '/' },
                { name: 'Privacy Policy', path: '/' },
                { name: 'Security Audit', path: '/verify' }
              ].map((link) => (
                <Box as="li" key={link.name}>
                  <Link to={link.path} className="text-[#50667a] hover:text-brand-primary transition-colors duration-200 text-sm">
                    {link.name}
                  </Link>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>

        <Box className="border-t border-brand-surface/40 mt-12 pt-8 text-center">
          <Text variant="sm" className="text-xs font-mono lowercase tracking-wider">
            © 2026 VoteChain India. All rights reserved.
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
