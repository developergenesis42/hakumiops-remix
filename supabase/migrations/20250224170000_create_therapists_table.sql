-- Create therapists table
CREATE TABLE therapists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  is_on_duty BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'Rostered' CHECK (status IN ('Rostered', 'Available', 'In Session', 'Departed')),
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  active_room_id UUID REFERENCES rooms(id),
  completed_room_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('Shower', 'Large Shower', 'VIP Jacuzzi')),
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Occupied')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('1 Lady', '2 Ladies', 'Couple')),
  room_type TEXT NOT NULL CHECK (room_type IN ('Shower', 'VIP Jacuzzi')),
  name TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  price DECIMAL(10,2) NOT NULL,
  payout DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_ids UUID[] NOT NULL,
  service_id INTEGER NOT NULL REFERENCES services(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id INTEGER NOT NULL REFERENCES services(id),
  therapist_ids UUID[] NOT NULL,
  room_id UUID NOT NULL REFERENCES rooms(id),
  status TEXT NOT NULL DEFAULT 'Ready' CHECK (status IN ('Ready', 'In Progress', 'Completed')),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration INTEGER NOT NULL, -- in minutes
  price DECIMAL(10,2) NOT NULL,
  payout DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create therapist_expenses table
CREATE TABLE therapist_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create shop_expenses table
CREATE TABLE shop_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(10,2) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create walkouts table
CREATE TABLE walkouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reason TEXT NOT NULL CHECK (reason IN ('No Rooms', 'No Ladies', 'Price Too High', 'Client Too Picky', 'Chinese', 'Laowai')),
  count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create daily_reports table
CREATE TABLE daily_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_date DATE NOT NULL UNIQUE,
  total_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
  shop_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
  therapist_payouts DECIMAL(10,2) NOT NULL DEFAULT 0,
  session_count INTEGER NOT NULL DEFAULT 0,
  walkout_count INTEGER NOT NULL DEFAULT 0,
  report_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_therapists_status ON therapists(status);
CREATE INDEX idx_therapists_on_duty ON therapists(is_on_duty);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_room_id ON sessions(room_id);
CREATE INDEX idx_sessions_therapist_ids ON sessions USING GIN(therapist_ids);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_therapist_expenses_therapist_id ON therapist_expenses(therapist_id);
CREATE INDEX idx_walkouts_created_at ON walkouts(created_at);
CREATE INDEX idx_daily_reports_date ON daily_reports(report_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_therapists_updated_at BEFORE UPDATE ON therapists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
