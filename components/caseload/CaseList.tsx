'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { CaseCard } from './CaseCard';
import type { CaseWithStats, CaseStatus, Element } from '@/lib/caseload/types';

interface CaseListProps {
  cases: CaseWithStats[];
  counts: Record<string, number>;
  onCaseClick?: (caseId: string) => void;
  onAddNote?: (caseId: string) => void;
  onConsult?: (caseId: string) => void;
  onFilterChange?: (filters: { status?: CaseStatus; element?: Element; search?: string }) => void;
  loading?: boolean;
  className?: string;
}

const statusTabs: { value: CaseStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

const elementFilters: { value: Element | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '○' },
  { value: 'earth', label: 'Earth', icon: '🜃' },
  { value: 'water', label: 'Water', icon: '🜄' },
  { value: 'fire', label: 'Fire', icon: '🜂' },
  { value: 'air', label: 'Air', icon: '🜁' },
  { value: 'aether', label: 'Aether', icon: '✦' },
];

export const CaseList: React.FC<CaseListProps> = ({
  cases,
  counts,
  onCaseClick,
  onAddNote,
  onConsult,
  onFilterChange,
  loading = false,
  className,
}) => {
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [elementFilter, setElementFilter] = useState<Element | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleStatusChange = (status: CaseStatus | 'all') => {
    setStatusFilter(status);
    onFilterChange?.({
      status: status === 'all' ? undefined : status,
      element: elementFilter === 'all' ? undefined : elementFilter,
      search: searchQuery || undefined,
    });
  };

  const handleElementChange = (element: Element | 'all') => {
    setElementFilter(element);
    onFilterChange?.({
      status: statusFilter === 'all' ? undefined : statusFilter,
      element: element === 'all' ? undefined : element,
      search: searchQuery || undefined,
    });
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    // Debounce search
    const timer = setTimeout(() => {
      onFilterChange?.({
        status: statusFilter === 'all' ? undefined : statusFilter,
        element: elementFilter === 'all' ? undefined : elementFilter,
        search: search || undefined,
      });
    }, 300);
    return () => clearTimeout(timer);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats row */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-sacred-navy/60 border border-gold-divine/20 rounded-lg">
          <span className="text-gold-divine text-xl font-light">{counts.total || 0}</span>
          <span className="text-neutral-silver/70 text-sm">Total Cases</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-900/20 border border-green-500/20 rounded-lg">
          <span className="text-green-400 text-xl font-light">{counts.active || 0}</span>
          <span className="text-neutral-silver/70 text-sm">Active</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-900/20 border border-yellow-500/20 rounded-lg">
          <span className="text-yellow-400 text-xl font-light">{counts.paused || 0}</span>
          <span className="text-neutral-silver/70 text-sm">Paused</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-900/20 border border-blue-500/20 rounded-lg">
          <span className="text-blue-400 text-xl font-light">{counts.completed || 0}</span>
          <span className="text-neutral-silver/70 text-sm">Completed</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2 bg-sacred-navy/60 border border-gold-divine/20 focus:border-gold-divine/50 rounded-lg text-neutral-silver placeholder-neutral-silver/50 outline-none transition-colors"
          />
        </div>

        {/* Element filter */}
        <div className="flex gap-1 p-1 bg-sacred-navy/40 border border-gold-divine/10 rounded-lg">
          {elementFilters.map((el) => (
            <button
              key={el.value}
              onClick={() => handleElementChange(el.value)}
              className={cn(
                'px-3 py-1.5 rounded text-sm transition-all',
                elementFilter === el.value
                  ? 'bg-gold-divine/20 text-gold-divine'
                  : 'text-neutral-silver/60 hover:text-neutral-silver'
              )}
              title={el.label}
            >
              {el.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 p-1 bg-sacred-navy/40 border border-gold-divine/10 rounded-lg overflow-x-auto">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusChange(tab.value)}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap',
              statusFilter === tab.value
                ? 'bg-gold-divine/20 text-gold-divine'
                : 'text-neutral-silver/60 hover:text-neutral-silver hover:bg-sacred-navy/40'
            )}
          >
            {tab.label}
            {tab.value !== 'all' && counts[tab.value] > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-sacred-navy/60 rounded text-xs">
                {counts[tab.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Case grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gold-divine/60 animate-pulse">Loading cases...</div>
        </div>
      ) : cases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-neutral-silver mb-2">No cases yet</h3>
          <p className="text-neutral-silver/60 text-sm max-w-sm">
            {statusFilter !== 'all' || elementFilter !== 'all' || searchQuery
              ? 'No cases match your current filters. Try adjusting your search.'
              : 'Create your first case to start tracking client sessions with MAIA as your consultation partner.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((caseData) => (
            <CaseCard
              key={caseData.id}
              caseData={caseData}
              onClick={onCaseClick ? () => onCaseClick(caseData.id) : undefined}
              onAddNote={onAddNote ? () => onAddNote(caseData.id) : undefined}
              onConsult={onConsult ? () => onConsult(caseData.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CaseList;
