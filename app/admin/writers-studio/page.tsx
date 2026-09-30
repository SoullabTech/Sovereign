'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpenText,
  CheckCircle2,
  Circle,
  Gauge,
  RefreshCw,
  ShieldAlert,
  TriangleAlert,
} from 'lucide-react';
import { adminFetch } from '@/lib/admin/adminFetch';
import { FOUNDER_WITNESS_STEPS } from '@/lib/writersStudio/releaseEvidence';

type Status = 'grey' | 'green' | 'amber' | 'red';

type DashboardPayload = {
  runtime: {
    sha: string;
    environment: string;
    candidateMatch: boolean | null;
    observedAt: string;
  };
  currentRelease: null | {
    release_key: string;
    title: string;
    phase: string;
    candidate_sha: string;
    canonical_parent_sha: string;
    status: string;
    rollback_plan: string;
    migration_set: unknown;
    feature_flags: unknown;
    what_changed: string | null;
    remains_uncertain: string | null;
    falsifier: string | null;
    created_at: string;
  };
  recentReleases: Array<Record<string, unknown>>;
  gates: Array<{
    id: string;
    title: string;
    question: string;
    stopOnFail: boolean;
    status: Status;
    evidence: null | {
      evidence_type: string;
      summary: string;
      evidence_ref: string | null;
      recorded_at: string;
    };
  }>;
  metrics: Array<{
    id: string;
    label: string;
    format: string;
    hardRed: boolean;
    status: Status;
    snapshot: null | {
      value: string | number | null;
      numerator: string | number | null;
      denominator: string | number | null;
      sample_count: string | number;
      status: Status;
      notes: string | null;
    };
  }>;
  founderWitness: null | {
    status: Status;
    summary: string;
    payload: unknown;
    recorded_at: string;
  };
};

const STATUS_STYLE: Record<Status, string> = {
  green: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200',
  amber: 'border-amber-500/35 bg-amber-500/10 text-amber-100',
  red: 'border-rose-500/45 bg-rose-500/10 text-rose-100',
  grey: 'border-white/10 bg-white/[0.035] text-white/55',
};

function shortSha(value: string | null | undefined) {
  if (!value) return '—';
  return value === 'unknown' ? value : value.slice(0, 12);
}

function displayMetric(metric: DashboardPayload['metrics'][number]) {
  const snapshot = metric.snapshot;
  if (!snapshot || snapshot.value === null) return 'Not instrumented';
  const n = Number(snapshot.value);
  if (!Number.isFinite(n)) return String(snapshot.value);
  return metric.format === 'percent' ? `${n.toFixed(1)}%` : n.toLocaleString();
}

function StatusDot({ status }: { status: Status }) {
  const iconClass = 'h-4 w-4 shrink-0';
  if (status === 'green') return <CheckCircle2 className={iconClass} />;
  if (status === 'red') return <ShieldAlert className={iconClass} />;
  if (status === 'amber') return <TriangleAlert className={iconClass} />;
  return <Circle className={iconClass} />;
}

export default function WritersStudioStewardshipDashboard() {
  const router = useRouter();
  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setPhase('loading');
    setMessage('');
    try {
      const res = await adminFetch('/api/admin/writers-studio/evidence', { cache: 'no-store' });
      if (!res.ok) throw new Error(`dashboard ${res.status}`);
      setPayload(await res.json() as DashboardPayload);
      setPhase('ready');
    } catch {
      setPhase('error');
      setMessage('The stewardship dashboard could not read release evidence just now.');
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const overall = useMemo<Status>(() => {
    if (!payload) return 'grey';
    if (payload.runtime.candidateMatch === false) return 'red';
    const statuses = payload.gates.map((gate) => gate.status);
    if (statuses.includes('red')) return 'red';
    if (statuses.includes('amber')) return 'amber';
    if (statuses.every((status) => status === 'green')) return 'green';
    return 'grey';
  }, [payload]);

  if (phase === 'loading' && !payload) {
    return (
      <main className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center">
        <div className="text-sm text-white/45">Opening Writer’s Studio stewardship…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d1117] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0d1117]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Back to admin"
              onClick={() => router.push('/admin')}
              className="rounded-lg p-2 text-white/50 transition hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <BookOpenText className="h-5 w-5 text-teal-300" />
                <h1 className="text-lg font-semibold tracking-tight">Writer’s Studio Stewardship</h1>
              </div>
              <p className="mt-0.5 text-xs text-white/40">
                Release evidence, trust, continuity and founder witness — no manuscript content.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-7">
        {message ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {message}
          </div>
        ) : null}

        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">Studio health</p>
              <h2 className="mt-1 text-xl font-semibold">Can we trust what is running?</h2>
            </div>
            <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${STATUS_STYLE[overall]}`}>
              <StatusDot status={overall} />
              {overall.toUpperCase()}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <Fact label="Runtime SHA" value={shortSha(payload?.runtime.sha)} />
            <Fact label="Release" value={payload?.currentRelease?.release_key ?? 'No release record'} />
            <Fact label="Phase" value={payload?.currentRelease?.phase ?? 'Evidence foundation'} />
            <Fact
              label="Provenance"
              value={
                payload?.runtime.candidateMatch === true
                  ? 'MATCH'
                  : payload?.runtime.candidateMatch === false
                    ? 'MISMATCH'
                    : 'UNBOUND'
              }
              status={
                payload?.runtime.candidateMatch === true
                  ? 'green'
                  : payload?.runtime.candidateMatch === false
                    ? 'red'
                    : 'grey'
              }
            />
            <Fact label="Environment" value={payload?.runtime.environment ?? '—'} />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Gauge className="h-5 w-5 text-teal-300" />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">North star</p>
                <h2 className="text-lg font-semibold">Meaningful Continuation</h2>
              </div>
            </div>
            {payload?.metrics.find((m) => m.id === 'meaningful_continuation_rate')?.snapshot ? (
              <div className="text-5xl font-semibold tracking-tight">
                {displayMetric(payload.metrics.find((m) => m.id === 'meaningful_continuation_rate')!)}
              </div>
            ) : (
              <div>
                <div className="text-3xl font-semibold text-white/50">Not instrumented yet</div>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
                  This remains grey until the Studio can observe structural continuation without collecting manuscript,
                  source, prompt or MAIA-response content.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">Release declaration</p>
            <div className="mt-3 space-y-3 text-sm">
              <Row label="Candidate" value={shortSha(payload?.currentRelease?.candidate_sha)} />
              <Row label="Canonical parent" value={shortSha(payload?.currentRelease?.canonical_parent_sha)} />
              <Row label="Rollback" value={payload?.currentRelease?.rollback_plan ?? 'Not yet recorded'} />
              <Row label="Falsifier" value={payload?.currentRelease?.falsifier ?? 'Not yet recorded'} />
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">Trust metrics</p>
            <h2 className="mt-1 text-xl font-semibold">Writer sovereignty and continuity</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {payload?.metrics.map((metric) => (
              <div key={metric.id} className={`rounded-xl border p-4 ${STATUS_STYLE[metric.status]}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-medium uppercase tracking-[0.13em] opacity-70">{metric.label}</div>
                  <StatusDot status={metric.status} />
                </div>
                <div className="mt-4 text-2xl font-semibold">{displayMetric(metric)}</div>
                <div className="mt-1 text-xs opacity-60">
                  {metric.snapshot
                    ? `sample ${Number(metric.snapshot.sample_count).toLocaleString()}`
                    : 'Grey means insufficient evidence, not pass.'}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">Release gates</p>
            <h2 className="mt-1 text-xl font-semibold">Technical integrity → human witness</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {payload?.gates.map((gate) => (
              <article key={gate.id} className={`rounded-xl border p-4 ${STATUS_STYLE[gate.status]}`}>
                <div className="flex items-start gap-3">
                  <StatusDot status={gate.status} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{gate.id} · {gate.title}</div>
                    <p className="mt-1 text-sm leading-5 opacity-75">{gate.question}</p>
                    <div className="mt-3 border-t border-current/10 pt-3 text-xs leading-5 opacity-65">
                      {gate.evidence?.summary ?? 'No evidence recorded for this gate.'}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">Founder witness</p>
            <h2 className="mt-1 text-xl font-semibold">Ordinary-use falsifier walk</h2>
            <p className="mt-2 text-sm leading-6 text-white/45">
              Run this without DevTools or database inspection. Stop at the first falsifier rather than explaining it away.
            </p>
            <ol className="mt-5 space-y-3">
              {FOUNDER_WITNESS_STEPS.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm leading-5 text-white/65">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 text-[11px] text-white/40">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-4">
            <div className={`rounded-2xl border p-5 ${STATUS_STYLE[payload?.founderWitness?.status ?? 'grey']}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] opacity-65">Latest witness</p>
                <StatusDot status={payload?.founderWitness?.status ?? 'grey'} />
              </div>
              <div className="mt-3 text-lg font-semibold">
                {payload?.founderWitness?.summary ?? 'No founder witness recorded'}
              </div>
              <p className="mt-2 text-sm opacity-65">
                A release cannot turn green merely because CI is green.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">Evidence privacy</p>
              <h3 className="mt-1 font-semibold">Observe the Studio, not the writer’s text.</h3>
              <p className="mt-2 text-sm leading-6 text-white/45">
                Release evidence and product metrics are structural. No selected passage, manuscript prose, source text,
                prompt body or MAIA-response text belongs in this dashboard by default.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Fact({ label, value, status = 'grey' }: { label: string; value: string; status?: Status }) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${STATUS_STYLE[status]}`}>
      <div className="text-[10px] uppercase tracking-[0.15em] opacity-60">{label}</div>
      <div className="mt-2 truncate font-mono text-sm font-semibold">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 border-b border-white/5 pb-2 last:border-0">
      <span className="text-white/35">{label}</span>
      <span className="text-white/70">{value}</span>
    </div>
  );
}
