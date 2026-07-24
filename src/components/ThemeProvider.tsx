'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('atypikal_theme') as Theme | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setThemeState(savedTheme);
      if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('atypikal_theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid context call on SSR if unmounted
  if (!mounted) {
    return (
      <button 
        aria-label="Toggle theme" 
        className={`w-9 h-9 rounded-xl border border-neutral-700 bg-neutral-800/80 flex items-center justify-center text-neutral-400 ${className}`}
      >
        <Moon size={16} />
      </button>
    );
  }

  return <ThemeToggleContent className={className} />;
}

function ThemeToggleContent({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`w-9 h-9 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm ${
        theme === 'dark'
          ? 'bg-[#2a2a2a] border-[#3d3d3d] text-emerald-400 hover:bg-[#333333] hover:border-emerald-500/50'
          : 'bg-white border-slate-200 text-emerald-600 hover:bg-slate-100 hover:border-emerald-500/50'
      } ${className}`}
    >
      {theme === 'dark' ? (
        <Sun size={16} className="transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon size={16} className="transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
