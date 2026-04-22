'use client';

/**
 * Decisions — list view (MAIA-native)
 *
 * The commitment field. Longitudinal surface for things being chosen —
 * open, made, deferred. Not a practitioner workspace; a place the member
 * returns to over time as selection unfolds.
 *
 * Phase 1: reads from /api/studio/decisions (until a member-facing
 * /api/decisions endpoint is added). Creation flows through the existing
 * DecisionsSheet to keep a single canonical path.
 *
 * Ideas → Decisions → Changes.
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Scale, Clock, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { DecisionsSheet } from '@/components/maia/decisions/DecisionsSheet';

type DecisionStatus = 'draft' | 'consulting' | 'active' | 'complete' | 'archived';

interface DecisionListItem {
  id: string;
  title: string;
  context: string | null;
  status: DecisionStatus;
  situationType: string | null;
  iterationCount: number;
  consultedAt: string | null;
  createdAt: string;
  updatedAt: string;
  experienceCount?: number;
  childCount?: number;
}

type TabKey = 'recent' | 'open' | 'made' | 'deferred';

const TABS: { key: TabKey; label: string; hint: string }[] = [
  { key: 'recent',   label: 'Recently active', hint: 'what\u2019s most alive' },
  { key: 'open',     label: 'Open',            hint: 'still forming' },
  { key: 'made',     label: 'Made',            hint: 'chosen' },
  { key: 'deferred', label: 'Deferred',        hint: 'not yet ripe' },
];

const STATUS_LABEL: Record<DecisionStatus, string> = {
  draft:      'Draft',
  consulting: 'Consulting',
  active:     'Active',
  complete:   'Made',
  archived:   'Archived',
};

const STATUS_COLOR: Record<DecisionStatus, string> = {
  draft:      'text-stone-400 bg-stone-800/60',
  consulting: 'text-amber-300 bg-amber-500/10',
  active:     'text-teal-300 bg-teal-500/10',
  complete:   'text-emerald-300 bg-emerald-500/10',
  archived:   'text-stone-500 bg-stone-900/60',
};

export default function DecisionsListPage() {
  const router = useRouter();
  const [decisions, setDecisions] = useState<DecisionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('recent');
  const [createOpen, setCreateOpen] = useState(false);

  const loadDecisions = useCallback(async () => {
    try {
      const res = await apiFetch('/api/studio/decisions?limit=100');
      if (!res.ok) {
        setDecisions([]);
        return;
      }
      const data = await res.json();
      const rows: DecisionListItem[] = (data.decisions || []).map((d: Record<string, unknown>) => ({
        id: d.id as string,
        title: d.title as string,
        context: (d.context as string) ?? null,
        status: (d.status as DecisionStatus) ?? 'draft',
        situationType: (d.situationType as string) ?? (d.situation_type as string) ?? null,
        iterationCount: (d.iterationCount as number) ?? (d.iteration_count as number) ?? 0,
        consultedAt: (d.consultedAt as string) ?? (d.consulted_at as string) ?? null,
        createdAt: (d.createdAt as string) ?? (d.created_at as string) ?? '',
        updatedAt: (d.updatedAt as string) ?? (d.updated_at as string) ?? '',
        experienceCount: (d.experienceCount as number) ?? (d.experience_count as number) ?? 0,
        childCount: (d.childCount as number) ?? (d.child_count as number) ?? 0,
      }));
      setDecisions(rows);
    } catch (err) {
      console.error('[decisions/list] load failed:', err);
      setDecisions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDecisions(); }, [loadDecisions]);

  // Re-fetch when the create sheet closes — a new decision may have been made
  const handleCreateClose = useCallback(() => {
    setCreateOpen(false);
    loadDecisions();
  }, [loadDecisions]);

  const filtered = useMemo(() => {
    switch (activeTab) {
      case 'open':     return decisions.filter(d => d.status === 'draft' || d.status === 'consulting' || d.status === 'active');
      case 'made':     return decisions.filter(d => d.status === 'complete');
      case 'deferred': return decisions.filter(d => d.status === 'archived');
      case 'recent':
      default: {
        const sorted = [...decisions].sort((a, b) => {
          const aT = a.updatedAt || a.createdAt;
          const bT = b.updatedAt || b.createdAt;
          return new Date(bT).getTime() - new Date(aT).getTime();
        });
        return sorted.slice(0, 30);
      }
    }
  }, [decisions, activeTab]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#0b0f1c] text-white pl-14"
    >
      {/* Return threshold */}
      <div className="p-6">
        <button
          onClick={() => router.push('/maia')}
          className="text-white/30 hover:text-white/60 transition-colors duration-200 flex items-center gap-2 text-sm"
          aria-label="Return to MAIA"
        >
          <ArrowLeft size={16} />
          <span>MAIA</span>
        </button>
      </div>

      {/* Header */}
      <div className="max-w-2xl mx-auto px-6 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Scale className="w-5 h-5 text-teal-300/80" />
          <h1
            className="text-2xl text-teal-200/90 font-light"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
          >
            Decisions
          </h1>
        </div>
        <p className="text-sm text-stone-400 leading-relaxed">
          The commitment field. A place for what is being chosen —
          open questions, made calls, and things not yet ripe.
        </p>
      </div>

      {/* New decision affordance */}
      <div className="max-w-2xl mx-auto px-6 mb-6">
        <button
          onClick={() => setCreateOpen(true)}
          className="w-full p-4 rounded-xl bg-teal-500/5 hover:bg-teal-500/10 border border-teal-500/20 hover:border-teal-500/40 transition-all text-left flex items-center gap-3 group"
        >
          <Plus className="w-4 h-4 text-teal-400/60 group-hover:text-teal-400/90 transition-colors" />
          <span className="text-sm text-teal-300/70 group-hover:text-teal-300/90 font-light">
            Name a decision
          </span>
        </button>
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-6 mb-5">
        <div className="flex items-center gap-2 border-b border-stone-800/60">
          {TABS.map((t) => {
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`
                  px-3 py-2 text-xs transition-colors relative
                  ${isActive ? 'text-teal-300' : 'text-stone-500 hover:text-stone-300'}
                `}
                title={t.hint}
              >
                {t.label}
                {isActive && (
                  <motion.div
                    layoutId="decisions-tab-active"
                    className="absolute left-0 right-0 bottom-0 h-px bg-teal-400/70"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="max-w-2xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-5 h-5 border border-teal-500/30 border-t-teal-400/70 rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Scale className="w-6 h-6 text-stone-600 mx-auto mb-3" />
            <p className="text-sm text-stone-500 font-light">
              {activeTab === 'recent' ? 'Nothing here yet.' : `No ${TABS.find(t => t.key === activeTab)?.label.toLowerCase()} decisions.`}
            </p>
            <p className="text-xs text-stone-600 mt-1">
              When something is asking to be chosen, name it here.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((d) => (
              <li key={d.id}>
                <button
                  onClick={() => router.push(`/maia/decisions/${d.id}`)}
                  className="w-full p-4 rounded-xl bg-stone-900/40 hover:bg-stone-900/70 border border-stone-800/50 hover:border-teal-500/30 transition-all text-left group"
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3
                      className="text-base text-teal-100/90 group-hover:text-teal-50 font-light flex-1 truncate"
                      style={{ fontFamily: 'Spectral, Georgia, serif' }}
                    >
                      {d.title}
                    </h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${STATUS_COLOR[d.status]}`}>
                      {STATUS_LABEL[d.status]}
                    </span>
                  </div>
                  {d.context && (
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{d.context}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-[11px] text-stone-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(d.updatedAt || d.createdAt)}
                    </span>
                    {d.consultedAt && (
                      <span className="flex items-center gap-1 text-amber-400/60">
                        <Sparkles className="w-3 h-3" />
                        council consulted
                      </span>
                    )}
                    {(d.childCount ?? 0) > 0 && (
                      <span className="flex items-center gap-1 text-emerald-500/60">
                        <CheckCircle2 className="w-3 h-3" />
                        {d.childCount} iteration{d.childCount === 1 ? '' : 's'}
                      </span>
                    )}
                    {d.iterationCount > 0 && (
                      <span className="flex items-center gap-1 text-stone-500">
                        <AlertTriangle className="w-3 h-3" />
                        revisited {d.iterationCount}&times;
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create surface — existing sheet as secondary entry point */}
      <DecisionsSheet
        isOpen={createOpen}
        onClose={handleCreateClose}
        memberId=""
        memberName=""
      />
    </motion.div>
  );
}

function formatTimeAgo(iso: string | null): string {
  if (!iso) return '';
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMin = Math.floor((now - then) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
