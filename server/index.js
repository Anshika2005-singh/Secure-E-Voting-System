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

app.get('/api/analytics', (req, res) => {
  res.json(voterAnalytics);
});

// AadhaarKYC.io API Integration Setup (Mocked Proxy)
const AADHAAR_KYC_API_KEY = 'YOUR_API_KEY_HERE';
const AADHAAR_KYC_BASE_URL = 'https://kyc-api.aadhaarkyc.io/api/v1';

// Mock state for OTP simulation (linked by client_id)
const activeSessions = new Map();

// Endpoint: Generate OTP (Matches AadhaarKYC: POST /aadhaar-v2/generate-otp)
app.post('/api/otp/send', (req, res) => {
  const { id_number } = req.body; // AadhaarKYC uses id_number
  
  if (!id_number || id_number.length !== 12) {
    return res.status(400).json({ 
      success: false, 
      message: 'Valid 12-digit Aadhaar Number (id_number) required' 
    });
  }
  
  // Create a mock client_id
  const client_id = `client_${Math.random().toString(36).slice(2, 10)}`;
  const otp = '123456'; 
  
  // Store session mapping AadhaarKYC style
  activeSessions.set(client_id, { id_number, otp });
  
  console.log(`[AADHAAR-KYC MOCK] OTP for Client ${client_id}: ${otp}`);
  
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
    return res.status(401).json({ success: false, message: 'Invalid OTP' });
  }
  
  // Clean up
  activeSessions.delete(client_id);
  
  res.json({
    data: {
      full_name: "Kush Pathak",
      aadhaar_number: session.id_number,
      client_id: client_id,
      dob: "1995-05-15",
      gender: "M",
      address: "New Delhi, India",
      zk_proof: `proof_0x${Math.random().toString(16).slice(2, 32)}` // Custom addition for VoteChain
    },
    status_code: 200,
    success: true,
    message: "OTP Verified Successfully"
  });
});

// OLD endpoint kept for backward compatibility if needed
app.post('/api/verify-identity', (req, res) => {
  const { citizenId } = req.body;
  if (!citizenId) return res.status(400).json({ error: 'Citizen ID required' });
  
  // Logic to 'verify' against national identity database
  res.json({
    success: true,
    zkProof: `proof_0x${Math.random().toString(16).slice(2)}`,
    status: 'Verified'
  });
});

app.listen(port, () => {
  console.log(`VoteChain Backend listening at http://localhost:${port}`);
});
