'use client';

/**
 * World Telemetry — Admin observation surface.
 *
 * Anonymized. No member names. No content.
 * Shows: doorway follow rates, time-to-click, time-in-world, world distribution.
 * Focused review surface for improving recognition, not analytics.
 */

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

interface SummaryRow {
  event_type: string;
  world: string | null;
  count: number;
  avg_time_to_click: number | null;
  avg_time_in_world: number | null;
  median_time_to_click: number | null;
  median_time_in_world: number | null;
}

interface RecentEvent {
  event_type: string;
  intent: string | null;
  world: string | null;
  confidence: number | null;
  time_to_click: number | null;
  time_in_world: number | null;
  created_at: string;
}

export default function WorldTelemetryPage() {
  const [hours, setHours] = useState(48);
  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [recent, setRecent] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/telemetry/world?hours=${hours}`);
      const data = await res.json();
      setSummary(data.summary || []);
      setRecent(data.recent || []);
    } catch {
      // silent
    }
    setLoading(false);
  }, [hours]);

  useEffect(() => { load(); }, [load]);

  // Derive headline stats
  const shown = summary.filter(r => r.event_type === 'doorway_shown').reduce((s, r) => s + r.count, 0);
  const clicked = summary.filter(r => r.event_type === 'doorway_clicked').reduce((s, r) => s + r.count, 0);
  const dismissed = summary.filter(r => r.event_type === 'doorway_dismissed').reduce((s, r) => s + r.count, 0);
  const entered = summary.filter(r => r.event_type === 'world_entered').reduce((s, r) => s + r.count, 0);
  const followRate = shown > 0 ? Math.round((clicked / shown) * 100) : 0;

  const clickedRows = summary.filter(r => r.event_type === 'doorway_clicked');
  const medianTTC = clickedRows.length > 0
    ? clickedRows.reduce((s, r) => s + (r.median_time_to_click || 0), 0) / clickedRows.length
    : null;

  const exitedRows = summary.filter(r => r.event_type === 'world_exited');

  return (
    <div className="min-h-screen bg-[#0b0f1c] text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-lg font-medium text-white/80 mb-1">World Telemetry</h1>
        <p className="text-white/30 text-sm mb-6">Anonymized movement signals — last {hours}h</p>

        {/* Time range */}
        <div className="flex gap-2 mb-8">
          {[12, 24, 48, 168].map(h => (
            <button
              key={h}
              onClick={() => setHours(h)}
              className={`px-3 py-1 text-xs rounded ${
                hours === h ? 'bg-amber-300/20 text-amber-300' : 'bg-white/5 text-white/40'
              }`}
            >
              {h}h
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-white/20 text-sm italic">Loading&hellip;</p>
        ) : (
          <>
            {/* Headline stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              <Stat label="Shown" value={shown} />
              <Stat label="Followed" value={clicked} sub={`${followRate}%`} />
              <Stat label="Dismissed" value={dismissed} />
              <Stat label="Median TTC" value={medianTTC !== null ? `${Math.round(medianTTC)}s` : '—'} sub="time to click" />
            </div>

            {/* Per-world breakdown */}
            <h2 className="text-sm text-white/50 mb-3">By world</h2>
            <div className="grid grid-cols-3 gap-4 mb-10">
              {['patterns', 'journey', 'depth'].map(world => {
                const worldClicked = summary.find(r => r.event_type === 'doorway_clicked' && r.world === world);
                const worldExited = exitedRows.find(r => r.world === world);
                return (
                  <div key={world} className="bg-white/5 rounded-lg p-4">
                    <p className="text-amber-300/70 text-sm font-medium capitalize mb-2">{world}</p>
                    <p className="text-white/60 text-xs">
                      Clicks: {worldClicked?.count || 0}
                    </p>
                    <p className="text-white/60 text-xs">
                      Median TTC: {worldClicked?.median_time_to_click != null ? `${worldClicked.median_time_to_click}s` : '—'}
                    </p>
                    <p className="text-white/60 text-xs">
                      Avg time in: {worldExited?.avg_time_in_world != null ? `${worldExited.avg_time_in_world}s` : '—'}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Recent events */}
            <h2 className="text-sm text-white/50 mb-3">Recent events</h2>
            <div className="space-y-1">
              {recent.map((ev, i) => (
                <div key={i} className="flex items-baseline gap-3 text-xs text-white/40 py-1 border-b border-white/5">
                  <span className="text-white/20 w-16 shrink-0">
                    {new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`w-28 shrink-0 ${
                    ev.event_type === 'doorway_clicked' ? 'text-amber-300/60' :
                    ev.event_type === 'world_entered' ? 'text-green-300/60' :
                    ev.event_type === 'world_exited' ? 'text-blue-300/60' :
                    'text-white/30'
                  }`}>
                    {ev.event_type.replace('doorway_', '').replace('world_', '')}
                  </span>
                  <span className="text-white/50 w-16 shrink-0 capitalize">{ev.world || '—'}</span>
                  {ev.time_to_click != null && (
                    <span className="text-amber-200/40">ttc:{ev.time_to_click}s</span>
                  )}
                  {ev.time_in_world != null && (
                    <span className="text-blue-200/40">in:{ev.time_in_world}s</span>
                  )}
                </div>
              ))}
              {recent.length === 0 && (
                <p className="text-white/20 text-sm italic py-4">No events yet.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-white/5 rounded-lg p-4">
      <p className="text-white/40 text-xs mb-1">{label}</p>
      <p className="text-white/80 text-xl font-light">{value}</p>
      {sub && <p className="text-white/30 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}
