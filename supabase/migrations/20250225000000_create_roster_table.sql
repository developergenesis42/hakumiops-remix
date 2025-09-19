-- Create roster table to store global therapist list
-- This replaces the hardcoded MASTER_THERAPIST_LIST in AddTherapistModal.tsx

-- Create roster table for global therapist management
CREATE TABLE roster (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  vip_number INTEGER UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert the current master list from AddTherapistModal.tsx
INSERT INTO roster (name, vip_number) VALUES
  ('Ally', 1), ('Anna', 2), ('Audy', 3), ('Ava', 4), ('BB', 5), ('Beer-male', 6), 
  ('Bella', 7), ('Bowie', 8), ('Candy', 9), ('Cherry', 10), ('Cookie', 11), ('Diamond', 12), 
  ('Emmy', 13), ('Essay', 14), ('Gina', 15), ('Hana', 16), ('IV', 17), ('Irin', 18), 
  ('Jenny', 19), ('Kana', 20), ('Kira', 21), ('Kitty', 22), ('Lita', 23), ('Lucky', 24), 
  ('Luna', 25), ('Mabel', 26), ('Mako', 27), ('Maria', 28), ('Micky', 29), ('Miku', 30), 
  ('Mimi', 31), ('Mina', 32), ('Nabee', 33), ('Nana', 34), ('Nicha', 35), ('Oily', 36), 
  ('Palmy', 37), ('Rosy', 38), ('Sara', 39), ('Shopee', 40), ('Sophia', 41), ('Sunny', 42), 
  ('Susie', 43), ('Tata', 44), ('Violet', 45), ('Yuki', 46), ('Yuri', 47);

-- Create indexes for better performance
CREATE INDEX idx_roster_name ON roster(name);
CREATE INDEX idx_roster_active ON roster(is_active);
CREATE INDEX idx_roster_vip_number ON roster(vip_number);

-- Add comments for documentation
COMMENT ON TABLE roster IS 'Global roster of all available therapists that can be added to duty';
COMMENT ON COLUMN roster.name IS 'Therapist name (must be unique)';
COMMENT ON COLUMN roster.is_active IS 'Whether this therapist is currently active in the roster';
COMMENT ON COLUMN roster.vip_number IS 'Unique VIP number assigned to the therapist';

-- Disable RLS for roster table (consistent with other tables)
ALTER TABLE roster DISABLE ROW LEVEL SECURITY;

-- Verify the roster was created correctly
SELECT 'Roster table created successfully!' as status;
SELECT COUNT(*) as total_therapists FROM roster;
SELECT name, vip_number FROM roster ORDER BY vip_number LIMIT 10;
