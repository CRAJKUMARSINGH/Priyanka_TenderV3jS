@echo off
echo Starting Tender Management System...
echo.
echo This will start both the server and client components.
echo.

REM Set environment variable
set NODE_ENV=development

REM Start the server in a new command window
start cmd /k "title Tender Server && echo Starting server... && node --loader tsx server/index.ts"

REM Wait a moment for the server to start
timeout /t 3 /nobreak > nul

REM Start the client in a new command window
start cmd /k "title Tender Client && cd client && echo Starting client... && npx vite"

echo.
echo Server and client started in separate windows.
echo Press any key to exit this window...
pause > nul