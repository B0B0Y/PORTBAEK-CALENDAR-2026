# 🤖 GitHub Actions Auto-Deploy Setup

## Automated Deployment ke Railway.app

Setup GitHub Actions untuk auto-deploy Portbaek Calendar ke Railway setiap kali push code ke GitHub.

---

## ✨ Features

- ✅ **Auto-deploy** pada setiap `git push` ke main/master branch
- ✅ **Pull request preview** - test sebelum merge
- ✅ **Manual trigger** - deploy bila-bila masa dari GitHub UI
- ✅ **Automated testing** - verify deployment success
- ✅ **Zero configuration** - setup sekali, works forever!

---

## 📋 Prerequisites

1. ✅ GitHub repository untuk project ini
2. ✅ Railway.app account
3. ✅ Railway project created (boleh guna `railway init` atau create via dashboard)

---

## 🔧 Setup Instructions

### Step 1: Get Railway Token

1. **Login ke Railway:**
   - Pergi ke: https://railway.app/account/tokens

2. **Create New Token:**
   - Click **"Create Token"**
   - Name: `GitHub Actions Deploy` (or apa-apa nama)
   - Click **"Create"**

3. **Copy Token:**
   - Token akan display SEKALI sahaja
   - **Copy dan simpan** - you won't see it again!
   - Format: `railway_token_xxxxxxxxxxxxx`

---

### Step 2: Add Token ke GitHub Secrets

1. **Go to Repository Settings:**
   - Navigate to your GitHub repo
   - Click **Settings** tab
   - Go to **Secrets and variables** → **Actions**

2. **Create New Secret:**
   - Click **"New repository secret"**
   - **Name:** `RAILWAY_TOKEN` (MUST be exactly this!)
   - **Value:** Paste token dari Step 1
   - Click **"Add secret"**

   ⚠️ **IMPORTANT:** Secret name MUST be `RAILWAY_TOKEN` (huruf besar semua!)

---

### Step 3: Configure Railway Service Name (Optional)

Workflow file default menggunakan service name: `portbaek-calendar`

**Jika service name anda berbeza:**

1. Check service name di Railway dashboard
2. Edit [.github/workflows/railway-deploy.yml](.github/workflows/railway-deploy.yml)
3. Update line:
   ```yaml
   run: railway up --service your-service-name
   ```

**Atau remove `--service` flag** untuk deploy ke default service:
```yaml
run: railway up
```

---

### Step 4: Push to GitHub

```bash
# Initialize git (jika belum)
git init

# Add files
git add .

# Commit
git commit -m "Setup GitHub Actions auto-deploy to Railway"

# Add remote (replace dengan your repo URL)
git remote add origin https://github.com/your-username/your-repo.git

# Push to main/master branch
git push -u origin main
```

**🎉 Done!** GitHub Actions akan auto-run dan deploy ke Railway!

---

## 🚀 Workflow Triggers

Workflow akan run automatically pada:

### 1. **Push to Main/Master**
```bash
git push origin main
```
→ Auto-deploy ke Railway production

### 2. **Pull Request**
```bash
# Create PR to main branch
```
→ Test deployment (preview environment)

### 3. **Manual Trigger**
- Go to **Actions** tab di GitHub
- Select **"Deploy to Railway"** workflow
- Click **"Run workflow"**
- Choose branch
- Click **"Run workflow"** button

---

## 📊 Monitor Deployment

### View Workflow Status

1. **GitHub Actions Tab:**
   - Go to your repo
   - Click **Actions** tab
   - See all workflow runs

2. **Workflow Badges (Optional):**
   Add to README.md:
   ```markdown
   ![Deploy to Railway](https://github.com/your-username/your-repo/actions/workflows/railway-deploy.yml/badge.svg)
   ```

### View Deployment Logs

**In GitHub:**
- Actions tab → Click workflow run → View logs

**In Railway:**
- Dashboard → Deployments → Click deployment → View logs

---

## 🔍 Troubleshooting

### ❌ Error: "Invalid Railway token"

**Solution:**
1. Generate new token dari Railway dashboard
2. Update `RAILWAY_TOKEN` secret di GitHub
3. Re-run workflow

### ❌ Error: "Service not found"

**Solution:**
1. Check service name di Railway dashboard
2. Update workflow file dengan correct service name
3. Or remove `--service` flag

### ❌ Error: "Permission denied"

**Solution:**
1. Verify token has correct permissions
2. Regenerate token dengan full access
3. Update GitHub secret

### ⚠️ Workflow not running

**Check:**
1. ✅ Workflow file dalam `.github/workflows/` directory
2. ✅ File name ends with `.yml` or `.yaml`
3. ✅ Pushed to `main` or `master` branch
4. ✅ GitHub Actions enabled dalam repo settings

---

## 🎯 Workflow File Breakdown

```yaml
name: Deploy to Railway
# Nama workflow yang appear dalam GitHub Actions

on:
  push:
    branches: [main, master]
  # Trigger pada push to main/master

  pull_request:
    branches: [main, master]
  # Trigger pada PR to main/master

  workflow_dispatch:
  # Allow manual trigger from UI

jobs:
  deploy:
    runs-on: ubuntu-latest
    # Run pada Ubuntu server

    steps:
      - uses: actions/checkout@v4
        # Download code

      - uses: actions/setup-node@v4
        # Setup Node.js

      - run: npm install -g @railway/cli
        # Install Railway CLI

      - run: railway up --service portbaek-calendar
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        # Deploy using token from secrets
```

---

## 🔐 Security Best Practices

### ✅ DO:
- Store Railway token dalam GitHub Secrets
- Use `RAILWAY_TOKEN` environment variable
- Regenerate tokens periodically
- Limit token permissions bila possible
- Use branch protection rules

### ❌ DON'T:
- Commit tokens dalam code
- Share tokens publicly
- Use personal tokens untuk production
- Hardcode sensitive data
- Push secrets to public repos

---

## 📈 Advanced Configuration

### Deploy to Multiple Environments

Create separate workflows untuk staging & production:

**.github/workflows/deploy-staging.yml:**
```yaml
on:
  push:
    branches: [develop]

env:
  RAILWAY_TOKEN: ${{ secrets.RAILWAY_STAGING_TOKEN }}
```

**.github/workflows/deploy-production.yml:**
```yaml
on:
  push:
    branches: [main]

env:
  RAILWAY_TOKEN: ${{ secrets.RAILWAY_PRODUCTION_TOKEN }}
```

### Add Notifications

**Slack notification on deploy:**
```yaml
- name: Notify Slack
  if: success()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "🚀 Deployed to Railway successfully!"
      }
```

### Add Testing Before Deploy

```yaml
- name: Run tests
  run: |
    # Add your test commands here
    echo "Running tests..."

- name: Deploy
  if: success()
  run: railway up
```

---

## 🔄 Workflow Lifecycle

```
1. Developer push code to GitHub
        ↓
2. GitHub Actions detect push
        ↓
3. Workflow starts (checkout code)
        ↓
4. Install Railway CLI
        ↓
5. Authenticate using RAILWAY_TOKEN
        ↓
6. Deploy to Railway
        ↓
7. Railway build Docker image
        ↓
8. Railway deploy to production
        ↓
9. Success! ✅
        ↓
10. Notifications sent (optional)
```

---

## 📊 Estimated Timing

| Step | Duration |
|------|----------|
| Checkout code | ~5 seconds |
| Setup Node.js | ~10 seconds |
| Install Railway CLI | ~15 seconds |
| Deploy to Railway | ~60-120 seconds |
| **Total** | **~2-3 minutes** |

---

## 💡 Tips & Tricks

### 1. **Speed Up Deployments**
- Use caching untuk Node modules
- Optimize Docker layers
- Use Railway's build cache

### 2. **Debug Failed Deployments**
```bash
# Local testing
railway up --detach
railway logs
```

### 3. **Rollback if Needed**
- Railway dashboard → Deployments → Click previous deployment → Redeploy

### 4. **Environment Variables**
Set dalam Railway dashboard, bukan dalam code:
- Dashboard → Variables → Add variable

---

## ✅ Post-Setup Checklist

- [ ] Railway token generated
- [ ] `RAILWAY_TOKEN` secret added to GitHub
- [ ] Workflow file committed to `.github/workflows/`
- [ ] Code pushed to main/master branch
- [ ] Workflow run successfully di Actions tab
- [ ] App deployed successfully di Railway
- [ ] Test app URL - verify everything works
- [ ] Test realtime sync - admin & viewer modes
- [ ] (Optional) Add workflow badge to README
- [ ] (Optional) Setup branch protection rules

---

## 🆘 Get Help

### GitHub Actions Issues:
- Docs: https://docs.github.com/en/actions
- Community: https://github.community/

### Railway Issues:
- Docs: https://docs.railway.app/
- Discord: https://discord.gg/railway

### Project-Specific Issues:
- Check workflow logs dalam Actions tab
- Check deployment logs dalam Railway dashboard
- Verify Firebase connection (browser console)

---

## 🔗 Related Files

- **Workflow:** [.github/workflows/railway-deploy.yml](.github/workflows/railway-deploy.yml)
- **Railway Config:** [railway.json](railway.json)
- **Dockerfile:** [Dockerfile](Dockerfile)
- **Manual Deploy Script:** [deploy-railway.ps1](deploy-railway.ps1)
- **Railway Guide:** [RAILWAY-DEPLOY.md](RAILWAY-DEPLOY.md)

---

## 🎉 Success!

Sekarang setiap kali anda:
```bash
git add .
git commit -m "Update calendar"
git push origin main
```

**Kalendar akan auto-deploy ke Railway! 🚀**

No manual deployment needed - just push and relax! ☕

---

**Created:** January 8, 2026
**Platform:** GitHub Actions + Railway.app
**Automation Level:** Full CI/CD
**Maintenance:** Zero (set and forget!)
