# Start Backend
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; .\venv\Scripts\Activate.ps1; python app.py" -PassThru

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend Server..." -ForegroundColor Cyan
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -PassThru

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Servers Started! 🚀" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C in each terminal window to stop the servers" -ForegroundColor Yellow
Write-Host ""
