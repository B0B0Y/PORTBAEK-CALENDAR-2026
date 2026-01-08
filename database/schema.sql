-- Portbaek Calendar Database Schema
-- PostgreSQL Database for Railway.app

-- Create sections table
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(50) NOT NULL DEFAULT '#5865F2',
    discord_channel_id VARCHAR(100),
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    color VARCHAR(50) NOT NULL DEFAULT '#5865F2',
    month VARCHAR(20) NOT NULL,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_month ON events(month);
CREATE INDEX idx_events_section ON events(section_id);
CREATE INDEX idx_sections_name ON sections(name);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for sections
CREATE TRIGGER update_sections_updated_at
    BEFORE UPDATE ON sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for events
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default sections
INSERT INTO sections (name, color, discord_channel_id, enabled) VALUES
    ('MEDIA', '#E91E63', NULL, true),
    ('TEAM TASK', '#57F287', NULL, true),
    ('PEMERINTAH', '#FEE75C', NULL, true),
    ('GENERAL', '#5865F2', NULL, true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample data for November 2025
INSERT INTO events (date, title, color, month) VALUES
    ('2025-11-15', 'Shooting Scene 1', '#5865F2', 'NOVEMBER'),
    ('2025-11-20', 'Team Meeting', '#57F287', 'NOVEMBER')
ON CONFLICT DO NOTHING;

-- Create view for calendar data grouped by month and section
CREATE OR REPLACE VIEW calendar_view AS
SELECT
    month,
    section_id,
    s.name as section_name,
    s.color as section_color,
    s.discord_channel_id,
    json_agg(
        json_build_object(
            'id', e.id,
            'date', e.date,
            'title', e.title,
            'color', e.color
        ) ORDER BY e.date
    ) as events
FROM events e
LEFT JOIN sections s ON e.section_id = s.id
GROUP BY month, section_id, s.name, s.color, s.discord_channel_id;
