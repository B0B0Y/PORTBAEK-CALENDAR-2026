# 🔥 Firebase Setup Guide untuk Portbaek Calendar

## Masalah yang Perlu Di-Fix

Dari error log, masalah utama adalah **Firebase Security Rules** yang terlalu strict dan menghalang auto-save.

---

## 📋 Step-by-Step Fix

### 1. Login ke Firebase Console
- Pergi ke: https://console.firebase.google.com/
- Pilih project: **portbaek-calendar**

### 2. Update Security Rules

1. Dari sidebar kiri, click **"Realtime Database"**
2. Click tab **"Rules"**
3. Anda akan nampak rules sedia ada yang strict

#### Current Rules (Yang Menyebabkan Error):
```json
{
  "rules": {
    ".read": "now < 1738368000000",  // 2025-02-01
    ".write": "now < 1738368000000",  // 2025-02-01
  }
}
```

#### ✅ New Rules (Yang Betul):
Replace dengan rules ini:

```json
{
  "rules": {
    "events": {
      ".read": true,
      ".write": true,
      "$eventId": {
        ".validate": "newData.exists()"
      }
    },
    "calendar": {
      ".read": true,
      ".write": true
    }
  }
}
```

**ATAU untuk production yang lebih secure:**

```json
{
  "rules": {
    "events": {
      ".read": true,
      ".write": "auth != null || true",
      "$eventId": {
        "date": {
          ".validate": "newData.isString()"
        },
        "title": {
          ".validate": "newData.isString() && newData.val().length > 0"
        },
        "color": {
          ".validate": "newData.isString()"
        }
      }
    },
    "calendar": {
      ".read": true,
      ".write": "auth != null || true",
      "$month": {
        "name": {
          ".validate": "newData.isString()"
        },
        "events": {
          ".validate": "newData.exists()"
        }
      }
    }
  }
}
```

4. Click **"Publish"** untuk save rules

---

## 🧪 Test Rules

Selepas update rules, test dengan:

1. Buka: https://november.fly.dev/hmmmmmmmmmnmmmmmmmmnmmm.html
2. Try add event pada mana-mana date
3. Check console - sepatutnya tiada error lagi!

---

## 🔐 Security Best Practices (Optional)

Jika anda nak secure lagi (require authentication):

### Setup Firebase Auth:
1. Dari sidebar, click **"Authentication"**
2. Click **"Get started"**
3. Enable **"Email/Password"** atau **"Anonymous"**

### Update Rules to Require Auth:
```json
{
  "rules": {
    "events": {
      ".read": true,
      ".write": "auth != null"
    },
    "calendar": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

### Add Auth to HTML Files:
Tambah authentication code dalam HTML files (optional, boleh skip for now)

---

## 📊 Monitor Database

### View Current Data:
1. Click tab **"Data"**
2. Expand **"events"** dan **"calendar"** nodes
3. Anda boleh manually edit/delete data dari sini

### Export Backup:
1. Click **⋮** (three dots menu)
2. Click **"Export JSON"**
3. Save backup file

---

## ✅ Checklist

- [ ] Login to Firebase Console
- [ ] Navigate to Realtime Database → Rules
- [ ] Copy and paste new rules
- [ ] Click "Publish"
- [ ] Test by adding event on calendar
- [ ] Verify no more errors in console

---

## 🆘 Troubleshooting

### If Still Getting Errors:

#### Error: "Permission Denied"
- Check rules are published correctly
- Clear browser cache and refresh

#### Error: "undefined in property"
- This means data structure doesn't match
- Check event format in code matches rules

#### Error: "Network Error"
- Check Firebase project is active
- Verify API key is correct in HTML files

### Check Current Config:
Open browser console and run:
```javascript
console.log(window.firebaseDB);
```

Should show database connection to:
```
https://portbaek-calendar-default-rtdb.asia-southeast1.firebasedatabase.app
```

---

## 📞 Need Help?

Check Firebase documentation:
- Rules: https://firebase.google.com/docs/database/security
- Debugging: https://firebase.google.com/docs/database/security/rules-conditions

---

**Created:** November 7, 2025
**Project:** Portbaek Calendar
**Database:** portbaek-calendar
