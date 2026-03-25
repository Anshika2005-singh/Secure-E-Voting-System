import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Vote, Activity, User, Menu, X } from 'lucide-react';
import { Box, Flex, Text } from '../ui/core';

export const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/', icon: Vote },
    { name: 'Dashboard', path: '/dashboard', icon: User },
    { name: 'Active Elections', path: '/elections', icon: Activity },
    { name: 'Audit Trail', path: '/audit', icon: ShieldCheck },
  ];

  return (
    <Box as="nav" className="sticky top-4 z-50 mx-4 sm:mx-8">
      <Flex align="center" justify="between" className="glass-card px-6 py-4 max-w-7xl mx-auto border-brand-surface/20 bg-white/40 shadow-sm">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Box className="bg-brand-primary p-2 rounded-lg shadow-sm group-hover:shadow-brand-primary/20 transition-all duration-300">
            <Vote color="white" size={24} />
          </Box>
          <Text weight="bold" className="text-xl tracking-tight">
            VoteChain <Text variant="gradient">India</Text>
          </Text>
        </Link>
        
        {/* Desktop Navigation */}
        <Flex align="center" gap={8} className="hidden md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 relative py-1
                  ${isActive ? 'text-brand-primary' : 'text-[#50667a] hover:text-brand-text'}`}
              >
                <Icon size={18} />
                {link.name}
                {isActive && (
                  <Box as="span" className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </Flex>
        
        {/* Actions */}
        <Flex align="center" gap={4}>
          <button className="hidden sm:flex btn-primary !py-2 !px-4 text-sm !shadow-none">
            <User size={18} />
            Connect Wallet
          </button>
          
          {/* Mobile Menu Toggle */}
          <Box 
            as="button"
            className="md:hidden p-2 text-[#50667a] hover:text-brand-text transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Box>
        </Flex>
      </Flex>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <Box className="md:hidden absolute top-full left-0 right-0 mt-2 mx-4 glass-card p-4 space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.name} 
                to={link.path} 
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all
                  ${isActive ? 'bg-brand-primary/10 text-brand-primary' : 'text-[#50667a] hover:bg-brand-surface/10 hover:text-brand-text'}`}
              >
                <Icon size={20} />
                <Text weight="medium">{link.name}</Text>
              </Link>
            );
          })}
          <Box as="hr" className="border-white/5 my-2" />
          <button className="w-full btn-primary !py-3">
            <User size={18} />
            Connect Wallet
          </button>
        </Box>
      )}
    </Box>
  );
};
