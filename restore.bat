@echo off
REM Windows batch wrapper for restore.sh - requires Git Bash or WSL

echo.
echo ==================================================
echo Ralph Wiggum Loop Restore
echo ==================================================
echo.

REM Try Git Bash first
where bash >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    bash restore.sh %1
    goto :end
)

REM Try WSL
where wsl >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    wsl bash restore.sh %1
    goto :end
)

echo ERROR: Neither Git Bash nor WSL found!
echo Install Git for Windows from https://git-scm.com/download/win
exit /b 1

:end
