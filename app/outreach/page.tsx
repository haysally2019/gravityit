"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabase, Campaign, Contact, Message } from "@/lib/supabase";
import { batchSendOutreach } from "@/lib/api";
import { Send, Mail, MessageSquare, Clock, CheckCircle } from "lucide-react";

export default function OutreachPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const [initialTpl, setInitialTpl] = useState("Hi {{name}}, we're reviewing candidates for {{jobTitle}}...");
  const [followTpl, setFollowTpl] = useState("Hi {{name}}, just checking if you're still interested...");
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [stage, setStage] = useState("new");
  const [tplChoice, setTplChoice] = useState("initial");

  const [tab, setTab] = useState<"overview" | "outreach" | "contacts">("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Contact[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [campaignsRes, contactsRes, messagesRes] = await Promise.all([
        supabase.from("campaigns").select("id, name, job_title, status, daily_limit, message_template, agent_id, created_at, updated_at").order("created_at", { ascending: false }).limit(50),
        supabase.from("contacts").select("id, first_name, last_name, email, phone, linkedin_url, job_title, company, location, status, source, from_lead_id, created_at, updated_at").order("created_at", { ascending: false }).limit(200),
        supabase.from("messages").select("id, campaign_contact_id, direction, content, sent_at, read_at, created_at").order("sent_at", { ascending: false }).limit(50),
      ]);

      if (campaignsRes.data) setCampaigns(campaignsRes.data);
      if (contactsRes.data) setContacts(contactsRes.data);
      if (messagesRes.data) setMessages(messagesRes.data);
    } catch (error) {
      console.error("Error loading outreach data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOutreach() {
    if (!selectedCampaign) {
      alert("Please select a campaign");
      return;
    }

    const eligibleContacts = contacts.filter((c) => c.status === stage);

    if (eligibleContacts.length === 0) {
      alert(`No contacts found with status: ${stage}`);
      return;
    }

    const template = tplChoice === "initial" ? initialTpl : followTpl;
    const contactIds = eligibleContacts.map((c) => c.id);

    try {
      const result = await batchSendOutreach({
        campaignId: selectedCampaign,
        contactIds: contactIds,
        template: template,
        stage: stage,
      });

      await loadData();
      alert(`Messages sent! Success: ${result.successful}, Failed: ${result.failed}`);
    } catch (error) {
      console.error("Error sending outreach:", error);
      alert("Failed to send messages. Please try again.");
    }
  }

  const stats = useMemo(() => {
    const pending = contacts.filter((c) => c.status === "new").length;
    const sent = contacts.filter((c) => c.status === "contacted").length;
    const responded = contacts.filter((c) => c.status === "responded").length;
    const responseRate = Math.round((responded / Math.max(sent, 1)) * 100);
    return { pending, sent, responded, responseRate };
  }, [contacts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Outreach Management</h1>
          <p className="text-slate-600 mt-1">Track and manage your candidate outreach</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<Clock className="text-yellow-600" size={24} />}
          label="Pending"
          value={stats.pending}
          color="yellow"
        />
        <StatCard
          icon={<Send className="text-blue-600" size={24} />}
          label="Sent"
          value={stats.sent}
          color="blue"
        />
        <StatCard
          icon={<MessageSquare className="text-green-600" size={24} />}
          label="Responded"
          value={stats.responded}
          color="green"
        />
        <StatCard
          icon={<CheckCircle className="text-purple-600" size={24} />}
          label="Response Rate"
          value={`${stats.responseRate}%`}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <div className="flex gap-6 px-6">
            <button
              onClick={() => setTab("overview")}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                tab === "overview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setTab("outreach")}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                tab === "outreach"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Outreach
            </button>
            <button
              onClick={() => setTab("contacts")}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                tab === "contacts"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Contacts
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-slate-600">Loading outreach data...</div>
            </div>
          ) : (
            <>
              {tab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Active Campaigns</h3>
                      <div className="space-y-3">
                        {campaigns.filter(c => c.status === 'active').map((campaign) => (
                          <div key={campaign.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <h4 className="font-medium text-slate-900">{campaign.name}</h4>
                            <p className="text-sm text-slate-600 mt-1">{campaign.job_title}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                              <span>Daily limit: {campaign.daily_limit}</span>
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">Active</span>
                            </div>
                          </div>
                        ))}
                        {campaigns.filter(c => c.status === 'active').length === 0 && (
                          <p className="text-slate-500 text-center py-8">No active campaigns</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Messages</h3>
                      <div className="space-y-3">
                        {messages.slice(0, 5).map((message) => (
                          <div key={message.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2 mb-2">
                              {message.direction === "outbound" ? (
                                <Send size={16} className="text-blue-600" />
                              ) : (
                                <MessageSquare size={16} className="text-green-600" />
                              )}
                              <span className="text-xs font-medium text-slate-600 capitalize">
                                {message.direction}
                              </span>
                              <span className="text-xs text-slate-500 ml-auto">
                                {new Date(message.sent_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 line-clamp-2">{message.content}</p>
                          </div>
                        ))}
                        {messages.length === 0 && (
                          <p className="text-slate-500 text-center py-8">No recent messages</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Status Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-600 font-medium">New</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">{contacts.filter(c => c.status === 'new').length}</p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-600 font-medium">Contacted</p>
                        <p className="text-2xl font-bold text-yellow-900 mt-1">{contacts.filter(c => c.status === 'contacted').length}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-600 font-medium">Responded</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">{contacts.filter(c => c.status === 'responded').length}</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-purple-600 font-medium">Qualified</p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">{contacts.filter(c => c.status === 'qualified').length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === "contacts" && (
                <section className="max-w-4xl">
                  <h3 className="text-xl font-semibold mb-3">Contacts</h3>

                  <div className="flex items-center gap-2 mb-4">
                    <input
                      placeholder="Search contacts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                    <button
                      onClick={async () => {
                        if (!searchTerm.trim()) {
                          setSearchResults([]);
                          return;
                        }
                        try {
                          const response = await fetch("/api/contacts/search", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ term: searchTerm }),
                          });
                          const data = await response.json();
                          setSearchResults(data);
                        } catch (error) {
                          console.error("Error searching contacts:", error);
                        }
                      }}
                      className="px-4 py-2 text-sm rounded bg-black text-white hover:bg-slate-800 transition-colors"
                    >
                      Search
                    </button>
                    <button
                      onClick={async () => {
                        const name = prompt("Enter contact name:");
                        const email = prompt("Enter contact email:");
                        const phone = prompt("Enter contact phone:");
                        if (name && email) {
                          try {
                            await fetch("/api/contacts", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                first_name: name.split(" ")[0],
                                last_name: name.split(" ")[1] || "",
                                email,
                                phone: phone || null,
                                status: "new",
                                source: "manual",
                              }),
                            });
                            await loadData();
                            alert("Contact added!");
                          } catch (error) {
                            console.error("Error adding contact:", error);
                            alert("Failed to add contact");
                          }
                        }
                      }}
                      className="px-4 py-2 text-sm rounded border hover:bg-slate-50 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-left">Email</th>
                          <th className="px-3 py-2 text-left">Phone</th>
                          <th className="px-3 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(searchResults.length > 0 ? searchResults : contacts).length > 0 ? (
                          (searchResults.length > 0 ? searchResults : contacts).map((c) => (
                            <tr key={c.id} className="border-b hover:bg-gray-50">
                              <td className="px-3 py-2">{c.first_name} {c.last_name}</td>
                              <td className="px-3 py-2">{c.email}</td>
                              <td className="px-3 py-2">{c.phone || "-"}</td>
                              <td className="px-3 py-2">
                                <button
                                  onClick={async () => {
                                    if (confirm("Delete this contact?")) {
                                      try {
                                        await fetch("/api/contacts/delete", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ id: c.id }),
                                        });
                                        await loadData();
                                        setSearchResults(searchResults.filter((item) => item.id !== c.id));
                                      } catch (error) {
                                        console.error("Error deleting contact:", error);
                                        alert("Failed to delete contact");
                                      }
                                    }
                                  }}
                                  className="text-red-600 text-xs underline hover:text-red-800"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-3 py-4 text-center text-gray-500 text-sm"
                            >
                              {searchTerm ? "No contacts found." : "No contacts yet."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {tab === "outreach" && (
                <section className="max-w-3xl">
                  <h3 className="text-xl font-semibold mb-3">Outreach</h3>

                  <div className="border rounded-lg p-4 bg-white">
                    <h4 className="font-semibold mb-2">Templates</h4>
                    <label className="block text-sm font-medium mt-2">Initial Message</label>
                    <textarea
                      value={initialTpl}
                      onChange={(e) => setInitialTpl(e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm mt-1 h-24"
                      placeholder="Hi {{name}}, we're reviewing candidates for {{jobTitle}}..."
                    />
                    <label className="block text-sm font-medium mt-3">Follow-Up</label>
                    <textarea
                      value={followTpl}
                      onChange={(e) => setFollowTpl(e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm mt-1 h-24"
                      placeholder="Hi {{name}}, just checking if you're still interested..."
                    />
                  </div>

                  <div className="border rounded-lg p-4 bg-white mt-4">
                    <h4 className="font-semibold mb-2">Send Messages</h4>
                    <label className="block text-sm mt-1">Select Campaign</label>
                    <select
                      value={selectedCampaign}
                      onChange={(e) => setSelectedCampaign(e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm mt-1"
                    >
                      <option value="">Choose...</option>
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <label className="block text-sm mt-3">Stage</label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm mt-1"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="responded">Responded</option>
                    </select>

                    <label className="block text-sm mt-3">Template</label>
                    <select
                      value={tplChoice}
                      onChange={(e) => setTplChoice(e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm mt-1"
                    >
                      <option value="initial">Initial</option>
                      <option value="follow">Follow-Up</option>
                    </select>

                    <button
                      onClick={handleSendOutreach}
                      className="mt-4 px-4 py-2 rounded bg-slate-900 text-white text-sm hover:bg-slate-800 transition-colors"
                    >
                      Send Messages
                    </button>
                  </div>

                  <div className="border rounded-lg p-4 bg-white mt-4">
                    <h4 className="font-semibold mb-2">Sent Log</h4>
                    <ul className="text-sm max-h-64 overflow-auto">
                      {messages.map((m) => (
                        <li key={m.id} className="border-b py-2 text-slate-700">
                          {m.direction} • {new Date(m.sent_at).toLocaleString()}
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{m.content}</p>
                        </li>
                      ))}
                      {messages.length === 0 && <li className="text-slate-500">No messages yet.</li>}
                    </ul>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
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
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-50`}>{icon}</div>
      </div>
      <h3 className="text-sm font-medium text-slate-600 mb-1">{label}</h3>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
