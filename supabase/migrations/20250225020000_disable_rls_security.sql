-- ============================================================================
-- DISABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ============================================================================
-- This migration disables RLS on all tables to rely solely on application-level
-- authentication instead of database-level security policies.

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

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- RLS DISABLED ON ALL TABLES:
-- - sessions: Now relies on application authentication only
-- - therapist_expenses: Now relies on application authentication only
-- - shop_expenses: Now relies on application authentication only
-- - walkouts: Now relies on application authentication only
-- - daily_reports: Now relies on application authentication only
-- - bookings: Now relies on application authentication only
-- - roster: Now relies on application authentication only
-- - rooms: Public access (reference data)
-- - services: Public access (reference data)
-- - therapists: Public access (reference data)
--
-- Security is now handled entirely by the application layer:
-- - All API endpoints require authentication via requireAuth()
-- - Session management through secure cookies
-- - No database-level access restrictions
--
-- This approach simplifies the security model and relies on your
-- application's authentication middleware to protect data access.
