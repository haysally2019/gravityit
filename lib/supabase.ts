import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Campaign = {
  id: string;
  name: string;
  job_title: string;
  daily_limit: number;
  message_template: string;
  agent_id: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
};

export type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: 'new' | 'contacted' | 'converted' | 'rejected';
  created_at: string;
  updated_at: string;
};

export type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  job_title: string | null;
  company: string | null;
  location: string | null;
  status: 'new' | 'contacted' | 'responded' | 'qualified' | 'rejected';
  source: 'indeed' | 'linkedin' | 'manual' | 'lead_conversion';
  from_lead_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CampaignContact = {
  id: string;
  campaign_id: string;
  contact_id: string;
  status: 'pending' | 'sent' | 'responded' | 'failed';
  sent_at: string | null;
  responded_at: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  campaign_contact_id: string;
  direction: 'outbound' | 'inbound';
  content: string;
  sent_at: string;
  read_at: string | null;
  created_at: string;
};

export type PhantomRun = {
  id: string;
  campaign_id: string;
  container_id: string;
  status: 'running' | 'success' | 'failed' | 'aborted';
  contacts_found: number;
  messages_sent: number;
  output_data: any;
  started_at: string;
  completed_at: string | null;
  created_at: string;
};
