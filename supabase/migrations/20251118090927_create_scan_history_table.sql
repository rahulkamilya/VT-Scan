/*
  # VirusTotal Scan History Schema

  1. New Tables
    - `scan_history`
      - `id` (uuid, primary key) - Unique identifier for each scan
      - `file_name` (text) - Original name of the scanned file
      - `file_size` (bigint) - Size of the file in bytes
      - `file_hash` (text) - SHA-256 hash of the file
      - `file_type` (text) - Description of the file type
      - `scan_date` (timestamptz) - When the scan was performed
      - `malicious_count` (integer) - Number of engines that detected malicious content
      - `total_engines` (integer) - Total number of engines that scanned the file
      - `scan_results` (jsonb) - Full scan results from VirusTotal
      - `is_malicious` (boolean) - Quick flag indicating if file is malicious
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on `scan_history` table
    - Add policy for public read access (anyone can view scan history)
    - Add policy for public insert access (anyone can add scan results)

  3. Indexes
    - Index on `file_hash` for quick lookups
    - Index on `scan_date` for chronological queries

  4. Notes
    - This is a public scanner tool, so RLS policies allow public access
    - All scans are stored for historical reference
    - JSONB column allows flexible storage of varying VirusTotal response structures
*/

CREATE TABLE IF NOT EXISTS scan_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_hash text NOT NULL,
  file_type text,
  scan_date timestamptz DEFAULT now(),
  malicious_count integer DEFAULT 0,
  total_engines integer DEFAULT 0,
  scan_results jsonb,
  is_malicious boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scan history"
  ON scan_history
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert scan results"
  ON scan_history
  FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_scan_history_file_hash ON scan_history(file_hash);
CREATE INDEX IF NOT EXISTS idx_scan_history_scan_date ON scan_history(scan_date DESC);
