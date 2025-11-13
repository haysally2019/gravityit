import { Campaign, Contact, Message } from "./supabase";

export async function fetchCampaigns(): Promise<Campaign[]> {
  const res = await fetch("/api/campaigns");
  if (!res.ok) throw new Error("Failed to fetch campaigns");
  return res.json();
}

export async function createCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
  const res = await fetch("/api/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(campaign),
  });
  if (!res.ok) throw new Error("Failed to create campaign");
  return res.json();
}

export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
  const res = await fetch("/api/campaigns", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...updates }),
  });
  if (!res.ok) throw new Error("Failed to update campaign");
  return res.json();
}

export async function deleteCampaign(id: string): Promise<void> {
  const res = await fetch(`/api/campaigns?id=${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete campaign");
}

export async function fetchContacts(filters?: {
  status?: string;
  source?: string;
}): Promise<Contact[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.source) params.append("source", filters.source);

  const res = await fetch(`/api/contacts?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch contacts");
  return res.json();
}

export async function createContact(contact: Partial<Contact>): Promise<Contact> {
  const res = await fetch("/api/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contact),
  });
  if (!res.ok) throw new Error("Failed to create contact");
  return res.json();
}

export async function updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
  const res = await fetch("/api/contacts", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...updates }),
  });
  if (!res.ok) throw new Error("Failed to update contact");
  return res.json();
}

export async function deleteContact(id: string): Promise<void> {
  const res = await fetch(`/api/contacts?id=${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete contact");
}

export async function fetchMessages(campaignContactId?: string): Promise<Message[]> {
  const params = new URLSearchParams();
  if (campaignContactId) params.append("campaign_contact_id", campaignContactId);

  const res = await fetch(`/api/messages?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export async function createMessage(message: Partial<Message>): Promise<Message> {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
  if (!res.ok) throw new Error("Failed to create message");
  return res.json();
}

export async function sendOutreach(data: {
  campaignId?: string;
  contactId?: string;
  campaignContactId?: string;
  stage?: string;
  template: string;
}): Promise<{ ok: boolean; message: Message; campaignContactId: string }> {
  const res = await fetch("/api/outreach/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to send outreach");
  return res.json();
}

export async function batchSendOutreach(data: {
  campaignId: string;
  contactIds: string[];
  template: string;
  stage?: string;
}): Promise<{
  ok: boolean;
  total: number;
  successful: number;
  failed: number;
  results: Array<{ contactId: string; success: boolean; messageId?: string; error?: string }>;
}> {
  const res = await fetch("/api/outreach/batch-send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to batch send outreach");
  return res.json();
}
