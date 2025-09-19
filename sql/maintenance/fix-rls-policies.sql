-- Fix RLS policies for deployed Supabase instance
-- Run this script in your Supabase SQL Editor to fix the "0 rooms" issue

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON therapists;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON rooms;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON services;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON bookings;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON sessions;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON therapist_expenses;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON shop_expenses;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON walkouts;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON daily_reports;

-- Disable Row Level Security for all tables
-- This allows public access via the anonymous key (no authentication required)
ALTER TABLE therapists DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE shop_expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE walkouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports DISABLE ROW LEVEL SECURITY;

-- Add missing rooms (run these one by one if needed)
INSERT INTO rooms (name, type, status) VALUES ('Room 7', 'Large Shower', 'Available');
INSERT INTO rooms (name, type, status) VALUES ('Room 8', 'Large Shower', 'Available');
INSERT INTO rooms (name, type, status) VALUES ('Room 9', 'VIP Jacuzzi', 'Available');

-- Verify the fix
SELECT 'Rooms count: ' || COUNT(*) as result FROM rooms;
SELECT 'Therapists count: ' || COUNT(*) as result FROM therapists;
SELECT 'Services count: ' || COUNT(*) as result FROM services;
