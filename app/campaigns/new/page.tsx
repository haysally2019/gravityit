"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save } from "lucide-react";

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    job_title: "Roofing Sales Rep",
    daily_limit: 25,
    message_template: "Hi {{firstName}}, I saw your profile and we're booking interviews this week for a {{jobTitle}} role. Interested in a quick 10–15 min chat?",
    agent_id: "SYSTEM_DEFAULT",
    status: "draft" as const,
  });

  function handleChange(field: string, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("campaigns")
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      router.push(`/campaigns/${data.id}`);
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Failed to create campaign. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Campaigns
          </Link>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-8">
          <h2 className="text-2xl font-bold mb-6">Create New Campaign</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Q1 Roofing Sales Outreach"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Target Job Title
              </label>
              <input
                type="text"
                value={formData.job_title}
                onChange={(e) => handleChange("job_title", e.target.value)}
                className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Roofing Sales Rep"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Daily Contact Limit
              </label>
              <input
                type="number"
                value={formData.daily_limit}
                onChange={(e) => handleChange("daily_limit", parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                min="1"
                max="100"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">Maximum contacts to reach out to per day</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Message Template
              </label>
              <textarea
                value={formData.message_template}
                onChange={(e) => handleChange("message_template", e.target.value)}
                className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-32"
                placeholder="Your message template..."
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Use variables: {"{"}{"{"} firstName {"}"}{"}"}, {"{"}{"{"} jobTitle {"}"}{"}"}, etc.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                {loading ? "Creating..." : "Create Campaign"}
              </button>
              <Link
                href="/campaigns"
                className="px-6 py-3 border border-input bg-background rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}