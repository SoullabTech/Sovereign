'use client';

/**
 * HexagramBrowser — Browse and Search Hexagrams
 *
 * Search input, grid of hexagram cards, click to select.
 * Optional filtering by change type.
 */

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import HexagramCard from '@/components/iching/HexagramCard';

interface HexagramBrowserProps {
  onSelect: (hexagramNumber: number) => void;
  changeType?: string;
}

interface HexagramResult {
  number: number;
  name: string;
  english: string;
  lines: boolean[];
  changeType: string;
  keywords: string[];
}

export default function HexagramBrowser({ onSelect, changeType }: HexagramBrowserProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HexagramResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  useEffect(() => {
    loadHexagrams();
  }, [query, changeType]);

  async function loadHexagrams() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (changeType) params.set('changeType', changeType);

      const res = await apiFetch(`/api/iching/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.hexagrams || []);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(number: number) {
    setSelectedNumber(number);
    onSelect(number);
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, keyword, or theme..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-slate-900 border border-slate-800/60 rounded-lg text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
        />
      </div>

      {/* Results Count */}
      {results.length > 0 && (
        <p className="text-xs text-slate-500">
          {results.length} hexagram{results.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 text-slate-500 text-sm">
          Loading hexagrams...
        </div>
      )}

      {/* No Results */}
      {!loading && results.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          {query.trim() ? 'No hexagrams match your search.' : 'Start typing to search...'}
        </div>
      )}

      {/* Results Grid */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[500px] overflow-y-auto">
          {results.map(hex => (
            <HexagramCard
              key={hex.number}
              number={hex.number}
              name={hex.name}
              english={hex.english}
              lines={hex.lines}
              changeType={hex.changeType}
              onClick={() => handleSelect(hex.number)}
              selected={selectedNumber === hex.number}
              compact
            />
          ))}
        </div>
      )}
    </div>
  );
}
