'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Code2, ShieldAlert, Monitor, ChevronRight, LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeProvider';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#222222] text-slate-900 dark:text-neutral-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-600 dark:selection:text-emerald-300 transition-colors duration-200">
      
      {/* Background radial effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xl shadow-lg shadow-emerald-500/10">
            🔓
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white leading-tight">Atypikal LockQuote</h1>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold block">Lead Capture Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Small button to toggle between dark and light modes */}
          <ThemeToggle />

          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-slate-200 dark:bg-[#2a2a2a] hover:bg-slate-300 dark:hover:bg-[#333333] border border-slate-300 dark:border-[#3d3d3d] text-slate-900 dark:text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200"
          >
            <LayoutDashboard size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/widget"
            className="bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white dark:text-slate-950 text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 cursor-pointer"
          >
            Launch Widget Demo
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-[#1a1a1a] border border-emerald-500/30 rounded-full text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
          <Sparkles size={12} /> Powered by Atypikal Studio Engine
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Increase Locksmith Enquiries with <span className="text-emerald-600 dark:text-emerald-400">Instant Quotes</span>
          </h2>
          <p className="text-md sm:text-lg text-slate-600 dark:text-neutral-400 max-w-2xl mx-auto font-medium">
            Embed a premium, multi-step quote wizard on any website. Qualify customers, calculate dynamic estimates, collect high-intent leads, and manage bookings instantly.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white dark:text-slate-950 font-bold px-8 py-4 rounded-xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 group transition-all duration-200 cursor-pointer"
          >
            Open Management Dashboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/widget"
            className="w-full sm:w-auto bg-white dark:bg-[#1a1a1a] border border-slate-300 dark:border-[#383838] hover:border-emerald-500/50 text-slate-800 dark:text-neutral-200 font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
          >
            Test Widget Experience <ChevronRight size={16} />
          </Link>
        </div>

        {/* Visual Widget Preview */}
        <div className="max-w-4xl mx-auto pt-12">
          <div className="bg-white dark:bg-[#1a1a1a]/80 border border-slate-200 dark:border-[#383838] rounded-3xl p-2 shadow-2xl shadow-black/10 dark:shadow-black/60">
            <div className="bg-slate-50 dark:bg-[#222222] border border-slate-200 dark:border-[#2a2a2a] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center justify-between text-left">
              <div className="space-y-4 max-w-sm">
                <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-xl">
                  ✨
                </div>
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Embeddable Wizard Widget</h3>
                <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                  A beautiful multi-step questionnaire that matches Elementor, Wix, WordPress, or custom sites seamlessly. Users answer service type, urgency, property, and postcode to see pricing.
                </p>
                <div className="flex items-center gap-4 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>✓ 100% Mobile Responsive</span>
                  <span>✓ Geocoded Coordinates</span>
                </div>
              </div>
              
              {/* Dummy widget preview card */}
              <div className="w-full max-w-sm bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-neutral-400">
                  <span>Locked Out Enquiry</span>
                  <span className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-bold">🚨 Emergency</span>
                </div>
                <div className="bg-slate-100 dark:bg-[#2a2a2a] rounded-xl p-4 border border-slate-200 dark:border-[#383838] text-center">
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase tracking-widest block mb-1">Estimate Range</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">£95 - £140</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 dark:text-neutral-300">
                  <p className="flex justify-between"><span>Client:</span> <span className="text-slate-900 dark:text-white font-semibold">David Jones</span></p>
                  <p className="flex justify-between"><span>Postcode:</span> <span className="text-slate-900 dark:text-white font-semibold uppercase">SW1A 1AA</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-[#383838] grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {/* Feature 1 */}
        <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] rounded-2xl p-6 space-y-4 hover:border-emerald-500/50 transition-colors shadow-sm">
          <div className="w-10 h-10 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Monitor size={18} />
          </div>
          <h4 className="font-extrabold text-slate-900 dark:text-white text-md">Embeds Anywhere</h4>
          <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
            Include as a fast vanilla JavaScript loader, a standard iframe container, or React components on Shopify, Squarespace, Wix, WordPress, and Custom HTML pages.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] rounded-2xl p-6 space-y-4 hover:border-emerald-500/50 transition-colors shadow-sm">
          <div className="w-10 h-10 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Code2 size={18} />
          </div>
          <h4 className="font-extrabold text-slate-900 dark:text-white text-md">Configurable Engine</h4>
          <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
            Ditch hardcoded values. Set service baselines, property multipliers, and urgency modifiers right from your dashboard. Keep price ranges accurate.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] rounded-2xl p-6 space-y-4 hover:border-emerald-500/50 transition-colors shadow-sm">
          <div className="w-10 h-10 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldAlert size={18} />
          </div>
          <h4 className="font-extrabold text-slate-900 dark:text-white text-md">Real-Time Alerts</h4>
          <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
            Trigger instant Twilio SMS details to technicians and detailed Resend Emails containing lead contact details and map coordinates as soon as they submit.
          </p>
        </div>
      </section>

      {/* Code Snip integration */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-[#383838] text-left space-y-8 relative z-10">
        <div className="max-w-2xl">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">Integrate in under 60 seconds</h3>
          <p className="text-sm text-slate-600 dark:text-neutral-400 mt-2">
            Just paste this lightweight, dependency-free script snippet inside the HTML body of any page to load the widget asynchronously.
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] rounded-2xl p-6 font-mono text-xs text-slate-800 dark:text-neutral-300 space-y-3 overflow-x-auto max-w-3xl shadow-lg">
          <div className="flex justify-between items-center text-slate-500 dark:text-neutral-400 text-[10px] uppercase font-bold border-b border-slate-200 dark:border-[#383838] pb-3 mb-2">
            <span>HTML Embed Code</span>
            <span className="text-emerald-600 dark:text-emerald-400">Fast Async Load</span>
          </div>
          <code>
            {`<script`} <br />
            {`  src="http://localhost:3000/widget.js"`} <br />
            {`  data-tenant="00000000-0000-0000-0000-000000000000">`} <br />
            {`</script>`}
          </code>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-[#383838] bg-slate-100 dark:bg-[#1a1a1a] py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-neutral-400 gap-4">
          <p>© {new Date().getFullYear()} Atypikal Studio. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Admin Dashboard</Link>
            <Link href="/widget" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Widget Test</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
