-- Add payment amount fields to sessions table for tracking different payment methods
ALTER TABLE sessions 
ADD COLUMN cash_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN thai_qr_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN wechat_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN alipay_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN fx_cash_amount DECIMAL(10,2) DEFAULT 0;

-- Add comments
COMMENT ON COLUMN sessions.cash_amount IS 'Amount paid in THB cash';
COMMENT ON COLUMN sessions.thai_qr_amount IS 'Amount paid via Thai QR Code';
COMMENT ON COLUMN sessions.wechat_amount IS 'Amount paid via WeChat';
COMMENT ON COLUMN sessions.alipay_amount IS 'Amount paid via Alipay';
COMMENT ON COLUMN sessions.fx_cash_amount IS 'Amount paid in foreign currency cash';

-- Add check constraint to ensure only one payment method has amount > 0
ALTER TABLE sessions 
ADD CONSTRAINT check_single_payment_method 
CHECK (
  (CASE WHEN cash_amount > 0 THEN 1 ELSE 0 END) +
  (CASE WHEN thai_qr_amount > 0 THEN 1 ELSE 0 END) +
  (CASE WHEN wechat_amount > 0 THEN 1 ELSE 0 END) +
  (CASE WHEN alipay_amount > 0 THEN 1 ELSE 0 END) +
  (CASE WHEN fx_cash_amount > 0 THEN 1 ELSE 0 END) = 1
);

-- Add check constraint to ensure payment amounts match the payment method
ALTER TABLE sessions 
ADD CONSTRAINT check_payment_method_amounts 
CHECK (
  (payment_method = 'Cash' AND cash_amount > 0 AND thai_qr_amount = 0 AND wechat_amount = 0 AND alipay_amount = 0 AND fx_cash_amount = 0) OR
  (payment_method = 'Thai QR Code' AND cash_amount = 0 AND thai_qr_amount > 0 AND wechat_amount = 0 AND alipay_amount = 0 AND fx_cash_amount = 0) OR
  (payment_method = 'WeChat' AND cash_amount = 0 AND thai_qr_amount = 0 AND wechat_amount > 0 AND alipay_amount = 0 AND fx_cash_amount = 0) OR
  (payment_method = 'Alipay' AND cash_amount = 0 AND thai_qr_amount = 0 AND wechat_amount = 0 AND alipay_amount > 0 AND fx_cash_amount = 0) OR
  (payment_method = 'FX Cash (other than THB)' AND cash_amount = 0 AND thai_qr_amount = 0 AND wechat_amount = 0 AND alipay_amount = 0 AND fx_cash_amount > 0)
);

-- Create indexes for better performance
CREATE INDEX idx_sessions_cash_amount ON sessions(cash_amount);
CREATE INDEX idx_sessions_thai_qr_amount ON sessions(thai_qr_amount);
CREATE INDEX idx_sessions_wechat_amount ON sessions(wechat_amount);
CREATE INDEX idx_sessions_alipay_amount ON sessions(alipay_amount);
CREATE INDEX idx_sessions_fx_cash_amount ON sessions(fx_cash_amount);
