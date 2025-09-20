-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) WITH PROPER POLICIES
-- ============================================================================
-- This migration enables RLS on sensitive tables while keeping reference
-- tables (rooms, services) unrestricted for webapp functionality.

-- ============================================================================
-- ENABLE RLS ON SENSITIVE TABLES
-- ============================================================================

-- Enable RLS on business/financial tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE walkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE roster ENABLE ROW LEVEL SECURITY;

-- Keep reference tables unrestricted (no RLS)
-- rooms - public access (room names, types, availability)
-- services - public access (service definitions, prices)
-- therapists - public access (names, status for booking)

-- ============================================================================
-- CREATE SECURITY POLICIES
-- ============================================================================

-- Sessions table policies
CREATE POLICY "Authenticated users can view sessions" ON sessions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert sessions" ON sessions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update sessions" ON sessions
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete sessions" ON sessions
  FOR DELETE USING (auth.role() = 'authenticated');

-- Therapist expenses table policies
CREATE POLICY "Authenticated users can view therapist expenses" ON therapist_expenses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert therapist expenses" ON therapist_expenses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update therapist expenses" ON therapist_expenses
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete therapist expenses" ON therapist_expenses
  FOR DELETE USING (auth.role() = 'authenticated');

-- Shop expenses table policies
CREATE POLICY "Authenticated users can view shop expenses" ON shop_expenses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert shop expenses" ON shop_expenses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update shop expenses" ON shop_expenses
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete shop expenses" ON shop_expenses
  FOR DELETE USING (auth.role() = 'authenticated');

-- Walkouts table policies
CREATE POLICY "Authenticated users can view walkouts" ON walkouts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert walkouts" ON walkouts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update walkouts" ON walkouts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete walkouts" ON walkouts
  FOR DELETE USING (auth.role() = 'authenticated');

-- Daily reports table policies
CREATE POLICY "Authenticated users can view daily reports" ON daily_reports
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert daily reports" ON daily_reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update daily reports" ON daily_reports
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete daily reports" ON daily_reports
  FOR DELETE USING (auth.role() = 'authenticated');

-- Bookings table policies
CREATE POLICY "Authenticated users can view bookings" ON bookings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert bookings" ON bookings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update bookings" ON bookings
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete bookings" ON bookings
  FOR DELETE USING (auth.role() = 'authenticated');

-- Roster table policies
CREATE POLICY "Authenticated users can view roster" ON roster
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert roster" ON roster
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update roster" ON roster
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete roster" ON roster
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================================
-- VERIFY RLS STATUS
-- ============================================================================

-- Check which tables have RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- RLS ENABLED (Protected):
-- - sessions: Business transactions
-- - therapist_expenses: Financial data
-- - shop_expenses: Financial data
-- - walkouts: Business data
-- - daily_reports: Financial reports
-- - bookings: Appointment data
-- - roster: VIP numbers and personal info
--
-- RLS DISABLED (Public):
-- - rooms: Reference data (room names, types, availability)
-- - services: Reference data (service definitions, prices)
-- - therapists: Reference data (names, status for booking)
--
-- All policies require authentication (auth.role() = 'authenticated')
-- This means users must be logged in to access protected data
