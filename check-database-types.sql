-- Diagnostic script to check data types in your database
-- Run this to see the actual column types

-- Check rooms table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'rooms' 
ORDER BY ordinal_position;

-- Check bookings table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;

-- Check if room_id column already exists
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name = 'room_id';

-- Check existing rooms data
SELECT id, name, type FROM rooms LIMIT 5;

-- Check existing bookings data
SELECT id, therapist_ids, service_id FROM bookings LIMIT 5;
