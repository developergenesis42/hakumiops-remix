-- Add payment_method column to sessions table
ALTER TABLE sessions 
ADD COLUMN payment_method TEXT DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'Thai QR Code', 'WeChat', 'Alipay', 'FX Cash (other than THB)'));

-- Add comment
COMMENT ON COLUMN sessions.payment_method IS 'Payment method used for the session';

-- Create index for better performance
CREATE INDEX idx_sessions_payment_method ON sessions(payment_method);
