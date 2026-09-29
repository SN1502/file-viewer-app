@echo off
REM File Viewer Launcher
REM This script starts the File Viewer application

SETLOCAL ENABLEDELAYEDEXPANSION

REM Get the directory where this script is located
SET SCRIPT_DIR=%~dp0

REM Change to the app directory
CD /D "%SCRIPT_DIR%"

REM Check if dist folder exists
IF NOT EXIST "dist" (
    echo Error: dist folder not found. Please extract all files.
    pause
    exit /b 1
)

REM Find a free port (starting from 8888)
SET PORT=8888
FOR /L %%i IN (1,1,100) DO (
    netstat -ano | find ":%PORT% " >nul
    IF ERRORLEVEL 1 (
        GOTO PORT_FOUND
    )
    SET /A PORT=PORT+1
)

:PORT_FOUND
echo Starting File Viewer on port %PORT%...

REM Start a simple HTTP server using Python if available
where python >nul 2>nul
IF %ERRORLEVEL% EQU 0 (
    echo Python found. Starting web server...
    start http://localhost:%PORT%
    python -m http.server %PORT% --directory dist
    exit /b 0
)

REM Fall back to Node.js if available
where node >nul 2>nul
IF %ERRORLEVEL% EQU 0 (
    echo Node.js found. Starting web server...
    start http://localhost:%PORT%
    npx http-server dist -p %PORT%
    exit /b 0
)

REM If no server available, open file directly
echo No server available. Opening index.html in default browser...
start dist\index.html
exit /b 0
