'use client';

/**
 * LabToolbar - find, and choose how to look
 *
 * With forty instruments on one shelf, search is not a nicety: it is the only
 * way to reach a named thing without reading everything. The view switch
 * makes explicit that domain is *a* way to look, not the way in.
 */

import React from 'react';
import { Search, X } from 'lucide-react';

export type LabView = 'intent' | 'domain';

interface LabToolbarProps {
  query: string;
  onQueryChange: (q: string) => void;
  view: LabView;
  onViewChange: (v: LabView) => void;
  /** Total instruments searchable, for the placeholder */
  total: number;
  /** Hide the view switch while a search or intent filter is narrowing */
  showViewSwitch?: boolean;
}

const VIEWS: { id: LabView; label: string }[] = [
  { id: 'intent', label: 'By need' },
  { id: 'domain', label: 'By domain' },
];

export function LabToolbar({
  query,
  onQueryChange,
  view,
  onViewChange,
  total,
  showViewSwitch = true,
}: LabToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none"
          strokeWidth={1.75}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={`Search ${total} instruments`}
          aria-label="Search instruments"
          className="w-full h-10 pl-10 pr-9 rounded-xl
                     bg-white/[0.035] border border-white/[0.07]
                     text-[14px] text-white/90 placeholder:text-white/30
                     hover:border-white/[0.12]
                     focus:outline-none focus:border-[#D4B896]/40 focus:bg-white/[0.05]
                     transition-colors
                     [&::-webkit-search-cancel-button]:appearance-none"
        />
        {query && (
          <button
            onClick={() => onQueryChange('')}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md
                       text-white/30 hover:text-white/70 hover:bg-white/[0.06]
                       transition-colors
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4B896]/60"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* View switch */}
      {showViewSwitch && (
        <div
          role="group"
          aria-label="Arrange instruments"
          className="inline-flex p-0.5 rounded-xl bg-white/[0.035] border border-white/[0.07] self-start"
        >
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => onViewChange(v.id)}
              aria-pressed={view === v.id}
              className={`px-3.5 h-9 rounded-[10px] text-[13px] font-medium
                          transition-colors duration-150
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4B896]/60
                          ${
                            view === v.id
                              ? 'bg-[#D4B896]/[0.14] text-[#D4B896]'
                              : 'text-white/45 hover:text-white/75'
                          }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
