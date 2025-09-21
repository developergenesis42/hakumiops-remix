-- Add 'Started' status to bookings table
-- This allows for proper status flow: Scheduled → Started → Completed

-- First, drop the existing constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Add the new constraint with 'Started' status included
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('Scheduled', 'Started', 'Completed', 'Cancelled'));

-- Update any existing bookings that might need the new status
-- (This is optional - existing bookings will remain as 'Scheduled' or 'Completed')
