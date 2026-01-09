/**
 * Portbaek Calendar API Client
 * PostgreSQL Backend with WebSocket Realtime Sync
 * Calendar Year: 2026 (January - December)
 */

// API Configuration
const API_CONFIG = {
    baseURL: 'https://backend-production-3c29.up.railway.app/api',
    wsURL: 'wss://backend-production-3c29.up.railway.app',
    timeout: 10000
};

// Calendar Data for 2026 (12 Months)
const MONTHS_2026 = [
    { name: "JANUARY", year: "2026", startDay: 4, days: 31, events: {} },
    { name: "FEBRUARY", year: "2026", startDay: 0, days: 28, events: {} },
    { name: "MARCH", year: "2026", startDay: 0, days: 31, events: {} },
    { name: "APRIL", year: "2026", startDay: 3, days: 30, events: {} },
    { name: "MAY", year: "2026", startDay: 5, days: 31, events: {} },
    { name: "JUNE", year: "2026", startDay: 1, days: 30, events: {} },
    { name: "JULY", year: "2026", startDay: 3, days: 31, events: {} },
    { name: "AUGUST", year: "2026", startDay: 6, days: 31, events: {} },
    { name: "SEPTEMBER", year: "2026", startDay: 2, days: 30, events: {} },
    { name: "OCTOBER", year: "2026", startDay: 4, days: 31, events: {} },
    { name: "NOVEMBER", year: "2026", startDay: 0, days: 30, events: {} },
    { name: "DECEMBER", year: "2026", startDay: 2, days: 31, events: {} }
];

// WebSocket Client
class CalendarWebSocket {
    constructor() {
        this.ws = null;
        this.reconnectDelay = 3000;
        this.onMessageCallback = null;
        this.isConnected = false;
        this.connectionAttempts = 0;
        this.maxRetries = 5;
        this.connect();
    }

    connect() {
        // Prevent multiple connection attempts
        if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
            console.log('ℹ️ WebSocket already connected or connecting');
            return;
        }

        try {
            this.connectionAttempts++;
            console.log(`🔌 Attempting WebSocket connection... (attempt ${this.connectionAttempts}/${this.maxRetries})`);

            this.ws = new WebSocket(API_CONFIG.wsURL);

            this.ws.onopen = () => {
                console.log('✅ WebSocket connected successfully');
                this.isConnected = true;
                this.connectionAttempts = 0; // Reset on success
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('📨 WebSocket message received:', message);
                    if (this.onMessageCallback) {
                        this.onMessageCallback(message);
                    }
                } catch (error) {
                    console.error('❌ WebSocket message parse error:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.isConnected = false;
            };

            this.ws.onclose = (event) => {
                this.isConnected = false;
                console.log('🔌 WebSocket disconnected', { code: event.code, reason: event.reason });

                // Only reconnect if under max retries
                if (this.connectionAttempts < this.maxRetries) {
                    console.log(`⏳ Reconnecting in ${this.reconnectDelay}ms...`);
                    setTimeout(() => this.connect(), this.reconnectDelay);
                } else {
                    console.warn('⚠️ Max WebSocket reconnection attempts reached. Manual refresh required.');
                }
            };
        } catch (error) {
            console.error('❌ WebSocket connection error:', error);
            this.isConnected = false;
            if (this.connectionAttempts < this.maxRetries) {
                setTimeout(() => this.connect(), this.reconnectDelay);
            }
        }
    }

    onMessage(callback) {
        this.onMessageCallback = callback;
        console.log('✅ WebSocket message listener registered');
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('⚠️ Cannot send: WebSocket not connected');
        }
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            readyState: this.ws ? this.ws.readyState : null,
            attempts: this.connectionAttempts
        };
    }
}

// API Client
class CalendarAPI {
    static get baseURL() {
        return API_CONFIG.baseURL;
    }

    static async fetch(endpoint, options = {}) {
        const url = `${API_CONFIG.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    // Get all events
    static async getAllEvents() {
        return await this.fetch('/events');
    }

    // Get events for specific month
    static async getEventsByMonth(month) {
        return await this.fetch(`/events/${month.toUpperCase()}`);
    }

    // Get calendar data (Firebase-compatible format)
    static async getCalendar(month) {
        const response = await this.fetch(`/calendar/${month.toUpperCase()}`);

        // Transform backend format to frontend format
        // Backend: events["2026-01-15"] = [...]
        // Frontend: events[15] = [...]
        if (response.success && response.data && response.data.events) {
            const transformedEvents = {};

            for (const [dateKey, dayEvents] of Object.entries(response.data.events)) {
                // Extract day number from date string "2026-01-15" -> 15
                const dayNum = parseInt(dateKey.split('-')[2]);
                transformedEvents[dayNum] = dayEvents;
            }

            response.data.events = transformedEvents;
        }

        return response;
    }

    // Create new event
    static async createEvent(eventData) {
        return await this.fetch('/events', {
            method: 'POST',
            body: JSON.stringify(eventData)
        });
    }

    // Update event
    static async updateEvent(id, eventData) {
        return await this.fetch(`/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(eventData)
        });
    }

    // Delete event
    static async deleteEvent(id) {
        return await this.fetch(`/events/${id}`, {
            method: 'DELETE'
        });
    }

    // Bulk save events for a month
    static async bulkSaveEvents(month, events, section_id = null) {
        const payload = {
            month: month.toUpperCase(),
            events
        };

        // Include section_id if provided (for partial saves)
        if (section_id) {
            payload.section_id = section_id;
        }

        return await this.fetch('/events/bulk', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }
}

// Initialize WebSocket
const calendarWS = new CalendarWebSocket();

// Export for use in HTML files
if (typeof window !== 'undefined') {
    window.CalendarAPI = CalendarAPI;
    window.CalendarWebSocket = {
        onMessage: (callback) => calendarWS.onMessage(callback),
        send: (data) => calendarWS.send(data),
        getStatus: () => calendarWS.getConnectionStatus()
    };
    window.MONTHS_2026 = MONTHS_2026;
}

console.log('✅ Portbaek Calendar API Client loaded (2026)');
console.log('📊 Months:', MONTHS_2026.length);
console.log('🔌 WebSocket:', API_CONFIG.wsURL);
