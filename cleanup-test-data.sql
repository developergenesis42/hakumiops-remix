-- Cleanup Test Data Script
-- Use this to remove test daily reports from your database

-- Option 1: Remove test reports by date range (January 2025)
DELETE FROM daily_reports 
WHERE report_date BETWEEN '2025-01-01' AND '2025-01-31';

-- Option 2: Remove specific test report IDs
-- DELETE FROM daily_reports 
-- WHERE id IN (
--   '11111111-1111-1111-1111-111111111111',
--   '22222222-2222-2222-2222-222222222222',
--   '33333333-3333-3333-3333-333333333333'
-- );

-- Option 3: Remove all daily reports (use with extreme caution!)
-- DELETE FROM daily_reports;

-- Verify cleanup
SELECT 
  'Cleanup Complete' as status,
  COUNT(*) as remaining_reports,
  MIN(report_date) as earliest_report,
  MAX(report_date) as latest_report
FROM daily_reports;
