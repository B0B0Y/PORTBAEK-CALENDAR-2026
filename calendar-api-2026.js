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
        this.connect();
    }

    connect() {
        try {
            this.ws = new WebSocket(API_CONFIG.wsURL);

            this.ws.onopen = () => {
                console.log('🔌 WebSocket connected');
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (this.onMessageCallback) {
                        this.onMessageCallback(message);
                    }
                } catch (error) {
                    console.error('WebSocket message parse error:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            this.ws.onclose = () => {
                console.log('🔌 WebSocket disconnected, reconnecting...');
                setTimeout(() => this.connect(), this.reconnectDelay);
            };
        } catch (error) {
            console.error('WebSocket connection error:', error);
            setTimeout(() => this.connect(), this.reconnectDelay);
        }
    }

    onMessage(callback) {
        this.onMessageCallback = callback;
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }
}

// API Client
class CalendarAPI {
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
        return await this.fetch(`/calendar/${month.toUpperCase()}`);
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
    static async bulkSaveEvents(month, events) {
        return await this.fetch('/events/bulk', {
            method: 'POST',
            body: JSON.stringify({ month: month.toUpperCase(), events })
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
        send: (data) => calendarWS.send(data)
    };
    window.MONTHS_2026 = MONTHS_2026;
}

console.log('✅ Portbaek Calendar API Client loaded (2026)');
console.log('📊 Months:', MONTHS_2026.length);
console.log('🔌 WebSocket:', API_CONFIG.wsURL);
