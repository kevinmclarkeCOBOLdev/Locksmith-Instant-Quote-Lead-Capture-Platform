'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Shield, AlertCircle, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }

      onClose();
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Click outside backdrop to close */}
      <div 
        className="absolute inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 z-10 transition-colors duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close login modal"
          title="Close modal"
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#282828] transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Atypikal LockQuote
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">
              Secure Management & Lead Control Platform
            </p>
          </div>
        </div>

        {/* Card Title & Desc */}
        <div className="space-y-1 border-t border-slate-200 dark:border-[#282828] pt-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sign In</h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            Access your business dashboard and live instant quotes.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-200 text-xs">
            <AlertCircle size={16} className="text-rose-500 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label htmlFor="modal-email" className="text-xs font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-neutral-500">
                <Mail size={16} />
              </div>
              <input
                id="modal-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@atypikallocksmiths.co.uk"
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#282828] border border-slate-200 dark:border-[#383838] rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label htmlFor="modal-password" className="text-xs font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider">
              Password
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-neutral-500">
                <Lock size={16} />
              </div>
              <input
                id="modal-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#282828] border border-slate-200 dark:border-[#383838] rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-slate-950 font-bold text-sm shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Authenticate Session</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Local Test Credentials Helper */}
        <div className="pt-3 border-t border-slate-200 dark:border-[#282828] text-center">
          <span className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase tracking-wider block">
            Local Test Credentials:
          </span>
          <code 
            onClick={() => {
              setEmail('admin@atypikallocksmiths.co.uk');
              setPassword('MockPassword123!');
            }}
            title="Click to fill test credentials"
            className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 block mt-1 select-all cursor-pointer font-mono"
          >
            admin@atypikallocksmiths.co.uk / MockPassword123!
          </code>
        </div>
      </div>
    </div>
  );
}
