@echo off
REM Windows batch wrapper for setup-ralph.sh - requires Git Bash or WSL

echo Setting up Ralph Wiggum loop...
echo.

REM Try Git Bash first
where bash >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    bash setup-ralph.sh
    goto :end
)

REM Try WSL
where wsl >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    wsl bash setup-ralph.sh
    goto :end
)

echo ERROR: Neither Git Bash nor WSL found!
echo Install Git for Windows from https://git-scm.com/download/win
exit /b 1

:end
