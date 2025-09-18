-- Update VIP column from boolean to integer (1-1000)
-- First, drop the existing boolean column
ALTER TABLE sessions DROP COLUMN vip;

-- Add new VIP number column
ALTER TABLE sessions 
ADD COLUMN vip_number INTEGER CHECK (vip_number IS NULL OR (vip_number >= 1 AND vip_number <= 1000));

-- Add comment for documentation
COMMENT ON COLUMN sessions.vip_number IS 'VIP customer number (1-1000), NULL for non-VIP customers';

-- Create index for VIP number filtering
CREATE INDEX idx_sessions_vip_number ON sessions(vip_number);

-- Update existing data: convert boolean true to random VIP number (1-1000)
-- This is optional - you might want to handle existing data differently
UPDATE sessions 
SET vip_number = FLOOR(RANDOM() * 1000) + 1 
WHERE vip_number IS NULL;
