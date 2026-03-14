'use client';

/**
 * Occupancy Rating Widget
 *
 * A fast, one-step UI for recording relational occupancy after a session.
 * 3 clicks maximum: select score, optionally toggle warm interruption, save.
 *
 * Designed for speed — it must be fast enough to use as an in-session or
 * immediately post-session note, not a reflective exercise.
 *
 * 1 = reciprocal    2 = mild    3 = occupied    4 = sustained    5 = total
 */

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import type { OccupancyRating, OccupancyTrend } from '@/lib/studio/practitioner/types';
import { TrendingDown, TrendingUp, Minus, Radio } from 'lucide-react';

const SCORE_CONFIG: Record<number, { label: string; description: string; color: string; bg: string }> = {
  1: { label: '1', description: 'Reciprocal',  color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40' },
  2: { label: '2', description: 'Mild',         color: 'text-lime-400',    bg: 'bg-lime-500/20 border-lime-500/40' },
  3: { label: '3', description: 'Occupied',     color: 'text-amber-400',   bg: 'bg-amber-500/20 border-amber-500/40' },
  4: { label: '4', description: 'Sustained',    color: 'text-orange-400',  bg: 'bg-orange-500/20 border-orange-500/40' },
  5: { label: '5', description: 'Total',        color: 'text-red-400',     bg: 'bg-red-500/20 border-red-500/40' },
};

const TRAJECTORY_ICONS = {
  improving:  <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />,
  worsening:  <TrendingUp   className="w-3.5 h-3.5 text-red-400" />,
  stable:     <Minus        className="w-3.5 h-3.5 text-slate-400" />,
  unknown:    null,
};

interface Props {
  decisionId?: string;
  changeId?: string;
  clientId?: string | null;
  onRated?: (score: number) => void;  // called after a rating is saved
}

export default function OccupancyRatingWidget({ decisionId, changeId, clientId, onRated }: Props) {
  const [trend, setTrend] = useState<OccupancyTrend | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    score: 0,
    warmInterruptionTolerated: null as boolean | null,
    momentOfContact: '',
    notes: '',
  });

  useEffect(() => {
    loadTrend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decisionId, changeId, clientId]);

  async function loadTrend() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (clientId)   params.set('clientId', clientId);
      if (decisionId) params.set('decisionId', decisionId);
      if (changeId)   params.set('changeId', changeId);
      params.set('limit', '10');
      const data = await apiFetch(`/api/studio/occupancy-ratings?${params.toString()}`);
      setTrend({ ratings: data.ratings || [], current: data.current || null, trajectory: data.trajectory || 'unknown' });
    } catch { /* graceful */ }
    finally { setLoading(false); }
  }

  async function handleSave() {
    if (!form.score) return;
    setSaving(true);
    try {
      const data = await apiFetch('/api/studio/occupancy-ratings', {
        method: 'POST',
        body: JSON.stringify({
          clientId: clientId || null,
          decisionId: decisionId || null,
          changeId: changeId || null,
          score: form.score,
          warmInterruptionTolerated: form.warmInterruptionTolerated,
          momentOfContact: form.momentOfContact.trim() || null,
          notes: form.notes.trim() || null,
        }),
      });
      const newRating: OccupancyRating = data.rating;
      setTrend((prev) => {
        if (!prev) return { ratings: [newRating], current: newRating, trajectory: 'unknown' };
        const updated = [newRating, ...prev.ratings];
        let trajectory: OccupancyTrend['trajectory'] = 'unknown';
        if (updated.length >= 2) {
          const delta = updated[0].score - updated[1].score;
          trajectory = delta < 0 ? 'improving' : delta > 0 ? 'worsening' : 'stable';
        }
        return { ratings: updated, current: newRating, trajectory };
      });
      setForm({ score: 0, warmInterruptionTolerated: null, momentOfContact: '', notes: '' });
      setOpen(false);
      onRated?.(form.score);
    } catch { /* keep open */ }
    finally { setSaving(false); }
  }

  const current = trend?.current;
  const currentCfg = current ? SCORE_CONFIG[current.score] : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-sm font-medium text-slate-200">Relational Occupancy</span>
          {trend && trend.trajectory !== 'unknown' && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              {TRAJECTORY_ICONS[trend.trajectory]}
              <span>{trend.trajectory}</span>
            </span>
          )}
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          + Rate session
        </button>
      </div>

      {/* Current score + mini history */}
      {!loading && (
        <div className="flex items-center gap-2">
          {current && currentCfg && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${currentCfg.bg} ${currentCfg.color}`}>
              {currentCfg.label} — {currentCfg.description}
            </div>
          )}
          {/* Sparkline: last 6 scores */}
          {trend && trend.ratings.length > 1 && (
            <div className="flex items-end gap-0.5" title="Recent occupancy trend (oldest → newest)">
              {[...trend.ratings].reverse().slice(-6).map((r, i) => {
                const height = r.score * 4 + 4; // 8-24px
                const cfg = SCORE_CONFIG[r.score];
                return (
                  <div
                    key={i}
                    style={{ height }}
                    className={`w-2 rounded-sm ${cfg.bg.replace('bg-', 'bg-').split(' ')[0]}`}
                    title={`${cfg.description} (${r.score})`}
                  />
                );
              })}
            </div>
          )}
          {!current && <p className="text-xs text-slate-600 italic">No rating yet</p>}
        </div>
      )}

      {/* Rating form */}
      {open && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 space-y-3">
          {/* Score selector */}
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Channel occupancy this session</label>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => {
                const cfg = SCORE_CONFIG[n];
                const selected = form.score === n;
                return (
                  <button
                    key={n}
                    onClick={() => setForm((f) => ({ ...f, score: n }))}
                    className={`flex flex-col items-center gap-0.5 px-1 py-2 rounded border text-center transition-colors ${
                      selected ? `${cfg.bg} ${cfg.color}` : 'border-slate-700 text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    <span className="text-sm font-bold">{n}</span>
                    <span className="text-[10px] leading-tight">{cfg.description}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-slate-600 mt-1 px-0.5">
              <span>reciprocal</span>
              <span>total occupation</span>
            </div>
          </div>

          {/* Warm interruption */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400">Warm interruption tolerated?</label>
            <div className="flex gap-2">
              {([true, false, null] as const).map((val) => (
                <button
                  key={String(val)}
                  onClick={() => setForm((f) => ({ ...f, warmInterruptionTolerated: val }))}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    form.warmInterruptionTolerated === val
                      ? 'bg-slate-600 text-slate-200'
                      : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  {val === null ? 'N/A' : val ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </div>

          {/* Moment of contact */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Moment of contact <span className="text-slate-600">(optional — brief note)</span>
            </label>
            <input
              value={form.momentOfContact}
              onChange={(e) => setForm((f) => ({ ...f, momentOfContact: e.target.value }))}
              placeholder="e.g. Paused when I named the chest sensation"
              maxLength={200}
              className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 placeholder-slate-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setOpen(false)} className="text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.score}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded disabled:opacity-40 transition-colors"
            >
              {saving ? 'Saving...' : 'Save rating'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
