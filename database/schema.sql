-- Portbaek Calendar Database Schema
-- PostgreSQL Database for Railway.app

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    color VARCHAR(50) NOT NULL DEFAULT '#5865F2',
    month VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_month ON events(month);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for November 2025
INSERT INTO events (date, title, color, month) VALUES
    ('2025-11-15', 'Shooting Scene 1', '#5865F2', 'NOVEMBER'),
    ('2025-11-20', 'Team Meeting', '#57F287', 'NOVEMBER')
ON CONFLICT DO NOTHING;

-- Create view for calendar data grouped by month
CREATE OR REPLACE VIEW calendar_view AS
SELECT
    month,
    json_agg(
        json_build_object(
            'id', id,
            'date', date,
            'title', title,
            'color', color
        ) ORDER BY date
    ) as events
FROM events
GROUP BY month;
