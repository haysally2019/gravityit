/*
  # Create Gravity IT CRM Schema

  ## Overview
  Complete CRM system for managing PhantomBuster campaigns, contacts, and outreach activities.

  ## New Tables

  ### `campaigns`
  Tracks PhantomBuster outreach campaigns
  - `id` (uuid, primary key) - Unique campaign identifier
  - `name` (text) - Campaign name
  - `job_title` (text) - Target job title
  - `daily_limit` (integer) - Max contacts per day
  - `message_template` (text) - Outreach message template
  - `agent_id` (text) - PhantomBuster agent ID
  - `status` (text) - Campaign status (draft, active, paused, completed)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `contacts`
  Stores contact information from Indeed/PhantomBuster
  - `id` (uuid, primary key) - Unique contact identifier
  - `first_name` (text) - Contact first name
  - `last_name` (text) - Contact last name
  - `email` (text) - Contact email
  - `phone` (text) - Contact phone number
  - `linkedin_url` (text) - LinkedIn profile URL
  - `job_title` (text) - Current job title
  - `company` (text) - Current company
  - `location` (text) - Geographic location
  - `status` (text) - Contact status (new, contacted, responded, qualified, rejected)
  - `source` (text) - Source of contact (indeed, linkedin, manual)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `campaign_contacts`
  Links contacts to campaigns
  - `id` (uuid, primary key) - Unique identifier
  - `campaign_id` (uuid, foreign key) - References campaigns
  - `contact_id` (uuid, foreign key) - References contacts
  - `status` (text) - Status in this campaign (pending, sent, responded, failed)
  - `sent_at` (timestamptz) - When message was sent
  - `responded_at` (timestamptz) - When contact responded
  - `created_at` (timestamptz) - Creation timestamp

  ### `messages`
  Tracks all messages sent and received
  - `id` (uuid, primary key) - Unique message identifier
  - `campaign_contact_id` (uuid, foreign key) - References campaign_contacts
  - `direction` (text) - Message direction (outbound, inbound)
  - `content` (text) - Message content
  - `sent_at` (timestamptz) - When sent
  - `read_at` (timestamptz) - When read
  - `created_at` (timestamptz) - Creation timestamp

  ### `phantom_runs`
  Tracks PhantomBuster execution runs
  - `id` (uuid, primary key) - Unique run identifier
  - `campaign_id` (uuid, foreign key) - References campaigns
  - `container_id` (text) - PhantomBuster container ID
  - `status` (text) - Run status (running, success, failed, aborted)
  - `contacts_found` (integer) - Number of contacts found
  - `messages_sent` (integer) - Number of messages sent
  - `output_data` (jsonb) - Full output from PhantomBuster
  - `started_at` (timestamptz) - Run start time
  - `completed_at` (timestamptz) - Run completion time
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - All tables are publicly accessible for now (will add auth later)
*/

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  job_title text NOT NULL,
  daily_limit integer DEFAULT 25,
  message_template text NOT NULL,
  agent_id text NOT NULL,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to campaigns"
  ON campaigns
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text,
  last_name text,
  email text,
  phone text,
  linkedin_url text,
  job_title text,
  company text,
  location text,
  status text DEFAULT 'new',
  source text DEFAULT 'indeed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to contacts"
  ON contacts
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create campaign_contacts junction table
CREATE TABLE IF NOT EXISTS campaign_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  sent_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, contact_id)
);

ALTER TABLE campaign_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to campaign_contacts"
  ON campaign_contacts
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_contact_id uuid REFERENCES campaign_contacts(id) ON DELETE CASCADE,
  direction text NOT NULL,
  content text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to messages"
  ON messages
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create phantom_runs table
CREATE TABLE IF NOT EXISTS phantom_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  container_id text NOT NULL,
  status text DEFAULT 'running',
  contacts_found integer DEFAULT 0,
  messages_sent integer DEFAULT 0,
  output_data jsonb,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE phantom_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to phantom_runs"
  ON phantom_runs
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_campaign ON campaign_contacts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_contact ON campaign_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_messages_campaign_contact ON messages(campaign_contact_id);
CREATE INDEX IF NOT EXISTS idx_phantom_runs_campaign ON phantom_runs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
