-- Remove 'Started' status from bookings table
-- Bookings are now deleted when converted to sessions, so we only need: Scheduled, Completed, Cancelled

-- Update the CHECK constraint to remove 'Started' status
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE bookings 
ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('Scheduled', 'Completed', 'Cancelled'));

-- Add comment to clarify the status flow
COMMENT ON COLUMN bookings.status IS 'Booking status: Scheduled (future booking) -> Completed (session finished) or Cancelled. Bookings are deleted when converted to sessions.';
