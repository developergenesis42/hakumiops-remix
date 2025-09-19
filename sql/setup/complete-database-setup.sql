-- Complete Database Setup for Spa Operations App
-- Run this entire script in your Supabase SQL Editor

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create all tables (if they don't exist)
CREATE TABLE IF NOT EXISTS therapists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  is_on_duty BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'Rostered' CHECK (status IN ('Rostered', 'Available', 'In Session', 'Departed')),
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  active_room_id UUID,
  completed_room_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('Shower', 'Large Shower', 'VIP Jacuzzi')),
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Occupied')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('1 Lady', '2 Ladies', 'Couple')),
  room_type TEXT NOT NULL CHECK (room_type IN ('Shower', 'Large Shower', 'VIP Jacuzzi')),
  name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  payout DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Disable RLS on all tables
ALTER TABLE therapists DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;

-- 4. Clear existing data and insert fresh data
DELETE FROM rooms;
DELETE FROM services;
DELETE FROM therapists;

-- 5. Insert rooms
INSERT INTO rooms (name, type, status) VALUES 
  ('Room 1', 'Shower', 'Available'),
  ('Room 2', 'Shower', 'Available'),
  ('Room 3', 'Shower', 'Available'),
  ('Room 4', 'VIP Jacuzzi', 'Available'),
  ('Room 5', 'VIP Jacuzzi', 'Available'),
  ('Room 6', 'VIP Jacuzzi', 'Available'),
  ('Room 7', 'Large Shower', 'Available'),
  ('Room 8', 'Large Shower', 'Available'),
  ('Room 9', 'VIP Jacuzzi', 'Available');

-- 6. Insert services
INSERT INTO services (category, room_type, name, duration, price, payout) VALUES
  ('1 Lady', 'Shower', '40 min Shower', 40, 3200.00, 1300.00),
  ('1 Lady', 'Shower', '60 min Shower', 60, 3500.00, 1500.00),
  ('1 Lady', 'Shower', '90 min Shower', 90, 4000.00, 1800.00),
  ('1 Lady', 'VIP Jacuzzi', '60 min VIP', 60, 4000.00, 2000.00),
  ('1 Lady', 'VIP Jacuzzi', '90 min VIP', 90, 5000.00, 2300.00),
  ('2 Ladies', 'Shower', '60 min 2L Shower', 60, 6500.00, 3400.00),
  ('2 Ladies', 'Shower', '90 min 2L Shower', 90, 7500.00, 4000.00),
  ('2 Ladies', 'VIP Jacuzzi', '60 min 2L VIP', 60, 7500.00, 4000.00),
  ('2 Ladies', 'VIP Jacuzzi', '90 min 2L VIP', 90, 8500.00, 4800.00),
  ('Couple', 'Shower', '60 min Couple Shower', 60, 7500.00, 2500.00),
  ('Couple', 'Shower', '90 min Couple Shower', 90, 8000.00, 3000.00),
  ('Couple', 'VIP Jacuzzi', '60 min Couple VIP', 60, 8500.00, 3000.00),
  ('Couple', 'VIP Jacuzzi', '90 min Couple VIP', 90, 9000.00, 3500.00);

-- 7. Insert sample therapists (all off-duty initially)
INSERT INTO therapists (name, is_on_duty, status) VALUES
  ('Sarah Johnson', false, 'Rostered'),
  ('Emma Wilson', false, 'Rostered'),
  ('Lisa Chen', false, 'Rostered');

-- 8. Verify setup
SELECT 'Setup Complete!' as status;
SELECT 'Rooms:' as table_name, COUNT(*) as count FROM rooms;
SELECT 'Services:' as table_name, COUNT(*) as count FROM services;
SELECT 'Therapists:' as table_name, COUNT(*) as count FROM therapists;
SELECT 'RLS Status:' as info, tablename, rowsecurity FROM pg_tables WHERE tablename IN ('rooms', 'therapists', 'services');
