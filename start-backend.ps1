Write-Host "Starting AskSheets backend..." -ForegroundColor Cyan

Set-Location "$PSScriptRoot\backend"

if (-not (Test-Path ".venv")) {
    Write-Host "Virtual environment not found. Creating .venv..." -ForegroundColor Yellow
    python -m venv .venv
}

Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& ".\.venv\Scripts\Activate.ps1"

Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt

Write-Host "Starting FastAPI server at http://127.0.0.1:8000" -ForegroundColor Green
uvicorn app.main:app --reload
