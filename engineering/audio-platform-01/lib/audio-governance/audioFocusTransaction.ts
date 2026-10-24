/**
 * AUDIO-PLATFORM-01 · adapter-neutral audio focus transaction (REVIEW ONLY).
 *
 * This is a coordinator CONTRACT, NOT a replacement for the protected
 * useAudioCoordinator singleton or for native AudioSessionManager. Adapters
 * must be integrated by their current source owner.
 *
 * Guarantees in a conforming adapter:
 *  - request preference evaluation happens before an output lock attempt
 *  - target pause must be verified, not merely requested
 *  - externally authoritative identity/consent/voice-turn/media rights are
 *    checked by the owning runtime, never supplied by browser UI fields
 *  - refreshed focus is checked again after async steps
 *  - output lease is retained for playback and released exactly once
 *  - no recording/mic starts or automatic music resumption happen here
 *
 * This CANNOT coordinate separate browser profiles, other apps or devices
 * until an independently accepted platform-specific audio authority exists.
 */
import {
  decideAudioFocus,
  type AudioFocusRequest, type AudioFocusSession,
  type AudioFocusDecision,
} from './platformAudioPolicy';

export interface ExclusiveOutputLease {
  /** Must be idempotent; caller MUST release on final stop/unmount/error. */
  release(): void | Promise<void>;
}

export interface AudioFocusRuntimeAdapter {
  /** Local, ephemeral audio states. No member IDs, transcript or media URL. */
  observe(): Promise<readonly AudioFocusSession[]>;
  /** Returns true only AFTER the actual owning player confirms PAUSE. */
  pauseAndConfirm(instanceKey: string): Promise<boolean>;
  /** Independently verify current user/session/turn/consent and music rights. */
  externallyAdmitted(request: AudioFocusRequest): Promise<boolean>;
  /** Browser WebLock, native AudioSession, verified Electron IPC, Cabin IPC etc. */
  claimOutput(request: AudioFocusRequest): Promise<ExclusiveOutputLease | null>;
}

export type AudioFocusTransactionOutcome =
 | { status: 'ready'; decision: AudioFocusDecision; release: () => Promise<void> }
 | { status: 'refused'; reason: 'policy-deny'|'owner-handoff'|'external-denial'|
      'pause-unconfirmed'|'stale-snapshot'|'output-unavailable'|'runtime-error';
     decision: AudioFocusDecision };

function refused(reason: Extract<AudioFocusTransactionOutcome,{status:'refused'}>['reason'],
                 decision: AudioFocusDecision): AudioFocusTransactionOutcome {
  return { status: 'refused', reason, decision };
}

/**
 * Preflight only: it does not start audio. The returned release callback must
 * be retained by the actual speaker player. Stop, Cancel, error, signout and
 * member change must each be wired by the owning runtime to release it.
 */
export async function prepareAudioOutput(
  request: AudioFocusRequest,
  adapter: AudioFocusRuntimeAdapter,
): Promise<AudioFocusTransactionOutcome> {
  let lastDecision = decideAudioFocus(request, []);
  let lease: ExclusiveOutputLease | null = null;
  try {
    const before = await adapter.observe();
    lastDecision = decideAudioFocus(request, before);
    if (lastDecision.verdict === 'deny') return refused('policy-deny', lastDecision);
    if (lastDecision.verdict === 'owner-handoff') return refused('owner-handoff', lastDecision);
    if (!await adapter.externallyAdmitted(request)) return refused('external-denial', lastDecision);

    for (const key of lastDecision.pauseInstanceKeys) {
      if (!await adapter.pauseAndConfirm(key))
        return refused('pause-unconfirmed',lastDecision);
    }
    // Race and late-join protection: do not trust a stale preflight snapshot.
    const refreshed = decideAudioFocus(request, await adapter.observe());
    lastDecision = refreshed;
    if (refreshed.verdict !== 'attempt') return refused('stale-snapshot',refreshed);
    if (!await adapter.externallyAdmitted(request)) return refused('external-denial',refreshed);

    lease = await adapter.claimOutput(request);
    if (!lease) return refused('output-unavailable',refreshed);
    // Reverify immediately before giving the caller the output lease.
    if (!await adapter.externallyAdmitted(request)) {
      await lease.release(); lease=null;
      return refused('external-denial',refreshed);
    }
    const finalDecision = decideAudioFocus(request, await adapter.observe());
    lastDecision = finalDecision;
    if (finalDecision.verdict !== 'attempt') {
      await lease.release(); lease=null;
      return refused('stale-snapshot',finalDecision);
    }
    const owned = lease;
    lease = null;
    let released = false;
    return {status:'ready',decision:finalDecision,release:async()=>{
      if (released) return;
      released=true;
      await owned.release();
    }};
  } catch {
    if (lease) {
      try { await lease.release(); } catch { /* keep denying on cleanup failure */ }
    }
    return refused('runtime-error',lastDecision);
  }
}

export type OutputStartResult =
 | {status:'playing'; release:()=>Promise<void>}
 | {status:'refused'; reason: string};

/**
 * Optional standard start wrapper ensuring the output lock is released on
 * failure to start playback. Never initiates microphone capture.
 */
export async function startAudioWithFocus(
  request: AudioFocusRequest,
  adapter: AudioFocusRuntimeAdapter,
  beginPlaying: () => Promise<boolean>,
): Promise<OutputStartResult> {
  const ready = await prepareAudioOutput(request, adapter);
  if (ready.status !== 'ready') return {status:'refused',reason:ready.reason};
  try {
    if (!await beginPlaying()) {
      await ready.release();
      return {status:'refused',reason:'playback-failed'};
    }
    return {status:'playing',release:ready.release};
  } catch {
    await ready.release();
    return {status:'refused',reason:'playback-failed'};
  }
}
