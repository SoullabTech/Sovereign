'use client';

/**
 * Encounter Threshold — the client's entry screen. PUBLIC (guest link).
 *
 * Where an Encounter begins: the participant sees what they are agreeing to and
 * authors their own consent on their own device (spec §3 — consent is the threshold,
 * not a gate; never a checkbox the practitioner clicks for them).
 *
 * Deliberately minimal: context, the exact consent text, one explicit action.
 * No recording UI here — the recorder path exists only downstream of the consent
 * row this page writes (R-A1 DB trigger).
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  RecordingCoordinator,
  type CoordinatorState,
  type CommittedEvidence,
} from '@/lib/encounters/recordingCoordinator';

interface ThresholdContext {
  encounterId: string;
  encounterTitle: string;
  displayName: string;
  role: string;
  consentText: string;
  joined: boolean;
  recordConsented: boolean;
}

export default function ThresholdPage() {
  const params = useParams();
  const token = params?.token as string;

  const [ctx, setCtx] = useState<ThresholdContext | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'consenting' | 'consented' | 'invalid' | 'error'>('loading');

  useEffect(() => {
    if (!token) return;
    fetch(`/api/open/threshold/${token}`)
      .then(async (r) => {
        if (r.status === 404) { setState('invalid'); return; }
        if (!r.ok) { setState('error'); return; }
        const data = (await r.json()) as ThresholdContext;
        setCtx(data);
        setState(data.recordConsented ? 'consented' : 'ready');
      })
      .catch(() => setState('error'));
  }, [token]);

  const consent = useCallback(async () => {
    setState('consenting');
    try {
      const r = await fetch(`/api/open/threshold/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent: true }),
      });
      setState(r.ok ? 'consented' : 'error');
    } catch {
      setState('error');
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        {state === 'loading' && <p className="text-neutral-400 text-center">Opening the threshold…</p>}

        {state === 'invalid' && (
          <div className="text-center space-y-2">
            <h1 className="text-lg font-semibold">This link is no longer valid</h1>
            <p className="text-sm text-neutral-400">
              Threshold links expire. Please ask your practitioner for a new one.
            </p>
          </div>
        )}

        {state === 'error' && (
          <p className="text-sm text-red-300 text-center">Something went wrong. Please try again.</p>
        )}

        {ctx && (state === 'ready' || state === 'consenting') && (
          <>
            <div className="space-y-1 text-center">
              <h1 className="text-xl font-semibold">{ctx.encounterTitle}</h1>
              <p className="text-sm text-neutral-400">
                You&apos;re entering as <span className="text-neutral-200">{ctx.displayName}</span>
              </p>
            </div>

            <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-5">
              <p className="text-sm leading-relaxed text-neutral-300">{ctx.consentText}</p>
            </div>

            <button
              onClick={consent}
              disabled={state === 'consenting'}
              className="w-full px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50"
            >
              {state === 'consenting' ? 'One moment…' : 'I agree — enter the session'}
            </button>

            <p className="text-xs text-neutral-500 text-center">
              Nothing is recorded before you agree. If you close this page instead, no session begins.
            </p>
          </>
        )}

        {ctx && state === 'consented' && (
          <div className="space-y-8">
            {/* Consent opens the door: the room accepts this participant's threshold proof
                and re-verifies the consent row server-side on every signaling request. */}
            <div className="space-y-3">
              <a
                href={`/open/session-room/${ctx.encounterId}?role=${ctx.role === 'practitioner' ? 'practitioner' : 'guest'}&threshold=${encodeURIComponent(token)}`}
                className="block w-full text-center px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 font-medium"
                data-testid="enter-session-room"
              >
                Enter the session room
              </a>
              <p className="text-xs text-neutral-500 text-center">
                The room opens only for consented participants.
              </p>
            </div>

            <ConsentedRecordingSurface token={token} displayName={ctx.displayName} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Recording surface — appears only downstream of a consent row (this component is
 * unreachable otherwise). The coordinator holds the capability; if the server refuses
 * (consent missing/expired), the error is shown honestly.
 */
function ConsentedRecordingSurface({ token, displayName }: { token: string; displayName: string }) {
  const coordinatorRef = useRef<RecordingCoordinator | null>(null);
  const [recState, setRecState] = useState<CoordinatorState>('idle');
  const [detail, setDetail] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<CommittedEvidence | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (recState !== 'recording') return;
    const started = Date.now();
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(t);
  }, [recState]);

  const begin = useCallback(async () => {
    const c = new RecordingCoordinator(token, (s, d) => { setRecState(s); setDetail(d ?? null); });
    coordinatorRef.current = c;
    setEvidence(null);
    setElapsed(0);
    try { await c.begin(); } catch { /* state/detail already reflect the refusal */ }
  }, [token]);

  const stop = useCallback(async () => {
    try { setEvidence(await coordinatorRef.current?.stop() ?? null); } catch { /* state reflects it */ }
  }, []);

  const cancel = useCallback(async () => {
    try { await coordinatorRef.current?.cancel(); } catch { /* state reflects it */ }
  }, []);

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;

  return (
    <div className="text-center space-y-5">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">You&apos;re in, {displayName}</h1>
        <p className="text-sm text-neutral-400">Your consent is recorded.</p>
      </div>

      {(recState === 'idle' || recState === 'error' || recState === 'stopped' || recState === 'canceled') && (
        <button
          onClick={begin}
          className="w-full px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
          data-testid="begin-recording"
        >
          {recState === 'idle' ? 'Begin recording' : 'Record again'}
        </button>
      )}

      {recState === 'starting' && <p className="text-sm text-neutral-400">Opening your stream…</p>}

      {recState === 'recording' && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-red-300">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-sm tabular-nums" data-testid="rec-elapsed">Recording {mmss}</span>
          </div>
          <div className="flex gap-3">
            <button onClick={stop} data-testid="stop-recording"
              className="flex-1 px-4 py-3 rounded-xl bg-neutral-100 text-neutral-900 font-medium hover:bg-white">
              Stop &amp; keep
            </button>
            <button onClick={cancel} data-testid="cancel-recording"
              className="flex-1 px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-300 hover:bg-neutral-800">
              Cancel &amp; discard
            </button>
          </div>
          <p className="text-xs text-neutral-500">Cancel discards everything — nothing is kept.</p>
        </div>
      )}

      {recState === 'stopping' && <p className="text-sm text-neutral-400">Sealing…</p>}

      {recState === 'stopped' && evidence && (
        <p className="text-sm text-neutral-400" data-testid="rec-committed">
          Recording kept ({Math.round(evidence.byteSize / 1024)} KB).
        </p>
      )}
      {recState === 'canceled' && (
        <p className="text-sm text-neutral-400" data-testid="rec-canceled">Recording discarded. Nothing was kept.</p>
      )}
      {recState === 'error' && detail && (
        <p className="text-sm text-red-300" data-testid="rec-error">{detail}</p>
      )}
    </div>
  );
}
