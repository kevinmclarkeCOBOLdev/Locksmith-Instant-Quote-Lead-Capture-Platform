'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Settings, Shield, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeProvider';

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
          ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
          : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2a2a2a]'
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
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#222222] text-slate-900 dark:text-neutral-100 font-sans transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-[#383838] bg-white dark:bg-[#1a1a1a] backdrop-blur-md flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="p-6 space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg shadow-sm">
              🔓
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">LockQuote</h1>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold">Atypikal Studio</span>
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

        {/* Footer info with Theme Toggle & Logout */}
        <div className="p-6 border-t border-slate-200 dark:border-[#383838] bg-slate-50 dark:bg-[#141414] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">Appearance</span>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-[#2a2a2a]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                AS
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Atypikal Locksmith</p>
                <span className="text-[10px] text-slate-500 dark:text-neutral-400 flex items-center gap-1">
                  <Shield size={10} className="text-emerald-600 dark:text-emerald-400" /> Multi-Tenant
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-[#282828] rounded-lg transition-all cursor-pointer"
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
        <header className="md:hidden h-16 border-b border-slate-200 dark:border-[#383838] bg-white dark:bg-[#1a1a1a] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-lg">🔓</span>
            <h1 className="font-extrabold text-sm text-slate-900 dark:text-white">Atypikal LockQuote</h1>
          </div>
          <nav className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/dashboard" className="text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white">Overview</Link>
            <Link href="/dashboard/leads" className="text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white">Leads</Link>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-all cursor-pointer"
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
