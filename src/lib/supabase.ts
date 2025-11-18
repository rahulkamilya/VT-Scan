import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ScanHistory {
  id: string;
  file_name: string;
  file_size: number;
  file_hash: string;
  file_type: string | null;
  scan_date: string;
  malicious_count: number;
  total_engines: number;
  scan_results: Record<string, unknown> | null;
  is_malicious: boolean;
  created_at: string;
}

export interface ScanResult {
  file_name: string;
  file_size: number;
  file_hash: string;
  file_type: string;
  malicious_count: number;
  total_engines: number;
  is_malicious: boolean;
  stats: {
    malicious: number;
    suspicious: number;
    undetected: number;
    harmless: number;
    timeout: number;
    'confirmed-timeout': number;
    failure: number;
    'type-unsupported': number;
  };
  results: Record<string, {
    category: string;
    engine_name: string;
    result: string | null;
  }>;
}
