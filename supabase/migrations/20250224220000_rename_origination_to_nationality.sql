-- Rename origination column to nationality in sessions table
ALTER TABLE sessions RENAME COLUMN origination TO nationality;

-- Update the comment
COMMENT ON COLUMN sessions.nationality IS 'Session nationality: Chinese or Foreigner';

-- Drop the old index and create new one
DROP INDEX IF EXISTS idx_sessions_origination;
CREATE INDEX idx_sessions_nationality ON sessions(nationality);
