-- Yanbu Elite OS: Production Database Schema (Supabase/PostgreSQL)

-- 1. Profiles & Roles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('ceo', 'teacher', 'counselor', 'finance', 'student')) DEFAULT 'student',
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Student Movement Tracking
CREATE TABLE public.student_movement (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  student_name TEXT NOT NULL,
  photo_url TEXT,
  location TEXT NOT NULL, -- e.g., 'Restroom', 'Clinic'
  source_room TEXT NOT NULL, -- e.g., 'Room 402'
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  status TEXT CHECK (status IN ('Active', 'Completed')) DEFAULT 'Active',
  auto_logged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Compliance & Disciplinary Logs
CREATE TABLE public.compliance_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  student_name TEXT NOT NULL,
  incident_type TEXT NOT NULL, -- e.g., 'Time Breach', 'Property Risk'
  severity TEXT CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Asset Registry
CREATE TABLE public.assets (
  id TEXT PRIMARY KEY, -- QR Code ID
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT CHECK (status IN ('functional', 'damaged', 'maintenance')) DEFAULT 'functional',
  last_used_by UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Financial Escalation (Invoices/Fees)
CREATE TABLE public.financial_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Parent Meeting Requests
CREATE TABLE public.parent_meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  student_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'pending', 'conducted')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime Configuration
ALTER PUBLICATION supabase_realtime ADD TABLE student_movement;
ALTER PUBLICATION supabase_realtime ADD TABLE compliance_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE financial_entries;

-- Row Level Security (RLS) - Example for Executives
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Executives can view all profiles" ON public.profiles
  FOR SELECT USING (auth.jwt() ->> 'role' = 'ceo');
