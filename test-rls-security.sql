-- ============================================================================
-- TEST RLS SECURITY IMPLEMENTATION
-- ============================================================================
-- Run this script to verify RLS is working correctly

-- ============================================================================
-- 1. CHECK RLS STATUS ON ALL TABLES
-- ============================================================================
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as "RLS Enabled",
  CASE 
    WHEN rowsecurity THEN '🔒 PROTECTED'
    ELSE '🌐 PUBLIC'
  END as "Security Status"
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- ============================================================================
-- 2. CHECK EXISTING POLICIES
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- 3. TEST DATA ACCESS (Run these one by one)
-- ============================================================================

-- Test 1: Try to access protected data without authentication
-- This should fail if RLS is working
SELECT 'Testing sessions access...' as test;
SELECT COUNT(*) as session_count FROM sessions;

-- Test 2: Try to access public data
-- This should work even without authentication
SELECT 'Testing rooms access...' as test;
SELECT COUNT(*) as room_count FROM rooms;

SELECT 'Testing services access...' as test;
SELECT COUNT(*) as service_count FROM services;

-- ============================================================================
-- 4. VERIFY AUTHENTICATION REQUIREMENT
-- ============================================================================
-- Check if auth.role() function is available
SELECT 'Testing auth functions...' as test;
SELECT auth.role() as current_role;

-- ============================================================================
-- EXPECTED RESULTS:
-- ============================================================================
-- 1. RLS should be ENABLED on: sessions, therapist_expenses, shop_expenses, 
--    walkouts, daily_reports, bookings, roster
-- 2. RLS should be DISABLED on: rooms, services, therapists
-- 3. Protected tables should require authentication
-- 4. Public tables should be accessible without authentication
