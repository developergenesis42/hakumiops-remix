-- Fix rooms insertion - enable UUID extension and insert rooms
-- Run this in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clear existing rooms if any
DELETE FROM rooms;

-- Insert rooms without specifying ID (let it auto-generate)
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

-- Verify the insertion
SELECT 'Rooms inserted:' as info, COUNT(*) as count FROM rooms;
SELECT 'Room data:' as info, id, name, type, status FROM rooms ORDER BY name;
