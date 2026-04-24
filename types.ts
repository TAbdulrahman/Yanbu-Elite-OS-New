export interface Student {
  id: string;
  name: string;
  photo_url: string;
  health_alerts: string[];
  financial_status: 'clear' | 'arrears' | 'critical';
  last_scan?: string;
}

export interface StudentMovement {
  id: string;
  student_id: string;
  student_name: string;
  photo_url: string;
  location: string;
  source_room?: string;
  start_time: string;
  end_time?: string;
  status: 'Active' | 'Completed';
  created_at: string;
  auto_logged?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'ceo' | 'teacher' | 'counselor';
  full_name: string;
}

export interface Asset {
  id: string;
  name: string;
  location: string;
  status: 'functional' | 'damaged' | 'maintenance';
  last_used_by?: string;
}

export interface FinancialEntry {
  id: string;
  student_id: string;
  amount: number;
  description: string;
  status: 'pending' | 'paid';
  created_at: string;
}

export interface ParentMeeting {
  id: string;
  student_id: string;
  student_name: string;
  reason: string;
  status: 'scheduled' | 'pending' | 'conducted';
  created_at: string;
}

export interface ComplianceLog {
  id: string;
  student_id: string;
  student_name: string;
  incident_type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  tags: string[];
  created_at: string;
}
