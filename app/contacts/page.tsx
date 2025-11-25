"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabase, Contact, Lead } from "@/lib/supabase";
import { Search, Filter, Download, Plus, Mail, Phone, MapPin, Briefcase } from "lucide-react";

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

  async function deleteContact(id: number) {
    await fetch("/api/contacts/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    loadContacts();
  }

  async function searchContacts() {
    if (!searchTerm) return loadContacts();
    const res = await fetch("/api/contacts/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term: searchTerm })
    }).then(r => r.json());
    setContacts(res);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Contacts</h2>
            <p className="text-slate-600 mt-1">Manage and track your outreach contacts</p>
          </div>
          <button
            onClick={addContactPrompt}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            Add Contact
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-600">Total Contacts</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-600">New</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.new}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-600">Contacted</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.contacted}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-600">Responded</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.responded}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-4 mb-6 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("contacts")}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === "contacts"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Contacts ({contacts.length})
            </button>
            <button
              onClick={() => setActiveTab("leads")}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === "leads"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Leads ({leads.length})
            </button>
          </div>

          {activeTab === "contacts" && (
            <>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Sources</option>
                    <option value="indeed">Indeed</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="manual">Manual</option>
                  </select>
                  <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                    <Download size={18} />
                    Export
                  </button>
                </div>
              </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-slate-600">Loading contacts...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {Array.isArray(filteredContacts) && filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-lg">
                            {contact.first_name?.[0] || contact.email?.[0] || "?"}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {contact.first_name} {contact.last_name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                contact.status === "new"
                                  ? "bg-blue-100 text-blue-700"
                                  : contact.status === "contacted"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : contact.status === "responded"
                                  ? "bg-green-100 text-green-700"
                                  : contact.status === "qualified"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {contact.status}
                            </span>
                            <span className="text-xs text-slate-500 capitalize">{contact.source}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {contact.job_title && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Briefcase size={16} className="text-slate-400" />
                            <span>{contact.job_title}</span>
                          </div>
                        )}
                        {contact.company && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Briefcase size={16} className="text-slate-400" />
                            <span>{contact.company}</span>
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail size={16} className="text-slate-400" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Phone size={16} className="text-slate-400" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        {contact.location && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin size={16} className="text-slate-400" />
                            <span>{contact.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        Added {new Date(contact.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500">No contacts found</p>
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
                  <div className="text-slate-600">Loading leads...</div>
                </div>
              ) : (
                <>
                  {Array.isArray(leads) && leads.length > 0 ? (
                    leads.map((l) => (
                      <div key={l.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                        <div className="font-semibold text-lg text-slate-900">{l.name}</div>
                        <div className="text-sm text-slate-500 mt-1">{l.email}</div>
                        {l.phone && <div className="text-sm text-slate-500">{l.phone}</div>}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => convertLeadToContact(l.id)}
                            className="text-xs border border-blue-600 text-blue-600 rounded px-3 py-1.5 hover:bg-blue-50 transition-colors font-medium"
                          >
                            Convert to Contact
                          </button>
                          <button
                            onClick={() => deleteLead(l.id)}
                            className="text-xs text-red-600 underline hover:text-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-slate-500">No leads found</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
