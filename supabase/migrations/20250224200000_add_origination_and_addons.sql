-- Add origination and add-on fields to sessions table
ALTER TABLE sessions 
ADD COLUMN origination TEXT DEFAULT 'Chinese' CHECK (origination IN ('Chinese', 'Foreigner')),
ADD COLUMN addon_items JSONB DEFAULT '[]',
ADD COLUMN addon_custom_amount DECIMAL(10,2) DEFAULT 0 CHECK (addon_custom_amount >= 0 AND addon_custom_amount <= 3000);

-- Add comments for documentation
COMMENT ON COLUMN sessions.origination IS 'Session origination: Chinese or Foreigner';
COMMENT ON COLUMN sessions.addon_items IS 'JSON array of selected add-on items with names and prices';
COMMENT ON COLUMN sessions.addon_custom_amount IS 'Custom add-on amount in THB (0-3000)';

-- Create indexes for filtering
CREATE INDEX idx_sessions_origination ON sessions(origination);
CREATE INDEX idx_sessions_addon_custom_amount ON sessions(addon_custom_amount);
