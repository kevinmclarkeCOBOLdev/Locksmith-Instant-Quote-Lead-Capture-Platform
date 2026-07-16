import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Code2, ShieldAlert, Monitor, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-300">
      
      {/* Background radial effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 font-bold text-xl">
            🔓
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white leading-tight">LocksmithOS</h1>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Lead Generation SaaS</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            SaaS Dashboard
          </Link>
          <Link
            href="/widget"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/5 transition-all duration-200"
          >
            Launch Widget Demo
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[11px] font-bold text-amber-500 uppercase tracking-wider">
          <Sparkles size={12} /> Transform Locksmith Lead Captures
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Increase Locksmith Enquiries with <span className="text-amber-500">Instant Quotes</span>
          </h2>
          <p className="text-md sm:text-lg text-slate-400 max-w-2xl mx-auto font-medium">
            Embed a premium, multi-step quote wizard on any website. Qualify customers, calculate dynamic estimates, collect high-intent leads, and manage bookings instantly.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2 group transition-all duration-200"
          >
            Open Management Dashboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/widget"
            className="w-full sm:w-auto bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
          >
            Test Widget Experience <ChevronRight size={16} />
          </Link>
        </div>

        {/* Visual Widget Preview */}
        <div className="max-w-4xl mx-auto pt-12">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-2 shadow-2xl shadow-black/80">
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center justify-between text-left">
              <div className="space-y-4 max-w-sm">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center text-xl">
                  ✨
                </div>
                <h3 className="font-extrabold text-xl text-white">Embeddable Wizard widget</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A beautiful multi-step questionnaire that matches Elementor, Wix, WordPress, or custom sites seamlessly. Users answer service type, urgency, property, and postcode to see pricing.
                </p>
                <div className="flex items-center gap-4 text-xs font-bold text-amber-500">
                  <span>✓ 100% Mobile Responsive</span>
                  <span>✓ Geocoded coordinates</span>
                </div>
              </div>
              
              {/* Dummy widget preview card */}
              <div className="w-full max-w-sm bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Locked Out Enquiry</span>
                  <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-bold">🚨 Emergency</span>
                </div>
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Estimate Range</span>
                  <span className="text-2xl font-black text-amber-400">£95 - £140</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <p className="flex justify-between"><span>Client:</span> <span className="text-white font-semibold">David Jones</span></p>
                  <p className="flex justify-between"><span>Postcode:</span> <span className="text-white font-semibold uppercase">SW1A 1AA</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900/80 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {/* Feature 1 */}
        <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 space-y-4 hover:border-slate-800 transition-colors">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
            <Monitor size={18} />
          </div>
          <h4 className="font-extrabold text-white text-md">Embeds Anywhere</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Include as a fast vanilla JavaScript loader, a standard iframe container, or React components on Shopify, Squarespace, Wix, WordPress, and Custom HTML pages.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 space-y-4 hover:border-slate-800 transition-colors">
          <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
            <Code2 size={18} />
          </div>
          <h4 className="font-extrabold text-white text-md">Configurable Engine</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ditch hardcoded values. Set service baselines, property multipliers, and urgency modifiers right from your dashboard. Keep price ranges accurate.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 space-y-4 hover:border-slate-800 transition-colors">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
            <ShieldAlert size={18} />
          </div>
          <h4 className="font-extrabold text-white text-md">Real-Time Alerts</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Trigger instant Twilio SMS details to technicians and detailed Resend Emails containing lead contact details and map coordinates as soon as they submit.
          </p>
        </div>
      </section>

      {/* Code Snip integration */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900/80 text-left space-y-8 relative z-10">
        <div className="max-w-2xl">
          <h3 className="text-2xl font-black text-white">Integrate in under 60 seconds</h3>
          <p className="text-sm text-slate-400 mt-2">
            Just paste this lightweight, dependency-free script snippet inside the HTML body of any page to load the widget asynchronously.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-850 rounded-2xl p-6 font-mono text-xs text-slate-300 space-y-3 overflow-x-auto max-w-3xl">
          <div className="flex justify-between items-center text-slate-500 text-[10px] uppercase font-bold border-b border-slate-850 pb-3 mb-2">
            <span>HTML Embed Code</span>
            <span className="text-amber-500">Fast Async Load</span>
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
      <footer className="border-t border-slate-900 bg-slate-950 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} LocksmithOS. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-white transition-colors">Admin Dashboard</Link>
            <Link href="/widget" className="hover:text-white transition-colors">Widget Test</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
