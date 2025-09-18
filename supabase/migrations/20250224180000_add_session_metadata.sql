-- Add discount, WOB, and VIP columns to sessions table
ALTER TABLE sessions 
ADD COLUMN discount INTEGER DEFAULT 0 CHECK (discount IN (0, 200, 300)),
ADD COLUMN wob TEXT DEFAULT 'W' CHECK (wob IN ('W', 'O', 'B')),
ADD COLUMN vip BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN sessions.discount IS 'Discount amount in baht: 0, 200, or 300';
COMMENT ON COLUMN sessions.wob IS 'Customer lead source: W=Walk-in, O=Online, B=Booking';
COMMENT ON COLUMN sessions.vip IS 'VIP customer status';

-- Create index for WOB filtering
CREATE INDEX idx_sessions_wob ON sessions(wob);

-- Create index for VIP filtering  
CREATE INDEX idx_sessions_vip ON sessions(vip);
