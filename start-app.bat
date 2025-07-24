@echo off
echo Starting Tender Management System...
echo.
echo This will start both the server and client components.
echo.

REM Set environment variables
set NODE_ENV=development
set PORT=3001

REM Start the server in a new command window
start cmd /k "title Tender Server && echo Starting server on port 3001... && node --loader tsx server/index.ts"

REM Wait a moment for the server to start
timeout /t 3 /nobreak > nul

REM Start the client in a new command window
start cmd /k "title Tender Client && cd client && echo Starting client on port 3000... && npx vite --port 3000"

echo.
echo Server running at http://localhost:3001
echo Client running at http://localhost:3000
echo.
echo Server and client started in separate windows.
echo Press any key to exit this window...
pause > nul