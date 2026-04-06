'use client';

import { Search } from 'lucide-react';
import type { MediaType, ProjectStatus } from '@/lib/media/types';

interface MediaFiltersProps {
  query: string;
  onQueryChange: (q: string) => void;
  typeFilter: MediaType | '';
  onTypeChange: (t: MediaType | '') => void;
  statusFilter: ProjectStatus | '';
  onStatusChange: (s: ProjectStatus | '') => void;
}

export function MediaFilters({
  query, onQueryChange,
  typeFilter, onTypeChange,
  statusFilter, onStatusChange,
}: MediaFiltersProps) {
  const selectClass = 'bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-amber-500/50';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Search projects..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      <select
        value={typeFilter}
        onChange={(e) => onTypeChange(e.target.value as MediaType | '')}
        className={selectClass}
      >
        <option value="">All Types</option>
        <option value="audio">Audio</option>
        <option value="video">Video</option>
        <option value="image">Image</option>
        <option value="document">Document</option>
      </select>

      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as ProjectStatus | '')}
        className={selectClass}
      >
        <option value="">All Statuses</option>
        <option value="uploading">Uploading</option>
        <option value="processing">Processing</option>
        <option value="ready">Ready</option>
        <option value="error">Error</option>
        <option value="archived">Archived</option>
      </select>
    </div>
  );
}
