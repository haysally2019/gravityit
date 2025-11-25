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
    <div className="min-h-screen flex bg-slate-50">
      {/* Dark Sidebar */}
      <aside
        className={`transition-all duration-300 bg-slate-900 border-r border-slate-800 shadow-xl ${
          sidebarOpen ? "w-64" : "w-20"
        } flex flex-col fixed h-full z-30`}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-center bg-slate-900">
          {sidebarOpen ? (
            <Image
              src="/download.png"
              alt="Gravity IT Resources"
              width={200}
              height={60}
              // Ensure logo is visible on dark background. 
              // If your logo is dark text, you might need brightness-0 invert
              // If it's blue/white, it should pop naturally.
              className="h-16 w-auto object-contain"
            />
          ) : (
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
              <span className="text-white font-bold text-lg">G</span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.href);

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon
                  size={20}
                  className={`flex-shrink-0 ${
                    active ? "text-white" : "text-slate-400 group-hover:text-white"
                  }`}
                />
                {sidebarOpen && (
                  <span className="font-medium text-sm tracking-wide">{tab.label}</span>
                )}
                {active && sidebarOpen && (
                  <ChevronRight size={16} className="ml-auto text-white/70" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft size={20} />
                <span className="text-sm font-medium">Collapse</span>
              </>
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area - Light Background */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        } bg-slate-50 min-h-screen`}
      >
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Search Bar */}
              <div className="flex items-center gap-4 flex-1 max-w-xl">
                <div className="relative flex-1 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-400 text-slate-700 font-medium"
                  />
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-6">
                <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm text-white font-semibold text-sm">
                    AD
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold text-slate-700">Admin User</p>
                    <p className="text-xs text-slate-500">admin@gravityit.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}