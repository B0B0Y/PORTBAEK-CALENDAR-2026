# 🚀 AUTO DEPLOY WITH FLY CLI CHECK
# This script will check for flyctl and deploy

Write-Host ""
Write-Host "⚡ Checking Fly CLI..." -ForegroundColor Cyan
Write-Host ""

# Check if flyctl exists
$flyctl = Get-Command flyctl -ErrorAction SilentlyContinue

if (-not $flyctl) {
    Write-Host "❌ Fly CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📦 Install Fly CLI using this command:" -ForegroundColor Yellow
    Write-Host "   irm https://fly.io/install.ps1 | iex" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or visit: https://fly.io/docs/hands-on/install-flyctl/" -ForegroundColor Gray
    Write-Host ""
    
    $install = Read-Host "Do you want to install Fly CLI now? (y/n)"
    
    if ($install -eq "y" -or $install -eq "Y") {
        Write-Host ""
        Write-Host "📦 Installing Fly CLI..." -ForegroundColor Cyan
        irm https://fly.io/install.ps1 | iex
        
        Write-Host ""
        Write-Host "✅ Fly CLI installed! Please restart PowerShell and run this script again." -ForegroundColor Green
        Write-Host ""
    }
    
    Read-Host "Press Enter to exit"
    exit
}

Write-Host "✅ Fly CLI found!" -ForegroundColor Green
Write-Host ""
Write-Host "⚡ Deploying to Fly.io..." -ForegroundColor Cyan
Write-Host ""

# Deploy
flyctl deploy

# Check result
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ DEPLOYED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📅 Your calendar with MONTH NAVIGATION is now live!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔗 Admin (Edit Mode): https://november.fly.dev/hmmmmmmmmmnmmmmmmmmnmmm.html" -ForegroundColor Cyan
    Write-Host "🔗 Viewer Only:       https://november.fly.dev/hmmmmmmmmmnmmmmnmmmmmm.html" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✨ New Features:" -ForegroundColor Yellow
    Write-Host "   ⬅️ ➡️  Click arrows to switch months" -ForegroundColor White
    Write-Host "   📱 Swipe left/right on mobile" -ForegroundColor White
    Write-Host "   ⌨️  Use arrow keys on keyboard" -ForegroundColor White
    Write-Host "   🔵 Click dots to jump to specific month" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deploy failed! Check errors above." -ForegroundColor Red
    Write-Host ""
}

Read-Host "Press Enter to exit"

