// components/astrology/synastry/SynastryCompareClient.tsx

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Users } from 'lucide-react';

type BirthInput = {
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  timezone?: string;
  lat?: number;
  lng?: number;
};

type SynastryRequest = {
  a: { memberId?: string; birth?: BirthInput };
  b: { memberId?: string; birth?: BirthInput };
  options?: {
    aspects?: Array<'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile'>;
    includeAngles?: boolean;
    includeNodes?: boolean;
    maxAspects?: number;
  };
  persist?: boolean;
  requestedByMemberId?: string;
};

type SynastryResponse = {
  success: boolean;
  analysisId?: string;
  persistedAt?: string;
  updatedAt?: string;
  synastry?: {
    aspects: Array<{
      aBody: string;
      bBody: string;
      aspect: string;
      orbDeg: number;
      strength: number;
      polarity?: 'harmony' | 'friction' | 'neutral';
      label?: string;
      interpretation?: string;
    }>;
    highlights: unknown[];
    scores: Record<string, number>;
  };
  chartA?: { memberId?: string; sunSign?: string; moonSign?: string; ascendantSign?: string };
  chartB?: { memberId?: string; sunSign?: string; moonSign?: string; ascendantSign?: string };
  error?: string;
};

function tzDefault() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function numOrUndef(v: string): number | undefined {
  const t = v.trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

function BirthCard({
  title,
  value,
  onChange,
  accentColor,
}: {
  title: string;
  value: BirthInput;
  onChange: (next: BirthInput) => void;
  accentColor: 'orange' | 'azure';
}) {
  const borderColor = accentColor === 'orange' ? 'border-dune-spice-orange/40' : 'border-dune-fremen-azure/40';
  const titleColor = accentColor === 'orange' ? 'text-dune-spice-orange' : 'text-dune-fremen-azure';

  return (
    <div className={`rounded-2xl border ${borderColor} bg-black/40 backdrop-blur-md p-5`}>
      <div className={`mb-4 text-lg font-semibold ${titleColor}`}>{title}</div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm">
          <div className="mb-1 text-dune-spice-sand/70">Birth date</div>
          <input
            className="w-full rounded-xl border border-dune-spice-sand/20 bg-black/40 px-3 py-2 text-dune-dune-amber focus:border-dune-spice-orange/60 focus:outline-none"
            type="date"
            value={value.date}
            onChange={(e) => onChange({ ...value, date: e.target.value })}
          />
        </label>

        <label className="text-sm">
          <div className="mb-1 text-dune-spice-sand/70">Birth time (optional)</div>
          <input
            className="w-full rounded-xl border border-dune-spice-sand/20 bg-black/40 px-3 py-2 text-dune-dune-amber focus:border-dune-spice-orange/60 focus:outline-none"
            type="time"
            value={value.time ?? ''}
            onChange={(e) => onChange({ ...value, time: e.target.value || undefined })}
          />
        </label>

        <label className="text-sm md:col-span-2">
          <div className="mb-1 text-dune-spice-sand/70">Timezone</div>
          <input
            className="w-full rounded-xl border border-dune-spice-sand/20 bg-black/40 px-3 py-2 text-dune-dune-amber focus:border-dune-spice-orange/60 focus:outline-none"
            placeholder="America/New_York"
            value={value.timezone ?? ''}
            onChange={(e) => onChange({ ...value, timezone: e.target.value || undefined })}
          />
        </label>

        <label className="text-sm">
          <div className="mb-1 text-dune-spice-sand/70">Latitude (optional)</div>
          <input
            className="w-full rounded-xl border border-dune-spice-sand/20 bg-black/40 px-3 py-2 text-dune-dune-amber focus:border-dune-spice-orange/60 focus:outline-none"
            inputMode="decimal"
            placeholder="40.7128"
            onChange={(e) => onChange({ ...value, lat: numOrUndef(e.target.value) })}
          />
        </label>

        <label className="text-sm">
          <div className="mb-1 text-dune-spice-sand/70">Longitude (optional)</div>
          <input
            className="w-full rounded-xl border border-dune-spice-sand/20 bg-black/40 px-3 py-2 text-dune-dune-amber focus:border-dune-spice-orange/60 focus:outline-none"
            inputMode="decimal"
            placeholder="-74.0060"
            onChange={(e) => onChange({ ...value, lng: numOrUndef(e.target.value) })}
          />
        </label>
      </div>

      <div className="mt-3 text-xs text-dune-spice-sand/50">
        If time is unknown, leave it blank — backend will default safely (noon).
      </div>
    </div>
  );
}

export default function SynastryCompareClient() {
  const router = useRouter();

  const [a, setA] = useState<BirthInput>({ date: '', timezone: tzDefault() });
  const [b, setB] = useState<BirthInput>({ date: '', timezone: tzDefault() });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SynastryResponse | null>(null);

  const canCompute = useMemo(() => Boolean(a.date && b.date), [a.date, b.date]);

  async function run(persist: boolean) {
    setError(null);
    setLoading(true);

    try {
      const body: SynastryRequest = {
        a: { birth: a },
        b: { birth: b },
        persist,
      };

      const res = await fetch('/api/astrology/synastry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json: SynastryResponse = await res.json();

      if (!json.success) {
        setError(json.error || 'Synastry request failed');
        setResult(null);
        return;
      }

      // If persisted, go straight to canonical viewer route
      if (persist && json.analysisId) {
        router.push(`/astrology/synastry/${json.analysisId}`);
        return;
      }

      setResult(json);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unexpected error';
      setError(msg);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function saveCurrent() {
    // Re-run as persist:true using same inputs (canonicalizes + gives analysisId)
    await run(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dune-ibad-blue via-dune-navigator-purple to-dune-deep-sand relative overflow-hidden">
      {/* Starfield background */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8">
        {/* Back link */}
        <Link
          href="/astrology"
          className="inline-flex items-center gap-2 text-dune-spice-sand/70 hover:text-dune-spice-orange transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Astrology
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-dune-spice-orange" />
            <h1 className="text-3xl font-bold text-dune-dune-amber">Synastry</h1>
          </div>
          <p className="text-dune-spice-sand/80">
            Compare two charts to reveal relationship dynamics. Compute on-demand, then save an analysis when it&apos;s worth keeping.
          </p>
        </div>

        {/* Birth Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
          <BirthCard title="Chart A (Person 1)" value={a} onChange={setA} accentColor="orange" />
          <BirthCard title="Chart B (Person 2)" value={b} onChange={setB} accentColor="azure" />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            className="rounded-xl bg-black/40 border border-dune-spice-sand/30 px-5 py-2.5 text-sm text-dune-spice-sand hover:bg-black/60 hover:border-dune-spice-orange/50 disabled:opacity-40 transition-all"
            disabled={!canCompute || loading}
            onClick={() => run(false)}
          >
            {loading ? 'Computing...' : 'Compute Preview'}
          </button>

          <button
            className="rounded-xl bg-dune-spice-orange px-5 py-2.5 text-sm font-semibold text-black hover:bg-dune-spice-glow disabled:opacity-40 transition-all shadow-lg shadow-dune-spice-orange/30"
            disabled={!canCompute || loading}
            onClick={() => run(true)}
          >
            {loading ? 'Saving...' : 'Compute & Save'}
          </button>

          {result?.success && (
            <button
              className="rounded-xl border border-dune-bene-gesserit-gold/40 px-5 py-2.5 text-sm text-dune-bene-gesserit-gold hover:bg-black/40 disabled:opacity-40 transition-all"
              disabled={loading}
              onClick={saveCurrent}
            >
              Save this analysis
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200 mb-6">
            {error}
          </div>
        )}

        {/* Preview result */}
        {result?.success && result.synastry && (
          <div className="rounded-2xl border border-dune-bene-gesserit-gold/40 bg-black/40 backdrop-blur-md p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-dune-bene-gesserit-gold" />
              <span className="text-sm text-dune-spice-sand/70">Preview (not persisted)</span>
            </div>

            <div className="text-xl font-semibold text-dune-dune-amber mb-4">
              {result.chartA?.sunSign ?? '—'} / {result.chartA?.moonSign ?? '—'} / {result.chartA?.ascendantSign ?? '—'}
              <span className="mx-3 text-dune-spice-sand/40">↔</span>
              {result.chartB?.sunSign ?? '—'} / {result.chartB?.moonSign ?? '—'} / {result.chartB?.ascendantSign ?? '—'}
            </div>

            <div className="text-sm text-dune-spice-sand/70 mb-4">
              {result.synastry.aspects.length} aspects found • {result.synastry.highlights.length} highlights
            </div>

            {/* Quick scores preview */}
            {result.synastry.scores && Object.keys(result.synastry.scores).length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {Object.entries(result.synastry.scores).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="rounded-xl bg-black/30 border border-dune-spice-sand/10 p-3 text-center">
                    <div className="text-xs text-dune-spice-sand/60 capitalize">{key}</div>
                    <div className="text-lg font-semibold text-dune-spice-orange tabular-nums">
                      {(value as number).toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-xs text-dune-spice-sand/50">
              Click &quot;Save this analysis&quot; to persist and view full details with filtering.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
