# 🔧 HTML Migration Script - Replace These Sections

## For VIEWER MODE (hmmmmmmmmmnmmmmnmmmmmm.html)

### REPLACE #1: Firebase SDK Section (Lines ~1859-1888)

**FIND THIS:**
```html
    <!-- Firebase SDK -->
    <script type="module">
        // Import Firebase modules
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
        import { getDatabase, ref, get, onValue } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

        // Firebase Configuration
        const firebaseConfig = {
            apiKey: "AIzaSyBku_z2Oiu0IoCdx--Zoi-bLciacl7QTCM",
            authDomain: "portbaek-calendar.firebaseapp.com",
            databaseURL: "https://portbaek-calendar-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "portbaek-calendar",
            storageBucket: "portbaek-calendar.firebasestorage.app",
            messagingSenderId: "237213935811",
            appId: "1:237213935811:web:23e8d54d2cb4c0fe789a76",
            measurementId: "G-733V2TJG66"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const database = getDatabase(app);

        // Make Firebase available globally
        window.firebaseDB = database;
        window.firebaseRef = ref;
        window.firebaseGet = get;
        window.firebaseOnValue = onValue;

        console.log('🔥 Firebase initialized successfully! (Viewer Mode)');
    </script>
```

**REPLACE WITH:**
```html
    <!-- Calendar API 2026 - PostgreSQL Backend -->
    <script src="calendar-api-2026.js"></script>
    <script>
        console.log('✅ Calendar API 2026 loaded! (Viewer Mode)');
        console.log('📊 Months available:', MONTHS_2026.length);
        console.log('🔌 WebSocket ready for realtime sync');
    </script>
```

---

### REPLACE #2: monthsData Array (Lines ~1895-1912)

**FIND THIS:**
```javascript
        const monthsData = [
            // November 2025 - EMPTY (User will add their own events)
            {
                name: "NOVEMBER",
                year: "2025",
                startDay: 6, // Saturday (0=Sun, 6=Sat)
                days: 30,
                events: {} // Empty - no default events
            },
            // December 2025 - EMPTY (User will add their own events)
            {
                name: "DECEMBER",
                year: "2025",
                startDay: 1, // Monday (0=Sun, 1=Mon)
                days: 31,
                events: {} // Empty - no default events
            }
        ];
```

**REPLACE WITH:**
```javascript
        // Calendar 2026 - 12 Months (from API client)
        const monthsData = MONTHS_2026;
        console.log('📅 Calendar loaded: 2026 with', monthsData.length, 'months');
```

---

### REPLACE #3: setupRealtimeSync Function (Lines ~2716-2756)

**FIND THIS:**
```javascript
        function setupRealtimeSync() {
            try {
                // Unsubscribe from previous month listener if exists
                if (firebaseUnsubscribe) {
                    console.log('🔕 Viewer: Unsubscribing from previous month listener');
                    firebaseUnsubscribe();
                    firebaseUnsubscribe = null;
                }

                // Listen for changes to current month
                const currentMonthName = monthsData[currentMonthIndex].name;
                const dbRef = window.firebaseRef(window.firebaseDB, `calendar/${currentMonthName}`);

                firebaseUnsubscribe = window.firebaseOnValue(dbRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        monthsData[currentMonthIndex] = data;
                        console.log(`🔄 Viewer: Month ${currentMonthName} updated from Firebase`);
                        renderCalendar(currentMonthIndex);
                    } else {
                        console.log(`ℹ️ Viewer: No data for ${currentMonthName}`);
                    }
                });

                console.log(`🔔 Viewer: Listening to ${currentMonthName} changes`);
            } catch (error) {
                console.error('❌ Error setting up realtime sync:', error);
            }
        }
```

**REPLACE WITH:**
```javascript
        function setupRealtimeSync() {
            try {
                const currentMonthName = monthsData[currentMonthIndex].name;

                // Load events from PostgreSQL
                CalendarAPI.getCalendar(currentMonthName)
                    .then(response => {
                        if (response.success && response.data) {
                            monthsData[currentMonthIndex] = response.data;
                            renderCalendar(currentMonthIndex);
                            console.log(`✅ Loaded ${currentMonthName} from PostgreSQL`);
                        }
                    })
                    .catch(error => {
                        console.error(`❌ Error loading ${currentMonthName}:`, error);
                    });

                // WebSocket listener for realtime updates
                CalendarWebSocket.onMessage((message) => {
                    if (message.type === 'event_created' ||
                        message.type === 'event_updated' ||
                        message.type === 'event_deleted' ||
                        message.type === 'events_bulk_update') {

                        // Reload current month
                        CalendarAPI.getCalendar(currentMonthName)
                            .then(response => {
                                if (response.success && response.data) {
                                    monthsData[currentMonthIndex] = response.data;
                                    renderCalendar(currentMonthIndex);
                                    console.log(`🔄 Realtime update: ${currentMonthName} refreshed`);
                                }
                            });
                    }
                });

                console.log(`🔔 Viewer: Listening to ${currentMonthName} changes (WebSocket)`);
            } catch (error) {
                console.error('❌ Error setting up realtime sync:', error);
            }
        }
```

---

## For ADMIN MODE (hmmmmmmmmmnmmmmmmmmnmmm.html)

### REPLACE #1: Firebase SDK Section (Similar to viewer, lines ~2004-2030)

**Same replacement as Viewer Mode Replace #1**

---

### REPLACE #2: monthsData Array (Similar to viewer, lines ~2037-2054)

**Same replacement as Viewer Mode Replace #2**

---

### REPLACE #3: saveToFirebase Function (Lines ~3150-3180 approximately)

**FIND THIS:**
```javascript
        async function saveToFirebase() {
            try {
                const currentMonthName = monthsData[currentMonthIndex].name;
                const dataToSave = monthsData[currentMonthIndex];

                const dbRef = window.firebaseRef(window.firebaseDB, `calendar/${currentMonthName}`);
                await window.firebaseSet(dbRef, dataToSave);

                console.log(`✅ Saved ${currentMonthName} to Firebase`);
                showToast(`✅ Saved to cloud`, 'success');
            } catch (error) {
                console.error('❌ Error saving to Firebase:', error);
                showToast('❌ Save failed', 'error');
            }
        }
```

**REPLACE WITH:**
```javascript
        async function saveToPostgreSQL() {
            try {
                const currentMonthName = monthsData[currentMonthIndex].name;
                const currentMonthData = monthsData[currentMonthIndex];

                // Extract events array from current month
                const eventsArray = [];
                if (currentMonthData.events) {
                    for (const [date, dayEvents] of Object.entries(currentMonthData.events)) {
                        if (Array.isArray(dayEvents)) {
                            dayEvents.forEach(event => {
                                eventsArray.push({
                                    date: date,
                                    title: event.title,
                                    color: event.color || '#5865F2',
                                    month: currentMonthName
                                });
                            });
                        }
                    }
                }

                const response = await CalendarAPI.bulkSaveEvents(currentMonthName, eventsArray);

                if (response.success) {
                    console.log(`✅ Saved ${currentMonthName} to PostgreSQL`);
                    showToast(`✅ Saved to cloud`, 'success');
                } else {
                    throw new Error(response.error || 'Save failed');
                }
            } catch (error) {
                console.error('❌ Error saving to PostgreSQL:', error);
                showToast('❌ Save failed', 'error');
            }
        }

        // Alias for backward compatibility
        const saveToFirebase = saveToPostgreSQL;
```

---

### REPLACE #4: setupRealtimeSync Function (Similar to viewer but with admin features)

**FIND similar Firebase onValue setup**

**REPLACE WITH similar WebSocket setup as Viewer, but keep admin-specific features**

---

## 🎯 SUMMARY OF CHANGES:

**For Each HTML File:**
1. Replace Firebase SDK → calendar-api-2026.js
2. Replace monthsData 2025 (2 months) → MONTHS_2026 (12 months)
3. Replace Firebase functions → CalendarAPI functions
4. Replace Firebase onValue → WebSocket listeners

**Files to update:**
- hmmmmmmmmmnmmmmnmmmmmm.html (Viewer)
- hmmmmmmmmmnmmmmmmmmnmmm.html (Admin)

---

## ⚠️ NOTES:

- Keep all other code unchanged
- Test after each replacement
- Save backup before editing
- Both files need same changes (with admin-specific additions)

---

This migration script shows exactly what to find and replace in each file.
