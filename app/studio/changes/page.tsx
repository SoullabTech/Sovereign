'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Wind, Clock, Droplets, Sprout, DoorOpen, Merge, Zap, Sun } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import type { ChangeRecord } from '@/lib/studio/changes/types';
import { getChangeTypeConfig } from '@/lib/studio/changes/changeTypes';
import HexagramGlyph from '@/components/iching/HexagramGlyph';
import { getHexagram } from '@/lib/iching/lookup';

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  naming: { label: 'Naming', color: 'text-slate-400 bg-slate-800' },
  casting: { label: 'Casting...', color: 'text-amber-300 bg-amber-900/40' },
  consulting: { label: 'Consulting...', color: 'text-amber-300 bg-amber-900/40' },
  active: { label: 'Active', color: 'text-amber-200 bg-amber-900/30' },
  integrating: { label: 'Integrating', color: 'text-cyan-300 bg-cyan-900/30' },
  complete: { label: 'Complete', color: 'text-emerald-300 bg-emerald-900/40' },
  archived: { label: 'Archived', color: 'text-slate-500 bg-slate-800/50' },
};

const CHANGE_TYPE_ICONS: Record<string, typeof Droplets> = {
  dissolution: Droplets,
  emergence: Sprout,
  threshold: DoorOpen,
  integration: Merge,
  upheaval: Zap,
  ripening: Sun,
};

const CHANGE_TYPE_COLORS: Record<string, string> = {
  dissolution: 'text-blue-400 bg-blue-950/30',
  emergence: 'text-cyan-400 bg-cyan-950/30',
  threshold: 'text-purple-400 bg-purple-950/30',
  integration: 'text-emerald-400 bg-emerald-950/30',
  upheaval: 'text-red-400 bg-red-950/30',
  ripening: 'text-amber-400 bg-amber-950/30',
};

export default function ChangesPage() {
  const [changes, setChanges] = useState<ChangeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    loadChanges();
  }, [filter]);

  async function loadChanges() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set('status', filter);
      const res = await apiFetch(`/api/studio/changes?${params}`);
      if (res.ok) {
        const data = await res.json();
        setChanges(data.changes || []);
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
              <Wind className="w-6 h-6 text-cyan-400" />
              Change Navigation
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Life transitions enriched with I Ching wisdom
            </p>
          </div>
          <Link
            href="/studio/changes/new"
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Change
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['', 'naming', 'active', 'integrating', 'complete'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                filter === s
                  ? 'bg-amber-600/30 text-amber-200 border border-amber-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600'
              }`}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Change List */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading...</div>
        ) : changes.length === 0 ? (
          <div className="text-center py-16">
            <Wind className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No changes yet</p>
            <p className="text-sm text-slate-500 mb-6">
              Name a change and consult the I Ching for guidance.
            </p>
            <Link
              href="/studio/changes/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Name First Change
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {changes.map((c, i) => {
              const config = getChangeTypeConfig(c.changeType);
              const Icon = CHANGE_TYPE_ICONS[c.changeType] || Wind;
              const hexagram = c.hexagramNumber ? getHexagram(c.hexagramNumber) : null;

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/studio/changes/${c.id}`}>
                    <div className="p-4 rounded-lg border border-slate-800/60 bg-slate-900/50 hover:border-cyan-800/40 transition-colors group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-white group-hover:text-cyan-200 transition-colors truncate">
                            {c.title}
                          </h3>
                          {c.clientName && (
                            <p className="text-xs text-slate-500 mt-0.5">{c.clientName}</p>
                          )}
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description}</p>
                        </div>

                        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                          {/* Change type badge */}
                          <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${CHANGE_TYPE_COLORS[c.changeType] || 'text-slate-400 bg-slate-800'}`}>
                            <Icon className="w-3 h-3" />
                            {config.label}
                          </span>

                          {/* Status badge */}
                          <span className={`text-xs px-2 py-0.5 rounded ${STATUS_BADGES[c.status]?.color || ''}`}>
                            {STATUS_BADGES[c.status]?.label || c.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                        {c.iterationCount > 1 && (
                          <span className="text-cyan-400/70">
                            {c.iterationCount} rounds
                          </span>
                        )}
                        {hexagram && (
                          <span className="flex items-center gap-1.5">
                            <HexagramGlyph
                              lines={hexagram.lines}
                              size="sm"
                              className="opacity-70"
                            />
                            <span>{hexagram.number}. {hexagram.english}</span>
                          </span>
                        )}
                        {((c as any).experienceCount > 0) && (
                          <span className="text-indigo-400/50">
                            {(c as any).experienceCount} experiences
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
