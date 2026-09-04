'use client';

/**
 * ReflectionsFeed — the reflection capsule feed, rendered at two addresses.
 *
 * WHY THIS COMPONENT EXISTS (founder ruling 2026-09-04, Journal precedent):
 * reflections are MEMBER-OWNED content — /api/capsules is requireMemberId()-scoped
 * and every capsule is the member's own Keep. But the only page that rendered
 * them lived under app/labtools/, whose layout calls requireFounder(), so members
 * were pushed at a place that refused them. Journal had the same shape and was
 * resolved the same way: the House points at /journal, not /labtools/journal.
 *
 * The feed is therefore extracted here and mounted twice:
 *   /reflections          → the member's ordinary home (House destination)
 *   /labtools/reflections → unchanged founder/lab instrumentation surface
 *
 * ⛔ Do NOT repoint the House at /labtools/reflections. The namespace boundary
 * is deliberate: /labtools is instrumentation, ruled out of the House
 * (lib/navigation/houseDispositions.ts → labtools). Member content does not
 * live there.
 *
 * No new data, no new API, no new persistence: same member-scoped endpoint.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Sparkles, Archive, Pin } from 'lucide-react';
import CapsuleCard from '@/components/capsules/CapsuleCard';
import type { CapsuleDTO } from '@/lib/capsules/types';

// Geometric symbol for reflections
const ReflectionSymbol = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
    {/* Crystal/prism reflecting light */}
    <polygon points="20,6 32,18 26,34 14,34 8,18" />
    <line x1="20" y1="6" x2="20" y2="34" strokeDasharray="2 2" opacity="0.5" />
    <line x1="8" y1="18" x2="32" y2="18" strokeDasharray="2 2" opacity="0.5" />
  </svg>
);

type FilterTab = 'all' | 'pinned' | 'drafts' | 'archived';

export interface ReflectionsFeedProps {
  /** Where an opened reflection lives — `${basePath}/${id}`. */
  basePath?: string;
  /** Where the back link goes. */
  backHref?: string;
  backLabel?: string;
}

export default function ReflectionsFeed({
  basePath = '/reflections',
  backHref = '/maia',
  backLabel = 'Back to MAIA',
}: ReflectionsFeedProps) {
  const router = useRouter();
  const [capsules, setCapsules] = useState<CapsuleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  // Fetch capsules
  const fetchCapsules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);

      switch (activeFilter) {
        case 'pinned':
          params.set('pinned', 'true');
          params.set('archived', 'false');
          break;
        case 'drafts':
          params.set('draft', 'true');
          params.set('archived', 'false');
          break;
        case 'archived':
          params.set('archived', 'true');
          break;
        default:
          params.set('archived', 'false');
      }

      const response = await fetch(`/api/capsules?${params.toString()}`);
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/signin');
          return;
        }
        throw new Error('Failed to fetch reflections');
      }

      const data = await response.json();
      setCapsules(data.capsules || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeFilter, router]);

  useEffect(() => {
    fetchCapsules();
  }, [fetchCapsules]);

  // Handle pin/unpin
  const handlePin = async (id: string, pinned: boolean) => {
    try {
      await fetch(`/api/capsules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned }),
      });
      fetchCapsules();
    } catch (err) {
      console.error('Failed to pin capsule:', err);
    }
  };

  // Handle archive
  const handleArchive = async (id: string) => {
    try {
      await fetch(`/api/capsules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: true }),
      });
      fetchCapsules();
    } catch (err) {
      console.error('Failed to archive capsule:', err);
    }
  };

  // Handle open
  const handleOpen = (id: string) => {
    router.push(`${basePath}/${id}`);
  };

  const filterTabs: { key: FilterTab; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All', icon: null },
    { key: 'pinned', label: 'Pinned', icon: <Pin className="w-3.5 h-3.5" /> },
    { key: 'drafts', label: 'Drafts', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { key: 'archived', label: 'Archived', icon: <Archive className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}
    >
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(backHref)}
            className="flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors text-[13px] tracking-wide"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{backLabel}</span>
          </button>
        </div>

        {/* Title Section */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl bg-[#5a7a6f]/10 flex items-center justify-center">
              <ReflectionSymbol className="w-8 h-8 text-[#5a7a6f]" />
            </div>
          </div>
          <h1 className="text-2xl font-light tracking-wide text-stone-800 mb-3">
            Reflections — what's been remembered
          </h1>
          <p className="text-stone-500 text-[14px] tracking-wide leading-relaxed max-w-md mx-auto">
            A place to return to what mattered
          </p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4 mb-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reflections..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-[14px] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5a7a6f]/20 focus:border-[#5a7a6f]"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] tracking-wide transition-all ${
                  activeFilter === tab.key
                    ? 'bg-[#5a7a6f] text-white'
                    : 'bg-white text-stone-500 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#5a7a6f]/20 border-t-[#5a7a6f] rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 text-[14px]">{error}</p>
            <button
              onClick={fetchCapsules}
              className="mt-4 text-[13px] text-stone-500 hover:text-stone-700 underline"
            >
              Try again
            </button>
          </div>
        ) : capsules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-[#D4B896]/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[#D4B896]" />
            </div>
            <h3 className="text-lg font-light text-stone-700 mb-2">Nothing has been kept yet</h3>
            <p className="text-stone-500 text-[14px] mb-6 max-w-sm mx-auto">
              When you keep the spirit of a conversation with MAIA, your reflections will appear here.
            </p>
            <button
              onClick={() => router.push('/maia')}
              className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-[#5a7a6f] hover:bg-[#4a6a5f] text-white rounded-xl text-[13px] tracking-wide transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Talk with MAIA
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {capsules.map((capsule, idx) => (
              <motion.div
                key={capsule.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <CapsuleCard
                  capsule={capsule}
                  onOpen={handleOpen}
                  onPin={handlePin}
                  onArchive={handleArchive}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
