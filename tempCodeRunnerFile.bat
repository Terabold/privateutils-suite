@echo off
TITLE Privacy Tools Suite - Launcher
SETLOCAL ENABLEDELAYEDEXPANSION

:: Configuration
SET "PORT=8899"
SET "SITE_URL=http://localhost:%PORT%"

echo.
echo ==========================================
echo   Privacy Tools Suite - Studio Launcher
echo ==========================================
echo.

:: Check for Bun (Priority)
where bun >nul 2>nul
if %ERRORLEVEL% NEQ 0 goto :npm_fallback

echo [+] Bun detected!
echo [+] Baking your Studio...
echo [+] Your site will be live at: %SITE_URL%
echo.
echo [TIP] Keep this window open while using the tools.
echo.

call bun dev
if %ERRORLEVEL% EQU 0 goto :end

echo.
echo [!] WARNING: Bun crashed or failed to start.
echo [!] Attempting fallback to Node.js (NPM)...
echo.

:npm_fallback
:: Check for NPM (Fallback)
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 goto :error_no_runtime

echo [+] Node.js detected!
echo [+] Launching dev server via NPM...
echo.
call npm run dev
goto :end

:error_no_runtime
echo.
echo [!] ERROR: No runtime (Bun or Node.js) found.
echo ------------------------------------------
echo This project needs a "Engine" to run locally.
echo.
echo Please follow these steps:
echo 1. Download Bun from: https://bun.sh
echo 2. After installing, close this window and run LAUNCH_SITE.bat again.
echo.
pause

:end
ENDLOCAL
