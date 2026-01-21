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

const categoryFilters: { value: Element | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'earth', label: 'Grounding' },
  { value: 'water', label: 'Emotional' },
  { value: 'fire', label: 'Motivation' },
  { value: 'air', label: 'Cognitive' },
  { value: 'aether', label: 'Existential' },
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
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg">
          <span className="text-white text-xl font-semibold">{counts.total || 0}</span>
          <span className="text-gray-400 text-sm">Total</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-900/20 border border-green-700/30 rounded-lg">
          <span className="text-green-400 text-xl font-semibold">{counts.active || 0}</span>
          <span className="text-gray-400 text-sm">Active</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
          <span className="text-yellow-400 text-xl font-semibold">{counts.paused || 0}</span>
          <span className="text-gray-400 text-sm">Paused</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <span className="text-blue-400 text-xl font-semibold">{counts.completed || 0}</span>
          <span className="text-gray-400 text-sm">Completed</span>
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
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 focus:border-amber-500/50 rounded-lg text-white placeholder-gray-500 outline-none transition-colors"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-1 p-1 bg-gray-800/50 border border-gray-700 rounded-lg">
          {categoryFilters.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleElementChange(cat.value)}
              className={cn(
                'px-3 py-1.5 rounded text-sm transition-all',
                elementFilter === cat.value
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-gray-400 hover:text-gray-200'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 p-1 bg-gray-800/50 border border-gray-700 rounded-lg overflow-x-auto">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusChange(tab.value)}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap',
              statusFilter === tab.value
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            )}
          >
            {tab.label}
            {tab.value !== 'all' && counts[tab.value] > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-gray-700 rounded text-xs">
                {counts[tab.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Case grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading cases...</div>
        </div>
      ) : cases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No cases found</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            {statusFilter !== 'all' || elementFilter !== 'all' || searchQuery
              ? 'No cases match your current filters. Try adjusting your search.'
              : 'Create your first case to start tracking client sessions with AI-assisted consultation.'}
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
