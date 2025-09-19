-- Complete Current Supabase Schema Backup
-- Generated from migration files: 20250224161427 through 20250224270000
-- Date: $(date)
-- 
-- This file contains the complete current schema of your spa operations app
-- Run this to recreate your database structure exactly as it currently exists

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create members table (from original template)
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  avatar_url TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT NOT NULL
);

-- 3. Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('Shower', 'Large Shower', 'VIP Jacuzzi')),
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Occupied')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create roster table (global therapist list)
CREATE TABLE IF NOT EXISTS roster (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  vip_number INTEGER UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create services table
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('1 Lady', '2 Ladies', 'Couple')),
  room_type TEXT NOT NULL CHECK (room_type IN ('Shower', 'Large Shower', 'VIP Jacuzzi')),
  name TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  price DECIMAL(10,2) NOT NULL,
  payout DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Create therapists table
CREATE TABLE IF NOT EXISTS therapists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  is_on_duty BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'Rostered' CHECK (status IN ('Rostered', 'Available', 'In Session', 'Departed')),
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  active_room_id UUID REFERENCES rooms(id),
  completed_room_ids TEXT[] DEFAULT '{}',
  vip_number INTEGER, -- Added in migration 20250224190000
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_ids UUID[] NOT NULL,
  service_id INTEGER NOT NULL REFERENCES services(id),
  room_id UUID REFERENCES rooms(id), -- Added in migration 20250224210000
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Create sessions table (with all migrations applied)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id INTEGER NOT NULL REFERENCES services(id),
  therapist_ids UUID[] NOT NULL,
  room_id UUID NOT NULL REFERENCES rooms(id),
  status TEXT NOT NULL DEFAULT 'Ready' CHECK (status IN ('Ready', 'In Progress', 'Completed')),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration INTEGER NOT NULL, -- in minutes
  price DECIMAL(10,2) NOT NULL,
  payout DECIMAL(10,2) NOT NULL,
  -- Session metadata (added in migration 20250224180000)
  customer_name TEXT,
  customer_phone TEXT,
  customer_age INTEGER,
  customer_nationality TEXT, -- Renamed from origination in migration 20250224220000
  -- Add-ons (added in migration 20250224200000)
  addon_items JSONB DEFAULT '[]',
  addon_custom_amount DECIMAL(10,2) DEFAULT 0 CHECK (addon_custom_amount >= 0 AND addon_custom_amount <= 3000),
  -- Payment tracking (simplified in migration 20250224250000)
  payment_method TEXT CHECK (payment_method IN ('Cash', 'Thai QR', 'WeChat', 'Alipay', 'FX Cash')),
  -- Notes (added in migration 20250224260000)
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Create therapist_expenses table
CREATE TABLE IF NOT EXISTS therapist_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Create shop_expenses table
CREATE TABLE IF NOT EXISTS shop_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(10,2) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Create walkouts table
CREATE TABLE IF NOT EXISTS walkouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reason TEXT NOT NULL CHECK (reason IN ('No Rooms', 'No Ladies', 'Price Too High', 'Client Too Picky', 'Chinese', 'Laowai')),
  count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Create daily_reports table
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_date DATE NOT NULL UNIQUE,
  total_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
  shop_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
  therapist_payouts DECIMAL(10,2) NOT NULL DEFAULT 0,
  session_count INTEGER NOT NULL DEFAULT 0,
  walkout_count INTEGER NOT NULL DEFAULT 0,
  report_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Insert roster data (global therapist list)
INSERT INTO roster (name, vip_number) VALUES
  ('Ally', 1), ('Anna', 2), ('Audy', 3), ('Ava', 4), ('BB', 5), ('Beer-male', 6), 
  ('Bella', 7), ('Bowie', 8), ('Candy', 9), ('Cherry', 10), ('Cookie', 11), ('Diamond', 12), 
  ('Emmy', 13), ('Essay', 14), ('Gina', 15), ('Hana', 16), ('IV', 17), ('Irin', 18), 
  ('Jenny', 19), ('Kana', 20), ('Kira', 21), ('Kitty', 22), ('Lita', 23), ('Lucky', 24), 
  ('Luna', 25), ('Mabel', 26), ('Mako', 27), ('Maria', 28), ('Micky', 29), ('Miku', 30), 
  ('Mimi', 31), ('Mina', 32), ('Nabee', 33), ('Nana', 34), ('Nicha', 35), ('Oily', 36), 
  ('Palmy', 37), ('Rosy', 38), ('Sara', 39), ('Shopee', 40), ('Sophia', 41), ('Sunny', 42), 
  ('Susie', 43), ('Tata', 44), ('Violet', 45), ('Yuki', 46), ('Yuri', 47);

-- 14. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_roster_name ON roster(name);
CREATE INDEX IF NOT EXISTS idx_roster_active ON roster(is_active);
CREATE INDEX IF NOT EXISTS idx_roster_vip_number ON roster(vip_number);
CREATE INDEX IF NOT EXISTS idx_therapists_status ON therapists(status);
CREATE INDEX IF NOT EXISTS idx_therapists_on_duty ON therapists(is_on_duty);
CREATE INDEX IF NOT EXISTS idx_therapists_vip_number ON therapists(vip_number);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_payment_method ON sessions(payment_method);
CREATE INDEX IF NOT EXISTS idx_sessions_customer_nationality ON sessions(customer_nationality);
CREATE INDEX IF NOT EXISTS idx_sessions_addon_custom_amount ON sessions(addon_custom_amount);
CREATE INDEX IF NOT EXISTS idx_sessions_notes ON sessions(notes) WHERE notes IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_therapist_expenses_therapist_id ON therapist_expenses(therapist_id);
CREATE INDEX IF NOT EXISTS idx_walkouts_reason ON walkouts(reason);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(report_date);

-- 15. Add comments for documentation
COMMENT ON TABLE roster IS 'Global roster of all available therapists that can be added to duty';
COMMENT ON TABLE therapists IS 'Therapist management with status tracking and room assignments';
COMMENT ON TABLE rooms IS 'Room availability and type management';
COMMENT ON TABLE services IS 'Available massage services with pricing';
COMMENT ON TABLE sessions IS 'Active and completed massage sessions with customer and payment data';
COMMENT ON TABLE bookings IS 'Scheduled appointments';
COMMENT ON TABLE therapist_expenses IS 'Individual therapist expense tracking';
COMMENT ON TABLE shop_expenses IS 'General shop expense tracking';
COMMENT ON TABLE walkouts IS 'Customer walkout tracking with reasons';
COMMENT ON TABLE daily_reports IS 'Daily financial reports and analytics';

COMMENT ON COLUMN sessions.customer_nationality IS 'Customer nationality: Chinese or Foreigner';
COMMENT ON COLUMN sessions.addon_items IS 'JSON array of selected add-on items with names and prices';
COMMENT ON COLUMN sessions.addon_custom_amount IS 'Custom add-on amount in THB (0-3000)';
COMMENT ON COLUMN sessions.payment_method IS 'Payment method used for the session';
COMMENT ON COLUMN sessions.notes IS 'Notes about the session or customer';
COMMENT ON COLUMN roster.name IS 'Therapist name (must be unique)';
COMMENT ON COLUMN roster.is_active IS 'Whether this therapist is currently active in the roster';
COMMENT ON COLUMN roster.vip_number IS 'Unique VIP number assigned to the therapist';

-- 16. Row Level Security (RLS) - Currently disabled in your setup
-- Uncomment these lines if you want to enable RLS:
-- ALTER TABLE roster DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE therapists DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE services DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE therapist_expenses DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE shop_expenses DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE walkouts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE daily_reports DISABLE ROW LEVEL SECURITY;

-- 17. Verify schema creation
SELECT 'Schema backup created successfully!' as status;
SELECT tablename, schemaname FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
SELECT 'Roster therapists:' as info, COUNT(*) as count FROM roster;

