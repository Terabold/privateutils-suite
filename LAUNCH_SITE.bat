@echo off
TITLE Privacy Tools Suite - Launcher
SETLOCAL

echo.
echo ==========================================
echo   Privacy Tools Suite - Studio Launcher
echo ==========================================
echo.

:: Check for Bun (Priority - Since we know it's installed)
where bun >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [+] Bun detected! (Version: 1.3.11)
    echo [+] Baking your Studio...
    echo [+] Your site will be live at: http://localhost:8899
    echo.
    echo [TIP] Keep this window open while using the tools.
    echo.
    call bun dev
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [!] CRITICAL: Bun v1.3.11 crashed with a Segmentation Fault.
        echo.
        echo This is a known issue on some Windows machines.
        echo To fix this, please run:
        echo    bun upgrade
        echo.
        echo If it persists, consider installing Node.js as a secondary engine.
        pause
    )
    goto :end
)

:: Check for NPM (Fallback)
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [+] Node.js detected!
    echo [+] Launching dev server...
    call npm run dev
    goto :end
)

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

