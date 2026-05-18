/**
 * Voice Debug Bus
 *
 * Tiny in-memory ring buffer + subscribe API for surfacing voice-path
 * diagnostics to an on-screen overlay (VoiceDebugOverlay).
 *
 * Built 2026-05-15 for PR 10 (diagnostic instrumentation) after Tara's
 * round-5 report that tapping the holoflower still produced no visible
 * effect on her Samsung Galaxy Tab — same silent-dead-state symptom as
 * round 4, despite PR #347 wiring a MediaRecorder fallback at two
 * native-failure points. We don't yet know which marker fails to fire on
 * her device, so this bus + overlay lets a tester screenshot the trace
 * and tell us where the chain breaks.
 *
 * Design rules:
 *   - In-process only. No telemetry, no network, no localStorage.
 *   - Bounded buffer (20 entries) — old entries drop off the front.
 *   - Subscribers re-render on each push; no debouncing yet (volume is
 *     low — a typical voice tap produces ~6-10 events).
 *   - Timestamp is local-time HH:MM:SS so screenshots are readable
 *     without a separate clock reference.
 *
 * Usage:
 *   import { pushVoiceDebug } from '@/lib/voice/voiceDebugBus';
 *   pushVoiceDebug('🎯 holoflower tap');
 *
 *   // In a React component:
 *   const [logs, setLogs] = useState<string[]>([]);
 *   useEffect(() => subscribeVoiceDebug(setLogs), []);
 */

type Listener = (logs: string[]) => void;

const MAX_ENTRIES = 20;
const buffer: string[] = [];
const listeners = new Set<Listener>();

function timestamp(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Append a message to the voice debug buffer and notify subscribers.
 * Also mirrors to console.log so adb logcat / Safari Web Inspector
 * captures it for engineers who can attach a debugger.
 */
export function pushVoiceDebug(msg: string): void {
  const line = `[${timestamp()}] ${msg}`;
  buffer.push(line);
  if (buffer.length > MAX_ENTRIES) buffer.shift();
  // Mirror to console — useful when device debugger is attached.
  // The 🎙️ prefix lets engineers grep logcat: `adb logcat | grep 🎙️`
  console.log('🎙️ [voiceDebug]', msg);
  for (const listener of listeners) {
    try {
      listener([...buffer]);
    } catch (err) {
      // Subscriber threw — log and continue. Never let one bad subscriber
      // break the bus for the rest.
      console.warn('[voiceDebug] subscriber threw:', err);
    }
  }
}

/**
 * Subscribe to debug-buffer updates. Returns an unsubscribe function.
 * The listener is called immediately with the current buffer so the
 * subscriber sees existing messages without waiting for a new push.
 */
export function subscribeVoiceDebug(listener: Listener): () => void {
  listeners.add(listener);
  listener([...buffer]);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Snapshot of the current buffer. Use sparingly — prefer subscribe for
 * live UI.
 */
export function getVoiceDebugLog(): string[] {
  return [...buffer];
}

/**
 * Clear the buffer. Mainly for tests; in production the ring buffer
 * self-prunes via MAX_ENTRIES.
 */
export function clearVoiceDebug(): void {
  buffer.length = 0;
  for (const listener of listeners) {
    try {
      listener([]);
    } catch {
      /* swallow */
    }
  }
}
