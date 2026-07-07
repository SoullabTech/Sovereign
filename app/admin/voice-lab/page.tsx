'use client';

/**
 * Admin Voice Lab (MVP) — compare wired TTS providers on the fixed protocol
 * passages, blind-drawn, provider-locked, with provenance + per-dimension scores
 * exportable to CSV. Admin-gated (LABTOOLS_ADMIN_PASSWORD via adminFetch).
 *
 * NOT member-facing. Runs on the Mac Studio lab stack
 * (MAIA_DEPLOYMENT_CONTEXT=voice-quality-lab). On a production-context process the
 * synthesize route's R15 guard refuses openai/pplex even for an admin.
 *
 * Scope: see docs/specs/VOICE_LAB_SPEC_2026-07-06.md. Scenarios / MAIA-facilitator
 * / longitudinal analysis are preserved direction, not built here.
 *
 * UX principle: surface reality. Provider availability is probed live so a dead
 * backend is visible before you draw — "page available ≠ voice testable". Blind
 * integrity is preserved (the drawn provider stays hidden until reveal/after-save)
 * and provenance is always shown on reveal, incl. a rendered≠requested warning.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { adminFetch, getAdminPassword, storeAdminPassword } from '@/lib/admin/adminFetch';

const PASSAGES = [
  { id: 'greeting', label: 'Greeting', text: "Welcome back. It's good to see you again." },
  { id: 'reflective', label: 'Reflective guidance', text: 'Take a moment before answering. Notice what is already present.' },
  { id: 'support', label: 'Emotional support', text: "That sounds difficult. We don't have to rush toward an answer." },
  { id: 'curiosity', label: 'Curiosity', text: 'What feels most alive for you right now?' },
  { id: 'celebration', label: 'Celebration', text: 'Something important has shifted since we last spoke.' },
] as const;

const PROVIDERS = ['openai', 'kokoro', 'sesame', 'pplex'] as const;
type Provider = (typeof PROVIDERS)[number];

const PROVIDER_LABEL: Record<Provider, string> = {
  openai: 'OpenAI',
  kokoro: 'Kokoro',
  sesame: 'Sesame',
  pplex: 'PersonaPlex',
};

// Layer-3 (role) qualification. Being operationally `up` is not enough — a provider must
// also perform the RIGHT KIND of behavior for this instrument. PersonaPlex (Moshi lineage)
// free-generates speech rather than reading supplied text (verified 2026-07-07), so it is a
// conversational engine, NOT a passage reader, and must not be blind-scored on fixed passages
// here. See docs/specs/VOICE_FUNCTION_TAXONOMY_2026-07-07.md.
type ProviderRole = 'passage' | 'conversational';
const PROVIDER_ROLE: Record<Provider, ProviderRole> = {
  openai: 'passage', kokoro: 'passage', sesame: 'passage', pplex: 'conversational',
};

const DEFAULT_VOICE: Record<Provider, string> = {
  openai: 'alloy',
  kokoro: 'af_kore',
  sesame: 'maya',
  pplex: '',
};

const DIMENSIONS = ['trust', 'presence', 'warmth', 'emotional_attunement', 'calm', 'naturalness'] as const;

type Avail = 'up' | 'down' | 'no-key' | 'unknown' | 'checking';

interface Provenance {
  provider: string;
  requestedProvider: string;
  voice: string | null;
  fallback: boolean;
  reason?: string;
  latencyMs: number;
}

const AVAIL_META: Record<Avail, { dot: string; text: string; word: string }> = {
  up: { dot: 'bg-emerald-400', text: 'text-emerald-300', word: 'available' },
  down: { dot: 'bg-red-500', text: 'text-red-300', word: 'unreachable' },
  'no-key': { dot: 'bg-neutral-500', text: 'text-neutral-400', word: 'no key' },
  unknown: { dot: 'bg-amber-400', text: 'text-amber-300', word: 'no signal' },
  checking: { dot: 'bg-neutral-600 animate-pulse', text: 'text-neutral-400', word: 'checking…' },
};

export default function VoiceLabPage() {
  const [pwd, setPwd] = useState('');
  const [hasPwd, setHasPwd] = useState(() => Boolean(getAdminPassword()));

  const [sessionId] = useState(() =>
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : String(Date.now()),
  );
  const [evaluator, setEvaluator] = useState('kelly');
  const [passageId, setPassageId] = useState<string>(PASSAGES[0].id);
  const [speed, setSpeed] = useState(1.0);

  // Provider selection + lock + blind
  const [enabled, setEnabled] = useState<Record<Provider, boolean>>({
    openai: true, kokoro: true, sesame: true, pplex: true,
  });
  const [locked, setLocked] = useState<Provider | null>(null);
  const [blind, setBlind] = useState(true);

  // Live availability
  const [avail, setAvail] = useState<Record<Provider, Avail>>({
    openai: 'checking', kokoro: 'checking', sesame: 'checking', pplex: 'checking',
  });
  const [latency, setLatency] = useState<Partial<Record<Provider, number>>>({});

  // Current draw
  const [drawn, setDrawn] = useState<Provider | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [provenance, setProvenance] = useState<Provenance | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scoring
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const passage = useMemo(() => PASSAGES.find((p) => p.id === passageId)!, [passageId]);
  // Draw pool = enabled AND operationally up AND role-qualified for passage reading.
  // Conversational engines (PersonaPlex) are excluded — they cannot be scored on a fixed passage.
  const drawPool = useMemo(
    () => PROVIDERS.filter((p) => enabled[p] && avail[p] === 'up' && PROVIDER_ROLE[p] === 'passage'),
    [enabled, avail],
  );

  // ── Live provider availability ────────────────────────────────────────────
  // Uses the admin lab-health route, which probes each engine directly (the
  // truthful "can the Lab reach this provider now" — covers PersonaPlex too).
  const refreshHealth = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/voice-lab/health');
      const j = await res.json().catch(() => ({}));
      const p = j?.providers ?? {};
      const norm = (v: any): Avail => (v?.status === 'up' ? 'up' : v?.status === 'no-key' ? 'no-key' : v ? 'down' : 'unknown');
      setAvail((prev) => ({
        ...prev,
        openai: norm(p.openai),
        kokoro: norm(p.kokoro),
        sesame: norm(p.sesame),
        pplex: norm(p.pplex),
      }));
      setLatency((prev) => ({
        ...prev,
        kokoro: p.kokoro?.latencyMs ?? prev.kokoro,
        sesame: p.sesame?.latencyMs ?? prev.sesame,
        pplex: p.pplex?.latencyMs ?? prev.pplex,
      }));
    } catch {
      setAvail((prev) => ({ ...prev, openai: 'unknown', kokoro: 'unknown', sesame: 'unknown', pplex: 'unknown' }));
    }
  }, []);

  const refreshTotal = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/voice-lab/evaluations');
      if (res.ok) {
        const j = await res.json();
        setTotalCount(typeof j.count === 'number' ? j.count : null);
      }
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => {
    if (!hasPwd) return;
    refreshHealth();
    refreshTotal();
    const t = setInterval(refreshHealth, 20000);
    return () => clearInterval(t);
  }, [hasPwd, refreshHealth, refreshTotal]);

  // ── Synthesis ─────────────────────────────────────────────────────────────
  async function synthesize(provider: Provider) {
    setBusy(true);
    setError(null);
    setAudioUrl(null);
    setProvenance(null);
    try {
      const res = await adminFetch('/api/admin/voice-lab/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, voice: DEFAULT_VOICE[provider] || undefined, text: passage.text, speed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ? `${data.error}${data.reason ? ` (${data.reason})` : ''}${data.hint ? ` — ${data.hint}` : ''}` : `HTTP ${res.status}`);
        // A failed draw is itself a signal — refresh the chips.
        void refreshHealth();
        return;
      }
      setAudioUrl(`data:${data.contentType};base64,${data.audioBase64}`);
      setProvenance(data.provenance);
    } catch (e: any) {
      setError(e?.message || 'Request failed');
    } finally {
      setBusy(false);
    }
  }

  const drawAndPlay = useCallback(() => {
    if (busy) return;
    if (!drawPool.length) { setError('No available provider in the draw — check the status strip above.'); return; }
    const provider = (locked && drawPool.includes(locked)) ? locked : drawPool[Math.floor(Math.random() * drawPool.length)];
    setDrawn(provider);
    setRevealed(!blind);
    setScores({});
    setNotes('');
    setSaveMsg(null);
    void synthesize(provider);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy, drawPool, locked, blind, passageId, speed]);

  const replay = useCallback(() => {
    const el = audioRef.current;
    if (el) { el.currentTime = 0; void el.play(); }
  }, []);

  async function saveScore() {
    if (!drawn) return;
    setSaveMsg(null);
    const res = await adminFetch('/api/admin/voice-lab/evaluations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId, evaluator,
        blindLabel: blind ? 'blind' : undefined,
        requestedProvider: drawn,
        provider: provenance?.provider ?? drawn,
        voice: provenance?.voice ?? DEFAULT_VOICE[drawn],
        passageId,
        scores,
        notes,
        provenance: provenance
          ? { fallback: provenance.fallback, reason: provenance.reason, latencyMs: provenance.latencyMs }
          : undefined,
      }),
    });
    setSaveMsg(res.ok ? 'Saved ✓' : `Save failed (${res.status})`);
    if (res.ok) {
      setRevealed(true);
      setSessionCount((n) => n + 1);
      void refreshTotal();
    }
  }

  // ── Keyboard: [d] draw · [space] / [r] replay ─────────────────────────────
  useEffect(() => {
    if (!hasPwd) return;
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key === 'd') { e.preventDefault(); drawAndPlay(); }
      else if (e.key === 'r' || e.key === ' ') { if (audioUrl) { e.preventDefault(); replay(); } }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hasPwd, drawAndPlay, replay, audioUrl]);

  function saveKey() {
    if (!pwd.trim()) return;
    storeAdminPassword(pwd.trim());
    setHasPwd(true);
  }

  const scoredDims = DIMENSIONS.filter((d) => scores[d] != null).length;

  // ── Password gate ─────────────────────────────────────────────────────────
  if (!hasPwd) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
          <div>
            <h1 className="text-lg font-semibold">Voice Lab</h1>
            <p className="mt-1 text-sm text-neutral-400">Admin only. Enter the admin password (LABTOOLS_ADMIN_PASSWORD) — stored locally in this browser.</p>
          </div>
          <input
            type="password" value={pwd} onChange={(e) => setPwd(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveKey()}
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 outline-none focus:border-indigo-500"
            placeholder="admin password" autoFocus
          />
          <button onClick={saveKey} className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 transition-colors">
            Continue
          </button>
        </div>
      </div>
    );
  }

  const card = 'rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5';
  const label = 'text-[11px] font-medium uppercase tracking-wider text-neutral-500';
  const field = 'rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-indigo-500';

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-3xl px-5 py-8 space-y-5">
        {/* Header */}
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Voice Lab</h1>
            <p className="mt-0.5 text-xs text-neutral-500">
              session <span className="font-mono text-neutral-400">{sessionId}</span> · admin-only · not member-facing
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span>
              <span className="text-neutral-200 font-semibold">{sessionCount}</span> scored this session
              {totalCount != null && <span className="text-neutral-600"> · {totalCount} total</span>}
            </span>
            <a href="/api/admin/voice-lab/evaluations?format=csv" className="rounded-lg border border-neutral-700 px-3 py-1.5 text-indigo-300 hover:border-indigo-500 hover:text-indigo-200 transition-colors">
              Export CSV
            </a>
          </div>
        </header>

        {/* Live provider status strip */}
        <div className={card}>
          <div className="flex items-center justify-between">
            <div className={label}>Provider status</div>
            <button onClick={refreshHealth} className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">refresh ↻</button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PROVIDERS.map((p) => {
              const a = avail[p];
              const m = AVAIL_META[a];
              return (
                <div key={p} className={`rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 ${a === 'up' ? '' : 'opacity-80'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${m.dot}`} />
                    <span className="text-sm font-medium">{PROVIDER_LABEL[p]}</span>
                  </div>
                  <div className={`mt-1 text-[11px] ${m.text}`}>
                    {m.word}
                    {a === 'up' && latency[p] != null && <span className="text-neutral-600"> · {latency[p]}ms</span>}
                  </div>
                  {PROVIDER_ROLE[p] === 'conversational' && (
                    <div className="mt-0.5 text-[10px] text-amber-300/80">conversational · not a passage reader</div>
                  )}
                </div>
              );
            })}
          </div>
          {drawPool.length < 2 && (
            <p className="mt-3 text-[11px] text-amber-300/80">
              {drawPool.length === 0
                ? 'No provider available — start a backend before drawing.'
                : 'Only one provider available. A blind comparison needs at least two.'}
            </p>
          )}
        </div>

        {/* Step 1 — Setup */}
        <div className={card + ' space-y-4'}>
          <div className={label}>1 · Setup</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={label}>Evaluator</div>
              <select value={evaluator} onChange={(e) => setEvaluator(e.target.value)} className={'mt-1.5 w-full ' + field}>
                <option value="kelly">Kelly</option>
                <option value="larry">Larry (practitioner)</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <div className={label}>Speed · <span className="text-neutral-300">{speed.toFixed(2)}×</span></div>
              <input type="range" min={0.5} max={2} step={0.02} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="mt-3 w-full accent-indigo-500" />
            </div>
          </div>
          <div>
            <div className={label}>Passage</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {PASSAGES.map((p) => (
                <button key={p.id} onClick={() => setPassageId(p.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${passageId === p.id ? 'border-indigo-500 bg-indigo-500/15 text-indigo-200' : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'}`}>
                  {p.label}
                </button>
              ))}
            </div>
            <blockquote className="mt-3 border-l-2 border-neutral-700 pl-3 text-sm italic text-neutral-300">“{passage.text}”</blockquote>
          </div>
        </div>

        {/* Step 2 — Draw */}
        <div className={card + ' space-y-4'}>
          <div className="flex items-center justify-between">
            <div className={label}>2 · Draw</div>
            <label className="flex items-center gap-2 text-xs text-neutral-400">
              <input type="checkbox" checked={blind} onChange={(e) => setBlind(e.target.checked)} className="accent-indigo-500" />
              Blind draw
            </label>
          </div>
          <div>
            <div className={label}>Providers in the pool</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {PROVIDERS.map((p) => {
                const on = enabled[p];
                const isUp = avail[p] === 'up';
                const convo = PROVIDER_ROLE[p] === 'conversational';
                return (
                  <button key={p} disabled={convo} onClick={() => setEnabled((s) => ({ ...s, [p]: !s[p] }))}
                    title={convo ? 'Conversational engine — not scored on fixed passages' : undefined}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${convo ? 'border-neutral-800 text-neutral-600 opacity-50 cursor-not-allowed' : on ? 'border-neutral-500 bg-neutral-800 text-neutral-100' : 'border-neutral-800 text-neutral-600'} ${on && !isUp && !convo ? 'line-through decoration-red-500/60' : ''}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${AVAIL_META[avail[p]].dot}`} />
                    {PROVIDER_LABEL[p]}
                    {convo && <span className="ml-1 rounded bg-amber-500/15 px-1 text-[9px] text-amber-300">convo</span>}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-neutral-500">
              Passage lab scores <span className="text-neutral-300">passage readers</span> only. Conversational
              engines (PersonaPlex) generate speech rather than reading text — evaluate them in a dialogue instrument, not here.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className={label}>Lock to</span>
              <select value={locked ?? ''} onChange={(e) => setLocked((e.target.value || null) as Provider | null)} className={field + ' py-1'}>
                <option value="">— none (random) —</option>
                {drawPool.map((p) => <option key={p} value={p}>{PROVIDER_LABEL[p]}</option>)}
              </select>
            </div>
            <button onClick={drawAndPlay} disabled={busy || !drawPool.length}
              className="ml-auto inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {busy && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {busy ? 'Synthesizing…' : 'Draw & synthesize'}
              <kbd className="rounded bg-black/20 px-1.5 text-[10px] font-normal">d</kbd>
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-900/70 bg-red-950/50 p-3 text-sm text-red-300">{error}</div>
        )}

        {/* Step 3 + 4 — Listen & Score */}
        {drawn && (
          <div className={card + ' space-y-5'}>
            <div className="flex items-center justify-between">
              <div className={label}>3 · Listen</div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-neutral-400">Voice:</span>
                <span className={`font-mono ${revealed ? 'text-neutral-100' : 'text-amber-300'}`}>
                  {revealed ? PROVIDER_LABEL[drawn] : '● ● ● hidden'}
                </span>
                {!revealed && <button onClick={() => setRevealed(true)} className="text-xs text-neutral-500 underline hover:text-neutral-300">reveal</button>}
              </div>
            </div>

            {audioUrl && (
              <div className="flex items-center gap-3">
                <audio ref={audioRef} controls autoPlay src={audioUrl} className="w-full" />
                <button onClick={replay} title="Replay (r / space)" className="shrink-0 rounded-lg border border-neutral-700 px-3 py-2 text-xs hover:border-indigo-500 transition-colors">
                  ↻ Replay
                </button>
              </div>
            )}

            {provenance && revealed && (
              <div className="rounded-lg bg-neutral-950/60 px-3 py-2 text-[11px] font-mono text-neutral-400">
                provider=<span className="text-neutral-200">{provenance.provider}</span> · fallback={String(provenance.fallback)} · reason={provenance.reason} · {provenance.latencyMs}ms
                {provenance.provider !== provenance.requestedProvider && (
                  <span className="text-amber-400"> ⚠ rendered ≠ requested ({provenance.requestedProvider})</span>
                )}
              </div>
            )}

            {/* Score */}
            <div className="pt-1">
              <div className="flex items-center justify-between">
                <div className={label}>4 · Score</div>
                <span className="text-[11px] text-neutral-500">{scoredDims}/{DIMENSIONS.length} rated</span>
              </div>
              <div className="mt-3 space-y-2.5">
                {DIMENSIONS.map((d) => (
                  <div key={d} className="flex items-center justify-between gap-3">
                    <span className="text-sm capitalize text-neutral-300">{d.replace(/_/g, ' ')}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} onClick={() => setScores((s) => ({ ...s, [d]: n }))}
                          className={`h-8 w-8 rounded-md border text-xs transition-colors ${scores[d] === n ? 'border-indigo-400 bg-indigo-500/25 text-indigo-100' : 'border-neutral-700 text-neutral-500 hover:border-neutral-500'}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder="Notes — spoken reflection, felt sense, what you noticed…"
              className={'w-full ' + field} />

            <div className="flex items-center gap-3">
              <button onClick={saveScore}
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold hover:bg-emerald-500 transition-colors">
                Save score
              </button>
              {saveMsg && <span className={`text-sm ${saveMsg.startsWith('Saved') ? 'text-emerald-400' : 'text-red-400'}`}>{saveMsg}</span>}
              <span className="ml-auto text-[11px] text-neutral-600">saving reveals the voice</span>
            </div>
          </div>
        )}

        <footer className="pt-2 text-center text-[11px] text-neutral-700">
          Lab stack · providers are probed live · dead backend ≠ silent OpenAI substitution
        </footer>
      </div>
    </div>
  );
}
