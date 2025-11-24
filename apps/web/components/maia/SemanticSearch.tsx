'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Filter, X } from 'lucide-react';
import { Copy } from '@/lib/copy/MaiaCopy';
import { useMaiaStore } from '@/lib/maia/state';
import { JournalingMode, JOURNALING_MODE_DESCRIPTIONS } from '@/lib/journaling/JournalingPrompts';

export default function SemanticSearch() {
  const { entries, setView, searchQuery, setSearchQuery } = useMaiaStore();
  const [selectedMode, setSelectedMode] = useState<JournalingMode | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const allSymbols = useMemo(() => {
    const symbols = new Set<string>();
    entries.forEach(entry => {
      entry.reflection?.symbols.forEach(symbol => symbols.add(symbol));
    });
    return Array.from(symbols).sort();
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesQuery = !searchQuery ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.reflection?.symbols.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        entry.reflection?.archetypes.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesMode = !selectedMode || entry.mode === selectedMode;
      const matchesSymbol = !selectedSymbol || entry.reflection?.symbols.includes(selectedSymbol);

      return matchesQuery && matchesMode && matchesSymbol;
    });
  }, [entries, searchQuery, selectedMode, selectedSymbol]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setView('mode-select')}
          className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filters</span>
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={Copy.timeline.searchPlaceholder}
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:border-[#FFD700] dark:focus:border-[#FFD700] focus:outline-none transition-colors text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
        />
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 space-y-4"
        >
          <div>
            <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
              Mode
            </div>
            <div className="flex flex-wrap gap-2">
              {(['free', 'dream', 'emotional', 'shadow', 'direction'] as JournalingMode[]).map(mode => {
                const modeInfo = JOURNALING_MODE_DESCRIPTIONS[mode];
                const isSelected = selectedMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => setSelectedMode(isSelected ? null : mode)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${
                      isSelected
                        ? 'bg-[#FFD700] text-[#0A0E27] font-medium'
                        : 'bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-[#FFD700]'
                    }`}
                  >
                    <span>{modeInfo.icon}</span>
                    <span>{modeInfo.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {allSymbols.length > 0 && (
            <div>
              <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                Symbols
              </div>
              <div className="flex flex-wrap gap-2">
                {allSymbols.slice(0, 10).map(symbol => {
                  const isSelected = selectedSymbol === symbol;
                  return (
                    <button
                      key={symbol}
                      onClick={() => setSelectedSymbol(isSelected ? null : symbol)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        isSelected
                          ? 'bg-violet-600 text-white font-medium'
                          : 'bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-violet-400'
                      }`}
                    >
                      {symbol}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(selectedMode || selectedSymbol) && (
            <button
              onClick={() => {
                setSelectedMode(null);
                setSelectedSymbol(null);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear filters
            </button>
          )}
        </motion.div>
      )}

      <div className="mb-4 text-sm text-neutral-500 dark:text-neutral-500">
        {Copy.timeline.showing(filteredEntries.length, entries.length)}
      </div>

      {filteredEntries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-600 dark:text-neutral-400 mb-2">
            {Copy.timeline.noResults}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            {Copy.timeline.noResultsHint}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry, index) => {
            const modeInfo = JOURNALING_MODE_DESCRIPTIONS[entry.mode as JournalingMode];

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-[#FFD700] dark:hover:border-[#FFD700] transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{modeInfo.icon}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {modeInfo.name}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500">
                        {formatDate(entry.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
                  {entry.content}
                </p>

                {entry.reflection && (
                  <div className="flex flex-wrap gap-2">
                    {entry.reflection.symbols.map((symbol, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                      >
                        #{symbol}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}