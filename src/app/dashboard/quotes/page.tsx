'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Phone, Mail, FileSpreadsheet, Eye } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  postcode: string;
  serviceType: string;
  urgency: string;
  status: string;
  createdAt: string;
  quote: {
    id: string;
    minPrice: string;
    maxPrice: string;
    quoteType: string;
  } | null;
}

export default function QuotesLog() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch('/api/leads');
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setLeads(data.leads);
      } catch (err: any) {
        setError(err.message || 'Failed to load quotes');
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(lead => {
    const term = searchTerm.toLowerCase();
    return (
      lead.name.toLowerCase().includes(term) ||
      lead.serviceType.toLowerCase().includes(term) ||
      lead.postcode.toLowerCase().includes(term) ||
      lead.phone.includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      contacted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      quoted: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      booked: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      lost: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${badges[status] || 'bg-slate-800 text-slate-400'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-900 rounded-lg animate-pulse"></div>
        <div className="h-[60vh] bg-slate-900/40 rounded-2xl border border-slate-900 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Quotes & Estimates Log</h2>
        <p className="text-sm text-slate-400 mt-1">Detailed history of all client quote estimates generated.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Search by client, service, postcode..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-xs bg-slate-900 border border-slate-900 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
        />
        <button 
          onClick={() => {
            // CSV Export simulation
            alert('Enquiry data exported to CSV format.');
          }}
          className="w-full sm:w-auto bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-200"
        >
          <FileSpreadsheet size={16} /> Export CSV
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-slate-900/30 border border-slate-900 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-900/40 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="p-4">Date</th>
                <th className="p-4">Client Details</th>
                <th className="p-4">Service Required</th>
                <th className="p-4 text-right">Estimate Range</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60 text-sm text-slate-300">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                    No matching quote entries found.
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-900/20 transition-colors">
                    {/* Date */}
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-semibold">
                        <Calendar size={14} className="text-slate-500" />
                        <span>
                          {new Date(lead.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Client */}
                    <td className="p-4 space-y-1">
                      <div className="font-extrabold text-white">{lead.name}</div>
                      <div className="flex flex-col text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Phone size={10} /> {lead.phone}</span>
                        <span className="flex items-center gap-1"><Mail size={10} /> {lead.email}</span>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="p-4">
                      <div className="font-semibold text-slate-200">{lead.serviceType}</div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mt-0.5">
                        Postcode: {lead.postcode}
                      </span>
                    </td>

                    {/* Quote price */}
                    <td className="p-4 text-right font-extrabold text-amber-400 text-md">
                      {lead.quote ? `£${lead.quote.minPrice} - £${lead.quote.maxPrice}` : 'N/A'}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {getStatusBadge(lead.status)}
                    </td>

                    {/* Quote type */}
                    <td className="p-4 text-center">
                      <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700/30 uppercase">
                        {lead.quote?.quoteType || 'instant'}
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
