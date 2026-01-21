"use client";

/**
 * COMMS SPINE: Inbox Page
 *
 * Unified communication cockpit for practitioners.
 * View inbox, read threads, manage safety flags.
 *
 * Route: /stellium/comms
 */

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageSquare, RefreshCw, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  InboxList,
  SafetyRibbon,
  type InboxThread,
  type SafetyRibbonData,
} from '@/components/comms';
import type { CommsDomain } from '@/lib/comms/types';

interface InboxResponse {
  threads: InboxThread[];
  summary: {
    total_threads: number;
    total_unread: number;
    by_domain: Record<CommsDomain, number>;
  };
  safety_ribbon: SafetyRibbonData;
}

export default function CommsInboxPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white p-6">Loading...</div>}>
      <CommsInboxContent />
    </Suspense>
  );
}

function CommsInboxContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialDomain = (searchParams.get('domain') as CommsDomain | 'all') || 'all';

  const [inboxData, setInboxData] = useState<InboxResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<CommsDomain | 'all'>(initialDomain);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // Fetch inbox
  const fetchInbox = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilter !== 'all') {
        params.set('domain', activeFilter);
      }
      params.set('limit', '50');

      const res = await fetch(`/api/comms/inbox?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInboxData(data);
      } else {
        console.error('[Comms Inbox] Failed to fetch:', res.status);
      }
    } catch (error) {
      console.error('[Comms Inbox] Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  // Initial fetch
  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  // Update URL when filter changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeFilter === 'all') {
      params.delete('domain');
    } else {
      params.set('domain', activeFilter);
    }
    router.replace(`/stellium/comms?${params.toString()}`, { scroll: false });
  }, [activeFilter, router, searchParams]);

  // Handle thread selection
  const handleSelectThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    router.push(`/stellium/comms/${threadId}`);
  };

  // Handle filter change
  const handleFilterChange = (filter: CommsDomain | 'all') => {
    setActiveFilter(filter);
    setSelectedThreadId(null);
  };

  // Handle safety view
  const handleViewSafety = () => {
    router.push('/stellium/comms?filter=safety');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-100 flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-sacred-gold" />
          Communications
        </h1>

        <div className="flex items-center space-x-3">
          {/* Refresh button */}
          <button
            onClick={fetchInbox}
            disabled={isLoading}
            className="p-2 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Safety dashboard link */}
          {inboxData?.safety_ribbon.has_unacknowledged && (
            <button
              onClick={handleViewSafety}
              className="flex items-center space-x-2 px-3 py-2 rounded-md bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">
                {inboxData.safety_ribbon.total_unacknowledged} Safety
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Safety ribbon */}
      {inboxData?.safety_ribbon && (
        <SafetyRibbon
          data={inboxData.safety_ribbon}
          onViewSafety={handleViewSafety}
        />
      )}

      {/* Summary stats */}
      {inboxData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Threads"
            value={inboxData.summary.total_threads}
          />
          <StatCard
            label="Unread"
            value={inboxData.summary.total_unread}
            highlight={inboxData.summary.total_unread > 0}
          />
          <StatCard
            label="Clinical"
            value={inboxData.summary.by_domain?.clinical || 0}
          />
          <StatCard
            label="Operations"
            value={inboxData.summary.by_domain?.ops || 0}
          />
        </div>
      )}

      {/* Inbox */}
      <div className="bg-gray-900/30 rounded-lg border border-gray-800/50 overflow-hidden">
        <InboxList
          threads={inboxData?.threads || []}
          selectedThreadId={selectedThreadId}
          onSelectThread={handleSelectThread}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  highlight?: boolean;
}

function StatCard({ label, value, highlight = false }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${
        highlight
          ? 'bg-sacred-gold/10 border-sacred-gold/30'
          : 'bg-gray-800/30 border-gray-700/50'
      }`}
    >
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`text-2xl font-semibold ${
        highlight ? 'text-sacred-gold' : 'text-gray-100'
      }`}>
        {value}
      </p>
    </motion.div>
  );
}
