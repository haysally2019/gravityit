"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Campaigns</h2>
          <p className="text-muted-foreground mt-1">Create and manage your outreach campaigns</p>
        </div>
        <Link
          href="/campaigns/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-md"
        >
          <Plus size={20} />
          New Campaign
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Campaigns" value={stats.total} />
        <StatCard label="Active" value={stats.active} valueColor="text-green-500" />
        <StatCard label="Paused" value={stats.paused} valueColor="text-yellow-500" />
        <StatCard label="Draft" value={stats.draft} valueColor="text-muted-foreground" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-muted-foreground">Loading campaigns...</div>
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
                className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{campaign.name}</h3>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          campaign.status === "active"
                            ? "bg-green-500/10 text-green-500"
                            : campaign.status === "paused"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4">{campaign.job_title}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="text-blue-500" size={18} />
                        <div>
                          <p className="text-muted-foreground">Daily Limit</p>
                          <p className="font-semibold">{campaign.daily_limit}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Rocket className="text-purple-500" size={18} />
                        <div>
                          <p className="text-muted-foreground">Total Contacts</p>
                          <p className="font-semibold">{totalContacts}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Activity className="text-green-500" size={18} />
                        <div>
                          <p className="text-muted-foreground">Messages Sent</p>
                          <p className="font-semibold">{totalMessages}</p>
                        </div>
                      </div>
                    </div>

                    {latestRun && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={16} />
                        <span>
                          Last run: {new Date(latestRun.started_at).toLocaleString()} -{" "}
                          <span
                            className={`font-medium ${
                              latestRun.status === "success"
                                ? "text-green-500"
                                : latestRun.status === "failed"
                                ? "text-destructive"
                                : "text-blue-500"
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
                            ? "border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
                            : "border-green-500/50 text-green-500 hover:bg-green-500/10"
                        }`}
                        title={campaign.status === "active" ? "Pause" : "Resume"}
                      >
                        {campaign.status === "active" ? <Pause size={20} /> : <Play size={20} />}
                      </button>
                    )}
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground font-medium">
                      Message Template
                    </summary>
                    <p className="mt-2 p-3 bg-muted/50 rounded-lg text-muted-foreground">
                      {campaign.message_template}
                    </p>
                  </details>
                </div>
              </div>
            );
          })}

          {campaigns.length === 0 && (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Rocket className="mx-auto text-muted-foreground mb-4" size={48} />
              <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4">Create your first campaign to start reaching out to candidates</p>
              <Link
                href="/campaigns/new"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus size={20} />
                Create Campaign
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, valueColor }: { label: string; value: number | string; valueColor?: string }) {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-4">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${valueColor || "text-foreground"}`}>{value}</p>
    </div>
  );
}