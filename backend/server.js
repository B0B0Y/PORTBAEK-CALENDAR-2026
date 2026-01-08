const express = require('express');
const { Pool } = require('pg');
const WebSocket = require('ws');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error connecting to PostgreSQL:', err.stack);
    } else {
        console.log('✅ Connected to PostgreSQL database');
        release();
    }
});

// WebSocket server for realtime sync
const wss = new WebSocket.Server({ noServer: true });
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('🔌 New WebSocket client connected');
    clients.add(ws);

    ws.on('close', () => {
        console.log('🔌 Client disconnected');
        clients.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
    });
});

// Broadcast changes to all connected clients
function broadcast(data) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// ==================== API ROUTES ====================

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', database: 'postgresql', timestamp: new Date().toISOString() });
});

// Get all events
app.get('/api/events', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM events ORDER BY date ASC');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get events by month
app.get('/api/events/:month', async (req, res) => {
    try {
        const { month } = req.params;
        const result = await pool.query(
            'SELECT * FROM events WHERE month = $1 ORDER BY date ASC',
            [month.toUpperCase()]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching events by month:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new event
app.post('/api/events', async (req, res) => {
    try {
        const { date, title, color, month } = req.body;

        if (!date || !title || !month) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: date, title, month'
            });
        }

        const result = await pool.query(
            'INSERT INTO events (date, title, color, month) VALUES ($1, $2, $3, $4) RETURNING *',
            [date, title, color || '#5865F2', month.toUpperCase()]
        );

        const newEvent = result.rows[0];

        // Broadcast to all connected clients
        broadcast({
            type: 'event_created',
            data: newEvent
        });

        res.json({ success: true, data: newEvent });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update event
app.put('/api/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { date, title, color, month } = req.body;

        const result = await pool.query(
            'UPDATE events SET date = COALESCE($1, date), title = COALESCE($2, title), color = COALESCE($3, color), month = COALESCE($4, month), updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
            [date, title, color, month?.toUpperCase(), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        const updatedEvent = result.rows[0];

        // Broadcast to all connected clients
        broadcast({
            type: 'event_updated',
            data: updatedEvent
        });

        res.json({ success: true, data: updatedEvent });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete event
app.delete('/api/events/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM events WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        // Broadcast to all connected clients
        broadcast({
            type: 'event_deleted',
            data: { id }
        });

        res.json({ success: true, message: 'Event deleted', data: result.rows[0] });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Bulk save events (for compatibility with existing save system)
app.post('/api/events/bulk', async (req, res) => {
    const client = await pool.connect();

    try {
        const { month, events } = req.body;

        if (!month || !events) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: month, events'
            });
        }

        await client.query('BEGIN');

        // Delete existing events for this month
        await client.query('DELETE FROM events WHERE month = $1', [month.toUpperCase()]);

        // Insert new events
        for (const event of events) {
            await client.query(
                'INSERT INTO events (date, title, color, month) VALUES ($1, $2, $3, $4)',
                [event.date, event.title, event.color || '#5865F2', month.toUpperCase()]
            );
        }

        await client.query('COMMIT');

        // Broadcast to all connected clients
        broadcast({
            type: 'events_bulk_update',
            data: { month }
        });

        res.json({ success: true, message: 'Events saved successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error bulk saving events:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
});

// Get calendar data grouped by month (Firebase compatibility)
app.get('/api/calendar/:month', async (req, res) => {
    try {
        const { month } = req.params;
        const result = await pool.query(
            'SELECT * FROM events WHERE month = $1 ORDER BY date ASC',
            [month.toUpperCase()]
        );

        // Format similar to Firebase structure
        const calendarData = {
            name: month.toUpperCase(),
            events: result.rows.reduce((acc, event) => {
                const dateKey = event.date.toISOString().split('T')[0];
                if (!acc[dateKey]) {
                    acc[dateKey] = [];
                }
                acc[dateKey].push({
                    id: event.id,
                    title: event.title,
                    color: event.color
                });
                return acc;
            }, {})
        };

        res.json({ success: true, data: calendarData });
    } catch (error) {
        console.error('Error fetching calendar data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start HTTP server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
});

// Upgrade HTTP server to handle WebSocket connections
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        pool.end(() => {
            console.log('Database pool closed');
            process.exit(0);
        });
    });
});
