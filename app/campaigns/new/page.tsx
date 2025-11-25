"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
    agent_id: "",
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

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Campaigns
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Create New Campaign</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Q1 Roofing Sales Outreach"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Target Job Title
              </label>
              <input
                type="text"
                value={formData.job_title}
                onChange={(e) => handleChange("job_title", e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Roofing Sales Rep"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Daily Contact Limit
              </label>
              <input
                type="number"
                value={formData.daily_limit}
                onChange={(e) => handleChange("daily_limit", parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="100"
                required
              />
              <p className="text-sm text-slate-500 mt-1">Maximum contacts to reach out to per day</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                PhantomBuster Agent ID
              </label>
              <input
                type="text"
                value={formData.agent_id}
                onChange={(e) => handleChange("agent_id", e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 123456789012345678"
                required
              />
              <p className="text-sm text-slate-500 mt-1">
                Your PhantomBuster agent ID for this campaign
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Message Template
              </label>
              <textarea
                value={formData.message_template}
                onChange={(e) => handleChange("message_template", e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                placeholder="Your message template..."
                required
              />
              <p className="text-sm text-slate-500 mt-1">
                Use variables: {"{"}{"{"} firstName {"}"}{"}"}, {"{"}{"{"} jobTitle {"}"}{"}"}, etc.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                {loading ? "Creating..." : "Create Campaign"}
              </button>
              <Link
                href="/campaigns"
                className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
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
