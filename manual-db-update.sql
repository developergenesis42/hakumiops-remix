-- Manual Database Update: Add 'Started' status to bookings
-- Run this in your Supabase SQL Editor

-- First, drop the existing constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Add the new constraint with 'Started' status included
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('Scheduled', 'Started', 'Completed', 'Cancelled'));

-- Verify the change
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'bookings' AND column_name = 'status';

-- Test the constraint
INSERT INTO bookings (therapist_ids, service_id, start_time, end_time, status) 
VALUES (ARRAY['00000000-0000-0000-0000-000000000000']::uuid[], 1, NOW(), NOW() + INTERVAL '1 hour', 'Started')
ON CONFLICT DO NOTHING;

-- Clean up test data
DELETE FROM bookings WHERE therapist_ids = ARRAY['00000000-0000-0000-0000-000000000000']::uuid[];

SELECT 'Migration completed successfully!' as result;
