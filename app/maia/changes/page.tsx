'use client';

/**
 * Changes — list view (MAIA-native)
 *
 * The transformation ledger. Longitudinal surface for what is actually shifting —
 * in motion, integrating, complete, archived. Not a practitioner tool; a place
 * the member returns to as change reveals itself over time.
 *
 * Reads from /api/changes (member-facing). Creation flows through the existing
 * ChangesSheet (I Ching-informed naming + casting flow).
 *
 * Ideas → Decisions → Changes.
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, GitBranch, Clock, Sparkles, Droplets, Sprout, DoorOpen, Merge, Zap, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { ChangesSheet } from '@/components/maia/changes/ChangesSheet';

type ChangeStatus = 'naming' | 'casting' | 'consulting' | 'active' | 'integrating' | 'complete' | 'archived';
type ChangeType = 'dissolution' | 'emergence' | 'threshold' | 'integration' | 'upheaval' | 'ripening';

interface ChangeListItem {
  id: string;
  title: string;
  description: string | null;
  changeType: ChangeType;
  status: ChangeStatus;
  hexagramNumber: number | null;
  hexagramName: string | null;
  castAt: string | null;
  consultedAt: string | null;
  createdAt: string;
  updatedAt: string;
  iterationCount: number;
  experienceCount: number;
  parentChangeId: string | null;
  rootChangeId: string | null;
}

type TabKey = 'shifting' | 'in-motion' | 'integrating' | 'complete' | 'archived';

const TABS: { key: TabKey; label: string; hint: string }[] = [
  { key: 'shifting',    label: 'Shifting',    hint: 'what is most alive' },
  { key: 'in-motion',   label: 'In motion',   hint: 'active changes' },
  { key: 'integrating', label: 'Integrating', hint: 'landing' },
  { key: 'complete',    label: 'Complete',    hint: 'arrived' },
  { key: 'archived',    label: 'Archived',    hint: 'released' },
];

const TYPE_CONFIG: Record<ChangeType, { label: string; icon: LucideIcon; color: string }> = {
  dissolution: { label: 'Dissolution', icon: Droplets, color: 'text-cyan-300' },
  emergence:   { label: 'Emergence',   icon: Sprout,   color: 'text-emerald-300' },
  threshold:   { label: 'Threshold',   icon: DoorOpen, color: 'text-violet-300' },
  integration: { label: 'Integration', icon: Merge,    color: 'text-amber-300' },
  upheaval:    { label: 'Upheaval',    icon: Zap,      color: 'text-rose-300' },
  ripening:    { label: 'Ripening',    icon: Sun,      color: 'text-yellow-300' },
};

const STATUS_LABEL: Record<ChangeStatus, string> = {
  naming: 'Named', casting: 'Casting', consulting: 'Consulting',
  active: 'Active', integrating: 'Integrating', complete: 'Complete', archived: 'Archived',
};

export default function ChangesListPage() {
  const router = useRouter();
  const [changes, setChanges] = useState<ChangeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('shifting');
  const [createOpen, setCreateOpen] = useState(false);

  const loadChanges = useCallback(async () => {
    try {
      const res = await apiFetch('/api/changes?limit=100');
      if (!res.ok) {
        setChanges([]);
        return;
      }
      const data = await res.json();
      setChanges(data.changes || []);
    } catch (err) {
      console.error('[changes/list] load failed:', err);
      setChanges([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadChanges(); }, [loadChanges]);

  const handleCreateClose = useCallback(() => {
    setCreateOpen(false);
    loadChanges();
  }, [loadChanges]);

  const filtered = useMemo(() => {
    switch (activeTab) {
      case 'in-motion':   return changes.filter(c => c.status === 'active' || c.status === 'consulting' || c.status === 'casting');
      case 'integrating': return changes.filter(c => c.status === 'integrating');
      case 'complete':    return changes.filter(c => c.status === 'complete');
      case 'archived':    return changes.filter(c => c.status === 'archived');
      case 'shifting':
      default: {
        // "Shifting" = everything that's still alive, sorted by recency
        const alive = changes.filter(c => c.status !== 'archived');
        return [...alive].sort((a, b) => {
          const aT = a.updatedAt || a.createdAt;
          const bT = b.updatedAt || b.createdAt;
          return new Date(bT).getTime() - new Date(aT).getTime();
        }).slice(0, 30);
      }
    }
  }, [changes, activeTab]);

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
          <GitBranch className="w-5 h-5 text-emerald-300/80" />
          <h1
            className="text-2xl text-emerald-200/90 font-light"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
          >
            Changes
          </h1>
        </div>
        <p className="text-sm text-stone-400 leading-relaxed">
          The transformation ledger. A place for what is actually shifting —
          in motion, landing, and already behind you.
        </p>
      </div>

      {/* Name a change */}
      <div className="max-w-2xl mx-auto px-6 mb-6">
        <button
          onClick={() => setCreateOpen(true)}
          className="w-full p-4 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-left flex items-center gap-3 group"
        >
          <Plus className="w-4 h-4 text-emerald-400/60 group-hover:text-emerald-400/90 transition-colors" />
          <span className="text-sm text-emerald-300/70 group-hover:text-emerald-300/90 font-light">
            Name a change
          </span>
        </button>
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-6 mb-5">
        <div className="flex items-center gap-2 border-b border-stone-800/60 overflow-x-auto">
          {TABS.map((t) => {
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`
                  px-3 py-2 text-xs transition-colors relative whitespace-nowrap
                  ${isActive ? 'text-emerald-300' : 'text-stone-500 hover:text-stone-300'}
                `}
                title={t.hint}
              >
                {t.label}
                {isActive && (
                  <motion.div
                    layoutId="changes-tab-active"
                    className="absolute left-0 right-0 bottom-0 h-px bg-emerald-400/70"
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
            <div className="w-5 h-5 border border-emerald-500/30 border-t-emerald-400/70 rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <GitBranch className="w-6 h-6 text-stone-600 mx-auto mb-3" />
            <p className="text-sm text-stone-500 font-light">
              {activeTab === 'shifting' ? 'Nothing shifting right now.' : `No ${TABS.find(t => t.key === activeTab)?.label.toLowerCase()} changes.`}
            </p>
            <p className="text-xs text-stone-600 mt-1">
              When something is moving, name it — it helps you see what it is.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((c) => {
              const typeCfg = TYPE_CONFIG[c.changeType] ?? TYPE_CONFIG.emergence;
              const TypeIcon = typeCfg.icon;
              return (
                <li key={c.id}>
                  <button
                    onClick={() => router.push(`/maia/changes/${c.id}`)}
                    className="w-full p-4 rounded-xl bg-stone-900/40 hover:bg-stone-900/70 border border-stone-800/50 hover:border-emerald-500/30 transition-all text-left group"
                  >
                    <div className="flex items-start gap-3">
                      <TypeIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${typeCfg.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h3
                            className="text-base text-emerald-100/90 group-hover:text-emerald-50 font-light flex-1 truncate"
                            style={{ fontFamily: 'Spectral, Georgia, serif' }}
                          >
                            {c.title}
                          </h3>
                          <span className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 text-stone-400 bg-stone-800/60">
                            {STATUS_LABEL[c.status]}
                          </span>
                        </div>
                        {c.description && (
                          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{c.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-3 text-[11px] text-stone-600 flex-wrap">
                          <span className={typeCfg.color + '/70'}>{typeCfg.label}</span>
                          {c.hexagramNumber && (
                            <span className="flex items-center gap-1 text-amber-400/60">
                              <Sparkles className="w-3 h-3" />
                              {c.hexagramNumber} {c.hexagramName ? `\u00b7 ${c.hexagramName}` : ''}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(c.updatedAt || c.createdAt)}
                          </span>
                          {c.experienceCount > 0 && (
                            <span>{c.experienceCount} experience{c.experienceCount === 1 ? '' : 's'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Create surface — existing sheet as secondary entry point */}
      <ChangesSheet
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
