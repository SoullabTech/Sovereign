'use client';

/**
 * Platform Pulse — Anonymized developmental telemetry.
 *
 * No names. No content. Only aggregate signals.
 * Answers: Is this alive? Is it deep? Is it changing people? Are they coming back?
 */

import { useState, useEffect, useCallback } from 'react';
import { adminFetch } from '@/lib/admin/adminFetch';

interface PulseData {
  period: { hours: number; start: string; end: string };
  pulse: {
    activeUsers: number; totalSessions: number; newSignups: number; totalOnboarded: number;
    avgSessionDuration: number; medianSessionDuration: number;
    dailyActive: { day: string; count: number }[];
    confidence: string;
  };
  depth: {
    avgTurns: number; medianTurns: number; p90Turns: number; totalSessions: number;
    ainShape: { mirror: number; bridge: number; nextStep: number; passRate: number; samples: number };
    confidence: string;
  };
  developmental: {
    currentState: {
      elements: Record<string, number>; motions: Record<string, number>;
      phases: Record<string, number>; avgAutonomyStreak: number; avgReturnCount: number; totalMembers: number;
    };
    recentMovement: { themes: { theme: string; count: number; resonance: number }[]; samples: number };
    confidence: string;
  };
  worlds: {
    byWorld: { world: string; shown: number; clicked: number; entered: number; avgTime: number | null; followRate: number; entryRate: number }[];
    totalEntries: number; overallFollowRate: number; confidence: string;
  };
  features: { adoption: { feature: string; users: number }[]; confidence: string };
  retention: {
    totalActive: number; returning: number; new: number;
    returningPct: number; newPct: number; avgReturnCount: number; confidence: string;
  };
}

function Badge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    low: 'text-red-400/60 bg-red-400/10',
    medium: 'text-amber-300/60 bg-amber-300/10',
    high: 'text-green-400/60 bg-green-400/10',
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded ${colors[level] || colors.low}`}>
      {level}
    </span>
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

function SectionHeader({ title, confidence }: { title: string; confidence: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h2 className="text-sm text-white/50">{title}</h2>
      <Badge level={confidence} />
    </div>
  );
}

function Sparkline({ data, label }: { data: { day: string; count: number }[]; label?: string }) {
  if (data.length === 0) return <p className="text-white/20 text-xs italic">No data yet</p>;
  const max = Math.max(...data.map(d => d.count), 1);
  const startLabel = data[0]?.day ? new Date(data[0].day).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
  const endLabel = data[data.length - 1]?.day ? new Date(data[data.length - 1].day).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
  return (
    <div>
      <div className="flex items-end gap-1 h-12">
        {data.map((d, i) => (
          <div
            key={i}
            className="bg-amber-300/30 rounded-t flex-1 min-w-[4px]"
            style={{ height: `${Math.max((d.count / max) * 100, 4)}%` }}
            title={`${new Date(d.day).toLocaleDateString()}: ${d.count}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-white/20 mt-1">
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </div>
    </div>
  );
}

function BarChart({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(...items.map(i => i.value), 1);
  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-white/50 text-xs w-16 shrink-0">{item.label}</span>
          <div className="flex-1 bg-white/5 rounded h-5 overflow-hidden">
            <div
              className="bg-amber-300/25 h-full rounded"
              style={{ width: `${Math.max((item.value / max) * 100, 2)}%` }}
            />
          </div>
          <span className="text-white/40 text-xs w-8 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function msToLabel(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function PlatformPulsePage() {
  const [hours, setHours] = useState(168); // default 7 days
  const [data, setData] = useState<PulseData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/activity-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours }),
      });
      const json = await res.json();
      setData(json);
    } catch {
      // silent
    }
    setLoading(false);
  }, [hours]);

  useEffect(() => { load(); }, [load]);

  const timeLabels: Record<number, string> = { 12: '12h', 24: '24h', 48: '48h', 168: '7d', 720: '30d' };

  return (
    <div className="min-h-screen bg-[#0b0f1c] text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-lg font-medium text-white/80 mb-1">Platform Pulse</h1>
        <p className="text-white/30 text-sm mb-6">Anonymized developmental signals — last {timeLabels[hours] || `${hours}h`}</p>

        {/* Time range */}
        <div className="flex gap-2 mb-8">
          {[12, 24, 48, 168, 720].map(h => (
            <button
              key={h}
              onClick={() => setHours(h)}
              className={`px-3 py-1 text-xs rounded ${
                hours === h ? 'bg-amber-300/20 text-amber-300' : 'bg-white/5 text-white/40'
              }`}
            >
              {timeLabels[h]}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-white/20 text-sm italic">Loading pulse data...</p>
        ) : !data ? (
          <p className="text-white/20 text-sm italic">No data available</p>
        ) : (
          <div className="space-y-10">
            {/* Section 1: Platform Pulse */}
            <section>
              <SectionHeader title="Activity" confidence={data.pulse.confidence} />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <Stat label="Active Users" value={data.pulse.activeUsers} />
                <Stat label="Sessions" value={data.pulse.totalSessions} />
                <Stat label="New Signups" value={data.pulse.newSignups} />
                <Stat label="Onboarded" value={data.pulse.totalOnboarded} sub={`of ${data.pulse.totalOnboarded + data.pulse.newSignups} total`} />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Stat label="Avg Response" value={msToLabel(data.pulse.avgSessionDuration)} sub="per oracle turn" />
                <Stat label="Median Response" value={msToLabel(data.pulse.medianSessionDuration)} sub="per oracle turn" />
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/40 text-xs mb-2">Daily active users</p>
                <Sparkline data={data.pulse.dailyActive} />
              </div>
            </section>

            {/* Section 2: Conversation Depth */}
            <section>
              <SectionHeader title="Conversation Depth" confidence={data.depth.confidence} />
              <div className="grid grid-cols-3 gap-4 mb-4">
                <Stat label="Avg Turns" value={data.depth.avgTurns} />
                <Stat label="Median Turns" value={data.depth.medianTurns} />
                <Stat label="P90 Turns" value={data.depth.p90Turns} />
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/40 text-xs mb-3">AIN Shape Distribution <span className="text-white/20">({data.depth.ainShape.samples} samples)</span></p>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center">
                    <p className="text-blue-300/70 text-lg font-light">{data.depth.ainShape.mirror}%</p>
                    <p className="text-white/30 text-xs">Mirror</p>
                  </div>
                  <div className="text-center">
                    <p className="text-green-300/70 text-lg font-light">{data.depth.ainShape.bridge}%</p>
                    <p className="text-white/30 text-xs">Bridge</p>
                  </div>
                  <div className="text-center">
                    <p className="text-amber-300/70 text-lg font-light">{data.depth.ainShape.nextStep}%</p>
                    <p className="text-white/30 text-xs">Next Step</p>
                  </div>
                  <div className="text-center">
                    <p className="text-purple-300/70 text-lg font-light">{data.depth.ainShape.passRate}%</p>
                    <p className="text-white/30 text-xs">Pass</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Developmental Signals */}
            <section>
              <SectionHeader title="Developmental Signals" confidence={data.developmental.confidence} />

              {/* Current state */}
              <p className="text-white/25 text-xs uppercase tracking-wider mb-2">Current state</p>
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <p className="text-white/40 text-xs mb-2">Element Distribution</p>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(data.developmental.currentState.elements).map(([el, count]) => {
                    const icons: Record<string, string> = { fire: '🔥', water: '💧', earth: '🌍', air: '💨', aether: '✨' };
                    return (
                      <span key={el} className="text-white/60 text-sm">
                        {icons[el] || ''} {el}: {count}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/40 text-xs mb-2">Motion</p>
                  {Object.entries(data.developmental.currentState.motions).map(([m, c]) => (
                    <p key={m} className="text-white/50 text-sm">{m}: {c}</p>
                  ))}
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/40 text-xs mb-2">Autonomy</p>
                  <p className="text-white/50 text-sm">Streak: {data.developmental.currentState.avgAutonomyStreak}</p>
                  <p className="text-white/50 text-sm">Returns: {data.developmental.currentState.avgReturnCount}</p>
                </div>
              </div>

              {/* Recent movement */}
              <p className="text-white/25 text-xs uppercase tracking-wider mb-2 mt-6">Recent movement</p>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/40 text-xs mb-2">Theme Signals <span className="text-white/20">({data.developmental.recentMovement.samples} signals)</span></p>
                {data.developmental.recentMovement.themes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.developmental.recentMovement.themes.map(t => (
                      <span key={t.theme} className="bg-amber-300/10 text-amber-300/70 text-xs px-2 py-1 rounded">
                        {t.theme.replace(/_/g, ' ')} ({t.count}) <span className="text-white/20">r:{t.resonance}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/20 text-xs italic">No theme signals in this period</p>
                )}
              </div>
            </section>

            {/* Section 4: World Engagement */}
            <section>
              <SectionHeader title="World Engagement" confidence={data.worlds.confidence} />
              {data.worlds.byWorld.length > 0 ? (
                <div className="space-y-3">
                  {data.worlds.byWorld.map(w => (
                    <div key={w.world} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="text-amber-300/70 text-sm font-medium capitalize">{w.world}</p>
                        <p className="text-white/40 text-xs">{w.entered} entries{w.avgTime != null ? ` · avg ${w.avgTime}s` : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm ${w.followRate >= 50 ? 'text-green-400/70' : w.followRate >= 25 ? 'text-amber-300/70' : 'text-red-400/70'}`}>
                          {w.followRate}% follow
                        </p>
                        <p className="text-white/20 text-xs">{w.shown} shown</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/20 text-xs italic">No world events in this period</p>
              )}
            </section>

            {/* Section 5: Feature Adoption */}
            <section>
              <SectionHeader title="Feature Adoption" confidence={data.features.confidence} />
              <p className="text-white/25 text-xs mb-3">Unique users per feature</p>
              <BarChart
                items={data.features.adoption.map(f => ({ label: f.feature, value: f.users }))}
              />
            </section>

            {/* Section 6: Retention */}
            <section>
              <SectionHeader title="Retention" confidence={data.retention.confidence} />
              <div className="grid grid-cols-3 gap-4">
                <Stat label="Active" value={data.retention.totalActive} />
                <Stat label="Returning" value={data.retention.returning} sub={`${data.retention.returningPct}%`} />
                <Stat label="New" value={data.retention.new} sub={`${data.retention.newPct}%`} />
              </div>
              <div className="mt-4">
                <Stat label="Avg Return Count" value={data.retention.avgReturnCount} sub="times returned after autonomy" />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
