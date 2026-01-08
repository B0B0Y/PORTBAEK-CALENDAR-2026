# Railway.app Deployment Script for Portbaek Calendar
# Created: January 8, 2026

Write-Host "🚂 Railway.app Deployment Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
Write-Host "🔍 Checking Railway CLI installation..." -ForegroundColor Yellow
$railwayCLI = Get-Command railway -ErrorAction SilentlyContinue

if (-not $railwayCLI) {
    Write-Host "❌ Railway CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📦 Please install Railway CLI first:" -ForegroundColor Yellow
    Write-Host "npm i -g @railway/cli" -ForegroundColor White
    Write-Host ""
    Write-Host "Or download from: https://docs.railway.app/develop/cli" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Railway CLI found: $($railwayCLI.Version)" -ForegroundColor Green
Write-Host ""

# Check if logged in
Write-Host "🔐 Checking Railway authentication..." -ForegroundColor Yellow
$loginCheck = railway whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Railway!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔑 Logging in to Railway..." -ForegroundColor Yellow
    railway login

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Login failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Authenticated as: $loginCheck" -ForegroundColor Green
Write-Host ""

# Check if project is linked
Write-Host "🔗 Checking project linkage..." -ForegroundColor Yellow
$projectCheck = railway status 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  No project linked yet!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Please choose an option:" -ForegroundColor Cyan
    Write-Host "  1. Link to existing project (railway link)" -ForegroundColor White
    Write-Host "  2. Create new project (railway init)" -ForegroundColor White
    Write-Host ""

    $choice = Read-Host "Enter your choice (1 or 2)"

    if ($choice -eq "1") {
        Write-Host "🔗 Linking to existing project..." -ForegroundColor Yellow
        railway link
    } elseif ($choice -eq "2") {
        Write-Host "🆕 Creating new project..." -ForegroundColor Yellow
        railway init
    } else {
        Write-Host "❌ Invalid choice!" -ForegroundColor Red
        exit 1
    }

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Project setup failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Project linked successfully!" -ForegroundColor Green
Write-Host ""

# Display current project info
Write-Host "📊 Current Project Status:" -ForegroundColor Cyan
railway status
Write-Host ""

# Confirm deployment
Write-Host "🚀 Ready to deploy to Railway!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deployment will include:" -ForegroundColor Yellow
Write-Host "  ✓ Dockerfile (nginx alpine)" -ForegroundColor White
Write-Host "  ✓ index.html (landing page)" -ForegroundColor White
Write-Host "  ✓ hmmmmmmmmmnmmmmnmmmmmm.html (viewer mode)" -ForegroundColor White
Write-Host "  ✓ hmmmmmmmmmnmmmmmmmmnmmm.html (admin mode)" -ForegroundColor White
Write-Host "  ✓ cleanup-firebase.html (cleanup tool)" -ForegroundColor White
Write-Host "  ✓ Logo-PBRP.png + calendar-bg.png" -ForegroundColor White
Write-Host "  ✓ Firebase Realtime Database integration" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Deploy now? (Y/n)"

if ($confirm -eq "" -or $confirm -eq "Y" -or $confirm -eq "y") {
    Write-Host ""
    Write-Host "🚀 Deploying to Railway..." -ForegroundColor Cyan
    Write-Host ""

    railway up

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Deployment successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Getting your app URL..." -ForegroundColor Cyan
        Write-Host ""

        # Get deployment URL
        $domain = railway domain 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Your app is live at:" -ForegroundColor Green
            Write-Host "   $domain" -ForegroundColor White
            Write-Host ""
            Write-Host "📝 URLs:" -ForegroundColor Cyan
            Write-Host "   Main: https://$domain/" -ForegroundColor White
            Write-Host "   Viewer: https://$domain/hmmmmmmmmmnmmmmnmmmmmm.html" -ForegroundColor White
            Write-Host "   Admin: https://$domain/hmmmmmmmmmnmmmmmmmmnmmm.html" -ForegroundColor White
            Write-Host "   Cleanup: https://$domain/cleanup-firebase.html" -ForegroundColor White
        } else {
            Write-Host "⚠️  Could not get domain. Check Railway dashboard." -ForegroundColor Yellow
            Write-Host "   Dashboard: https://railway.app/dashboard" -ForegroundColor Cyan
        }

        Write-Host ""
        Write-Host "📊 View logs: railway logs" -ForegroundColor Cyan
        Write-Host "🔄 View status: railway status" -ForegroundColor Cyan
        Write-Host "🌐 Open app: railway open" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🔥 Firebase realtime sync is ACTIVE!" -ForegroundColor Green
        Write-Host "   Admin edits will appear instantly in viewer mode." -ForegroundColor White

    } else {
        Write-Host ""
        Write-Host "❌ Deployment failed!" -ForegroundColor Red
        Write-Host "   Check logs with: railway logs" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "⏸️  Deployment cancelled." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Deploy manually with: railway up" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "✨ Done!" -ForegroundColor Green
