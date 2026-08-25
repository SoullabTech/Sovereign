'use client';

/**
 * Offline-first capture queue (USC-04)
 *
 * The contract this serves:
 *
 *   tap → local save → haptic confirmation → queued sync → Session Room
 *
 * not:
 *
 *   tap → spin → network error → lost thought
 *
 * A capture is written to local storage and acknowledged BEFORE any network
 * call. Delivery is a background concern. Because the server is idempotent on
 * (memberId, clientCaptureId), replaying the queue is always safe — a capture
 * flushed twice resolves to the same row rather than duplicating the moment.
 *
 * This mirrors the transport guarantee a Watch client will need (queued
 * background transfer when the phone is unreachable), so USC-06 inherits the
 * same semantics rather than inventing its own.
 */

import { apiFetch } from '@/lib/http/apiBase';

const QUEUE_KEY = 'maia_capture_queue_v1';
const MAX_QUEUE = 500;

export interface QueuedCapture {
  clientCaptureId: string;
  source: 'iphone' | 'ipad' | 'web';
  modality: 'marker' | 'text' | 'voice' | 'task';
  content?: string;
  transcript?: string;
  capturedAtMs: number;
  kind?: string;
  /** Attempt count, for backoff and for surfacing a stuck queue honestly. */
  attempts: number;
}

function readQueue(): QueuedCapture[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedCapture[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(q: QueuedCapture[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-MAX_QUEUE)));
  } catch {
    // Storage full or blocked. The in-flight capture still attempts delivery;
    // we simply cannot persist it. Never throw from a capture path.
  }
}

export function queueDepth(): number {
  return readQueue().length;
}

/** Device-stamped id. This is what makes replay idempotent server-side. */
function newClientCaptureId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `cap-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/** Short haptic acknowledgement. Silent no-op where unsupported. */
export function haptic(pattern: number | number[] = 12): void {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* not supported */
  }
}

/**
 * Capture a moment.
 *
 * Returns as soon as the capture is durable locally. Delivery happens after.
 * The caller may show confirmation immediately — that is the point.
 */
export function capture(
  input: Omit<QueuedCapture, 'clientCaptureId' | 'capturedAtMs' | 'attempts'> &
    { capturedAtMs?: number }
): QueuedCapture {
  const item: QueuedCapture = {
    ...input,
    clientCaptureId: newClientCaptureId(),
    capturedAtMs: input.capturedAtMs ?? Date.now(),
    attempts: 0,
  };

  const q = readQueue();
  q.push(item);
  writeQueue(q);

  haptic();
  void flushQueue();

  return item;
}

let flushing = false;

/**
 * Attempt delivery of everything queued.
 *
 * A capture is removed from the queue only on a definitive server outcome:
 * accepted (201), already known (200 — idempotent replay), or permanently
 * rejected (4xx that will never succeed). Transport failures leave it queued.
 */
export async function flushQueue(): Promise<{ sent: number; remaining: number }> {
  if (flushing || typeof window === 'undefined') {
    return { sent: 0, remaining: queueDepth() };
  }
  if (navigator.onLine === false) {
    return { sent: 0, remaining: queueDepth() };
  }

  flushing = true;
  let sent = 0;

  try {
    let q = readQueue();

    for (const item of [...q]) {
      try {
        const res = await apiFetch('/api/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientCaptureId: item.clientCaptureId,
            source: item.source,
            modality: item.modality,
            content: item.content,
            transcript: item.transcript,
            capturedAtMs: item.capturedAtMs,
            kind: item.kind,
          }),
        });

        // 201 accepted, 200 idempotent replay — both are delivered.
        // 4xx other than 401/408/429 will never succeed; drop rather than
        // retry forever. 401 stays queued: the member may sign back in.
        const delivered = res.ok;
        const permanentlyRejected =
          res.status >= 400 && res.status < 500 &&
          ![401, 408, 429].includes(res.status);

        if (delivered || permanentlyRejected) {
          q = q.filter(i => i.clientCaptureId !== item.clientCaptureId);
          writeQueue(q);
          if (delivered) sent++;
        } else {
          item.attempts++;
          writeQueue(q);
        }
      } catch {
        // Transport failure — keep it queued and stop this pass.
        item.attempts++;
        writeQueue(q);
        break;
      }
    }

    return { sent, remaining: readQueue().length };
  } finally {
    flushing = false;
  }
}

/** Flush on reconnect and when the app returns to the foreground. */
export function installFlushTriggers(): () => void {
  if (typeof window === 'undefined') return () => {};

  const onOnline = () => { void flushQueue(); };
  const onVisible = () => {
    if (document.visibilityState === 'visible') void flushQueue();
  };

  window.addEventListener('online', onOnline);
  document.addEventListener('visibilitychange', onVisible);
  void flushQueue();

  return () => {
    window.removeEventListener('online', onOnline);
    document.removeEventListener('visibilitychange', onVisible);
  };
}
