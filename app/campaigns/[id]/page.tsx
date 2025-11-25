"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { supabase, Campaign, PhantomRun, Contact, CampaignContact } from "@/lib/supabase";
import { ArrowLeft, Play, Pause, RefreshCw, Users, MessageSquare, TrendingUp, Activity } from "lucide-react";

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [runs, setRuns] = useState<PhantomRun[]>([]);
  const [campaignContacts, setCampaignContacts] = useState<(CampaignContact & { contact: Contact })[]>([]);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadData();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [campaignId]);

  async function loadData() {
    setLoading(true);
    try {
      const [campaignRes, runsRes, contactsRes] = await Promise.all([
        supabase.from("campaigns").select("*").eq("id", campaignId).maybeSingle(),
        supabase.from("phantom_runs").select("*").eq("campaign_id", campaignId).order("created_at", { ascending: false }),
        supabase
          .from("campaign_contacts")
          .select("*, contact:contacts(*)")
          .eq("campaign_id", campaignId)
          .order("created_at", { ascending: false }),
      ]);

      if (campaignRes.data) setCampaign(campaignRes.data);
      if (runsRes.data) setRuns(runsRes.data);
      if (contactsRes.data) setCampaignContacts(contactsRes.data as any);
    } catch (error) {
      console.error("Error loading campaign:", error);
    } finally {
      setLoading(false);
    }
  }

  async function launchPhantom() {
    if (!campaign) return;

    setLaunching(true);
    try {
      const args = {
        jobTitle: campaign.job_title,
        dailyLimit: campaign.daily_limit,
        template: campaign.message_template,
      };

      const res = await fetch("/api/phantombuster/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: campaign.agent_id,
          arguments: args,
          maxDuration: 900,
        }),
      });

      const data = await res.json();
      const containerId = data.containerId || data.container?.id || data.id;

      if (!containerId) throw new Error("No container ID returned");

      const { data: runData, error: runError } = await supabase
        .from("phantom_runs")
        .insert([
          {
            campaign_id: campaignId,
            container_id: containerId,
            status: "running",
          },
        ])
        .select()
        .single();

      if (runError) throw runError;

      setActiveRunId(runData.id);
      startPolling(containerId, runData.id);
      await loadData();
    } catch (error) {
      console.error("Launch failed:", error);
      alert("Failed to launch Phantom. Please try again.");
    } finally {
      setLaunching(false);
    }
  }

  function startPolling(containerId: string, runId: string) {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/phantombuster/container/${containerId}`);
        const data = await res.json();
        const status = (data?.status || "").toLowerCase();

        if (["success", "failed", "aborted"].includes(status)) {
          if (pollRef.current) clearInterval(pollRef.current);

          try {
            const outRes = await fetch(`/api/phantombuster/container/${containerId}/output`);
            const outData = await outRes.json();

            await supabase
              .from("phantom_runs")
              .update({
                status,
                output_data: outData,
                completed_at: new Date().toISOString(),
              })
              .eq("id", runId);

            setActiveRunId(null);
            await loadData();
          } catch (err) {
            console.error("Error fetching output:", err);
          }
        } else {
          await supabase.from("phantom_runs").update({ status }).eq("id", runId);
          await loadData();
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000);
  }

  const stats = {
    totalRuns: runs.length,
    successfulRuns: runs.filter((r) => r.status === "success").length,
    totalContacts: runs.reduce((sum, r) => sum + r.contacts_found, 0),
    totalMessages: runs.reduce((sum, r) => sum + r.messages_sent, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-slate-600">Loading campaign...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Campaign not found</h2>
          <Link href="/campaigns" className="text-blue-600 hover:text-blue-700">
            Back to Campaigns
          </Link>
        </div>
      </div>
    );
  }

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
        <div className="mb-6">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Campaigns
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{campaign.name}</h2>
              <p className="text-slate-600">{campaign.job_title}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={launchPhantom}
                disabled={launching || activeRunId !== null}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {launching ? <RefreshCw size={20} className="animate-spin" /> : <Play size={20} />}
                {launching ? "Launching..." : "Launch Phantom"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <StatCard icon={<Activity size={20} />} label="Total Runs" value={stats.totalRuns} color="blue" />
            <StatCard
              icon={<TrendingUp size={20} />}
              label="Successful Runs"
              value={stats.successfulRuns}
              color="green"
            />
            <StatCard icon={<Users size={20} />} label="Contacts Found" value={stats.totalContacts} color="purple" />
            <StatCard
              icon={<MessageSquare size={20} />}
              label="Messages Sent"
              value={stats.totalMessages}
              color="orange"
            />
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2">Message Template</h3>
            <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg">{campaign.message_template}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Runs</h3>
            <div className="space-y-3">
              {runs.slice(0, 10).map((run) => (
                <div key={run.id} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        run.status === "success"
                          ? "bg-green-100 text-green-700"
                          : run.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : run.status === "running"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {run.status}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(run.started_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    {run.contacts_found} contacts • {run.messages_sent} messages
                  </div>
                </div>
              ))}
              {runs.length === 0 && (
                <p className="text-slate-500 text-center py-8">No runs yet</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Campaign Contacts</h3>
            <div className="space-y-3">
              {campaignContacts.slice(0, 10).map((cc) => (
                <div key={cc.id} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        {cc.contact.first_name} {cc.contact.last_name}
                      </p>
                      <p className="text-sm text-slate-600">{cc.contact.email}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        cc.status === "sent"
                          ? "bg-green-100 text-green-700"
                          : cc.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : cc.status === "responded"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {cc.status}
                    </span>
                  </div>
                </div>
              ))}
              {campaignContacts.length === 0 && (
                <p className="text-slate-500 text-center py-8">No contacts yet</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-slate-50 rounded-lg p-4">
      <div className={`text-${color}-600 mb-2`}>{icon}</div>
      <p className="text-sm text-slate-600">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
