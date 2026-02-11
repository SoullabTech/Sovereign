'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Scale, Clock, CheckCircle2, AlertTriangle, Sparkles, GitBranch, Compass } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import type { DecisionRecord } from '@/lib/studio/leadership/types';
import { getSituationConfig } from '@/lib/studio/leadership/situationTypes';

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'text-slate-400 bg-slate-800' },
  consulting: { label: 'Consulting...', color: 'text-amber-300 bg-amber-900/40' },
  active: { label: 'Active', color: 'text-amber-200 bg-amber-900/30' },
  complete: { label: 'Resolved', color: 'text-emerald-300 bg-emerald-900/40' },
  archived: { label: 'Archived', color: 'text-slate-500 bg-slate-800/50' },
};

const EMERGENCE_ICONS: Record<string, string> = {
  breakthrough: '***',
  synthesis: '**',
  recombination: '*',
};

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    loadDecisions();
  }, [filter]);

  async function loadDecisions() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set('status', filter);
      const res = await apiFetch(`/api/studio/decisions?${params}`);
      if (res.ok) {
        const data = await res.json();
        setDecisions(data.decisions || []);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-light text-white flex items-center gap-3">
              <Scale className="w-6 h-6 text-amber-400" />
              Decision Council
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Multi-perspective reflection for practitioner decisions
            </p>
          </div>
          <Link
            href="/studio/decisions/new"
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Decision
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['', 'draft', 'active', 'complete'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                filter === s
                  ? 'bg-amber-600/30 text-amber-200 border border-amber-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600'
              }`}
            >
              {s === '' ? 'All' : s === 'complete' ? 'Resolved' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Decision List */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading...</div>
        ) : decisions.length === 0 ? (
          <div className="text-center py-16">
            <Scale className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No decisions yet</p>
            <p className="text-sm text-slate-500 mb-6">
              Capture a decision and run the council for multi-perspective insight.
            </p>
            <Link
              href="/studio/decisions/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Decision
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {decisions.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/studio/decisions/${d.id}`}>
                  <div className="p-4 rounded-lg border border-slate-800/60 bg-slate-900/50 hover:border-amber-800/40 transition-colors group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white group-hover:text-amber-200 transition-colors truncate">
                          {d.title}
                        </h3>
                        {d.clientName && (
                          <p className="text-xs text-slate-500 mt-0.5">{d.clientName}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{d.context}</p>
                      </div>

                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        {d.timePressure && d.timePressure !== 'none' && (
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            d.timePressure === 'urgent' || d.timePressure === 'high'
                              ? 'text-red-300 bg-red-900/30'
                              : 'text-amber-300 bg-amber-900/30'
                          }`}>
                            <AlertTriangle className="w-3 h-3 inline mr-0.5" />
                            {d.timePressure}
                          </span>
                        )}

                        {d.councilResult?.emergenceRating && (
                          <span className="text-xs text-purple-300 bg-purple-900/30 px-1.5 py-0.5 rounded">
                            <Sparkles className="w-3 h-3 inline mr-0.5" />
                            {d.councilResult.emergenceRating}
                          </span>
                        )}

                        <span className={`text-xs px-2 py-0.5 rounded ${STATUS_BADGES[d.status]?.color || ''}`}>
                          {STATUS_BADGES[d.status]?.label || d.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(d.createdAt).toLocaleDateString()}
                      </span>
                      {d.situationType && (
                        <span className="text-slate-500">{getSituationConfig(d.situationType).label}</span>
                      )}
                      {d.iterationCount > 1 && (
                        <span className="text-amber-400/70">
                          {d.iterationCount} rounds
                        </span>
                      )}
                      {d.councilResult && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {d.councilResult.framingsUsed?.length || 0} framings
                        </span>
                      )}
                      {d.questionsForLeader?.length > 0 && (
                        <span>{d.questionsForLeader.length} questions prepared</span>
                      )}
                      {((d as any).childCount > 0 || (d as any).parentDecisionId) && (
                        <span className="flex items-center gap-1 text-amber-400/50">
                          <GitBranch className="w-3 h-3" />
                          {(d as any).childCount > 0 ? `${(d as any).childCount} spawned` : 'child'}
                        </span>
                      )}
                      {(d as any).experienceCount > 0 && (
                        <span className="flex items-center gap-1 text-blue-400/50">
                          <Compass className="w-3 h-3" />
                          {(d as any).experienceCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
