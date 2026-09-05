@echo off
echo Starting IBVAP Backend Server...
start "IBVAP Backend" cmd.exe /k "cd backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload"

echo Starting IBVAP Frontend Server...
start "IBVAP Frontend" cmd.exe /k "cd frontend && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo Please wait a few seconds, then open http://localhost:5173 in your browser.
echo.
pause
