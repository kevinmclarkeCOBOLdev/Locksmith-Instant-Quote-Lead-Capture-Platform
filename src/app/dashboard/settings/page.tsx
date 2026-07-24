'use client';

import React, { useEffect, useState } from 'react';
import { Save, Building, Bell, DollarSign, FileCode } from 'lucide-react';

interface TenantSettings {
  name: string;
  businessPhone: string;
  businessEmail: string;
  logoUrl: string | null;
  quoteRules: {
    pricing: Record<string, { min: number; max: number }>;
    multipliers: {
      property: Record<string, number>;
      urgency: Record<string, number>;
    };
  };
  notificationSettings: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    dashboardEnabled: boolean;
  };
  emailTemplates: {
    leadNotification: string;
  };
  smsTemplates: {
    leadNotification: string;
  };
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'pricing' | 'notifications' | 'templates'>('profile');
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/tenant');
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setSettings(data.tenant);
      } catch (err: any) {
        setError(err.message || 'Error loading settings');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateProfileField = (key: keyof TenantSettings, value: any) => {
    if (!settings) return;
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  const updateQuotePrice = (service: string, field: 'min' | 'max', value: number) => {
    if (!settings) return;
    const newPricing = { ...settings.quoteRules.pricing };
    newPricing[service] = { ...newPricing[service], [field]: value };
    setSettings(prev => prev ? {
      ...prev,
      quoteRules: {
        ...prev.quoteRules,
        pricing: newPricing
      }
    } : null);
  };

  const updateNotifSetting = (key: string, value: boolean) => {
    if (!settings) return;
    setSettings(prev => prev ? {
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [key]: value
      }
    } : null);
  };

  const updateTemplate = (type: 'email' | 'sms', field: string, value: string) => {
    if (!settings) return;
    if (type === 'email') {
      setSettings(prev => prev ? {
        ...prev,
        emailTemplates: {
          ...prev.emailTemplates,
          [field]: value
        }
      } : null);
    } else {
      setSettings(prev => prev ? {
        ...prev,
        smsTemplates: {
          ...prev.smsTemplates,
          [field]: value
        }
      } : null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-[#1a1a1a] light:bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="h-[55vh] bg-[#1a1a1a] light:bg-slate-200 rounded-2xl border border-[#383838] light:border-slate-200 animate-pulse"></div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="p-6 bg-rose-950/20 border border-rose-500/20 rounded-2xl text-rose-300">
        <h3 className="font-bold mb-1">Failed to load configuration</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white light:text-slate-900">Platform Settings</h2>
          <p className="text-sm text-neutral-400 light:text-slate-500 mt-1">Configure company profiles, notification targets, and instant quote pricing rules.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          type="button"
          className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all duration-200 shrink-0 cursor-pointer"
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {success && (
        <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm">
          ✓ {success}
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-950/50 border border-rose-500/30 rounded-lg text-rose-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Navigation Tabs (Vertical on Desktop) */}
        <div className="w-full md:w-56 shrink-0 flex flex-row md:flex-col gap-1 border-b md:border-b-0 md:border-r border-[#383838] light:border-slate-200 pb-4 md:pb-0 md:pr-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'profile' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-neutral-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:bg-[#282828] light:hover:bg-slate-100'
            }`}
          >
            <Building size={16} /> Company Profile
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'pricing' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-neutral-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:bg-[#282828] light:hover:bg-slate-100'
            }`}
          >
            <DollarSign size={16} /> Quote Rules
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'notifications' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-neutral-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:bg-[#282828] light:hover:bg-slate-100'
            }`}
          >
            <Bell size={16} /> Notifications
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'templates' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-neutral-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:bg-[#282828] light:hover:bg-slate-100'
            }`}
          >
            <FileCode size={16} /> Message Templates
          </button>
        </div>

        {/* Tab Panels */}
        <div className="flex-1 w-full bg-[#1a1a1a] light:bg-white border border-[#383838] light:border-slate-200 rounded-2xl p-6 shadow-sm">
          {settings && (
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Tab 1: Profile */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-white light:text-slate-900 mb-2">Company Profile Settings</h3>
                  
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 light:text-slate-500 mb-1.5">Business Name</label>
                    <input
                      type="text"
                      value={settings.name}
                      onChange={e => updateProfileField('name', e.target.value)}
                      className="w-full bg-[#282828] light:bg-slate-50 border border-[#383838] light:border-slate-200 rounded-xl px-4 py-2.5 text-sm text-white light:text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 light:text-slate-500 mb-1.5">Notification Phone (SMS recipient)</label>
                      <input
                        type="tel"
                        value={settings.businessPhone}
                        onChange={e => updateProfileField('businessPhone', e.target.value)}
                        className="w-full bg-[#282828] light:bg-slate-50 border border-[#383838] light:border-slate-200 rounded-xl px-4 py-2.5 text-sm text-white light:text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 light:text-slate-500 mb-1.5">Notification Email (Resend target)</label>
                      <input
                        type="email"
                        value={settings.businessEmail}
                        onChange={e => updateProfileField('businessEmail', e.target.value)}
                        className="w-full bg-[#282828] light:bg-slate-50 border border-[#383838] light:border-slate-200 rounded-xl px-4 py-2.5 text-sm text-white light:text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 light:text-slate-500 mb-1.5">Logo URL</label>
                    <input
                      type="text"
                      value={settings.logoUrl || ''}
                      onChange={e => updateProfileField('logoUrl', e.target.value)}
                      className="w-full bg-[#282828] light:bg-slate-50 border border-[#383838] light:border-slate-200 rounded-xl px-4 py-2.5 text-sm text-white light:text-slate-900 focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. https://domain.com/logo.png"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Quote Rules */}
              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-bold text-white light:text-slate-900">Quote Engine Pricing Rules</h3>
                    <p className="text-xs text-neutral-400 light:text-slate-500 mt-0.5">Specify baseline pricing estimates (min/max) for services. The system applies property type and urgency multipliers.</p>
                  </div>

                  <div className="space-y-4">
                    {Object.keys(settings.quoteRules.pricing).map(serviceName => {
                      const basePrice = settings.quoteRules.pricing[serviceName];
                      return (
                        <div key={serviceName} className="grid grid-cols-3 gap-4 items-center bg-[#282828] light:bg-slate-50 p-4 border border-[#383838] light:border-slate-200 rounded-xl">
                          <span className="text-xs font-bold text-neutral-200 light:text-slate-800">{serviceName}</span>
                          <div>
                            <label className="block text-[10px] text-neutral-400 light:text-slate-500 uppercase tracking-widest font-bold mb-1">Min Price (£)</label>
                            <input
                              type="number"
                              value={basePrice.min}
                              onChange={e => updateQuotePrice(serviceName, 'min', parseInt(e.target.value))}
                              className="w-full bg-[#1a1a1a] light:bg-white border border-[#383838] light:border-slate-200 rounded-xl px-3 py-1.5 text-sm text-white light:text-slate-900 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-neutral-400 light:text-slate-500 uppercase tracking-widest font-bold mb-1">Max Price (£)</label>
                            <input
                              type="number"
                              value={basePrice.max}
                              onChange={e => updateQuotePrice(serviceName, 'max', parseInt(e.target.value))}
                              className="w-full bg-[#1a1a1a] light:bg-white border border-[#383838] light:border-slate-200 rounded-xl px-3 py-1.5 text-sm text-white light:text-slate-900 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: Notifications */}
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-white light:text-slate-900 mb-2">Notification Routing</h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-[#282828] light:bg-slate-50 border border-[#383838] light:border-slate-200 rounded-xl">
                      <div>
                        <span className="font-bold text-sm text-neutral-200 light:text-slate-800 block">Email Alerts</span>
                        <span className="text-xs text-neutral-400 light:text-slate-500">Send an email alert to {settings.businessEmail} when a lead is captured.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notificationSettings.emailEnabled}
                        onChange={e => updateNotifSetting('emailEnabled', e.target.checked)}
                        className="w-5 h-5 accent-emerald-500 cursor-pointer rounded border-[#383838] bg-[#1a1a1a]"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#282828] light:bg-slate-50 border border-[#383838] light:border-slate-200 rounded-xl">
                      <div>
                        <span className="font-bold text-sm text-neutral-200 light:text-slate-800 block">SMS Alerts</span>
                        <span className="text-xs text-neutral-400 light:text-slate-500">Send an instant text alert to {settings.businessPhone} when a lead is captured.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notificationSettings.smsEnabled}
                        onChange={e => updateNotifSetting('smsEnabled', e.target.checked)}
                        className="w-5 h-5 accent-emerald-500 cursor-pointer rounded border-[#383838] bg-[#1a1a1a]"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#282828] light:bg-slate-50 border border-[#383838] light:border-slate-200 rounded-xl">
                      <div>
                        <span className="font-bold text-sm text-neutral-200 light:text-slate-800 block">Dashboard Push</span>
                        <span className="text-xs text-neutral-400 light:text-slate-500">Update the dashboard logs page and metrics in real-time.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notificationSettings.dashboardEnabled}
                        onChange={e => updateNotifSetting('dashboardEnabled', e.target.checked)}
                        className="w-5 h-5 accent-emerald-500 cursor-pointer rounded border-[#383838] bg-[#1a1a1a]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Templates */}
              {activeTab === 'templates' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-md font-bold text-white light:text-slate-900">Message Alert Templates</h3>
                    <p className="text-xs text-neutral-400 light:text-slate-500 mt-0.5">Customize notifications. Variables: `{"{{name}}"}` , `{"{{phone}}"}` , `{"{{email}}"}` , `{"{{serviceType}}"}` , `{"{{urgency}}"}` , `{"{{minPrice}}"}` , `{"{{maxPrice}}"}`</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 light:text-slate-500 mb-1.5">Email HTML template</label>
                    <textarea
                      rows={8}
                      value={settings.emailTemplates.leadNotification}
                      onChange={e => updateTemplate('email', 'leadNotification', e.target.value)}
                      className="w-full bg-[#282828] light:bg-slate-50 border border-[#383838] light:border-slate-200 rounded-xl px-4 py-3 text-sm text-white light:text-slate-900 focus:outline-none focus:border-emerald-500 font-mono resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 light:text-slate-500 mb-1.5">SMS Text template</label>
                    <textarea
                      rows={3}
                      value={settings.smsTemplates.leadNotification}
                      onChange={e => updateTemplate('sms', 'leadNotification', e.target.value)}
                      className="w-full bg-[#282828] light:bg-slate-50 border border-[#383838] light:border-slate-200 rounded-xl px-4 py-3 text-sm text-white light:text-slate-900 focus:outline-none focus:border-emerald-500 font-mono resize-none"
                    />
                  </div>
                </div>
              )}

            </form>
          )}
        </div>
      </div>
    </div>
  );
}
