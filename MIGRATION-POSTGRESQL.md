# 🔄 Migration Guide: Firebase → PostgreSQL

## Portbaek Calendar 2026 - Database Migration

Migrate dari Firebase ke Railway PostgreSQL dengan realtime WebSocket sync.

---

## 🎯 Why PostgreSQL?

✅ **Railway Native** - Built-in integration, easier setup
✅ **Better Performance** - Faster queries, proper indexing
✅ **Free Tier** - 512MB database included
✅ **SQL Power** - Complex queries, relationships
✅ **WebSocket Realtime** - Custom realtime sync
✅ **Full Control** - Your data, your rules

---

## 📋 Migration Steps

### **Phase 1: Deploy PostgreSQL Backend** (15 minutes)

#### Step 1: Create PostgreSQL Database on Railway

1. **Go to Railway Dashboard:**
   ```
   https://railway.app/dashboard
   ```

2. **Select Your Project:** `portbaek-calendar`

3. **Add PostgreSQL:**
   - Click **"+ New"** button
   - Select **"Database"**
   - Choose **"PostgreSQL"**
   - Click **"Add PostgreSQL"**

4. **Wait for Provisioning** (~30 seconds)
   - Database akan auto-create
   - Railway akan generate DATABASE_URL

5. **Copy Database Connection:**
   - Click PostgreSQL service
   - Go to **"Connect"** tab
   - Copy **"Postgres Connection URL"**
   - Format: `postgresql://user:pass@host:port/db`

---

#### Step 2: Deploy Backend API

1. **Create New Service for Backend:**
   - In same project, click **"+ New"**
   - Select **"GitHub Repo"**
   - Choose `B0B0Y/PORTBAEK-CALENDAR-2026`
   - Railway will detect Node.js app

2. **Configure Backend Service:**
   - Click backend service
   - Go to **"Settings"** tab
   - **Root Directory:** `/backend`
   - **Start Command:** `npm start`

3. **Add Environment Variables:**
   Click **"Variables"** tab:
   ```
   DATABASE_URL = (paste from PostgreSQL service)
   NODE_ENV = production
   FRONTEND_URL = https://november-production.up.railway.app
   ```

4. **Deploy:**
   - Railway will auto-deploy
   - Wait ~2-3 minutes for build
   - Check logs for ✅ success messages

5. **Generate Domain:**
   - Go to **"Settings"** → **"Networking"**
   - Click **"Generate Domain"**
   - Note the URL: `portbaek-calendar-backend.up.railway.app`

---

#### Step 3: Initialize Database

**Option A: Automatic (Recommended)**

Railway akan auto-run migrations bila deploy. Check logs untuk:
```
✅ Connected to PostgreSQL database
📄 Executing schema.sql...
✅ Database schema created successfully
```

**Option B: Manual**

Kalau perlu manual init:
```bash
# Local machine
cd backend
npm install
DATABASE_URL="your-railway-postgres-url" npm run init-db
```

---

#### Step 4: Test API

**Test endpoints:**

1. **Health Check:**
   ```
   https://portbaek-calendar-backend.up.railway.app/health
   ```
   Should return: `{"status":"ok","database":"postgresql"}`

2. **Get Events:**
   ```
   https://portbaek-calendar-backend.up.railway.app/api/events
   ```
   Should return: `{"success":true,"data":[...]}`

3. **Get January 2026:**
   ```
   https://portbaek-calendar-backend.up.railway.app/api/events/JANUARY
   ```

---

### **Phase 2: Update Frontend** (30 minutes)

#### Step 1: Update HTML Files

Files yang perlu update:
- `hmmmmmmmmmnmmmmnmmmmmm.html` (Viewer Mode)
- `hmmmmmmmmmnmmmmmmmmnmmm.html` (Admin Mode)

**Changes needed:**

**1. Replace Firebase SDK dengan fetch API:**
```javascript
// OLD (Firebase):
import { initializeApp } from 'firebase/app';
const app = initializeApp(firebaseConfig);

// NEW (PostgreSQL API):
const API_URL = 'https://portbaek-calendar-backend.up.railway.app/api';
```

**2. Update saveToFirebase():**
```javascript
// OLD:
async function saveToFirebase() {
    await set(ref(database, `calendar/${monthName}`), data);
}

// NEW:
async function saveToDatabase() {
    const response = await fetch(`${API_URL}/events/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: monthName, events: eventArray })
    });
    return response.json();
}
```

**3. Update loadFromFirebase():**
```javascript
// OLD:
async function loadFromFirebase() {
    const snapshot = await get(ref(database, `calendar/${monthName}`));
    return snapshot.val();
}

// NEW:
async function loadFromDatabase() {
    const response = await fetch(`${API_URL}/calendar/${monthName}`);
    const data = await response.json();
    return data.data;
}
```

**4. Add WebSocket for Realtime Sync:**
```javascript
// WebSocket connection
const WS_URL = 'wss://portbaek-calendar-backend.up.railway.app';
let ws = null;

function connectWebSocket() {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
        console.log('🔌 WebSocket connected');
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        // Handle different event types
        if (message.type === 'event_created' ||
            message.type === 'event_updated' ||
            message.type === 'event_deleted' ||
            message.type === 'events_bulk_update') {

            // Reload current month data
            loadFromDatabase(currentMonthName).then(data => {
                updateCalendar(data);
            });
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('🔌 WebSocket disconnected, reconnecting...');
        setTimeout(connectWebSocket, 3000); // Reconnect after 3s
    };
}

// Initialize on page load
connectWebSocket();
```

**5. Update Month Data to 2026:**
```javascript
// OLD:
const monthsData = [
    { name: "NOVEMBER", year: 2025, startDay: 4, days: 30 },
    { name: "DECEMBER", year: 2025, startDay: 0, days: 31 }
];

// NEW (All 12 months of 2026):
const monthsData = [
    { name: "JANUARY", year: 2026, startDay: 4, days: 31 },
    { name: "FEBRUARY", year: 2026, startDay: 0, days: 28 },
    { name: "MARCH", year: 2026, startDay: 0, days: 31 },
    { name: "APRIL", year: 2026, startDay: 3, days: 30 },
    { name: "MAY", year: 2026, startDay: 5, days: 31 },
    { name: "JUNE", year: 2026, startDay: 1, days: 30 },
    { name: "JULY", year: 2026, startDay: 3, days: 31 },
    { name: "AUGUST", year: 2026, startDay: 6, days: 31 },
    { name: "SEPTEMBER", year: 2026, startDay: 2, days: 30 },
    { name: "OCTOBER", year: 2026, startDay: 4, days: 31 },
    { name: "NOVEMBER", year: 2026, startDay: 0, days: 30 },
    { name: "DECEMBER", year: 2026, startDay: 2, days: 31 }
];
```

---

### **Phase 3: Test Realtime Sync** (10 minutes)

#### Test Procedure:

1. **Open Admin Mode:**
   ```
   https://november-production.up.railway.app/hmmmmmmmmmnmmmmmmmmnmmm.html
   ```

2. **Open Viewer Mode (separate tab/window):**
   ```
   https://november-production.up.railway.app/hmmmmmmmmmnmmmmnmmmmmm.html
   ```

3. **In Admin Mode:**
   - Open browser console (F12)
   - Should see: `🔌 WebSocket connected`
   - Click any date
   - Add event: "Test PostgreSQL Sync"
   - Choose color
   - Click Save

4. **In Viewer Mode:**
   - Check console: `🔌 WebSocket connected`
   - **Event should appear INSTANTLY!**
   - No refresh needed! ✨

5. **Test Edit & Delete:**
   - Edit event in admin → updates in viewer
   - Delete event in admin → removes from viewer

---

## 📊 Feature Comparison

| Feature | Firebase | PostgreSQL + WebSocket |
|---------|----------|----------------------|
| **Realtime Sync** | ✅ Built-in | ✅ Custom WebSocket |
| **Query Performance** | ⚠️ Limited | ✅ SQL Power |
| **Free Tier** | ✅ 1GB | ✅ 512MB |
| **Cost (estimate)** | $0-5/month | $0/month (Railway) |
| **Setup Complexity** | Easy | Moderate |
| **Data Control** | ⚠️ Firebase servers | ✅ Your database |
| **Offline Support** | ✅ Native | ⚠️ Needs implementation |
| **Railway Integration** | ❌ External | ✅ Native |

---

## 🔄 Migration Checklist

**Backend Setup:**
- [ ] PostgreSQL database created on Railway
- [ ] Backend service deployed
- [ ] DATABASE_URL configured
- [ ] Database initialized (schema + tables)
- [ ] API endpoints tested (health, events)
- [ ] WebSocket server running

**Frontend Update:**
- [ ] Remove Firebase SDK imports
- [ ] Replace Firebase functions with fetch API
- [ ] Add WebSocket client code
- [ ] Update month data to 2026 (12 months)
- [ ] Test API connections
- [ ] Verify error handling

**Testing:**
- [ ] Admin mode loads correctly
- [ ] Viewer mode loads correctly
- [ ] Can create events
- [ ] Can edit events
- [ ] Can delete events
- [ ] Realtime sync works (admin → viewer)
- [ ] WebSocket reconnects on disconnect
- [ ] All 12 months of 2026 accessible

**Deployment:**
- [ ] Push updated code to GitHub
- [ ] Railway auto-deploys frontend
- [ ] Test live URLs
- [ ] Verify production WebSocket connection
- [ ] Check Railway logs for errors

---

## 🆘 Troubleshooting

### API Not Responding

**Check:**
```bash
# Test health endpoint
curl https://portbaek-calendar-backend.up.railway.app/health

# Expected: {"status":"ok","database":"postgresql"}
```

**Fix:**
- Check Railway logs
- Verify DATABASE_URL is set
- Restart backend service

### WebSocket Not Connecting

**Check browser console:**
```javascript
// Should see:
🔌 WebSocket connected

// If seeing errors:
WebSocket connection failed
```

**Fix:**
- Verify backend has WebSocket support
- Check CORS settings
- Ensure wss:// (not ws://) for production

### Database Connection Errors

**Check Railway logs:**
```
❌ Error connecting to PostgreSQL
```

**Fix:**
- Verify PostgreSQL service is running
- Check DATABASE_URL format
- Restart PostgreSQL service

### Events Not Syncing

**Check:**
- Open browser console in both windows
- Verify WebSocket connected in both
- Check network tab for API calls

**Fix:**
- Reconnect WebSocket
- Check API response status
- Verify event data format

---

## 📖 API Documentation

### Base URL
```
https://portbaek-calendar-backend.up.railway.app/api
```

### Endpoints

**GET /health**
- Health check
- Returns: `{"status":"ok","database":"postgresql"}`

**GET /api/events**
- Get all events
- Returns: `{"success":true,"data":[...]}`

**GET /api/events/:month**
- Get events for specific month
- Example: `/api/events/JANUARY`
- Returns: `{"success":true,"data":[...]}`

**POST /api/events**
- Create new event
- Body: `{"date":"2026-01-15","title":"Event","color":"#5865F2","month":"JANUARY"}`
- Returns: `{"success":true,"data":{...}}`

**PUT /api/events/:id**
- Update event
- Body: `{"title":"Updated Title","color":"#57F287"}`
- Returns: `{"success":true,"data":{...}}`

**DELETE /api/events/:id**
- Delete event
- Returns: `{"success":true,"message":"Event deleted"}`

**POST /api/events/bulk**
- Bulk save events for a month
- Body: `{"month":"JANUARY","events":[...]}`
- Returns: `{"success":true}`

**GET /api/calendar/:month**
- Get calendar data (Firebase-compatible format)
- Returns: `{"success":true,"data":{"name":"JANUARY","events":{...}}}`

---

## 🚀 Next Steps

1. **Deploy Backend** (follow Phase 1)
2. **Test API** (ensure all endpoints work)
3. **Update Frontend** (follow Phase 2)
4. **Test Realtime Sync** (follow Phase 3)
5. **Monitor & Optimize**

---

**Created:** January 8, 2026
**Migration Type:** Firebase → PostgreSQL
**Calendar Year:** 2026 (All 12 months)
**Realtime Method:** WebSocket
**Platform:** Railway.app
