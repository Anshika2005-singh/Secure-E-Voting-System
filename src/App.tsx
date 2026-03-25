import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { VoterDashboard } from './pages/VoterDashboard';
import { ElectionVotingInterface } from './pages/ElectionVotingInterface';
import { AdminDashboard } from './pages/AdminDashboard';
import { VoteVerification } from './pages/VoteVerification';
import { Box, Stack } from './components/ui/core';

function App() {
  return (
    <Router>
      <Stack className="min-h-screen bg-brand-bg">
        <Navbar />
        <Box as="main" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<VoterDashboard />} />
            <Route path="/elections" element={<ElectionVotingInterface />} />
            <Route path="/verify" element={<VoteVerification />} />
            <Route path="/audit" element={<AdminDashboard />} />
          </Routes>
        </Box>
        <Footer />
      </Stack>
    </Router>
  );
}

export default App;
