// LISTEN-NATIVE-AUDIO-01 · platform audio policy (pure, no I/O).
//
// What the operating system may and may not make the single Soullab player do.
// The governing law is AUDIO-PLATFORM-01: member intent starts and stops sound.
//   - an interruption, route change or lock-screen event may PAUSE the field;
//   - nothing the platform reports may RESUME it — "interruption ended, should
//     resume" is a hint the platform gives to ordinary media apps, and Soullab
//     ignores it by policy;
//   - a lock-screen Play is a member gesture and is the only remote resume;
//   - Now Playing carries a title, a passage and a clock — never content,
//     never a duration for an until-Stop field.

export type PlatformSessionSnapshot = {
  kind: 'none' | 'sketch' | 'local-file' | 'review-media';
  playback: 'idle' | 'playing' | 'paused' | 'error';
  title: string;
  subtitle?: string;
  passage?: string | null;
  elapsedMs?: number;
  durationMs?: number | null;
  continuation?: 'until-stop' | null;
};

export type NowPlayingInfo = {
  title: string;
  subtitle: string;
  passage: string | null;
  elapsedSeconds: number;
  /** null for an until-Stop field: there is no honest end to display. */
  durationSeconds: number | null;
  playing: boolean;
};

export function nowPlayingFor(snapshot: PlatformSessionSnapshot): NowPlayingInfo | null {
  if (snapshot.kind === 'none' || snapshot.playback === 'idle' || snapshot.playback === 'error') return null;
  const untilStop = snapshot.continuation === 'until-stop';
  const duration = !untilStop && typeof snapshot.durationMs === 'number' && Number.isFinite(snapshot.durationMs)
    ? Math.max(0, Math.round(snapshot.durationMs / 1000))
    : null;
  return {
    title: snapshot.title,
    subtitle: untilStop ? 'Until Stop' : (snapshot.subtitle ?? ''),
    passage: snapshot.passage ?? null,
    elapsedSeconds: Math.max(0, Math.round((snapshot.elapsedMs ?? 0) / 1000)),
    durationSeconds: duration,
    playing: snapshot.playback === 'playing',
  };
}

export type InterruptionEvent = { phase: 'began' | 'ended'; shouldResume?: boolean };
/** A call, alarm or Siri pauses the field. The end of an interruption does nothing. */
export function interruptionAction(event: InterruptionEvent): 'pause' | 'none' {
  return event.phase === 'began' ? 'pause' : 'none';
}

export type RouteChangeEvent = { reason: string };
const ROUTE_REASONS_THAT_PAUSE = new Set(['oldDeviceUnavailable']);
/**
 * Removing headphones (or a Bluetooth/AirPlay route disappearing) pauses the field,
 * so sound never moves to the built-in speaker at a level chosen for headphones.
 * A new route appearing never starts anything.
 */
export function routeChangeAction(event: RouteChangeEvent): 'pause' | 'none' {
  return ROUTE_REASONS_THAT_PAUSE.has(event.reason) ? 'pause' : 'none';
}

export type RemoteCommand = 'play' | 'pause' | 'stop' | 'toggle';
/** Lock screen and Control Center. Play here is the member's own gesture. */
export function remoteCommandAction(
  command: RemoteCommand,
  playing: boolean,
): 'resume' | 'pause' | 'stop' {
  if (command === 'stop') return 'stop';
  if (command === 'play') return 'resume';
  if (command === 'pause') return 'pause';
  return playing ? 'pause' : 'resume';
}

/**
 * "Play alongside another app" is withheld until sound can mix with other apps AND keep playing with the
 * screen locked. Measured on device (LISTEN-01, 6 Nov 2026): the native session's mixWithOthers does not govern
 * audio the web view plays, so another app starting still stops the sound, and a web-level `ambient` session
 * mixes but is silenced whenever the app leaves the foreground. A control that does not do what it says is not
 * offered. Restoring it needs audio played natively (separate lane, founder ruling).
 */
export const COMPANION_MIXING_AVAILABLE = false;

/** Companion mode is the only reason the native session may mix with other apps. */
export function sessionOptionsFor(companion: boolean): { mixWithOthers: boolean } {
  return { mixWithOthers: companion };
}

// ── Native mix ("Play with your music") ─────────────────────────────────────────────────────────────
// Ruled by the founder (LISTEN-01, 2026-11-06): the iOS app may hold a second, native player for recorded
// sounds under a single-source rule. Proven on device: it mixes with another app, survives the lock
// screen, and must STOP when an interruption begins (it restarted itself after Siri when nothing stopped it).

/** Level 0…100 → −60 … +18 dB around the recording's own level (≈77 is the file's level). Mirrors the Swift. */
export const MIX_GAIN_MIN_DB = -60;
export const MIX_GAIN_MAX_DB = 18;
export const MIX_DEFAULT_LEVEL = 80;
export function mixGainDb(level: number): number {
  const clamped = Number.isFinite(level) ? Math.max(0, Math.min(100, level)) : MIX_DEFAULT_LEVEL;
  return MIX_GAIN_MIN_DB + ((MIX_GAIN_MAX_DB - MIX_GAIN_MIN_DB) * clamped) / 100;
}

export type SoundSource = 'none' | 'web' | 'native-mix';
/** Single-source rule: exactly one Soullab sound at a time. Starting one source stops the other first. */
export function singleSourceTransition(
  current: SoundSource,
  next: 'web' | 'native-mix',
): { stopWeb: boolean; stopNative: boolean } {
  return {
    stopWeb: next === 'native-mix' && current === 'web',
    stopNative: next === 'web' && current === 'native-mix',
  };
}

export type NativeMixStopReason = 'interruption' | 'routeLoss' | 'stopped' | 'finished' | 'error' | 'replaced';
/** However the native mix ended, the platform never restarts it; only the member's own Play does. */
export function nativeMixMayRestart(_reason: NativeMixStopReason): false {
  return false;
}

