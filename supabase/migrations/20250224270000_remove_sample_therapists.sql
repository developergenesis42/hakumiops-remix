-- Remove sample therapist data that is no longer needed
-- These were inserted for initial testing but are now managed through the application

DELETE FROM therapists 
WHERE name IN ('Sarah Johnson', 'Emma Wilson', 'Lisa Chen');

-- Note: This will also cascade delete any related therapist_expenses 
-- for these therapists due to the ON DELETE CASCADE constraint
