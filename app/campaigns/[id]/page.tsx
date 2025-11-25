"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { supabase, Campaign, PhantomRun, Contact, CampaignContact } from "@/lib/supabase";
import { ArrowLeft, Play, Pause, RefreshCw, Users, MessageSquare, TrendingUp, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CampaignDetailPage() {
  const params = useParams();
  const { toast } = useToast();
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
        search: campaign.job_title, 
        numberOfProfiles: campaign.daily_limit,
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
      toast({ title: "Phantom Launched", description: "Scraping started successfully." });
    } catch (error) {
      console.error("Launch failed:", error);
      toast({ title: "Launch Failed", description: "Could not start Phantom.", variant: "destructive" });
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
            
            let contactsAdded = 0;
            // Handle PhantomBuster's variable output formats (sometimes arrays, sometimes inside resultObject)
            let resultsArray = Array.isArray(outData) ? outData : (outData.resultObject || []);

            if (resultsArray.length > 0) {
                for (const lead of resultsArray) {
                    const contactData = {
                        first_name: lead.firstName || lead.first_name || (lead.name ? lead.name.split(' ')[0] : ''),
                        last_name: lead.lastName || lead.last_name || (lead.name ? lead.name.split(' ').slice(1).join(' ') : ''),
                        linkedin_url: lead.profileUrl || lead.url || lead.linkedinProfile,
                        job_title: lead.headline || lead.job || lead.title,
                        company: lead.company || lead.currentCompany,
                        location: lead.location,
                        source: 'linkedin' as const,
                        status: 'new' as const,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };

                    // Use linkedin_url as a unique key to avoid duplicates
                    const { data: savedContact, error } = await supabase
                        .from('contacts')
                        .upsert(contactData, { onConflict: 'linkedin_url', ignoreDuplicates: false })
                        .select()
                        .single();
                    
                    if (savedContact && !error) {
                        contactsAdded++;
                        await supabase.from('campaign_contacts').upsert({
                            campaign_id: campaignId,
                            contact_id: savedContact.id,
                            status: 'pending'
                        }, { onConflict: 'campaign_id,contact_id' });
                    }
                }
            }

            await supabase
              .from("phantom_runs")
              .update({
                status,
                output_data: outData,
                contacts_found: contactsAdded,
                completed_at: new Date().toISOString(),
              })
              .eq("id", runId);

            setActiveRunId(null);
            await loadData();
            toast({ 
                title: "Run Complete", 
                description: `Found and added ${contactsAdded} new contacts.` 
            });

          } catch (err) {
            console.error("Error processing output:", err);
          }
        } else {
          await supabase.from("phantom_runs").update({ status }).eq("id", runId);
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading campaign...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Campaign not found</h2>
          <Link href="/campaigns" className="text-primary hover:underline">
            Back to Campaigns
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b shadow-sm sticky top-0 z-10">
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
              <div className="h-8 w-px bg-border" />
              <h1 className="text-xl font-semibold">Outreach Portal</h1>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/campaigns" className="text-sm font-medium text-primary border-b-2 border-primary pb-1">
                Campaigns
              </Link>
              <Link href="/contacts" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
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
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Campaigns
          </Link>
        </div>

        <div className="bg-card rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{campaign.name}</h2>
              <p className="text-muted-foreground">{campaign.job_title}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={launchPhantom}
                disabled={launching || activeRunId !== null}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {launching ? <RefreshCw size={20} className="animate-spin" /> : <Play size={20} />}
                {launching ? "Launching..." : (activeRunId ? "Running..." : "Launch Phantom")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <StatCard icon={<Activity size={20} />} label="Total Runs" value={stats.totalRuns} />
            <StatCard icon={<TrendingUp size={20} />} label="Successful Runs" value={stats.successfulRuns} />
            <StatCard icon={<Users size={20} />} label="Contacts Found" value={stats.totalContacts} />
            <StatCard icon={<MessageSquare size={20} />} label="Messages Sent" value={stats.totalMessages} />
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-2">Message Template</h3>
            <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">{campaign.message_template}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Runs</h3>
            <div className="space-y-3">
              {runs.slice(0, 10).map((run) => (
                <div key={run.id} className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        run.status === "success"
                          ? "bg-green-500/10 text-green-500"
                          : run.status === "failed"
                          ? "bg-red-500/10 text-red-500"
                          : run.status === "running"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-gray-500/10 text-gray-500"
                      }`}
                    >
                      {run.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(run.started_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {run.contacts_found} contacts found
                  </div>
                </div>
              ))}
              {runs.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No runs yet</p>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Campaign Contacts</h3>
            <div className="space-y-3">
              {campaignContacts.slice(0, 10).map((cc) => (
                <div key={cc.id} className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        {cc.contact.first_name} {cc.contact.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{cc.contact.job_title}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        cc.status === "sent"
                          ? "bg-green-500/10 text-green-500"
                          : cc.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-blue-500/10 text-blue-500"
                      }`}
                    >
                      {cc.status}
                    </span>
                  </div>
                </div>
              ))}
              {campaignContacts.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No contacts generated yet</p>
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
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
      <div className="text-primary mb-2">{icon}</div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}