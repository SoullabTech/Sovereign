'use client';

import React from 'react';
import { BookOpen, Clock, Search, HelpCircle, Sparkles, BarChart3, Settings as SettingsIcon, TrendingUp, MessageCircle } from 'lucide-react';
import { useMaiaStore } from '@/lib/maia/state';

interface MAIANavigationProps {
  entries: any[];
  currentView: string;
  onShowHelp: () => void;
  onShowSettings: () => void;
  onShowAnalytics: () => void;
  onShowSoulprint: () => void;
}

export function MAIANavigation({
  entries,
  currentView,
  onShowHelp,
  onShowSettings,
  onShowAnalytics,
  onShowSoulprint
}: MAIANavigationProps) {
  const { setView } = useMaiaStore();

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        {/* Coherence metrics moved to Analytics page */}
      </div>

      <nav className="flex items-center gap-2">
        <button
          onClick={() => setView('mode-select')}
          className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all ${
            currentView === 'mode-select' || currentView === 'journal-entry' || currentView === 'voice-journal' || currentView === 'reflection'
              ? 'bg-jade-jade text-jade-abyss font-medium shadow-lg shadow-jade-jade/25'
              : 'text-jade-mineral hover:bg-jade-shadow/40 hover:text-jade-sage'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Journal</span>
        </button>

        <button
          onClick={() => setView('oracle-conversation')}
          className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all ${
            currentView === 'oracle-conversation'
              ? 'bg-jade-jade text-jade-abyss font-medium shadow-lg shadow-jade-jade/25'
              : 'text-jade-mineral hover:bg-jade-shadow/40 hover:text-jade-sage'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Oracle</span>
        </button>

        {entries.length >= 3 && (
          <button
            onClick={() => setView('timeline')}
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all ${
              currentView === 'timeline'
                ? 'bg-jade-jade text-jade-abyss font-medium shadow-lg shadow-jade-jade/25'
                : 'text-jade-mineral hover:bg-jade-shadow/40 hover:text-jade-sage'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Timeline</span>
          </button>
        )}

        {entries.length >= 5 && (
          <button
            onClick={() => setView('search')}
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all ${
              currentView === 'search'
                ? 'bg-jade-jade text-jade-abyss font-medium shadow-lg shadow-jade-jade/25'
                : 'text-jade-mineral hover:bg-jade-shadow/40 hover:text-jade-sage'
            }`}
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        )}

        {entries.length > 0 && (
          <button
            onClick={onShowSoulprint}
            className="flex items-center gap-2 px-3 py-2 rounded-full text-sm text-jade-mineral hover:bg-jade-shadow/40 hover:text-jade-sage transition-all"
            title="Soulprint"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onShowAnalytics}
          className="flex items-center gap-2 px-3 py-2 rounded-full text-sm text-jade-mineral hover:bg-jade-shadow/40 hover:text-jade-sage transition-all"
          title="Analytics"
        >
          <BarChart3 className="w-4 h-4" />
        </button>

        <a
          href="/dashboard/evolution"
          className="flex items-center gap-2 px-3 py-2 rounded-full text-sm text-jade-mineral hover:bg-jade-shadow/40 hover:text-jade-sage transition-all"
          title="Developmental Insights - Track Your Consciousness Evolution"
        >
          <TrendingUp className="w-4 h-4" />
          <span className="hidden sm:inline">Insights</span>
        </a>

        <button
          onClick={onShowSettings}
          className="flex items-center gap-2 px-3 py-2 rounded-full text-sm text-jade-mineral hover:bg-jade-shadow/40 hover:text-jade-sage transition-all"
          title="Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>

        <button
          onClick={onShowHelp}
          className="flex items-center gap-2 px-3 py-2 rounded-full text-sm text-jade-mineral hover:bg-jade-shadow/40 hover:text-jade-sage transition-all"
          title="Help"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
}