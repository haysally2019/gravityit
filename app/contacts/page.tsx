"use client";

import React, { useEffect, useState } from "react";
import { Contact, Lead } from "@/lib/supabase";
import { Search, Download, Plus, Mail, Phone, MapPin, Briefcase } from "lucide-react";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"contacts" | "leads">("contacts");

  useEffect(() => {
    loadContacts();
    loadLeads();
  }, [statusFilter, sourceFilter]);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm]);

  useEffect(() => {
    loadContacts();
  }, [activeTab]);

  async function loadContacts() {
    setLoading(true);
    try {
      const res = await fetch("/api/contacts").then(r => r.json());
      setContacts(res);
    } catch (error) {
      console.error("Error loading contacts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadLeads() {
    try {
      const res = await fetch("/api/leads").then(r => r.json());
      setLeads(res);
    } catch (error) {
      console.error("Error loading leads:", error);
    }
  }

  async function addContactPrompt() {
    const name = prompt("Contact name?");
    if (!name) return;
    const email = prompt("Email address?") || "";
    const phone = prompt("Phone number?") || "";
    await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: name.split(" ")[0],
        last_name: name.split(" ")[1] || "",
        email,
        phone,
        status: "new",
        source: "manual"
      })
    });
    loadContacts();
  }

  async function convertLeadToContact(id: string) {
    const res = await fetch("/api/leads/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) return alert("Conversion failed");
    alert("Lead converted to contact");
    loadContacts();
    loadLeads();
  }

  async function deleteLead(id: string) {
    await fetch(`/api/leads?id=${id}`, {
      method: "DELETE",
    });
    loadLeads();
  }

  function filterContacts() {
    let filtered = contacts;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.first_name?.toLowerCase().includes(term) ||
          c.last_name?.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term) ||
          c.company?.toLowerCase().includes(term) ||
          c.job_title?.toLowerCase().includes(term)
      );
    }

    if (sourceFilter !== "all") {
      filtered = filtered.filter((c) => c.source === sourceFilter);
    }

    setFilteredContacts(filtered);
  }

  const stats = {
    total: contacts.length,
    new: contacts.filter((c) => c.status === "new").length,
    contacted: contacts.filter((c) => c.status === "contacted").length,
    responded: contacts.filter((c) => c.status === "responded").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contacts</h2>
          <p className="text-muted-foreground mt-1">Manage and track your outreach contacts</p>
        </div>
        <button
          onClick={addContactPrompt}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-md"
        >
          <Plus size={20} />
          Add Contact
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Contacts" value={stats.total} />
        <StatCard label="New" value={stats.new} valueColor="text-blue-500" />
        <StatCard label="Contacted" value={stats.contacted} valueColor="text-yellow-500" />
        <StatCard label="Responded" value={stats.responded} valueColor="text-green-500" />
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center gap-4 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("contacts")}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === "contacts"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Contacts ({contacts.length})
          </button>
          <button
            onClick={() => setActiveTab("leads")}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === "leads"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Leads ({leads.length})
          </button>
        </div>

        {activeTab === "contacts" && (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="responded">Responded</option>
                  <option value="qualified">Qualified</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Sources</option>
                  <option value="indeed">Indeed</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="manual">Manual</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-2 border border-input bg-background rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Download size={18} />
                  Export
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-muted-foreground">Loading contacts...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {Array.isArray(filteredContacts) && filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="border border-border rounded-lg p-5 hover:shadow-md transition-shadow bg-card"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-semibold text-lg">
                                {contact.first_name?.[0] || contact.email?.[0] || "?"}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">
                                {contact.first_name} {contact.last_name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    contact.status === "new"
                                      ? "bg-blue-500/10 text-blue-500"
                                      : contact.status === "contacted"
                                      ? "bg-yellow-500/10 text-yellow-500"
                                      : contact.status === "responded"
                                      ? "bg-green-500/10 text-green-500"
                                      : contact.status === "qualified"
                                      ? "bg-purple-500/10 text-purple-500"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {contact.status}
                                </span>
                                <span className="text-xs text-muted-foreground capitalize">{contact.source}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {contact.job_title && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Briefcase size={16} className="text-muted-foreground/70" />
                                <span>{contact.job_title}</span>
                              </div>
                            )}
                            {contact.company && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Briefcase size={16} className="text-muted-foreground/70" />
                                <span>{contact.company}</span>
                              </div>
                            )}
                            {contact.email && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail size={16} className="text-muted-foreground/70" />
                                <span>{contact.email}</span>
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone size={16} className="text-muted-foreground/70" />
                                <span>{contact.phone}</span>
                              </div>
                            )}
                            {contact.location && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin size={16} className="text-muted-foreground/70" />
                                <span>{contact.location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Added {new Date(contact.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No contacts found</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === "leads" && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-muted-foreground">Loading leads...</div>
              </div>
            ) : (
              <>
                {Array.isArray(leads) && leads.length > 0 ? (
                  leads.map((l) => (
                    <div key={l.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow bg-card">
                      <div className="font-semibold text-lg">{l.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">{l.email}</div>
                      {l.phone && <div className="text-sm text-muted-foreground">{l.phone}</div>}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => convertLeadToContact(l.id)}
                          className="text-xs border border-primary text-primary rounded px-3 py-1.5 hover:bg-primary/10 transition-colors font-medium"
                        >
                          Convert to Contact
                        </button>
                        <button
                          onClick={() => deleteLead(l.id)}
                          className="text-xs text-destructive underline hover:text-destructive/80 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No leads found</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
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