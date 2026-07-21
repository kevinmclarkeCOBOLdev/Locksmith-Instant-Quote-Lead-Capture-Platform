'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Settings, Shield, LogOut } from 'lucide-react';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SidebarLink({ href, icon, children }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
        isActive
          ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10'
          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-900 bg-slate-900/40 backdrop-blur-md flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="p-6 space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-500 font-bold text-lg">
              🔓
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-white">LocksmithOS</h1>
              <span className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">SaaS Widget</span>
            </div>
          </div>

          {/* Links */}
          <nav className="space-y-1">
            <SidebarLink href="/dashboard" icon={<LayoutDashboard size={18} />}>
              Overview
            </SidebarLink>
            <SidebarLink href="/dashboard/leads" icon={<Users size={18} />}>
              Leads (Kanban)
            </SidebarLink>
            <SidebarLink href="/dashboard/quotes" icon={<FileText size={18} />}>
              Quotes Log
            </SidebarLink>
            <SidebarLink href="/dashboard/settings" icon={<Settings size={18} />}>
              Settings
            </SidebarLink>
          </nav>
        </div>

        {/* Footer info with Logout */}
        <div className="p-6 border-t border-slate-900/80 bg-slate-900/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-xs">
                AL
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Atypikal Locksmith</p>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Shield size={10} className="text-emerald-500" /> Multi-Tenant
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-slate-900 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-lg">🔓</span>
            <h1 className="font-extrabold text-sm text-white">LocksmithOS</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xs font-semibold text-slate-400 hover:text-white">Overview</Link>
            <Link href="/dashboard/leads" className="text-xs font-semibold text-slate-400 hover:text-white">Leads</Link>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
            >
              Logout
            </button>
          </nav>
        </header>

        {/* Main page content scrollable */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
