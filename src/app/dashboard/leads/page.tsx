'use client';

import React, { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Calendar, Clock } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  postcode: string;
  serviceType: string;
  propertyType: string;
  urgency: string;
  message: string | null;
  status: 'new' | 'contacted' | 'quoted' | 'booked' | 'completed' | 'lost';
  createdAt: string;
  quote: {
    minPrice: string;
    maxPrice: string;
  } | null;
}

const COLUMNS: Array<{ id: Lead['status']; label: string; color: string }> = [
  { id: 'new', label: 'New Lead', color: 'border-t-blue-500 bg-blue-500/5' },
  { id: 'contacted', label: 'Contacted', color: 'border-t-purple-500 bg-purple-500/5' },
  { id: 'quoted', label: 'Quoted', color: 'border-t-emerald-500 bg-emerald-500/5' },
  { id: 'booked', label: 'Booked', color: 'border-t-teal-500 bg-teal-500/5' },
  { id: 'completed', label: 'Completed', color: 'border-t-emerald-400 bg-emerald-400/10' },
  { id: 'lost', label: 'Lost', color: 'border-t-rose-500 bg-rose-500/5' },
];

export default function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch leads
  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch leads');
      setLeads(data.leads);
    } catch (err: any) {
      setError(err.message || 'Error loading leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // HTML5 Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Required to allow dropping
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Lead['status']) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    if (!leadId) return;

    // Find the lead and check if status actually changed
    const leadToUpdate = leads.find(l => l.id === leadId);
    if (!leadToUpdate || leadToUpdate.status === targetStatus) return;

    // Optimistic state update
    const previousLeads = [...leads];
    setLeads(prev =>
      prev.map(l => (l.id === leadId ? { ...l, status: targetStatus } : l))
    );
    setUpdatingId(leadId);

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
    } catch (err: any) {
      // Revert if failed
      console.error('Failed to update status:', err);
      setLeads(previousLeads);
      alert(`Failed to update status: ${err.message || 'Unknown error'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Manual move click-fallback helper for mobile/accessibility
  const moveLeadStatus = async (leadId: string, targetStatus: Lead['status']) => {
    setUpdatingId(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      // Update local state on success
      setLeads(prev =>
        prev.map(l => (l.id === leadId ? { ...l, status: targetStatus } : l))
      );
    } catch (err: any) {
      alert(`Failed to move lead: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-[#1a1a1a] light:bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-6 gap-4 h-[75vh]">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-[#1a1a1a] light:bg-slate-200 rounded-2xl border border-[#383838] light:border-slate-200 h-full animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 flex flex-col h-[88vh]">
      {/* Header */}
      <div className="shrink-0">
        <h2 className="text-3xl font-extrabold tracking-tight text-white light:text-slate-900">Lead Pipeline</h2>
        <p className="text-sm text-neutral-400 light:text-slate-500 mt-1">Drag and drop leads to update status in real-time.</p>
      </div>

      {/* Board Columns container */}
      <div className="flex-1 overflow-x-auto min-h-0 flex gap-4 pb-4">
        {COLUMNS.map(col => {
          const colLeads = leads.filter(l => l.status === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, col.id)}
              className={`w-80 shrink-0 border-t-4 border border-[#383838] light:border-slate-200 bg-[#1a1a1a] light:bg-white rounded-2xl flex flex-col max-h-full ${col.color}`}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-[#383838] light:border-slate-200 flex items-center justify-between shrink-0">
                <span className="text-sm font-bold text-white light:text-slate-900 flex items-center gap-2">
                  {col.label}
                  <span className="text-xs bg-[#282828] light:bg-slate-100 border border-[#383838] light:border-slate-200 text-neutral-300 light:text-slate-600 px-2 py-0.5 rounded-full">
                    {colLeads.length}
                  </span>
                </span>
              </div>

              {/* Cards list */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[150px]">
                {colLeads.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-neutral-500 light:text-slate-400 italic py-10">
                    No leads here
                  </div>
                ) : (
                  colLeads.map(lead => {
                    const isUpdating = updatingId === lead.id;
                    const urgencyColors = {
                      Emergency: 'bg-red-500/15 text-red-400 border-red-500/30',
                      'Same Day': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                      Flexible: 'bg-[#282828] text-neutral-400 border-[#383838]',
                    };
                    const urgencyColor = urgencyColors[lead.urgency as keyof typeof urgencyColors] || urgencyColors.Flexible;

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={e => handleDragStart(e, lead.id)}
                        className={`bg-[#282828] light:bg-slate-50 border border-[#383838] light:border-slate-200 rounded-xl p-4 space-y-3 cursor-grab active:cursor-grabbing hover:border-emerald-500/50 transition-all duration-200 relative group shadow-sm ${
                          isUpdating ? 'opacity-50' : ''
                        }`}
                      >
                        {/* Service Type + Urgency */}
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-white light:text-slate-900 leading-tight">
                            {lead.serviceType}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${urgencyColor}`}>
                            {lead.urgency}
                          </span>
                        </div>

                        {/* Customer Name */}
                        <div>
                          <h4 className="font-extrabold text-sm text-neutral-200 light:text-slate-800 group-hover:text-emerald-400 transition-colors">
                            {lead.name}
                          </h4>
                          <span className="text-[10px] text-neutral-400 light:text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock size={10} /> {new Date(lead.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>

                        {/* Contact details */}
                        <div className="space-y-1 text-xs text-neutral-400 light:text-slate-600">
                          <a href={`tel:${lead.phone}`} className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                            <Phone size={12} className="text-neutral-500" /> {lead.phone}
                          </a>
                          <a href={`mailto:${lead.email}`} className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                            <Mail size={12} className="text-neutral-500 animate-pulse" />
                            <span className="truncate max-w-[170px]">{lead.email}</span>
                          </a>
                          <div className="flex items-center gap-2">
                            <MapPin size={12} className="text-neutral-500" />
                            <span className="uppercase">{lead.postcode}</span>
                          </div>
                        </div>

                        {/* Pricing details if quote exists */}
                        {lead.quote && (
                          <div className="border-t border-[#383838] light:border-slate-200 pt-2.5 flex justify-between items-center text-xs">
                            <span className="text-[10px] text-neutral-400 light:text-slate-500 font-semibold uppercase">Estimate</span>
                            <span className="font-extrabold text-emerald-400 light:text-emerald-600">
                              £{lead.quote.minPrice} - £{lead.quote.maxPrice}
                            </span>
                          </div>
                        )}

                        {/* Mobile action button controls */}
                        <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1 bg-[#1a1a1a]/95 light:bg-white pl-2 rounded-lg py-1 border border-[#383838] light:border-slate-200 shadow-md">
                          <span className="text-[10px] text-neutral-400 mr-1">Move:</span>
                          {COLUMNS.filter(c => c.id !== lead.status).map(colItem => (
                            <button
                              key={colItem.id}
                              onClick={() => moveLeadStatus(lead.id, colItem.id)}
                              title={`Move to ${colItem.label}`}
                              className="w-4 h-4 rounded-full border border-[#383838] hover:border-emerald-500 flex items-center justify-center text-[9px] text-neutral-400 hover:text-white"
                            >
                              {colItem.label.substring(0, 1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
