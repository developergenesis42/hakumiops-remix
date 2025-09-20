-- ============================================================================
-- DISABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ============================================================================
-- Run this SQL in your Supabase SQL Editor to disable RLS

-- ============================================================================
-- DROP ALL EXISTING RLS POLICIES
-- ============================================================================

-- Drop all policies from sessions table
DROP POLICY IF EXISTS "Authenticated users can view sessions" ON sessions;
DROP POLICY IF EXISTS "Authenticated users can insert sessions" ON sessions;
DROP POLICY IF EXISTS "Authenticated users can update sessions" ON sessions;
DROP POLICY IF EXISTS "Authenticated users can delete sessions" ON sessions;

-- Drop all policies from therapist_expenses table
DROP POLICY IF EXISTS "Authenticated users can view therapist expenses" ON therapist_expenses;
DROP POLICY IF EXISTS "Authenticated users can insert therapist expenses" ON therapist_expenses;
DROP POLICY IF EXISTS "Authenticated users can update therapist expenses" ON therapist_expenses;
DROP POLICY IF EXISTS "Authenticated users can delete therapist expenses" ON therapist_expenses;

-- Drop all policies from shop_expenses table
DROP POLICY IF EXISTS "Authenticated users can view shop expenses" ON shop_expenses;
DROP POLICY IF EXISTS "Authenticated users can insert shop expenses" ON shop_expenses;
DROP POLICY IF EXISTS "Authenticated users can update shop expenses" ON shop_expenses;
DROP POLICY IF EXISTS "Authenticated users can delete shop expenses" ON shop_expenses;

-- Drop all policies from walkouts table
DROP POLICY IF EXISTS "Authenticated users can view walkouts" ON walkouts;
DROP POLICY IF EXISTS "Authenticated users can insert walkouts" ON walkouts;
DROP POLICY IF EXISTS "Authenticated users can update walkouts" ON walkouts;
DROP POLICY IF EXISTS "Authenticated users can delete walkouts" ON walkouts;

-- Drop all policies from daily_reports table
DROP POLICY IF EXISTS "Authenticated users can view daily reports" ON daily_reports;
DROP POLICY IF EXISTS "Authenticated users can insert daily reports" ON daily_reports;
DROP POLICY IF EXISTS "Authenticated users can update daily reports" ON daily_reports;
DROP POLICY IF EXISTS "Authenticated users can delete daily reports" ON daily_reports;

-- Drop all policies from bookings table
DROP POLICY IF EXISTS "Authenticated users can view bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can insert bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can update bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can delete bookings" ON bookings;

-- Drop all policies from roster table
DROP POLICY IF EXISTS "Authenticated users can view roster" ON roster;
DROP POLICY IF EXISTS "Authenticated users can insert roster" ON roster;
DROP POLICY IF EXISTS "Authenticated users can update roster" ON roster;
DROP POLICY IF EXISTS "Authenticated users can delete roster" ON roster;

-- ============================================================================
-- DISABLE RLS ON ALL TABLES
-- ============================================================================

-- Disable RLS on all business/financial tables
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE shop_expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE walkouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE roster DISABLE ROW LEVEL SECURITY;

-- Ensure reference tables remain unrestricted
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE therapists DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFY RLS STATUS
-- ============================================================================

-- Check which tables have RLS enabled (should all be false now)
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
