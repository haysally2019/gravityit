"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase, Campaign, Contact, PhantomRun } from "@/lib/supabase";
import { Rocket, Users, MessageSquare, TrendingUp, BarChart3, Plus } from "lucide-react";

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [recentRuns, setRecentRuns] = useState<PhantomRun[]>([]);
  const [loading, setLoading] = useState(true);

  const [initialTpl, setInitialTpl] = useState(
    "Hi {{name}}, we're reviewing candidates for {{jobTitle}}."
  );
  const [followTpl, setFollowTpl] = useState(
    "Hi {{name}}, just checking if you're still interested in {{jobTitle}}."
  );
  const [tplChoice, setTplChoice] = useState("initial");
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [stage, setStage] = useState("new");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [campaignsRes, contactsRes, runsRes] = await Promise.all([
        supabase.from("campaigns").select("id, name, job_title, status, daily_limit, message_template, agent_id, created_at, updated_at").order("created_at", { ascending: false }).limit(20),
        supabase.from("contacts").select("id, first_name, last_name, email, phone, linkedin_url, job_title, company, location, status, source, from_lead_id, created_at, updated_at").order("created_at", { ascending: false }).limit(10),
        supabase.from("phantom_runs").select("id, campaign_id, container_id, status, contacts_found, messages_sent, output_data, started_at, completed_at, created_at").order("created_at", { ascending: false }).limit(5)
      ]);

      if (campaignsRes.data) setCampaigns(campaignsRes.data);
      if (contactsRes.data) setContacts(contactsRes.data);
      if (runsRes.data) setRecentRuns(runsRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function sendOutreach() {
    if (!selectedCampaign) return alert("Select a campaign first.");
    const tpl = tplChoice === "initial" ? initialTpl : followTpl;
    await fetch("/api/outreach/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId: selectedCampaign, stage, template: tpl })
    });
    alert("Outreach sent.");
    loadData();
  }

  const stats = useMemo(() => ({
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalContacts: contacts.length,
    newContacts: contacts.filter(c => c.status === 'new').length,
    respondedContacts: contacts.filter(c => c.status === 'responded').length,
    successfulRuns: recentRuns.filter(r => r.status === 'success').length
  }), [campaigns, contacts, recentRuns]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome to your recruiting command center</p>
        </div>
        <Link
          href="/campaigns/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          New Campaign
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-600">Loading...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<Rocket className="text-blue-600" size={24} />}
              label="Total Campaigns"
              value={stats.totalCampaigns}
              subtext={`${stats.activeCampaigns} active`}
              color="blue"
            />
            <StatCard
              icon={<Users className="text-green-600" size={24} />}
              label="Total Contacts"
              value={stats.totalContacts}
              subtext={`${stats.newContacts} new`}
              color="green"
            />
            <StatCard
              icon={<MessageSquare className="text-purple-600" size={24} />}
              label="Responses"
              value={stats.respondedContacts}
              subtext={`${Math.round((stats.respondedContacts / Math.max(stats.totalContacts, 1)) * 100)}% rate`}
              color="purple"
            />
            <StatCard
              icon={<TrendingUp className="text-orange-600" size={24} />}
              label="Successful Runs"
              value={stats.successfulRuns}
              subtext={`of ${recentRuns.length} recent`}
              color="orange"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Active Campaigns</h3>
                <Link href="/campaigns" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {campaigns.filter(c => c.status === 'active').slice(0, 5).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div>
                      <h4 className="font-medium text-slate-900">{campaign.name}</h4>
                      <p className="text-sm text-slate-600">{campaign.job_title}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Active
                    </span>
                  </div>
                ))}
                {campaigns.filter(c => c.status === 'active').length === 0 && (
                  <p className="text-slate-500 text-center py-8">No active campaigns</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Recent Phantom Runs</h3>
                <BarChart3 className="text-slate-400" size={20} />
              </div>
              <div className="space-y-4">
                {recentRuns.map((run) => (
                  <div key={run.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${
                          run.status === 'success' ? 'bg-green-500' :
                          run.status === 'failed' ? 'bg-red-500' :
                          run.status === 'running' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }`} />
                        <span className="text-sm font-medium text-slate-900 capitalize">{run.status}</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {run.contacts_found} contacts • {run.messages_sent} messages
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(run.started_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {recentRuns.length === 0 && (
                  <p className="text-slate-500 text-center py-8">No recent runs</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Recent Contacts</h3>
              <Link href="/contacts" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Job Title</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Company</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.slice(0, 10).map((contact) => (
                    <tr key={contact.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-slate-900">
                        {contact.first_name} {contact.last_name}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{contact.job_title || '-'}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{contact.company || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          contact.status === 'new' ? 'bg-blue-100 text-blue-700' :
                          contact.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
                          contact.status === 'responded' ? 'bg-green-100 text-green-700' :
                          contact.status === 'qualified' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {contact.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-500">
                        {new Date(contact.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {contacts.length === 0 && (
                <p className="text-slate-500 text-center py-8">No contacts yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, subtext, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtext: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-medium text-slate-600 mb-1">{label}</h3>
      <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-sm text-slate-500">{subtext}</p>
    </div>
  );
}
