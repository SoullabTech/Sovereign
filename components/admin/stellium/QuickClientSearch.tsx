"use client";

/**
 * QUICK CLIENT SEARCH
 *
 * Fast client lookup for the session cockpit
 * Allows practitioners to quickly pull up any client's chart
 *
 * Design: Minimal, keyboard-friendly, immediate results
 */

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, X } from 'lucide-react';
import type { PractitionerClient } from '@/lib/stellium/types';

interface QuickClientSearchProps {
  practitionerId: string;
  basePath: string;
}

const colors = {
  void: '#0D0B14',
  cosmos: '#1A1625',
  nebula: '#251F33',
  stardust: '#2D2640',
  gold: '#E5C158',
  violet: '#B8A5D9',
  celestialBlue: '#79c0ff',
  starlight: '#FFFFFF',
  muted: '#C8BDE0',
  dim: '#9A8FB8',
};

export function QuickClientSearch({ practitionerId, basePath }: QuickClientSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PractitionerClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/stellium/clients/list?practitionerId=${practitionerId}&search=${encodeURIComponent(query)}&limit=5`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data.clients || []);
        }
      } catch (err) {
        console.error('[QuickSearch] Error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, practitionerId]);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to clear
      if (e.key === 'Escape') {
        setQuery('');
        setShowResults(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (client: PractitionerClient) => {
    router.push(`${basePath}/chart/${client.id}`);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div
        className="flex items-center space-x-3 px-4 py-3 rounded-xl"
        style={{
          backgroundColor: `${colors.nebula}50`,
          border: `1px solid ${showResults ? colors.celestialBlue : colors.stardust}40`,
        }}
      >
        <Search className="w-4 h-4" style={{ color: colors.dim }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder="Quick client search..."
          className="flex-1 bg-transparent text-sm outline-none placeholder-gray-500"
          style={{ color: colors.starlight }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="p-1 rounded hover:bg-white/5"
            style={{ color: colors.dim }}
          >
            <X className="w-3 h-3" />
          </button>
        )}
        <span
          className="text-xs px-1.5 py-0.5 rounded"
          style={{
            backgroundColor: `${colors.stardust}60`,
            color: colors.dim,
          }}
        >
          ⌘K
        </span>
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {showResults && (query.trim() || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
            style={{
              backgroundColor: colors.nebula,
              border: `1px solid ${colors.stardust}`,
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
            }}
          >
            {loading && (
              <div className="px-4 py-3 text-sm" style={{ color: colors.dim }}>
                Searching...
              </div>
            )}

            {!loading && results.length === 0 && query.trim() && (
              <div className="px-4 py-3 text-sm" style={{ color: colors.dim }}>
                No clients found
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="py-2">
                {results.map(client => (
                  <button
                    key={client.id}
                    onClick={() => handleSelect(client)}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-left transition-colors hover:bg-white/5"
                  >
                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium"
                      style={{
                        background: `linear-gradient(135deg, ${colors.celestialBlue}20 0%, ${colors.violet}20 100%)`,
                        color: colors.celestialBlue,
                      }}
                    >
                      {(client.preferred_name || client.name)[0].toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: colors.starlight }}>
                        {client.preferred_name || client.name}
                      </p>
                      <div className="flex items-center space-x-2 text-xs" style={{ color: colors.dim }}>
                        {client.key_placements?.sun_sign && (
                          <span>☉ {client.key_placements.sun_sign}</span>
                        )}
                        {client.key_placements?.moon_sign && (
                          <span>☽ {client.key_placements.moon_sign}</span>
                        )}
                        {!client.key_placements?.sun_sign && (
                          <span>{client.total_sessions} sessions</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default QuickClientSearch;
