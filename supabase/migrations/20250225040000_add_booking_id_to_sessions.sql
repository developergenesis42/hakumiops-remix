-- Add booking_id field to sessions table
-- This allows tracking which booking a session was created from

-- Add booking_id column to sessions table
ALTER TABLE sessions 
ADD COLUMN booking_id UUID REFERENCES bookings(id);

-- Add index for better query performance
CREATE INDEX idx_sessions_booking_id ON sessions(booking_id);

-- Add comment to clarify the relationship
COMMENT ON COLUMN sessions.booking_id IS 'Reference to the booking this session was created from. NULL for walk-in sessions.';
