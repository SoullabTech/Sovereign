import React from 'react';

/**
 * CollectiveDashboard
 * 
 * Phenomenology-first UI for the AIN Neural Reservoir → Maya translation layer.
 * - No archetypal jargon by default; expert mode reveals technical tags.
 * - All copy is gentle, actionable, and secular.
 * - Components are modular so you can drop pieces into other pages.
 *
 * Styling:
 * - TailwindCSS
 * - Shadcn UI (optional): replace primitive <button>/<card> with imports if you prefer.
 */

// =====================
// Types (align with your API contracts)
// =====================
export type CoherenceLevel = 0 | 1 | 2 | 3; // 0=low, 1=steady, 2=strong, 3=highly aligned

export interface CollectiveHeader {
  coherenceScore: number; // 0..100
  level: CoherenceLevel;  // derived bucket
  phrase: string;         // e.g., "steady and clear"
  themes: Array<{ label: string; momentum: number }>; // 0..1 momentum
}

export interface EmergingShift {
  id: string;
  title: string;          // e.g., "Clarity rising"
  description?: string;   // optional, short phenomenological gloss
  momentum: 0 | 1 | 2 | 3; // how quickly it&apos;s rising
  when?: string;          // e.g., "next 2–3 days"
  // expert fields (hidden unless expertMode)
  _technical?: { code?: string; confidence?: number };
}

export interface ShadowSignal {
  id: string;
  observation: string;    // gentle reflection: "I notice a hesitation to name a small truth."
  invitation: string;     // one practical step
  severity: 0 | 1 | 2 | 3; // 0 mild → 3 strong
  // expert fields
  _technical?: { tag?: string; code?: string };
}

export interface FavorableWindow {
  id: string;
  label: string;          // "Honest conversations"
  timeframe: string;      // "next 3 days"
  note?: string;          // short extra guidance
  // expert
  _technical?: { element?: string; phase?: string };
}

export interface PracticeTile {
  id: string;
  title: string;          // "One-line truth"
  duration: string;       // "2–3 min"
  instruction: string;    // clear, secular practice
  tags?: string[];        // e.g., ["grounding","clarity"]
}

export interface CollectiveDashboardData {
  header: CollectiveHeader;
  emerging: EmergingShift[];
  shadow: ShadowSignal[];
  windows: FavorableWindow[];
  practices: PracticeTile[];
}

// =====================
// Gauge (donut) util
// =====================
const circumference = 2 * Math.PI * 38;
function gaugeStrokeDash(score: number) {
  const pct = Math.max(0, Math.min(100, score));
  const filled = (pct / 100) * circumference;
  return `${filled} ${circumference - filled}`;
}

// =====================
// Subcomponents
// =====================
function CoherenceGauge({ score, phrase }: { score: number; phrase: string }) {
  return (
    <div className="flex items-center gap-4">
      <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0">
        <circle cx="48" cy="48" r="38" strokeWidth="10" className="opacity-20" fill="none" stroke="currentColor" />
        <circle
          cx="48"
          cy="48"
          r="38"
          strokeWidth="10"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeDasharray={gaugeStrokeDash(score)}
          transform="rotate(-90 48 48)"
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="text-xl font-semibold">
          {Math.round(score)}
        </text>
      </svg>
      <div>
        <div className="text-sm uppercase tracking-wide opacity-70">Coherence</div>
        <div className="text-lg font-medium">{phrase}</div>
      </div>
    </div>
  );
}

function ThemeChips({ themes }: { themes: CollectiveHeader['themes'] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {themes.map((t, i) => (
        <div key={i} className="px-3 py-1 rounded-full border text-sm flex items-center gap-2">
          <span>{t.label}</span>
          <span className="flex gap-[2px]" aria-label={`momentum ${t.momentum}`}>
            {Array.from({ length: 3 }).map((_, j) => (
              <span key={j} className={`w-1.5 h-1.5 rounded-full ${j < Math.round(t.momentum * 3) ? 'opacity-100' : 'opacity-30'} bg-current`}></span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

function EmergingPills({ items, expertMode = false }: { items: EmergingShift[]; expertMode?: boolean }) {
  if (!items?.length) return <div className="text-sm opacity-60">No strong shifts today. Keep it simple and kind.</div>;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((it) => (
        <div key={it.id} className="border rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-medium">{it.title}</div>
              {it.description && <div className="text-sm opacity-70 mt-1">{it.description}</div>}
            </div>
            <div className="flex items-center gap-1" title="momentum">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < it.momentum ? 'opacity-100' : 'opacity-30'} bg-current`} />
              ))}
            </div>
          </div>
          <div className="text-xs opacity-60 mt-2">{it.when ?? 'near-term'}</div>
          {expertMode && it._technical?.code && (
            <div className="text-[11px] mt-2 px-2 py-1 rounded bg-black/5 inline-block">{it._technical.code} · {(it._technical.confidence ?? 0.8).toFixed(2)}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function ShadowCards({ items, expertMode = false }: { items: ShadowSignal[]; expertMode?: boolean }) {
  if (!items?.length) return <div className="text-sm opacity-60">Shadow weather looks mild. A small act of care goes a long way.</div>;
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {items.map((s) => (
        <div key={s.id} className="rounded-2xl border p-4">
          <div className="text-[13px] uppercase tracking-wide opacity-60 mb-2">I notice…</div>
          <div className="font-medium leading-relaxed">{s.observation}</div>
          <div className="mt-3 text-sm">Try: {s.invitation}</div>
          <div className="mt-3 flex items-center gap-2 text-xs opacity-60">
            <span>strength</span>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i < s.severity ? 'opacity-100' : 'opacity-30'} bg-current`} />
            ))}
          </div>
          {expertMode && s._technical?.tag && (
            <div className="mt-2 text-[11px] px-2 py-1 rounded bg-black/5 inline-block">{s._technical.tag}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function WindowsTimeline({ items, expertMode = false }: { items: FavorableWindow[]; expertMode?: boolean }) {
  if (!items?.length) return <div className="text-sm opacity-60">No special timing windows—steady progress is favored.</div>;
  return (
    <div className="flex flex-col gap-3">
      {items.map((w) => (
        <div key={w.id} className="border rounded-2xl p-4 flex items-center justify-between gap-4">
          <div>
            <div className="font-medium">{w.label}</div>
            <div className="text-sm opacity-70">{w.timeframe}</div>
            {w.note && <div className="text-sm mt-1">{w.note}</div>}
          </div>
          {expertMode && (
            <div className="text-[11px] px-2 py-1 rounded bg-black/5 whitespace-nowrap">
              {w._technical?.element ?? '—'} {w._technical?.phase ? `· ${w._technical.phase}` : ''}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PracticeGrid({ items }: { items: PracticeTile[] }) {
  if (!items?.length) return <div className="text-sm opacity-60">No special practices today—sleep, water, and sunlight are enough.</div>;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((p) => (
        <div key={p.id} className="border rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="font-medium">{p.title}</div>
            <div className="text-xs opacity-60">{p.duration}</div>
          </div>
          <div className="text-sm leading-relaxed">{p.instruction}</div>
          {p.tags && (
            <div className="flex flex-wrap gap-2 mt-2">
              {p.tags.map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full border opacity-80">{t}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// =====================
// Main component
// =====================
export default function CollectiveDashboard({ data, expertMode = false, loading = false }: { data?: CollectiveDashboardData; expertMode?: boolean; loading?: boolean }) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-24 rounded-2xl bg-black/5" />
        <div className="h-8 w-2/3 rounded bg-black/5" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-black/5" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-sm opacity-60">No data available.</div>;

  const { header, emerging, shadow, windows, practices } = data;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-10">
      {/* Header Bar */}
      <section className="rounded-3xl border p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <CoherenceGauge score={header.coherenceScore} phrase={header.phrase} />
        <div className="sm:text-right">
          <div className="text-sm uppercase tracking-wide opacity-70">Themes</div>
          <div className="mt-2">
            <ThemeChips themes={header.themes} />
          </div>
        </div>
      </section>

      {/* Emerging Shifts */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Emerging shifts</h2>
          {expertMode && <span className="text-xs opacity-60">expert mode</span>}
        </div>
        <EmergingPills items={emerging} expertMode={expertMode} />
      </section>

      {/* Shadow Weather */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Shadow weather</h2>
        <ShadowCards items={shadow} expertMode={expertMode} />
      </section>

      {/* Favorable Windows */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Favorable windows</h2>
        <WindowsTimeline items={windows} expertMode={expertMode} />
      </section>

      {/* Practice Tiles */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">One small practice</h2>
        <PracticeGrid items={practices} />
      </section>
    </div>
  );
}

// =====================
// Example usage (remove in prod)
// =====================
export const ExampleScreen = () => {
  const sample: CollectiveDashboardData = {
    header: {
      coherenceScore: 67,
      level: 2,
      phrase: 'steady, honest, and quietly focused',
      themes: [
        { label: 'courage', momentum: 0.7 },
        { label: 'integration', momentum: 0.6 },
        { label: 'clean starts', momentum: 0.5 },
      ],
    },
    emerging: [
      { id: '1', title: 'Clarity rising', description: 'Direct speech lands well', momentum: 3, when: 'next 2–3 days', _technical: { code: 'air.shift.clarity', confidence: 0.82 } },
      { id: '2', title: 'Grounding opportunities', description: 'Simple routines bring relief', momentum: 2, when: 'this weekend', _technical: { code: 'earth.window.routine', confidence: 0.76 } },
      { id: '3', title: 'Gentle truth-telling', description: 'Name one small thing out loud', momentum: 2, when: 'today', _technical: { code: 'water.truth.micro', confidence: 0.81 } },
    ],
    shadow: [
      { id: 's1', observation: 'I notice a hesitation to name a small truth.', invitation: 'Say one sentence aloud—even quietly to yourself.', severity: 2, _technical: { tag: 'deflection', code: 'shadow.deflection' } },
      { id: 's2', observation: "There&apos;s a pull toward perfection before starting.", invitation: 'Start messy—one honest paragraph or two minutes of action.', severity: 1, _technical: { tag: 'perfectionism', code: 'shadow.perfection' } },
    ],
    windows: [
      { id: 'w1', label: 'Honest conversations', timeframe: 'next 3 days', note: 'Keep it simple and kind.', _technical: { element: 'air', phase: 'integration' } },
      { id: 'w2', label: 'Clean starts', timeframe: 'this weekend', note: 'Small resets beat big overhauls.', _technical: { element: 'earth', phase: 'renewal' } },
    ],
    practices: [
      { id: 'p1', title: 'One-line truth', duration: '2-3 min', instruction: "Whisper a single sentence you&apos;ve been avoiding. Notice the relief.", tags: ['clarity', 'courage'] },
      { id: 'p2', title: 'Barefoot step', duration: '2 min', instruction: 'Stand on earth or floor. Breathe slowly for ten cycles.', tags: ['grounding'] },
      { id: 'p3', title: 'Tiny clean slate', duration: '5 min', instruction: 'Reset one surface or list. Let completion spark energy.', tags: ['renewal'] },
    ],
  };

  return <CollectiveDashboard data={sample} expertMode={false} />;
};