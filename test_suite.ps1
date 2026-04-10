# PrivateUtils - Design & Build Tester (PowerShell Version)

Write-Host "`n ##########################################################" -ForegroundColor Cyan
Write-Host " #                                                        #" -ForegroundColor Cyan
Write-Host " #         PRIVATEUTILS - PRODUCTION TEST SUITE           #" -ForegroundColor Cyan
Write-Host " #                                                        #" -ForegroundColor Cyan
Write-Host " ##########################################################`n" -ForegroundColor Cyan

Write-Host "[1/2] Starting Production-Grade Build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ERROR] Build Engine encountered a fault." -ForegroundColor Red
    Write-Host "Please resolve syntax or logic errors before previewing." -ForegroundColor Red
    Pause
    exit $LASTEXITCODE
}

Write-Host "`n[2/2] Build Successful. Launching Local Preview..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server when finished.`n" -ForegroundColor Gray
npm run preview
