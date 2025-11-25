"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, Campaign, PhantomRun } from "@/lib/supabase";
import { Play, Pause, Plus, Rocket, Calendar, Target, Activity, MoreHorizontal, Users, MessageSquare } from "lucide-react";

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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Campaigns</h2>
          <p className="text-slate-500 mt-1">Manage your outreach campaigns and monitor performance</p>
        </div>
        <Link
          href="/campaigns/new"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow-md active:transform active:scale-95"
        >
          <Plus size={18} />
          Create Campaign
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Campaigns" value={stats.total} icon={<LayersIcon />} />
        <StatCard label="Active" value={stats.active} icon={<PlayCircleIcon />} color="green" />
        <StatCard label="Paused" value={stats.paused} icon={<PauseCircleIcon />} color="yellow" />
        <StatCard label="Drafts" value={stats.draft} icon={<FileIcon />} color="gray" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-slate-500 font-medium">Loading campaigns...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
            {campaigns.length === 0 ? (
                 <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Rocket className="text-slate-400" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No campaigns found</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mb-6">Get started by creating your first outreach campaign to connect with candidates.</p>
                  <Link
                    href="/campaigns/new"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Create Campaign
                  </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {campaigns.map((campaign) => {
                    const campaignRuns = runs[campaign.id] || [];
                    const latestRun = campaignRuns[0];
                    const totalContacts = campaignRuns.reduce((sum, run) => sum + run.contacts_found, 0);
                    const totalMessages = campaignRuns.reduce((sum, run) => sum + run.messages_sent, 0);

                    return (
                    <div
                        key={campaign.id}
                        className="group bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-200 flex flex-col"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                                        <Link href={`/campaigns/${campaign.id}`}>{campaign.name}</Link>
                                    </h3>
                                </div>
                                <p className="text-sm text-slate-500 font-medium">{campaign.job_title}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                                        campaign.status === "active"
                                            ? "bg-green-50 text-green-700 border border-green-100"
                                            : campaign.status === "paused"
                                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                                            : "bg-slate-100 text-slate-600 border border-slate-200"
                                    }`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                        campaign.status === "active" ? "bg-green-500" :
                                        campaign.status === "paused" ? "bg-amber-500" : "bg-slate-400"
                                    }`}></span>
                                    {campaign.status}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 py-4 my-2 border-t border-b border-slate-50">
                             <div className="text-center px-2">
                                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Daily Limit</div>
                                <div className="font-bold text-slate-700">{campaign.daily_limit}</div>
                            </div>
                            <div className="text-center px-2 border-l border-slate-100">
                                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Contacts</div>
                                <div className="font-bold text-slate-700">{totalContacts}</div>
                            </div>
                             <div className="text-center px-2 border-l border-slate-100">
                                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Sent</div>
                                <div className="font-bold text-slate-700">{totalMessages}</div>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 flex items-center justify-between">
                            <div className="text-xs text-slate-400 flex items-center gap-1.5">
                                <Calendar size={14} />
                                {latestRun ? (
                                    <span>Last run: {new Date(latestRun.started_at).toLocaleDateString()}</span>
                                ) : (
                                    <span>No runs yet</span>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {campaign.status !== "draft" && (
                                <button
                                    onClick={() => toggleCampaignStatus(campaign.id, campaign.status)}
                                    className={`p-2 rounded-md transition-all ${
                                    campaign.status === "active"
                                        ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                        : "text-slate-400 hover:text-green-600 hover:bg-green-50"
                                    }`}
                                    title={campaign.status === "active" ? "Pause Campaign" : "Resume Campaign"}
                                >
                                    {campaign.status === "active" ? <Pause size={18} /> : <Play size={18} />}
                                </button>
                                )}
                                <Link
                                    href={`/campaigns/${campaign.id}`}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </div>
                    );
                })}
                </div>
            )}
        </div>
      )}
    </div>
  );
}

// Minimal Icons for Stat Cards
const LayersIcon = () => <Layers className="w-5 h-5" />;
const PlayCircleIcon = () => <Play className="w-5 h-5" />;
const PauseCircleIcon = () => <Pause className="w-5 h-5" />;
const FileIcon = () => <MoreHorizontal className="w-5 h-5" />;

function StatCard({ label, value, icon, color = "blue" }: { label: string; value: number | string; icon?: React.ReactNode; color?: "blue" | "green" | "yellow" | "gray" }) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    yellow: "bg-amber-50 text-amber-600 border-amber-100",
    gray: "bg-slate-50 text-slate-600 border-slate-100"
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
      {icon && (
        <div className={`p-3 rounded-lg border ${colorStyles[color]}`}>
          {icon}
        </div>
      )}
    </div>
  );
}