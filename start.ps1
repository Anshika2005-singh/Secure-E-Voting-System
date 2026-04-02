# ==========================================
#   Secure E-Voting System Start Script
# ==========================================
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Starting Secure E-Voting System        " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Start Hardhat Node (Blockchain) in a NEW window
Write-Host "[1/3] Starting Local Blockchain (Hardhat)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "npx hardhat node" -WindowStyle Normal

# 2. Wait a few seconds for blockchain to initialize
Start-Sleep -Seconds 2

# 3. Start Backend Server in a NEW window
Write-Host "[2/3] Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "npm run server" -WindowStyle Normal

# 4. Start Frontend (Vite) in the CURRENT window
Write-Host "[3/3] Starting Frontend (Vite)..." -ForegroundColor Yellow
Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Green
npm run dev
