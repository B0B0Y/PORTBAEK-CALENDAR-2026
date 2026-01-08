# 🚀 Quick Start: GitHub Actions Auto-Deploy

Deploy Portbaek Calendar ke Railway automatically setiap kali `git push`!

---

## ⚡ 5-Minute Setup

### 1️⃣ Get Railway Token (1 min)

```
1. Pergi → https://railway.app/account/tokens
2. Click "Create Token"
3. Name: "GitHub Actions"
4. Click "Create"
5. COPY token yang muncul (akan hilang lepas tu!)
```

---

### 2️⃣ Add GitHub Secret (1 min)

```
1. Pergi GitHub repo → Settings
2. Secrets and variables → Actions
3. Click "New repository secret"
4. Name: RAILWAY_TOKEN
5. Value: <paste token dari step 1>
6. Click "Add secret"
```

---

### 3️⃣ Push Code (1 min)

```bash
git add .
git commit -m "Setup GitHub Actions auto-deploy"
git push origin main
```

---

### 4️⃣ Watch Magic Happen! ✨

```
1. Go to GitHub → Actions tab
2. See workflow running
3. Wait ~2-3 minutes
4. ✅ Deployed automatically!
```

---

## 🎯 That's It!

Sekarang bila-bila masa push code:

```bash
git add .
git commit -m "Update calendar"
git push
```

**Auto-deploy to Railway! 🚀**

---

## 📊 What Happens Behind the Scenes

```
Push to GitHub
    ↓
GitHub Actions triggers
    ↓
Checkout code
    ↓
Install Railway CLI
    ↓
Deploy to Railway
    ↓
Railway builds Docker image
    ↓
Railway deploys to production
    ↓
✅ Live in ~2-3 minutes!
```

---

## 🔍 Verify Deployment

### Check GitHub:
```
GitHub repo → Actions tab → See green checkmark ✅
```

### Check Railway:
```
Railway dashboard → Deployments → See latest deployment
```

### Check Live Site:
```
Open: https://your-app.up.railway.app/
Test: Add event in admin, see in viewer instantly!
```

---

## 🆘 Troubleshooting

### ❌ Workflow failed?

**Check logs:**
```
GitHub → Actions → Click failed workflow → View logs
```

**Common issues:**
- ❌ Wrong token → Regenerate and update secret
- ❌ Wrong service name → Edit workflow file
- ❌ Railway quota exceeded → Upgrade plan

---

### ⚙️ Advanced: Configure Service Name

Jika Railway service name berbeza dari `portbaek-calendar`:

Edit `.github/workflows/railway-deploy.yml`:

```yaml
- name: 🚀 Deploy to Railway
  run: railway up --service YOUR-SERVICE-NAME
```

Or remove `--service` flag untuk auto-detect:

```yaml
- name: 🚀 Deploy to Railway
  run: railway up
```

---

## 📖 Full Documentation

- **Detailed guide:** [GITHUB-ACTIONS.md](GITHUB-ACTIONS.md)
- **Railway deployment:** [RAILWAY-DEPLOY.md](RAILWAY-DEPLOY.md)
- **Firebase setup:** [FIREBASE-SETUP.md](FIREBASE-SETUP.md)

---

## ✅ Success Checklist

- [ ] Railway token generated
- [ ] GitHub secret `RAILWAY_TOKEN` added
- [ ] Code pushed to GitHub
- [ ] Workflow running dalam Actions tab
- [ ] Deployment successful (green checkmark)
- [ ] App accessible via Railway URL
- [ ] Realtime sync working (test admin + viewer)

---

## 🎉 Congratulations!

Your calendar is now on **full autopilot**!

Every push = automatic deployment. No manual steps needed! 🚀

---

**Setup time:** ~5 minutes
**Future deployment time:** 0 minutes (automatic!)
**Maintenance required:** Zero! ✨
