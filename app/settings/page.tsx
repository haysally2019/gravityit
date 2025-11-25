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
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl shadow-sm border border-border p-4">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeSection === section.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium text-sm">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="lg:col-span-3 bg-card rounded-xl shadow-sm border border-border p-6">
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
        <h2 className="text-xl font-semibold">Profile Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Update your personal information</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">First Name</label>
            <input
              type="text"
              defaultValue="Admin"
              className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Last Name</label>
            <input
              type="text"
              defaultValue="User"
              className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
          <input
            type="email"
            defaultValue="admin@gravityit.com"
            className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Company</label>
          <input
            type="text"
            defaultValue="Gravity IT Resources"
            className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
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
        <h2 className="text-xl font-semibold">Notification Preferences</h2>
        <p className="text-sm text-muted-foreground mt-1">Choose what notifications you want to receive</p>
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

      <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
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
        <h2 className="text-xl font-semibold">Integrations</h2>
        <p className="text-sm text-muted-foreground mt-1">Connect external services to enhance your workflow</p>
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
        <h2 className="text-xl font-semibold">Email Templates</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your outreach email templates</p>
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

      <button className="flex items-center gap-2 border border-input text-muted-foreground hover:text-foreground px-6 py-2 rounded-lg hover:bg-accent transition-colors">
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
        <h2 className="text-xl font-semibold">Security Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your account security</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Current Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">New Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Confirm New Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
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
    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
      <div>
        <h4 className="font-medium">{label}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-background rounded-full transition-transform ${
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
    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
      <div>
        <h4 className="font-medium">{name}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
        {connected && apiKey && <p className="text-xs text-muted-foreground mt-1 font-mono">{apiKey}</p>}
      </div>
      <button
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          connected
            ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        {connected ? "Connected" : "Connect"}
      </button>
    </div>
  );
}

function TemplateCard({ name, subject, preview }: { name: string; subject: string; preview: string }) {
  return (
    <div className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow">
      <h4 className="font-medium">{name}</h4>
      <p className="text-sm text-muted-foreground mt-1">
        <span className="font-medium">Subject:</span> {subject}
      </p>
      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{preview}</p>
      <button className="mt-3 text-sm text-primary hover:text-primary/80 font-medium">Edit Template</button>
    </div>
  );
}