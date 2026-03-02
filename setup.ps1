# AI-Powered Document Intelligence System - Setup Script
# Run this script to set up both backend and frontend

Write-Host "================================" -ForegroundColor Cyan
Write-Host "DocIntel AI - Setup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot

# Check Python
Write-Host "Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://www.python.org/" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Setup Backend
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setting up Backend..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "$projectRoot\backend"

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to create virtual environment" -ForegroundColor Red
        Set-Location $projectRoot
        exit 1
    }
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "✓ Virtual environment already exists" -ForegroundColor Green
}

# Activate virtual environment and install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
pip install -r requirements.txt --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install Python dependencies" -ForegroundColor Red
    Set-Location $projectRoot
    exit 1
}
Write-Host "✓ Python dependencies installed" -ForegroundColor Green
Write-Host ""

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Please edit backend\.env and add your OpenAI API key!" -ForegroundColor Yellow
    Write-Host "Required variables:" -ForegroundColor Yellow
    Write-Host "  - OPENAI_API_KEY=your-api-key-here" -ForegroundColor White
    Write-Host "  - SECRET_KEY=your-random-secret" -ForegroundColor White
    Write-Host "  - JWT_SECRET_KEY=your-random-jwt-secret" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

# Setup Frontend
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setting up Frontend..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "$projectRoot\frontend"

# Install npm dependencies
Write-Host "Installing Node.js dependencies (this may take a few minutes)..." -ForegroundColor Yellow
npm install --silent
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install Node.js dependencies" -ForegroundColor Red
    Set-Location $projectRoot
    exit 1
}
Write-Host "✓ Node.js dependencies installed" -ForegroundColor Green
Write-Host ""

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating frontend .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Frontend .env file created" -ForegroundColor Green
} else {
    Write-Host "✓ Frontend .env file already exists" -ForegroundColor Green
}

Set-Location $projectRoot

# Summary
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Setup Complete! 🎉" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend\.env and add your OpenAI API key" -ForegroundColor White
Write-Host "2. Start the backend:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "   python app.py" -ForegroundColor Gray
Write-Host ""
Write-Host "3. In a new terminal, start the frontend:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see README.md or QUICKSTART.md" -ForegroundColor Yellow
Write-Host ""
