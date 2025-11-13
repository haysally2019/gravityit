/*
  # Create Leads Table

  ## Overview
  Stores potential leads that can be converted into contacts.

  ## New Tables

  ### `leads`
  Stores lead information before conversion to contacts
  - `id` (uuid, primary key) - Unique lead identifier
  - `name` (text) - Lead name
  - `email` (text) - Lead email
  - `phone` (text) - Lead phone number
  - `status` (text) - Lead status (new, contacted, converted, rejected)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on leads table
  - Public access for all operations
*/

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to leads"
  ON leads
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Add from_lead_id column to contacts table to track conversions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'from_lead_id'
  ) THEN
    ALTER TABLE contacts ADD COLUMN from_lead_id uuid REFERENCES leads(id);
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_from_lead ON contacts(from_lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
