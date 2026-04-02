import express from 'express';
import cors from 'cors';
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Mock in-memory database for voter analytics (Off-chain metadata)
const voterAnalytics = {
  totalVoters: 142500000,
  verifiedIdentities: 85200000,
  activeElections: 2,
  networkHealth: 'Optimal'
};

// Track which Aadhaar numbers have already voted (prevents double-voting)
const votedAadhaarNumbers = new Set();

app.get('/api/analytics', (req, res) => {
  res.json(voterAnalytics);
});

// AadhaarKYC.io API Integration Setup (Mocked Proxy)
const AADHAAR_KYC_API_KEY = 'YOUR_API_KEY_HERE';
const AADHAAR_KYC_BASE_URL = 'https://kyc-api.aadhaarkyc.io/api/v1';

// Mock state for OTP simulation (linked by client_id)
const activeSessions = new Map();

// --- Dynamic mock user data generator based on Aadhaar number ---
const MOCK_FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Ananya', 'Diya', 'Myra', 'Sara', 'Aadhya', 'Ira', 'Aanya', 'Navya', 'Priya', 'Riya'];
const MOCK_LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Gupta', 'Singh', 'Kumar', 'Reddy', 'Nair', 'Joshi', 'Mehta',
  'Iyer', 'Rao', 'Das', 'Mukherjee', 'Chatterjee', 'Bose', 'Pillai', 'Menon', 'Agarwal', 'Tiwari'];
const MOCK_STATES = ['New Delhi', 'Mumbai, Maharashtra', 'Bengaluru, Karnataka', 'Chennai, Tamil Nadu',
  'Kolkata, West Bengal', 'Hyderabad, Telangana', 'Pune, Maharashtra', 'Ahmedabad, Gujarat',
  'Jaipur, Rajasthan', 'Lucknow, Uttar Pradesh'];

function generateMockUser(aadhaarNumber) {
  // Use digits from the Aadhaar number to deterministically pick user details
  const digits = aadhaarNumber.split('').map(Number);
  const firstIdx = (digits[0] + digits[1]) % MOCK_FIRST_NAMES.length;
  const lastIdx = (digits[2] + digits[3]) % MOCK_LAST_NAMES.length;
  const stateIdx = (digits[4] + digits[5]) % MOCK_STATES.length;
  const genderIdx = (digits[6]) % 2;
  const yearOffset = (digits[7] + digits[8]) % 40; // 1965-2004
  const monthOffset = (digits[9] + digits[10]) % 12 + 1;
  const dayOffset = (digits[11]) % 28 + 1;

  return {
    full_name: `${MOCK_FIRST_NAMES[firstIdx]} ${MOCK_LAST_NAMES[lastIdx]}`,
    aadhaar_number: aadhaarNumber,
    dob: `${1965 + yearOffset}-${String(monthOffset).padStart(2, '0')}-${String(dayOffset).padStart(2, '0')}`,
    gender: genderIdx === 0 ? 'M' : 'F',
    address: `${MOCK_STATES[stateIdx]}, India`
  };
}

// Endpoint: Generate OTP (Matches AadhaarKYC: POST /aadhaar-v2/generate-otp)
app.post('/api/otp/send', (req, res) => {
  const { id_number } = req.body; // AadhaarKYC uses id_number
  
  if (!id_number || id_number.length !== 12) {
    return res.status(400).json({ 
      success: false, 
      message: 'Valid 12-digit Aadhaar Number (id_number) required' 
    });
  }

  // Check if this Aadhaar has already voted
  if (votedAadhaarNumbers.has(id_number)) {
    return res.status(403).json({
      success: false,
      message: 'This Aadhaar number has already been used to cast a vote in the current election.'
    });
  }
  
  // Create a mock client_id
  const client_id = `client_${Math.random().toString(36).slice(2, 10)}`;
  const otp = '123456'; 
  
  // Store session mapping AadhaarKYC style
  activeSessions.set(client_id, { id_number, otp });
  
  console.log(`[AADHAAR-KYC MOCK] OTP for Client ${client_id} (Aadhaar: ${id_number}): ${otp}`);
  
  res.json({
    data: { client_id },
    status_code: 200,
    success: true,
    message: 'OTP sent successfully'
  });
});

// Endpoint: Submit OTP (Matches AadhaarKYC: POST /aadhaar-v2/submit-otp)
app.post('/api/otp/verify', (req, res) => {
  const { client_id, otp } = req.body;
  
  if (!activeSessions.has(client_id)) {
    return res.status(404).json({ success: false, message: 'Invalid or expired client_id' });
  }
  
  const session = activeSessions.get(client_id);
  
  if (otp !== session.otp) {
    console.log(`[AADHAAR-KYC MOCK] Verification FAILED for Client ${client_id}: Incorrect OTP`);
    return res.status(401).json({ success: false, message: 'Invalid OTP' });
  }
  
  console.log(`[AADHAAR-KYC MOCK] Verification SUCCESS for Client ${client_id} (Aadhaar: ${session.id_number})`);
  
  // Generate dynamic user data based on the actual Aadhaar number entered
  const mockUser = generateMockUser(session.id_number);
  
  // Clean up session
  activeSessions.delete(client_id);
  
  res.json({
    data: {
      ...mockUser,
      client_id: client_id,
      zk_proof: `proof_0x${Math.random().toString(16).slice(2, 32)}`
    },
    status_code: 200,
    success: true,
    message: "OTP Verified Successfully"
  });
});

// ═══════════════════════════════════════════════════════════════════
// VOTE LEDGER — In-memory blockchain simulation
// ═══════════════════════════════════════════════════════════════════
const voteLedger = [];
let currentBlock = 5_842_091;

function generateTxHash() {
  return '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
}
function generateVoteId() {
  return 'VC-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Seed some historical mock transactions for demo
const SEED_ELECTIONS = [
  'National General Election 2026',
  'State Infrastructure Bond Proposal',
  'Municipal Corporation Elections – Ward 42'
];
const SEED_TYPES = ['Encrypted Vote', 'Encrypted Vote', 'Encrypted Vote', 'Identity Verification', 'Encrypted Vote'];

for (let i = 12; i >= 1; i--) {
  const ts = new Date(Date.now() - i * 3_600_000 * (1 + Math.random() * 5));
  voteLedger.push({
    txHash: generateTxHash(),
    voteId: generateVoteId(),
    blockNumber: currentBlock - i,
    timestamp: ts.toISOString(),
    election: SEED_ELECTIONS[Math.floor(Math.random() * SEED_ELECTIONS.length)],
    type: SEED_TYPES[Math.floor(Math.random() * SEED_TYPES.length)],
    candidateEncrypted: `enc_0x${Math.random().toString(16).slice(2, 18)}`,
    voterHash: `voter_0x${Math.random().toString(16).slice(2, 18)}`,
    zkProof: `proof_0x${Math.random().toString(16).slice(2, 34)}`,
    gasUsed: Math.floor(21000 + Math.random() * 30000),
    status: 'confirmed',
    confirmations: Math.floor(6 + Math.random() * 50),
    nodeId: `IN-${['DL','MH','KA','TN','WB','TS'][Math.floor(Math.random()*6)]}-${String(Math.floor(Math.random()*20)+1).padStart(2,'0')}`
  });
}

// Endpoint: Record a vote for an Aadhaar number (prevents double-voting)
app.post('/api/voter/record-vote', (req, res) => {
  const { aadhaar_number, txHash, voteId, election, candidateEncrypted, blockNumber } = req.body;
  if (!aadhaar_number) {
    return res.status(400).json({ success: false, message: 'Aadhaar number required' });
  }
  votedAadhaarNumbers.add(aadhaar_number);

  // Add to the public ledger
  currentBlock++;
  const entry = {
    txHash: txHash || generateTxHash(),
    voteId: voteId || generateVoteId(),
    blockNumber: blockNumber || currentBlock,
    timestamp: new Date().toISOString(),
    election: election || 'Unknown Election',
    type: 'Encrypted Vote',
    candidateEncrypted: candidateEncrypted || `enc_0x${Math.random().toString(16).slice(2, 18)}`,
    voterHash: `voter_0x${Math.random().toString(16).slice(2, 18)}`,
    zkProof: `proof_0x${Math.random().toString(16).slice(2, 34)}`,
    gasUsed: Math.floor(21000 + Math.random() * 30000),
    status: 'confirmed',
    confirmations: 1,
    nodeId: `IN-DL-${String(Math.floor(Math.random()*20)+1).padStart(2,'0')}`
  };
  voteLedger.push(entry);
  
  console.log(`[VOTE RECORDED] Block #${entry.blockNumber} | Tx: ${entry.txHash.slice(0,16)}... | Election: ${entry.election}`);
  res.json({ success: true, message: 'Vote recorded', data: entry });
});

// Endpoint: Check if an Aadhaar has already voted
app.get('/api/voter/status', (req, res) => {
  const { aadhaar_number } = req.query;
  if (!aadhaar_number) {
    return res.status(400).json({ success: false, message: 'Aadhaar number required' });
  }
  res.json({
    success: true,
    has_voted: votedAadhaarNumbers.has(aadhaar_number)
  });
});

// ═══════════════════════════════════════════════════════════════════
// AUDIT TRAIL API
// ═══════════════════════════════════════════════════════════════════

// GET /api/audit/transactions — paginated, searchable, filterable
app.get('/api/audit/transactions', (req, res) => {
  const { search, election, page = 1, limit = 20 } = req.query;
  let results = [...voteLedger].reverse(); // newest first

  // Filter by search term (tx hash, vote id, node id)
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(tx =>
      tx.txHash.toLowerCase().includes(q) ||
      tx.voteId.toLowerCase().includes(q) ||
      tx.nodeId.toLowerCase().includes(q) ||
      tx.election.toLowerCase().includes(q)
    );
  }

  // Filter by election
  if (election && election !== 'all') {
    results = results.filter(tx => tx.election === election);
  }

  const total = results.length;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const paginated = results.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    data: paginated,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  });
});

// GET /api/audit/stats — live network statistics
app.get('/api/audit/stats', (req, res) => {
  const totalVotes = voteLedger.filter(t => t.type === 'Encrypted Vote').length;
  const electionBreakdown = {};
  voteLedger.forEach(tx => {
    if (!electionBreakdown[tx.election]) electionBreakdown[tx.election] = 0;
    electionBreakdown[tx.election]++;
  });

  res.json({
    success: true,
    data: {
      totalBlocks: currentBlock,
      totalTransactions: voteLedger.length,
      totalVotesCast: totalVotes,
      registeredVoters: voterAnalytics.totalVoters,
      networkHealth: 'Optimal',
      networkIntegrity: '100%',
      avgBlockTime: '2.4s',
      avgGasUsed: voteLedger.length > 0
        ? Math.floor(voteLedger.reduce((s, t) => s + t.gasUsed, 0) / voteLedger.length)
        : 0,
      latestBlock: currentBlock,
      electionBreakdown,
      uptime: '99.97%',
      validatorNodes: 24,
      syncStatus: 'Fully Synchronized'
    }
  });
});

// GET /api/audit/transaction/:hash — single transaction detail
app.get('/api/audit/transaction/:hash', (req, res) => {
  const tx = voteLedger.find(t => t.txHash === req.params.hash || t.voteId === req.params.hash);
  if (!tx) {
    return res.status(404).json({ success: false, message: 'Transaction not found on ledger' });
  }
  res.json({ success: true, data: tx });
});

// OLD endpoint kept for backward compatibility
app.post('/api/verify-identity', (req, res) => {
  const { citizenId } = req.body;
  if (!citizenId) return res.status(400).json({ error: 'Citizen ID required' });
  
  res.json({
    success: true,
    zkProof: `proof_0x${Math.random().toString(16).slice(2)}`,
    status: 'Verified'
  });
});

app.listen(port, () => {
  console.log(`VoteChain Backend listening at http://localhost:${port}`);
  console.log(`  → ${voteLedger.length} seeded transactions in ledger`);
  console.log(`  → Latest block: #${currentBlock}`);
});
