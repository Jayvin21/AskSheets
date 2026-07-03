Write-Host "Starting AskSheets frontend..." -ForegroundColor Cyan

Set-Location "$PSScriptRoot\frontend"

if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules not found. Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local..." -ForegroundColor Yellow
    @"
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
"@ | Set-Content -Encoding utf8 ".env.local"
}

Write-Host "Starting Next.js frontend at http://localhost:3000" -ForegroundColor Green
npm run dev -- -p 3000
