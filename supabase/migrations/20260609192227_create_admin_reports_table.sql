
CREATE TABLE admin_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email text NOT NULL,
  lead_email text,
  lead_phone text,
  structure_name text,
  city text,
  payload jsonb NOT NULL DEFAULT '{}',
  subject text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_reports ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (admin-only table)
CREATE POLICY "service_role_full_access" ON admin_reports
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
