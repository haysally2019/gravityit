"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase, Campaign, PhantomRun } from "@/lib/supabase";
import { Play, Pause, Plus, Rocket, Calendar, Target, Activity } from "lucide-react";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [runs, setRuns] = useState<Record<string, PhantomRun[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("campaigns")
        .select("id, name, job_title, status, daily_limit, message_template, agent_id, created_at, updated_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (campaignsError) throw campaignsError;
      if (campaignsData) {
        setCampaigns(campaignsData);

        const { data: runsData, error: runsError } = await supabase
          .from("phantom_runs")
          .select("id, campaign_id, container_id, status, contacts_found, messages_sent, output_data, started_at, completed_at, created_at")
          .order("created_at", { ascending: false })
          .limit(100);

        if (runsData && !runsError) {
          const runsByCampaign: Record<string, PhantomRun[]> = {};
          runsData.forEach((run) => {
            if (!runsByCampaign[run.campaign_id]) {
              runsByCampaign[run.campaign_id] = [];
            }
            runsByCampaign[run.campaign_id].push(run);
          });
          setRuns(runsByCampaign);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleCampaignStatus(campaignId: string, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", campaignId);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error("Error updating campaign:", error);
    }
  }

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === "active").length,
    paused: campaigns.filter((c) => c.status === "paused").length,
    draft: campaigns.filter((c) => c.status === "draft").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/download.png"
                alt="Gravity IT Resources"
                width={200}
                height={60}
                className="h-12 w-auto"
              />
              <div className="h-8 w-px bg-slate-300" />
              <h1 className="text-xl font-semibold text-slate-800">Outreach Portal</h1>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Dashboard
              </Link>
              <Link href="/campaigns" className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-1">
                Campaigns
              </Link>
              <Link href="/contacts" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Contacts
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Campaigns</h2>
            <p className="text-slate-600 mt-1">Create and manage your outreach campaigns</p>
          </div>
          <Link
            href="/campaigns/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            New Campaign
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-600">Total Campaigns</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-600">Active</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-600">Paused</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.paused}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-600">Draft</p>
            <p className="text-2xl font-bold text-slate-600 mt-1">{stats.draft}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-slate-600">Loading campaigns...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {campaigns.map((campaign) => {
              const campaignRuns = runs[campaign.id] || [];
              const latestRun = campaignRuns[0];
              const totalContacts = campaignRuns.reduce((sum, run) => sum + run.contacts_found, 0);
              const totalMessages = campaignRuns.reduce((sum, run) => sum + run.messages_sent, 0);

              return (
                <div
                  key={campaign.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-slate-900">{campaign.name}</h3>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            campaign.status === "active"
                              ? "bg-green-100 text-green-700"
                              : campaign.status === "paused"
                              ? "bg-yellow-100 text-yellow-700"
                              : campaign.status === "draft"
                              ? "bg-slate-100 text-slate-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-4">{campaign.job_title}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="text-blue-500" size={18} />
                          <div>
                            <p className="text-slate-500">Daily Limit</p>
                            <p className="font-semibold text-slate-900">{campaign.daily_limit}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Rocket className="text-purple-500" size={18} />
                          <div>
                            <p className="text-slate-500">Total Contacts</p>
                            <p className="font-semibold text-slate-900">{totalContacts}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Activity className="text-green-500" size={18} />
                          <div>
                            <p className="text-slate-500">Messages Sent</p>
                            <p className="font-semibold text-slate-900">{totalMessages}</p>
                          </div>
                        </div>
                      </div>

                      {latestRun && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Calendar size={16} />
                          <span>
                            Last run: {new Date(latestRun.started_at).toLocaleString()} -{" "}
                            <span
                              className={`font-medium ${
                                latestRun.status === "success"
                                  ? "text-green-600"
                                  : latestRun.status === "failed"
                                  ? "text-red-600"
                                  : "text-blue-600"
                              }`}
                            >
                              {latestRun.status}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {campaign.status !== "draft" && (
                        <button
                          onClick={() => toggleCampaignStatus(campaign.id, campaign.status)}
                          className={`p-2 rounded-lg border transition-colors ${
                            campaign.status === "active"
                              ? "border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                              : "border-green-300 text-green-600 hover:bg-green-50"
                          }`}
                          title={campaign.status === "active" ? "Pause" : "Resume"}
                        >
                          {campaign.status === "active" ? <Pause size={20} /> : <Play size={20} />}
                        </button>
                      )}
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <details className="text-sm">
                      <summary className="cursor-pointer text-slate-600 hover:text-slate-900 font-medium">
                        Message Template
                      </summary>
                      <p className="mt-2 p-3 bg-slate-50 rounded-lg text-slate-700">
                        {campaign.message_template}
                      </p>
                    </details>
                  </div>
                </div>
              );
            })}

            {campaigns.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <Rocket className="mx-auto text-slate-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No campaigns yet</h3>
                <p className="text-slate-600 mb-4">Create your first campaign to start reaching out to candidates</p>
                <Link
                  href="/campaigns/new"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                  Create Campaign
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
