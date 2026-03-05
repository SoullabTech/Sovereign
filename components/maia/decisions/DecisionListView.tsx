'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Loader2,
  Scale,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import type { DecisionRecord } from '@/lib/studio/leadership/types';
import { getSituationConfig } from '@/lib/studio/leadership/situationTypes';

interface DecisionListViewProps {
  onSelect: (decisionId: string) => void;
  onCreate: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft:      { label: 'Draft',      color: 'text-stone-400 bg-stone-800/60' },
  consulting: { label: 'Consulting', color: 'text-amber-300 bg-amber-900/30' },
  active:     { label: 'Active',     color: 'text-amber-200 bg-amber-900/20' },
  complete:   { label: 'Resolved',   color: 'text-emerald-300 bg-emerald-900/30' },
  archived:   { label: 'Archived',   color: 'text-stone-500 bg-stone-800/40' },
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function DecisionListView({ onSelect, onCreate }: DecisionListViewProps) {
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDecisions();
  }, []);

  async function fetchDecisions() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/studio/decisions?limit=50');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setDecisions(data.decisions || []);
    } catch {
      setError('Could not load decisions');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={fetchDecisions} className="ml-auto text-red-400 hover:text-red-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Create Button */}
      <button
        onClick={onCreate}
        className="w-full p-4 bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 border border-amber-500/30 rounded-xl transition-all"
      >
        <div className="flex items-center justify-center gap-2">
          <Plus className="w-5 h-5 text-amber-400" />
          <span className="text-white font-medium">New Decision</span>
        </div>
      </button>

      {/* Empty State */}
      {decisions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-12 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Scale className="w-8 h-8 text-amber-400" />
          </div>
          <p className="text-stone-400 text-sm max-w-xs mx-auto">
            Bring a decision here. The council offers multi-perspective reflection — the choice is always yours.
          </p>
        </motion.div>
      )}

      {/* Decision List */}
      <div className="space-y-3">
        {decisions.map((d, i) => {
          const situation = getSituationConfig(d.situationType);
          const status = STATUS_CONFIG[d.status] ?? STATUS_CONFIG.draft;

          return (
            <motion.button
              key={d.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onSelect(d.id)}
              className="w-full p-4 bg-stone-800/30 border border-stone-700/30 hover:border-amber-500/30 hover:bg-stone-800/60 rounded-xl text-left transition-all"
            >
              <div className="flex items-start gap-3">
                <Scale className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  {/* Title + status */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-stone-100 text-sm font-medium line-clamp-2 leading-snug flex-1">
                      {d.title}
                    </h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Context snippet */}
                  {d.context && (
                    <p className="text-stone-500 text-xs line-clamp-1 mb-1.5">{d.context}</p>
                  )}

                  {/* Meta row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-stone-600 text-xs">
                      <Clock className="w-3 h-3" />
                      {formatDate(d.createdAt)}
                    </span>

                    <span className="text-stone-700 text-xs">{situation.label}</span>

                    {d.iterationCount > 1 && (
                      <span className="flex items-center gap-0.5 text-xs text-amber-500/70">
                        <RefreshCw className="w-3 h-3" />
                        {d.iterationCount} rounds
                      </span>
                    )}

                    {d.councilResult?.emergenceRating && (
                      <span className="flex items-center gap-0.5 text-xs text-purple-400/70">
                        <Sparkles className="w-3 h-3" />
                        {d.councilResult.emergenceRating}
                      </span>
                    )}

                    {d.status === 'complete' && (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500/70" />
                    )}

                    {d.timePressure && d.timePressure !== 'none' && (
                      <AlertTriangle className={`w-3 h-3 ${
                        d.timePressure === 'urgent' || d.timePressure === 'high'
                          ? 'text-red-400/70'
                          : 'text-amber-400/50'
                      }`} />
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
