-- Insert initial rooms
INSERT INTO rooms (name, type, status) VALUES
  ('Room 1', 'Shower', 'Available'),
  ('Room 2', 'Shower', 'Available'),
  ('Room 3', 'Shower', 'Available'),
  ('Room 4', 'VIP Jacuzzi', 'Available'),
  ('Room 5', 'VIP Jacuzzi', 'Available'),
  ('Room 6', 'VIP Jacuzzi', 'Available'),
  ('Room 7', 'Large Shower', 'Available'),
  ('Room 8', 'Large Shower', 'Available'),
  ('Room 9', 'VIP Jacuzzi', 'Available');

-- Insert initial services
INSERT INTO services (category, room_type, name, duration, price, payout) VALUES
  -- 1 Lady Services
  ('1 Lady', 'Shower', '40 min Shower', 40, 3200.00, 1300.00),
  ('1 Lady', 'Shower', '60 min Shower', 60, 3500.00, 1500.00),
  ('1 Lady', 'Shower', '90 min Shower', 90, 4000.00, 1800.00),
  ('1 Lady', 'VIP Jacuzzi', '60 min VIP', 60, 4000.00, 2000.00),
  ('1 Lady', 'VIP Jacuzzi', '90 min VIP', 90, 5000.00, 2300.00),
  
  -- 2 Ladies Services
  ('2 Ladies', 'Shower', '60 min 2L Shower', 60, 6500.00, 3400.00),
  ('2 Ladies', 'Shower', '90 min 2L Shower', 90, 7500.00, 4000.00),
  ('2 Ladies', 'VIP Jacuzzi', '60 min 2L VIP', 60, 7500.00, 4000.00),
  ('2 Ladies', 'VIP Jacuzzi', '90 min 2L VIP', 90, 8500.00, 4800.00),
  
  -- Couple Services
  ('Couple', 'Shower', '60 min Couple Shower', 60, 7500.00, 2500.00),
  ('Couple', 'Shower', '90 min Couple Shower', 90, 8000.00, 3000.00),
  ('Couple', 'VIP Jacuzzi', '60 min Couple VIP', 60, 8500.00, 3000.00),
  ('Couple', 'VIP Jacuzzi', '90 min Couple VIP', 90, 9000.00, 3500.00);

-- Insert sample therapists
INSERT INTO therapists (name, is_on_duty, status, check_in_time) VALUES
  ('Sarah Johnson', true, 'Available', NOW()),
  ('Emma Wilson', true, 'Rostered', NULL),
  ('Lisa Chen', true, 'Available', NOW());

-- Enable Row Level Security (RLS)
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE walkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your auth requirements)
CREATE POLICY "Allow all operations for authenticated users" ON therapists FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON rooms FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON services FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON bookings FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON sessions FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON therapist_expenses FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON shop_expenses FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON walkouts FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON daily_reports FOR ALL USING (true);
