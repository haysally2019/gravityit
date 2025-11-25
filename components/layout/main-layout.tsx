"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Users,
  Send,
  Calendar,
  Layers,
  Settings,
  ChevronRight,
  ChevronLeft,
  Bell,
  Search,
} from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, href: "/" },
    { id: "campaigns", label: "Campaigns", icon: Layers, href: "/campaigns" },
    { id: "contacts", label: "Contacts", icon: Users, href: "/contacts" },
    { id: "outreach", label: "Outreach", icon: Send, href: "/outreach" },
    { id: "interviews", label: "Interviews", icon: Calendar, href: "/interviews" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50">
      <aside
        className={`transition-all duration-300 border-r bg-white shadow-lg ${
          sidebarOpen ? "w-64" : "w-20"
        } flex flex-col fixed h-full z-30`}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          {sidebarOpen ? (
            <Image
              src="/download.png"
              alt="Gravity IT Resources"
              width={160}
              height={48}
              className="h-10 w-auto"
            />
          ) : (
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.href);

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  active
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  size={20}
                  className={`flex-shrink-0 ${
                    active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                {sidebarOpen && (
                  <span className="font-medium text-sm">{tab.label}</span>
                )}
                {active && sidebarOpen && (
                  <ChevronRight size={16} className="ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft size={20} />
                <span className="text-sm">Collapse</span>
              </>
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>
      </aside>

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 max-w-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search campaigns, contacts, or interviews..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">AD</span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-slate-900">Admin User</p>
                    <p className="text-xs text-slate-500">admin@gravityit.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
