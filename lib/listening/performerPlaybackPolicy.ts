/** LISTEN-01 · performer playback policy (pure, no I/O).
 *
 * A performer's video or track plays inside the performer's own platform player. Soullab never
 * starts it — only the member's own press on that player does. What Soullab controls is when it
 * must STOP, and it must never restart it:
 *   - first sound without the shared audio lease, or with MAIA speaking => pause (fail closed);
 *   - a preflight/focus request from MAIA, Reader, Writer or another music source => pause;
 *   - an interruption, route loss or backgrounding => pause; "interruption ended" does nothing;
 *   - there is no resume, play or load-and-play decision anywhere in this file, by design.
 * Reuses platformAudioPolicy (AUDIO-PLATFORM-01) rather than forking a second priority stack.
 */
import { interruptionAction, routeChangeAction } from './platformAudioPolicy';
import type { InterruptionEvent, RouteChangeEvent } from './platformAudioPolicy';
import type { AudioFocusSource } from './audioFocus';

export type PerformerPlayerState = 'unstarted' | 'buffering' | 'playing' | 'paused' | 'ended' | 'error' | 'closed';

/** The adapter a platform player exposes to Soullab. There is deliberately no play(). */
export interface PerformerPlayerAdapter {
  pause(): void;
  destroy(): void;
}

/** The output lease is held only while sound is actually playing. */
export function holdsOutput(state: PerformerPlayerState): boolean {
  return state === 'playing';
}

export type LeaseOutcome = 'granted' | 'refused';
export function decideOnPlaying(lease: LeaseOutcome, maiaSpeaking: boolean): 'keep' | 'pause' {
  return lease === 'granted' && !maiaSpeaking ? 'keep' : 'pause';
}

const PAUSING_BUS_MESSAGES: ReadonlySet<string> = new Set([
  'maia-speech-preflight', 'reader-narration-preflight', 'music-preflight',
]);
/** A preflight from another tab is a request to pause. A message is never a grant; our own tab's is ignored. */
export function decideOnBusMessage(
  message: { type?: unknown; tab?: unknown } | null | undefined,
  ownTab: string,
): 'pause' | 'ignore' {
  if (!message || typeof message !== 'object') return 'ignore';
  if (message.tab === ownTab) return 'ignore';
  return typeof message.type === 'string' && PAUSING_BUS_MESSAGES.has(message.type) ? 'pause' : 'ignore';
}

/** A focus event is a request to pause other local audio — never anything else. */
export function decideOnFocusSource(source: AudioFocusSource | null): 'pause' | 'ignore' {
  return source === null || source === 'listening-room' ? 'ignore' : 'pause';
}

export function decideOnInterruption(event: InterruptionEvent): 'pause' | 'none' {
  return interruptionAction(event);
}
export function decideOnRouteChange(event: RouteChangeEvent): 'pause' | 'none' {
  return routeChangeAction(event);
}

const PAUSING_LIFECYCLE: ReadonlySet<string> = new Set(['willResignActive', 'didEnterBackground', 'deviceLocking']);
/** Backgrounding or locking pauses; coming back never resumes. */
export function decideOnLifecycle(label: string): 'pause' | 'none' {
  return PAUSING_LIFECYCLE.has(label) ? 'pause' : 'none';
}
