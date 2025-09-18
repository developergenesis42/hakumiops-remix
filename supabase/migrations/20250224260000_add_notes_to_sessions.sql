-- Add notes field to sessions table for session and customer notes

-- Add notes column to sessions table
ALTER TABLE sessions
ADD COLUMN notes TEXT;

COMMENT ON COLUMN sessions.notes IS 'Notes about the session or customer';

-- Create an index for notes (for searching)
CREATE INDEX idx_sessions_notes ON sessions(notes) WHERE notes IS NOT NULL;
