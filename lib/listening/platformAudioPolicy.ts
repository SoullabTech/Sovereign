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

/** Companion mode is the only reason the native session may mix with other apps. */
export function sessionOptionsFor(companion: boolean): { mixWithOthers: boolean } {
  return { mixWithOthers: companion };
}
