-- Quick Fix Script for Common Issues
-- Run this in Supabase SQL Editor for most common problems

-- 1. Fix RLS issues (most common problem)
ALTER TABLE therapists DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE shop_expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE walkouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports DISABLE ROW LEVEL SECURITY;

-- 2. Check if tables exist and have data
SELECT 'therapists' as table_name, COUNT(*) as row_count FROM therapists
UNION ALL
SELECT 'rooms' as table_name, COUNT(*) as row_count FROM rooms
UNION ALL
SELECT 'services' as table_name, COUNT(*) as row_count FROM services
UNION ALL
SELECT 'bookings' as table_name, COUNT(*) as row_count FROM bookings
UNION ALL
SELECT 'sessions' as table_name, COUNT(*) as row_count FROM sessions;

-- 3. Verify room data exists
SELECT id, name, type, status FROM rooms ORDER BY name;
