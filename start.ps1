# PowerShell script to start Law Guidance App
Write-Host "Starting Law Guidance App..." -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "ERROR: .env file not found in backend directory!" -ForegroundColor Red
    Write-Host "Please create backend\.env with your Google API key." -ForegroundColor Red
    Write-Host "See backend\.env for instructions." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Google API key is set
$envContent = Get-Content "backend\.env" -Raw
if ($envContent -like "*GOOGLE_API_KEY=your_google_generative_ai_api_key_here*") {
    Write-Host "WARNING: Please update GOOGLE_API_KEY in backend\.env file" -ForegroundColor Yellow
    Write-Host "You can get an API key from: https://makersuite.google.com/app/apikey" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Starting backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start"

Write-Host "Waiting for backend to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host "Starting frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")