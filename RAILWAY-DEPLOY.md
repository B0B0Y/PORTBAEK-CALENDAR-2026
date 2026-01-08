# 🚂 Railway.app Deployment Guide

## Portbaek Calendar - Railway Deployment

Panduan lengkap untuk deploy kalendar Portbaek ke Railway.app dengan Firebase Realtime Database.

---

## 🎯 Kenapa Railway?

- ✅ **Lebih mudah** daripada Fly.io
- ✅ **Auto-detect Dockerfile** - tak perlu banyak config
- ✅ **Free tier** yang generous untuk static sites
- ✅ **Auto HTTPS** dengan custom domain
- ✅ **GitHub integration** untuk auto-deploy
- ✅ **Zero downtime** deployments
- ✅ **Built-in monitoring** dan logs

---

## 📋 Prerequisites

### 1. Install Railway CLI

```powershell
# Via npm (recommended)
npm install -g @railway/cli

# Or download from
# https://docs.railway.app/develop/cli
```

### 2. Verify Installation

```powershell
railway --version
```

---

## 🚀 Deployment Steps

### Method 1: Auto Deploy (Recommended)

```powershell
# Run the auto-deploy script
.\deploy-railway.ps1
```

Script ini akan:
1. ✅ Check Railway CLI installation
2. ✅ Login ke Railway (jika belum)
3. ✅ Link/create project
4. ✅ Deploy aplikasi
5. ✅ Display app URLs

---

### Method 2: Manual Deploy

#### Step 1: Login
```powershell
railway login
```
Browser akan open untuk authentication.

#### Step 2: Initialize Project

**Option A - New Project:**
```powershell
railway init
```

**Option B - Link Existing Project:**
```powershell
railway link
```

#### Step 3: Deploy
```powershell
railway up
```

#### Step 4: Get Domain
```powershell
railway domain
```

---

## 🌐 URLs Selepas Deploy

Setelah deploy, aplikasi akan available di:

```
Main URL:     https://your-app.up.railway.app/
Viewer:       https://your-app.up.railway.app/hmmmmmmmmmnmmmmnmmmmmm.html
Admin:        https://your-app.up.railway.app/hmmmmmmmmmnmmmmmmmmnmmm.html
Cleanup Tool: https://your-app.up.railway.app/cleanup-firebase.html
```

---

## 🔥 Firebase Realtime Sync - Cara Ia Berfungsi

### **Admin Mode** (Edit)

Bila admin add/edit/delete event:

```javascript
// hmmmmmmmmmnmmmmmmmmnmmm.html:2007-2030
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Auto-save menggunakan Firebase set()
window.firebaseSet(ref(database, `calendar/${monthName}`), data);
```

**Flow:**
1. Admin klik tarikh → Modal open
2. Admin masuk title & color
3. JavaScript call `saveToFirebase()`
4. Data push ke Firebase: `calendar/NOVEMBER/events`
5. Firebase update realtime database

---

### **Viewer Mode** (Read-Only)

Viewer mode listen untuk changes:

```javascript
// hmmmmmmmmmnmmmmnmmmmmm.html:2716-2730
function setupRealtimeSync() {
    const dbRef = window.firebaseRef(window.firebaseDB, `calendar/${monthName}`);

    // Listen for ANY changes - realtime!
    firebaseUnsubscribe = window.firebaseOnValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            monthsData[currentMonthIndex] = data;
            renderCalendar(currentMonthIndex); // Re-render with new data
        }
    });
}
```

**Flow:**
1. Viewer mode subscribe ke Firebase path
2. Bila admin save changes → Firebase trigger event
3. `onValue()` callback fire automatically
4. Calendar re-render dengan data terbaru
5. **Instant update - NO refresh needed!**

---

### **Realtime Sync Test**

Untuk test realtime sync:

1. **Buka 2 browser tabs:**
   - Tab 1: Admin mode (`hmmmmmmmmmnmmmmmmmmnmmm.html`)
   - Tab 2: Viewer mode (`hmmmmmmmmmnmmmmnmmmmmm.html`)

2. **Dalam Admin tab:**
   - Klik mana-mana tarikh
   - Add event baru (contoh: "Meeting 10am")
   - Klik Save

3. **Perhatikan Viewer tab:**
   - Event akan muncul **INSTANTLY** tanpa refresh!
   - Tak perlu press F5
   - Magic of Firebase Realtime Database! ✨

4. **Edit atau delete:**
   - Try edit/delete event dalam Admin
   - Viewer akan update automatically

---

## 📊 Railway Dashboard Features

### View Logs
```powershell
railway logs
```

### View Status
```powershell
railway status
```

### Open App in Browser
```powershell
railway open
```

### Environment Variables
```powershell
# List all env vars
railway variables

# Set new variable
railway variables set KEY=value
```

---

## 🔧 Configuration Files

### [railway.json](railway.json)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### [Dockerfile](Dockerfile)
- Base: `nginx:alpine` (~20MB)
- Port: `8080`
- Static files served via nginx
- Gzip compression enabled

---

## 🔐 Security & Firebase

### Current Setup:
```json
{
  "rules": {
    "events": {
      ".read": true,
      ".write": true
    },
    "calendar": {
      ".read": true,
      ".write": true
    }
  }
}
```

⚠️ **Public Access** - Sesuai untuk internal use

### Production Setup (Optional):
Refer to [FIREBASE-SETUP.md](FIREBASE-SETUP.md) untuk setup authentication.

---

## 🎨 Features Included

- ✅ Realtime sync antara admin & viewer modes
- ✅ Beautiful calendar UI dengan custom background
- ✅ Mobile responsive dengan swipe gestures
- ✅ Keyboard navigation (arrow keys)
- ✅ Month navigation dengan smooth animations
- ✅ Drag & drop events (admin mode)
- ✅ Color picker untuk events
- ✅ Auto-save ke Firebase
- ✅ Cleanup tool untuk database maintenance

---

## 🆘 Troubleshooting

### Deployment Failed?

```powershell
# Check logs
railway logs

# Rebuild
railway up --detach
```

### Firebase Not Syncing?

1. Check Firebase Console → Realtime Database → Rules
2. Verify rules allow read/write access
3. Check browser console for errors (F12)
4. Verify Firebase config dalam HTML files

### Port Issues?

Railway auto-detects port 8080 from Dockerfile. No changes needed!

### Domain Not Working?

```powershell
# Generate new domain
railway domain

# Or add custom domain in Railway dashboard
```

---

## 🔄 GitHub Auto-Deploy (Optional)

### Setup:

1. Push code ke GitHub repo
2. Go to Railway Dashboard
3. Click "New Project" → "Deploy from GitHub"
4. Select your repo
5. Railway will auto-deploy on every push!

### Benefits:
- ✅ Automatic deployments on git push
- ✅ Preview deployments for PRs
- ✅ Rollback capability
- ✅ Build logs tracking

---

## 📈 Monitoring

### Railway provides:
- 📊 CPU & Memory usage graphs
- 📝 Realtime logs
- 🚀 Deployment history
- ⚡ Build times
- 🌐 Network metrics

Access via: https://railway.app/dashboard

---

## 💰 Pricing

### Free Tier:
- $5 worth of usage per month
- Static sites like this calendar = **almost free**
- No credit card required to start

### Pro Tier ($20/month):
- $20 worth of usage included
- Priority support
- Custom domains
- Team collaboration

**Estimated cost untuk kalendar ini:** ~$1-2/month (almost free!)

---

## 🔗 Useful Links

- **Railway Dashboard**: https://railway.app/dashboard
- **Railway Docs**: https://docs.railway.app/
- **Railway CLI Docs**: https://docs.railway.app/develop/cli
- **Firebase Console**: https://console.firebase.google.com/

---

## 📝 Quick Commands Reference

```powershell
# Deploy
railway up

# View logs
railway logs

# Open app
railway open

# Check status
railway status

# Environment variables
railway variables

# Link project
railway link

# Unlink project
railway unlink

# Get domain
railway domain

# Delete project (DANGER!)
railway delete
```

---

## ✅ Post-Deployment Checklist

- [ ] Deploy successful
- [ ] Open main URL - redirects to viewer mode
- [ ] Test viewer mode - calendar displays correctly
- [ ] Test admin mode - can add/edit/delete events
- [ ] Test realtime sync - open both modes, verify instant updates
- [ ] Test mobile responsive - swipe gestures work
- [ ] Test keyboard navigation - arrow keys work
- [ ] Check Firebase console - data saving correctly
- [ ] Test cleanup tool - can view/backup data
- [ ] Add custom domain (optional)
- [ ] Setup GitHub auto-deploy (optional)

---

## 🎉 Success!

Kalendar Portbaek sekarang live di Railway.app dengan full realtime sync functionality!

**Verify realtime sync:**
1. Buka Admin mode
2. Buka Viewer mode (separate tab/device)
3. Add event dalam Admin
4. Lihat event muncul INSTANTLY dalam Viewer!

---

**Created:** January 8, 2026
**Platform:** Railway.app
**Database:** Firebase Realtime Database
**Region:** Auto (Railway chooses optimal)
