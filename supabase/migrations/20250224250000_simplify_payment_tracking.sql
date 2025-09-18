-- Simplify payment tracking to just track payment method, not amounts
-- Remove payment amount columns and constraints

-- Drop the payment amount columns
ALTER TABLE sessions 
DROP COLUMN IF EXISTS cash_amount,
DROP COLUMN IF EXISTS thai_qr_amount,
DROP COLUMN IF EXISTS wechat_amount,
DROP COLUMN IF EXISTS alipay_amount,
DROP COLUMN IF EXISTS fx_cash_amount;

-- Drop the constraints
ALTER TABLE sessions 
DROP CONSTRAINT IF EXISTS check_single_payment_method,
DROP CONSTRAINT IF EXISTS check_payment_method_amounts;

-- Drop the indexes
DROP INDEX IF EXISTS idx_sessions_cash_amount;
DROP INDEX IF EXISTS idx_sessions_thai_qr_amount;
DROP INDEX IF EXISTS idx_sessions_wechat_amount;
DROP INDEX IF EXISTS idx_sessions_alipay_amount;
DROP INDEX IF EXISTS idx_sessions_fx_cash_amount;
