# Portbaek Roleplay Calendar 2025

Kalendar shooting dan event untuk Portbaek Roleplay - deployed on Fly.io

## 🌐 Live URLs

- **Main URL**: https://november.fly.dev/ (Fly.io)
- **Railway**: Coming soon!
- **Viewer Mode**: `/hmmmmmmmmmnmmmmnmmmmmm.html`
- **Admin/Edit Mode**: `/hmmmmmmmmmnmmmmmmmmnmmm.html`

## 📋 Features

- ✨ Interactive calendar with beautiful UI
- 🎨 Custom background wallpaper
- 📱 Mobile responsive with swipe gestures
- ⌨️ Keyboard navigation (arrow keys)
- 🔄 Month navigation with arrows and dots
- 📝 Edit mode for managing events
- 👀 Viewer mode for public viewing
- 🔥 Firebase Realtime Database integration
- 🚀 Auto-stop machines to save costs

## 🗄️ Database

**Firebase Project:** portbaek-calendar
**Database URL:** https://portbaek-calendar-default-rtdb.asia-southeast1.firebasedatabase.app

### Data Structure:
```json
{
  "events": {
    "event-id-1": {
      "date": "2025-11-15",
      "title": "Event Title",
      "color": "#5865F2"
    }
  },
  "calendar": {
    "NOVEMBER": {
      "name": "NOVEMBER",
      "events": { ... }
    }
  }
}
```

## 🚀 Deployment

### Railway.app (Recommended - Easier!)

**Quick Deploy:**
```powershell
.\deploy-railway.ps1
```

**Auto-Deploy with GitHub Actions (Best!):**
```bash
# One-time setup:
1. Get Railway token from https://railway.app/account/tokens
2. Add as GitHub Secret: RAILWAY_TOKEN
3. Push to GitHub - auto-deploys on every push! 🎉
```

📖 **Full Guide:** [RAILWAY-DEPLOY.md](RAILWAY-DEPLOY.md)
🤖 **GitHub Actions Setup:** [GITHUB-ACTIONS.md](GITHUB-ACTIONS.md)

**Manual Deploy:**
```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Fly.io (Current)

Run the auto-deploy script:

```powershell
.\auto-deploy-fixed.ps1
```

### Manual Deploy

```powershell
# Make sure you're logged in to Fly.io
flyctl auth login

# Deploy
flyctl deploy
```

## 📁 Project Structure

```
calender-portbaek/
├── .github/
│   └── workflows/
│       └── railway-deploy.yml         # GitHub Actions auto-deploy
├── index.html                          # Landing page (redirects to viewer)
├── hmmmmmmmmmnmmmmnmmmmmm.html        # Viewer mode (public)
├── hmmmmmmmmmnmmmmmmmmnmmm.html       # Admin/Edit mode
├── Logo-PBRP.png                       # Logo image
├── calendar-bg.png                     # Background wallpaper
├── cleanup-firebase.html               # Firebase cleanup tool
├── Dockerfile                          # Docker configuration
├── railway.json                        # Railway.app configuration
├── fly.toml                            # Fly.io configuration
├── auto-deploy-fixed.ps1              # Fly.io auto-deploy script
├── deploy-railway.ps1                 # Railway auto-deploy script
├── RAILWAY-DEPLOY.md                  # Railway deployment guide
├── GITHUB-ACTIONS.md                  # GitHub Actions setup guide
├── FIREBASE-SETUP.md                  # Firebase setup guide
└── .gitignore                          # Git ignore file
```

## 🎯 Usage

### For Viewers
Visit the main URL or viewer mode URL to see the calendar. You can:
- Navigate months using arrow buttons
- Swipe left/right on mobile
- Use keyboard arrow keys
- Click dots to jump to specific months
- **View events in realtime** - updates instantly when admin makes changes!

### For Admins
Visit the admin/edit mode URL to manage events. You can:
- Add new events by clicking on dates
- Edit existing events
- Delete events
- Drag and drop events to different dates
- All changes are saved automatically to Firebase
- **Changes appear instantly** in all viewer windows!

### 🔥 Test Realtime Sync
1. Open **Admin mode** in one browser tab/window
2. Open **Viewer mode** in another tab/window (or different device)
3. Add/edit an event in Admin mode
4. Watch it appear **INSTANTLY** in Viewer mode - no refresh needed! ✨

## 🤖 Automation & CI/CD

### GitHub Actions Auto-Deploy
Setup once, auto-deploy on every push to GitHub:

```bash
# 1. Get Railway token
https://railway.app/account/tokens

# 2. Add to GitHub Secrets as: RAILWAY_TOKEN

# 3. Push to GitHub
git push origin main

# 4. Auto-deploys! 🎉
```

**Features:**
- ✅ Auto-deploy on `git push` to main/master
- ✅ Deploy preview for pull requests
- ✅ Manual trigger from GitHub UI
- ✅ Deployment status notifications
- ✅ Zero maintenance required

📖 **Complete Guide:** [GITHUB-ACTIONS.md](GITHUB-ACTIONS.md)

### Firebase Realtime Sync
Automatic realtime updates - built-in feature:
- Admin saves event → Instantly appears in all viewer windows
- No polling, no refresh needed
- Uses Firebase `onValue()` listeners
- WebSocket-based realtime communication

## 🔧 Configuration

The app is configured in `fly.toml`:
- **App name**: november
- **Region**: Singapore (sin)
- **Port**: 8080
- **Auto-stop**: Enabled (saves costs when idle)
- **Memory**: 1GB
- **CPU**: 1 shared CPU

## 🔥 Firebase Setup

**IMPORTANT:** If you're getting Firebase save errors, read [FIREBASE-SETUP.md](FIREBASE-SETUP.md) for complete setup instructions.

Quick fix for Firebase errors:
1. Go to Firebase Console
2. Navigate to Realtime Database → Rules
3. Update security rules (see FIREBASE-SETUP.md)
4. Click "Publish"

## 🧹 Database Maintenance

### Clean Up Data
Use the cleanup tool to remove unwanted data:

```bash
# Open in browser
calender-portbaek/cleanup-firebase.html
```

Features:
- 📋 View all database data
- 💾 Backup data as JSON
- 🗑️ Clean up specific entries
- 🔍 Search and filter

### Backup Database
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select "portbaek-calendar" project
3. Go to Realtime Database → Data
4. Click ⋮ menu → Export JSON

## 📝 Notes

- Calendar is optimized for Portbaek Roleplay schedules and events
- Uses nginx alpine for lightweight deployment
- Automatic HTTPS enabled via Fly.io
- Zero downtime deployments
- Data persists in Firebase Realtime Database

## 🔐 Security

- Firebase security rules control read/write access
- Test mode rules allow public access (suitable for internal use)
- For production, consider implementing authentication
- API keys are public (normal for Firebase web apps)
- Sensitive operations should use Firebase Auth

## 🆘 Support

For issues or questions:

### Deployment Issues:
1. Check Fly.io dashboard: https://fly.io/apps/november
2. View logs: `flyctl logs`
3. Check app status: `flyctl status`

### Firebase Issues:
1. Check Firebase Console: https://console.firebase.google.com/
2. Read FIREBASE-SETUP.md
3. Monitor database activity in Realtime Database tab

### Testing:
```powershell
# Check local Dockerfile
docker build -t portbaek-calendar .
docker run -p 8080:8080 portbaek-calendar

# Open browser to http://localhost:8080
```

## 🔄 Related Projects

- **PB Media Calendar**: Separate calendar for PB Media (different Firebase database)
  - App: `pb-media-calendar`
  - Database: `pb-media-calendar`
  - No data conflicts with Portbaek

---

**Created:** November 5, 2025
**Updated:** November 7, 2025
**Deployed on:** Fly.io
**Database:** Firebase Realtime Database
**Region:** Singapore (asia-southeast1)
