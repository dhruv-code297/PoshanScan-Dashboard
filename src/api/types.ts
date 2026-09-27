export interface LoginResponse {
  token: string;
  role: string;
  name: string;
}

export interface DashboardOverview {
  total_screenings: number;
  normal_count: number;
  mam_count: number;
  sam_count: number;
  avg_confidence: number;
  screenings_today: number;
  active_workers: number;
}

export interface TrendPoint {
  date: string;
  normal: number;
  mam: number;
  sam: number;
  total: number;
}

export interface DashboardTrends {
  points: TrendPoint[];
}

export interface LocationData {
  location_id: string;
  village: string;
  block: string;
  district: string;
  lat: number;
  lng: number;
  total_screenings: number;
  normal: number;
  mam: number;
  sam: number;
  prevalence_pct: number;
}

export interface WorkerData {
  worker_id: string;
  name: string;
  village: string;
  total_screenings: number;
  last_active_at: string;
  avg_confidence: number;
  flagged_count: number;
}

export interface FlaggedRecord {
  screening_id: string;
  child_ref: string;
  worker_name: string;
  muac_estimate_mm: number;
  confidence: number;
  risk_band: 'Normal' | 'MAM' | 'SAM';
  captured_at: string;
  quality_flags: string[];
  status: 'pending' | 'reviewed';
}
