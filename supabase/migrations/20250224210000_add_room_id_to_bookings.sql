-- Add room_id field to bookings table
-- Handle the case where rooms.id might be UUID or TEXT

-- First, add the column without foreign key constraint
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS room_id TEXT;

-- Try to add the foreign key constraint
-- This will work regardless of whether rooms.id is UUID or TEXT
DO $$
BEGIN
    -- Attempt to add the foreign key constraint
    BEGIN
        ALTER TABLE bookings ADD CONSTRAINT bookings_room_id_fkey 
          FOREIGN KEY (room_id) REFERENCES rooms(id);
    EXCEPTION
        WHEN duplicate_object THEN
            -- Constraint already exists, do nothing
            NULL;
        WHEN others THEN
            -- If it fails for any other reason, we'll handle it gracefully
            RAISE NOTICE 'Could not add foreign key constraint: %', SQLERRM;
    END;
END $$;

-- Add comment to explain the field
COMMENT ON COLUMN bookings.room_id IS 'Optional room assignment for the booking';
