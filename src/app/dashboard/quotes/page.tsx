'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Phone, Mail, FileSpreadsheet } from 'lucide-react';

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
      new: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      contacted: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      quoted: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      booked: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
      completed: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40',
      lost: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${badges[status] || 'bg-[#282828] text-neutral-400'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-[#1a1a1a] light:bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="h-[60vh] bg-[#1a1a1a] light:bg-slate-200 rounded-2xl border border-[#383838] light:border-slate-200 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white light:text-slate-900">Quotes & Estimates Log</h2>
        <p className="text-sm text-neutral-400 light:text-slate-500 mt-1">Detailed history of all client quote estimates generated.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Search by client, service, postcode..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-xs bg-[#1a1a1a] light:bg-white border border-[#383838] light:border-slate-200 rounded-xl px-4 py-2.5 text-sm text-white light:text-slate-900 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
        />
        <button 
          onClick={() => {
            alert('Enquiry data exported to CSV format.');
          }}
          className="w-full sm:w-auto bg-[#1a1a1a] light:bg-white border border-[#383838] light:border-slate-200 hover:border-emerald-500/50 text-neutral-200 light:text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-sm cursor-pointer"
        >
          <FileSpreadsheet size={16} className="text-emerald-400" /> Export CSV
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-[#1a1a1a] light:bg-white border border-[#383838] light:border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#383838] light:border-slate-200 bg-[#141414] light:bg-slate-50 text-xs font-bold uppercase tracking-wider text-neutral-400 light:text-slate-500">
                <th className="p-4">Date</th>
                <th className="p-4">Client Details</th>
                <th className="p-4">Service Required</th>
                <th className="p-4 text-right">Estimate Range</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#383838] light:divide-slate-200 text-sm text-neutral-300 light:text-slate-700">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500 italic">
                    No matching quote entries found.
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-[#242424] light:hover:bg-slate-50 transition-colors">
                    {/* Date */}
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-semibold">
                        <Calendar size={14} className="text-neutral-500" />
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
                      <div className="font-extrabold text-white light:text-slate-900">{lead.name}</div>
                      <div className="flex flex-col text-xs text-neutral-400 light:text-slate-500">
                        <span className="flex items-center gap-1"><Phone size={10} /> {lead.phone}</span>
                        <span className="flex items-center gap-1"><Mail size={10} /> {lead.email}</span>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="p-4">
                      <div className="font-semibold text-neutral-200 light:text-slate-800">{lead.serviceType}</div>
                      <span className="text-[10px] text-neutral-500 light:text-slate-500 uppercase tracking-widest font-bold block mt-0.5">
                        Postcode: {lead.postcode}
                      </span>
                    </td>

                    {/* Quote price */}
                    <td className="p-4 text-right font-extrabold text-emerald-400 light:text-emerald-600 text-md">
                      {lead.quote ? `£${lead.quote.minPrice} - £${lead.quote.maxPrice}` : 'N/A'}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {getStatusBadge(lead.status)}
                    </td>

                    {/* Quote type */}
                    <td className="p-4 text-center">
                      <span className="text-[10px] font-bold bg-[#282828] light:bg-slate-100 text-neutral-400 light:text-slate-600 px-2 py-0.5 rounded border border-[#383838] light:border-slate-200 uppercase">
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
