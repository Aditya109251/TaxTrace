# Supabase Setup SQL
# Run this in your Supabase SQL Editor

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create Constituencies Table
CREATE TABLE constituencies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  boundary GEOMETRY(Polygon, 4326),
  total_budget DECIMAL(15, 2) DEFAULT 0,
  transparency_score INTEGER DEFAULT 0
);

-- Create Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  role TEXT CHECK (role IN ('government', 'contractor', 'citizen')),
  constituency_id INTEGER REFERENCES constituencies(id),
  aadhaar TEXT,
  risk_score DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Projects Table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  constituency_id INTEGER REFERENCES constituencies(id),
  contractor_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  location GEOMETRY(Point, 4326),
  budget_allocated DECIMAL(15, 2) NOT NULL,
  funds_released DECIMAL(15, 2) DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  delay_days INTEGER DEFAULT 0,
  risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')) DEFAULT 'LOW',
  status TEXT CHECK (status IN ('Active', 'Delayed', 'Closed')) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Materials Table
CREATE TABLE materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity DECIMAL(12, 2) NOT NULL,
  market_price DECIMAL(15, 2) NOT NULL,
  claimed_price DECIMAL(15, 2) NOT NULL,
  anomaly_flag BOOLEAN DEFAULT FALSE,
  ai_probability DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Complaints Table
CREATE TABLE complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  citizen_id UUID REFERENCES profiles(id),
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('Quality', 'Delay', 'Pricing', 'Safety', 'Other')) DEFAULT 'Other',
  photo_url TEXT,
  status TEXT CHECK (status IN ('PENDING', 'INVESTIGATING', 'RESOLVED')) DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Audit Logs Table
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE constituencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Public can view basic profile info" ON profiles FOR SELECT USING (true);

-- Constituencies: Everyone can read
CREATE POLICY "Everyone can view constituencies" ON constituencies FOR SELECT USING (true);

-- Projects: 
-- Citizens can read projects in their constituency
CREATE POLICY "Citizens view constituency projects" ON projects FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.constituency_id = projects.constituency_id
  ) OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'government'
);

-- Contractors can view and update their assigned projects
CREATE POLICY "Contractors view assigned projects" ON projects FOR SELECT USING (contractor_id = auth.uid());
CREATE POLICY "Contractors update assigned projects" ON projects FOR UPDATE USING (contractor_id = auth.uid());

-- Government has full access to their constituency
CREATE POLICY "Gov full access" ON projects FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'government'
    AND profiles.constituency_id = projects.constituency_id
  )
);

-- Materials:
CREATE POLICY "Contractors insert materials" ON materials FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects WHERE projects.id = project_id AND projects.contractor_id = auth.uid()
  )
);

-- Complaints:
CREATE POLICY "Citizens insert complaints" ON complaints FOR INSERT WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'citizen'
);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE projects, materials, complaints;
