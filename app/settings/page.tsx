"use client";

import React, { useState } from "react";
import { Settings, User, Bell, Key, Database, Mail, Shield, Save } from "lucide-react";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "integrations", label: "Integrations", icon: Database },
    { id: "email", label: "Email Templates", icon: Mail },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeSection === section.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium text-sm">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {activeSection === "profile" && <ProfileSection />}
          {activeSection === "notifications" && <NotificationsSection />}
          {activeSection === "integrations" && <IntegrationsSection />}
          {activeSection === "email" && <EmailTemplatesSection />}
          {activeSection === "security" && <SecuritySection />}
        </div>
      </div>
    </div>
  );
}

function ProfileSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Profile Settings</h2>
        <p className="text-sm text-slate-600 mt-1">Update your personal information</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
            <input
              type="text"
              defaultValue="Admin"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
            <input
              type="text"
              defaultValue="User"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
          <input
            type="email"
            defaultValue="admin@gravityit.com"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Company</label>
          <input
            type="text"
            defaultValue="Gravity IT Resources"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Save size={18} />
          Save Changes
        </button>
      </div>
    </div>
  );
}

function NotificationsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Notification Preferences</h2>
        <p className="text-sm text-slate-600 mt-1">Choose what notifications you want to receive</p>
      </div>

      <div className="space-y-4">
        <NotificationToggle label="New campaign responses" description="Get notified when candidates respond" />
        <NotificationToggle
          label="Interview reminders"
          description="Receive reminders 1 hour before interviews"
        />
        <NotificationToggle
          label="Daily summary"
          description="Get a daily email summary of your activities"
        />
        <NotificationToggle
          label="PhantomBuster updates"
          description="Notifications when Phantom runs complete"
        />
      </div>

      <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
        <Save size={18} />
        Save Preferences
      </button>
    </div>
  );
}

function IntegrationsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Integrations</h2>
        <p className="text-sm text-slate-600 mt-1">Connect external services to enhance your workflow</p>
      </div>

      <div className="space-y-4">
        <IntegrationCard
          name="PhantomBuster"
          description="Automated lead generation and outreach"
          connected={true}
          apiKey="••••••••••••3456"
        />
        <IntegrationCard
          name="Supabase"
          description="Database and authentication"
          connected={true}
          apiKey="Connected"
        />
        <IntegrationCard
          name="Calendly"
          description="Automated interview scheduling"
          connected={false}
        />
      </div>
    </div>
  );
}

function EmailTemplatesSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Email Templates</h2>
        <p className="text-sm text-slate-600 mt-1">Manage your outreach email templates</p>
      </div>

      <div className="space-y-4">
        <TemplateCard
          name="Initial Outreach"
          subject="Exciting opportunity at Gravity IT"
          preview="Hi {{firstName}}, I saw your profile and..."
        />
        <TemplateCard
          name="Follow-up"
          subject="Following up on our opportunity"
          preview="Hi {{firstName}}, Just wanted to follow up..."
        />
        <TemplateCard
          name="Interview Invitation"
          subject="Interview request - {{position}}"
          preview="Hi {{firstName}}, We'd love to schedule an interview..."
        />
      </div>

      <button className="flex items-center gap-2 border border-slate-300 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-50 transition-colors">
        <Mail size={18} />
        Create New Template
      </button>
    </div>
  );
}

function SecuritySection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Security Settings</h2>
        <p className="text-sm text-slate-600 mt-1">Manage your account security</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Key size={18} />
          Update Password
        </button>
      </div>
    </div>
  );
}

function NotificationToggle({ label, description }: { label: string; description: string }) {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
      <div>
        <h4 className="font-medium text-slate-900">{label}</h4>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? "bg-blue-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            enabled ? "translate-x-6" : ""
          }`}
        />
      </button>
    </div>
  );
}

function IntegrationCard({
  name,
  description,
  connected,
  apiKey,
}: {
  name: string;
  description: string;
  connected: boolean;
  apiKey?: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
      <div>
        <h4 className="font-medium text-slate-900">{name}</h4>
        <p className="text-sm text-slate-600">{description}</p>
        {connected && apiKey && <p className="text-xs text-slate-500 mt-1 font-mono">{apiKey}</p>}
      </div>
      <button
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          connected
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {connected ? "Connected" : "Connect"}
      </button>
    </div>
  );
}

function TemplateCard({ name, subject, preview }: { name: string; subject: string; preview: string }) {
  return (
    <div className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
      <h4 className="font-medium text-slate-900">{name}</h4>
      <p className="text-sm text-slate-600 mt-1">
        <span className="font-medium">Subject:</span> {subject}
      </p>
      <p className="text-sm text-slate-500 mt-2 line-clamp-2">{preview}</p>
      <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">Edit Template</button>
    </div>
  );
}
