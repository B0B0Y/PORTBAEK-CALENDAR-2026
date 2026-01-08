const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDatabase() {
    const client = await pool.connect();

    try {
        console.log('🚀 Initializing PostgreSQL database...');

        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('📄 Executing schema.sql...');
        await client.query(schema);

        console.log('✅ Database schema created successfully');

        // Insert sample data for 2026 months
        console.log('📊 Inserting sample data for 2026...');

        const sampleEvents = [
            // January 2026
            { date: '2026-01-15', title: 'New Year Planning', color: '#5865F2', month: 'JANUARY' },
            { date: '2026-01-20', title: 'Team Meeting', color: '#57F287', month: 'JANUARY' },

            // February 2026
            { date: '2026-02-14', title: 'Valentine Event', color: '#EB459E', month: 'FEBRUARY' },

            // March 2026
            { date: '2026-03-10', title: 'Q1 Review', color: '#FEE75C', month: 'MARCH' },
        ];

        for (const event of sampleEvents) {
            await client.query(
                'INSERT INTO events (date, title, color, month) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
                [event.date, event.title, event.color, event.month]
            );
        }

        console.log('✅ Sample data inserted');
        console.log('🎉 Database initialization complete!');

        // Show event count
        const result = await client.query('SELECT COUNT(*) FROM events');
        console.log(`📊 Total events: ${result.rows[0].count}`);

    } catch (error) {
        console.error('❌ Error initializing database:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run initialization
initDatabase()
    .then(() => {
        console.log('✅ Database initialization completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    });
