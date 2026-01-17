-- Safety Feature Schema

-- Table for Emergency Contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Other', -- e.g. Police, Ambulance, Fire, Helplines
  location TEXT DEFAULT 'Bihar', -- Coverage area description
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for User SOS Actions / Safety Alerts
CREATE TABLE IF NOT EXISTS safety_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID, -- Optional link to auth.users if available, or just keeping it loose for now
  user_name TEXT, -- Snapshot of user name
  phone TEXT, -- Contact number of the user in distress
  type TEXT NOT NULL DEFAULT 'SOS', -- SOS, Medical, Harassment, Accident
  status TEXT DEFAULT 'Open', -- Open, In Progress, Resolved, False Alarm
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT, -- Reverse geocoded address if available
  description TEXT, -- User provided details or voice-to-text
  admin_notes TEXT, -- Notes added by admin during resolution
  resolved_at TIMESTAMPTZ,
  resolved_by UUID, -- ID of the admin who resolved it
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_safety_alerts_status ON safety_alerts(status);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_created_at ON safety_alerts(created_at);

-- Mock Data for Emergency Contacts
INSERT INTO emergency_contacts (name, phone, type, location)
VALUES 
('Police Control Room', '100', 'Police', 'All India'),
('Fire Service', '101', 'Fire', 'All India'),
('Ambulance', '102', 'Medical', 'All India'),
('Women Helpline', '1091', 'Helpline', 'Bihar'),
('Tourist Police', '0612-2222222', 'Police', 'Patna');

-- Mock Data for Safety Alerts
INSERT INTO safety_alerts (user_name, phone, type, status, latitude, longitude, address, description, created_at)
VALUES
('Rahul Kumar', '9876543210', 'SOS', 'Open', 25.611, 85.144, 'Gandhi Maidan, Patna', 'Requesting immediate assistance, feeling unsafe.', NOW() - INTERVAL '10 minutes'),
('Priya Singh', '9123456780', 'Medical', 'In Progress', 24.796, 85.000, 'Bodh Gaya Temple Road', 'Minor injury, need first aid.', NOW() - INTERVAL '1 hour'),
('Amit Verma', '8877665544', 'Accident', 'Resolved', 25.594, 85.137, 'Bailey Road, Patna', 'Bike accident reported.', NOW() - INTERVAL '1 day');
