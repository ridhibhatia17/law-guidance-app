@echo off
echo Starting Law Guidance App...
echo.

REM Check if .env file exists
if not exist "backend\.env" (
    echo ERROR: .env file not found in backend directory!
    echo Please create backend\.env with your Google API key.
    echo See backend\.env for instructions.
    pause
    exit /b 1
)

REM Check if Google API key is set
findstr /C:"GOOGLE_API_KEY=your_google_generative_ai_api_key_here" backend\.env >nul
if %errorlevel%==0 (
    echo WARNING: Please update GOOGLE_API_KEY in backend\.env file
    echo You can get an API key from: https://makersuite.google.com/app/apikey
    echo.
)

echo Starting backend server...
start "Backend" cmd /k "cd backend && npm start"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting frontend...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul