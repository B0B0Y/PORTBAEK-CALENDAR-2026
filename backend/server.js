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

// ==================== SECTIONS API ====================

// Get all sections
app.get('/api/sections', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM sections ORDER BY name ASC');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching sections:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new section
app.post('/api/sections', async (req, res) => {
    try {
        const { name, color, discord_channel_id, enabled } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: name'
            });
        }

        const result = await pool.query(
            'INSERT INTO sections (name, color, discord_channel_id, enabled) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, color || '#5865F2', discord_channel_id, enabled !== undefined ? enabled : true]
        );

        const newSection = result.rows[0];

        // Broadcast to all connected clients
        broadcast({
            type: 'section_created',
            data: newSection
        });

        res.json({ success: true, data: newSection });
    } catch (error) {
        console.error('Error creating section:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update section
app.put('/api/sections/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, color, discord_channel_id, enabled } = req.body;

        const result = await pool.query(
            'UPDATE sections SET name = COALESCE($1, name), color = COALESCE($2, color), discord_channel_id = COALESCE($3, discord_channel_id), enabled = COALESCE($4, enabled), updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
            [name, color, discord_channel_id, enabled, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Section not found' });
        }

        const updatedSection = result.rows[0];

        // Broadcast to all connected clients
        broadcast({
            type: 'section_updated',
            data: updatedSection
        });

        res.json({ success: true, data: updatedSection });
    } catch (error) {
        console.error('Error updating section:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete section
app.delete('/api/sections/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM sections WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Section not found' });
        }

        // Broadcast to all connected clients
        broadcast({
            type: 'section_deleted',
            data: { id }
        });

        res.json({ success: true, message: 'Section deleted', data: result.rows[0] });
    } catch (error) {
        console.error('Error deleting section:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== EVENTS API ====================

// Get all events
app.get('/api/events', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.*, s.name as section_name, s.color as section_color
            FROM events e
            LEFT JOIN sections s ON e.section_id = s.id
            ORDER BY date ASC
        `);
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
            `SELECT e.*, s.name as section_name, s.color as section_color
             FROM events e
             LEFT JOIN sections s ON e.section_id = s.id
             WHERE month = $1
             ORDER BY date ASC`,
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
        const { date, title, color, month, section_id } = req.body;

        if (!date || !title || !month) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: date, title, month'
            });
        }

        const result = await pool.query(
            'INSERT INTO events (date, title, color, month, section_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [date, title, color || '#5865F2', month.toUpperCase(), section_id || null]
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
        const { date, title, color, month, section_id } = req.body;

        const result = await pool.query(
            'UPDATE events SET date = COALESCE($1, date), title = COALESCE($2, title), color = COALESCE($3, color), month = COALESCE($4, month), section_id = COALESCE($5, section_id), updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
            [date, title, color, month?.toUpperCase(), section_id, id]
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
        const { month, events, section_id } = req.body;

        if (!month || !events) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: month, events'
            });
        }

        await client.query('BEGIN');

        // Check if section_id column exists first
        const columnCheck = await client.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'events' AND column_name = 'section_id'
        `);
        const hasSectionColumn = columnCheck.rows.length > 0;

        // Delete existing events for this month (filtered by section if provided)
        if (section_id && hasSectionColumn) {
            // Delete only events for this section in this month
            console.log(`🗑️ Deleting events for month: ${month.toUpperCase()}, section: ${section_id}`);
            await client.query(
                'DELETE FROM events WHERE month = $1 AND section_id = $2',
                [month.toUpperCase(), section_id]
            );
        } else {
            // Delete all events for this month (backward compatible)
            console.log(`🗑️ Deleting ALL events for month: ${month.toUpperCase()}`);
            await client.query('DELETE FROM events WHERE month = $1', [month.toUpperCase()]);
        }

        // CRITICAL: De-duplicate events before inserting
        console.log(`📊 Events received: ${events.length}`);
        const uniqueEventsMap = new Map();
        events.forEach(event => {
            const key = `${event.date}|${event.title}|${event.section_id || section_id || 'null'}`;
            if (!uniqueEventsMap.has(key)) {
                uniqueEventsMap.set(key, event);
            }
        });

        const uniqueEvents = Array.from(uniqueEventsMap.values());
        const duplicatesRemoved = events.length - uniqueEvents.length;

        if (duplicatesRemoved > 0) {
            console.log(`⚠️ Removed ${duplicatesRemoved} duplicate(s) before inserting`);
            console.log(`✅ Will insert ${uniqueEvents.length} unique events`);
        } else {
            console.log(`✅ All ${uniqueEvents.length} events are unique`);
        }

        // Insert new events (from de-duplicated array)
        for (const event of uniqueEvents) {
            if (hasSectionColumn) {
                // New schema with section_id
                await client.query(
                    'INSERT INTO events (date, title, color, month, section_id) VALUES ($1, $2, $3, $4, $5)',
                    [event.date, event.title, event.color || '#5865F2', month.toUpperCase(), event.section_id || section_id || null]
                );
            } else {
                // Old schema without section_id
                await client.query(
                    'INSERT INTO events (date, title, color, month) VALUES ($1, $2, $3, $4)',
                    [event.date, event.title, event.color || '#5865F2', month.toUpperCase()]
                );
            }
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

// ==================== DISCORD EXPORT API ====================

// Export calendar to Discord format (grouped by section)
app.get('/api/discord/export/:month', async (req, res) => {
    try {
        const { month } = req.params;
        const { section_id } = req.query;

        let query = `
            SELECT e.*, s.name as section_name, s.color as section_color, s.discord_channel_id
            FROM events e
            LEFT JOIN sections s ON e.section_id = s.id
            WHERE month = $1
        `;

        const params = [month.toUpperCase()];

        if (section_id) {
            query += ' AND e.section_id = $2';
            params.push(section_id);
        }

        query += ' ORDER BY e.section_id, e.date ASC';

        const result = await pool.query(query, params);

        // Group events by section
        const eventsBySection = {};
        result.rows.forEach(event => {
            const sectionKey = event.section_id || 'uncategorized';
            if (!eventsBySection[sectionKey]) {
                eventsBySection[sectionKey] = {
                    section_name: event.section_name || 'Uncategorized',
                    section_color: event.section_color || '#5865F2',
                    discord_channel_id: event.discord_channel_id,
                    events: []
                };
            }
            eventsBySection[sectionKey].events.push({
                date: event.date,
                title: event.title,
                color: event.color
            });
        });

        res.json({
            success: true,
            month: month.toUpperCase(),
            data: eventsBySection
        });
    } catch (error) {
        console.error('Error exporting to Discord format:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get calendar data grouped by month (Firebase compatibility)
app.get('/api/calendar/:month', async (req, res) => {
    try {
        const { month } = req.params;
        const result = await pool.query(
            `SELECT e.*, s.name as section_name, s.color as section_color
             FROM events e
             LEFT JOIN sections s ON e.section_id = s.id
             WHERE e.month = $1
             ORDER BY e.date ASC`,
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
                    color: event.color,
                    section_id: event.section_id,
                    section_name: event.section_name,
                    section_color: event.section_color
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

// Initialize database (run once)
app.post('/api/init-db', async (req, res) => {
    const client = await pool.connect();

    try {
        console.log('🚀 Initializing database schema...');

        // Create sections table
        await client.query(`
            CREATE TABLE IF NOT EXISTS sections (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL UNIQUE,
                color VARCHAR(50) NOT NULL DEFAULT '#5865F2',
                discord_channel_id VARCHAR(100),
                enabled BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create events table (if doesn't exist)
        await client.query(`
            CREATE TABLE IF NOT EXISTS events (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                date DATE NOT NULL,
                title VARCHAR(255) NOT NULL,
                color VARCHAR(50) NOT NULL DEFAULT '#5865F2',
                month VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Add section_id column if it doesn't exist (migration)
        const columnCheck = await client.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'events' AND column_name = 'section_id'
        `);

        if (columnCheck.rows.length === 0) {
            console.log('📝 Adding section_id column to events table...');
            await client.query(`
                ALTER TABLE events
                ADD COLUMN section_id UUID REFERENCES sections(id) ON DELETE CASCADE
            `);
            console.log('✅ section_id column added successfully');
        } else {
            console.log('✓ section_id column already exists');
        }

        // Create indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_events_date ON events(date)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_events_month ON events(month)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_events_section ON events(section_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_sections_name ON sections(name)`);

        // Create updated_at trigger function
        await client.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql
        `);

        // Create triggers for sections
        await client.query(`DROP TRIGGER IF EXISTS update_sections_updated_at ON sections`);
        await client.query(`
            CREATE TRIGGER update_sections_updated_at
                BEFORE UPDATE ON sections
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column()
        `);

        // Create triggers for events
        await client.query(`DROP TRIGGER IF EXISTS update_events_updated_at ON events`);
        await client.query(`
            CREATE TRIGGER update_events_updated_at
                BEFORE UPDATE ON events
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column()
        `);

        // Insert default sections
        await client.query(`
            INSERT INTO sections (name, color, discord_channel_id, enabled) VALUES
                ('MEDIA', '#E91E63', NULL, true),
                ('TEAM TASK', '#57F287', NULL, true),
                ('PEMERINTAH', '#FEE75C', NULL, true),
                ('GENERAL', '#5865F2', NULL, true)
            ON CONFLICT (name) DO NOTHING
        `);

        // Insert sample data for 2026
        await client.query(`
            INSERT INTO events (date, title, color, month) VALUES
                ('2026-01-15', 'New Year Planning', '#5865F2', 'JANUARY'),
                ('2026-01-20', 'Team Meeting', '#57F287', 'JANUARY'),
                ('2026-02-14', 'Valentine Event', '#EB459E', 'FEBRUARY'),
                ('2026-03-10', 'Q1 Review', '#FEE75C', 'MARCH')
            ON CONFLICT DO NOTHING
        `);

        // Get counts
        const eventResult = await client.query('SELECT COUNT(*) FROM events');
        const sectionResult = await client.query('SELECT COUNT(*) FROM sections');
        const eventCount = eventResult.rows[0].count;
        const sectionCount = sectionResult.rows[0].count;

        console.log('✅ Database initialized successfully');
        console.log(`📊 Total events: ${eventCount}`);
        console.log(`📁 Total sections: ${sectionCount}`);

        res.json({
            success: true,
            message: 'Database initialized successfully',
            eventCount: eventCount,
            sectionCount: sectionCount
        });

    } catch (error) {
        console.error('❌ Error initializing database:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    } finally {
        client.release();
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
