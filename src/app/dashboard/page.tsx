'use client';

import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Users, FileText, Activity, Calendar, Award } from 'lucide-react';

interface Metrics {
  totalLeads: number;
  totalQuotes: number;
  conversionRate: number;
  leadsThisMonth: number;
  averageQuoteValue: number;
  topServices: Array<{ name: string; value: number }>;
  chartData: Array<{ name: string; Leads: number }>;
}

export default function DashboardOverview() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to fetch dashboard metrics');
        setMetrics(data.metrics);
      } catch (err: any) {
        setError(err.message || 'Error loading dashboard');
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-900 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-900 rounded-2xl border border-slate-900"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-900 rounded-2xl border border-slate-900"></div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-6 bg-red-950/20 border border-red-500/20 rounded-2xl text-red-200">
        <h3 className="font-bold mb-1">Failed to load dashboard metrics</h3>
        <p className="text-sm">{error || 'An unexpected error occurred'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Dashboard Overview</h2>
        <p className="text-sm text-slate-400 mt-1">Real-time quote and lead activity metrics.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Leads */}
        <div className="bg-slate-900/50 border border-slate-900 rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Leads</span>
            <p className="text-3xl font-bold text-white">{metrics.totalLeads}</p>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
            <Users size={22} />
          </div>
        </div>

        {/* Quotes Generated */}
        <div className="bg-slate-900/50 border border-slate-900 rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Quotes Generated</span>
            <p className="text-3xl font-bold text-white">{metrics.totalQuotes}</p>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
            <FileText size={22} />
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-slate-900/50 border border-slate-900 rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Conversion Rate</span>
            <p className="text-3xl font-bold text-white">{metrics.conversionRate}%</p>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
            <Activity size={22} />
          </div>
        </div>

        {/* Average Quote Value */}
        <div className="bg-slate-900/50 border border-slate-900 rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Avg Quote Value</span>
            <p className="text-3xl font-bold text-white">£{metrics.averageQuoteValue}</p>
          </div>
          <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
            <Award size={22} />
          </div>
        </div>
      </div>

      {/* Chart & Top Services section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart Card */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-md">Leads over Time</h3>
              <p className="text-xs text-slate-400 mt-0.5">Enquiry submissions captured by month</p>
            </div>
            <span className="text-xs bg-slate-800 border border-slate-700/50 rounded-lg px-2.5 py-1 text-slate-300 font-semibold flex items-center gap-1.5">
              <Calendar size={12} /> Last 6 Months
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="Leads" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Services Card */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="font-bold text-white text-md">Top Services</h3>
            <p className="text-xs text-slate-400 mt-0.5">Most common customer requirements</p>
          </div>

          <div className="space-y-4">
            {metrics.topServices.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No services requested yet.</p>
            ) : (
              metrics.topServices.map((service, index) => {
                const colors = ['bg-amber-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500'];
                const color = colors[index % colors.length];

                return (
                  <div key={service.name} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">{service.name}</span>
                      <span className="font-bold text-slate-400">{service.value} enquiries</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${color}`}
                        style={{ 
                          width: `${Math.min(100, (service.value / Math.max(1, metrics.totalLeads)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
