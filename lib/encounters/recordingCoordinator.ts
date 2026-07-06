'use client';

/**
 * Recording Coordinator — Phase B step 2 (Evidence layer, client side).
 *
 * Dependency inversion (Kelly, 2026-07-05):
 *
 *   Threshold → Consent Event → Recording Coordinator → MediaRecorder
 *
 * The recorder never asks "am I allowed?" — it receives a capability that already
 * authorizes recording. `createRecorder` below knows nothing about consent, tokens,
 * encounters, or participants: it takes a MediaStream and a sink. All constitutional
 * logic lives server-side (stream creation derives consent_event_id from the
 * participant's own consent row; the R-A1 trigger backs it structurally).
 *
 * Evidence only: no transcription, no analysis, no reads of what was said.
 */

// ── MediaRecorder wrapper — constitutionally blind ──────────────────────────
// Receives a stream and a sink. Nothing else. Keep it that way.

const CHUNK_MS = 5000;

function pickMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return 'audio/webm';
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus';
  if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
  return 'audio/mp4';
}

function createRecorder(stream: MediaStream, sink: (chunk: Blob) => void): MediaRecorder {
  const recorder = new MediaRecorder(stream, {
    mimeType: pickMimeType(),
    audioBitsPerSecond: 128000,
  });
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) sink(event.data);
  };
  return recorder;
}

// ── Coordinator ──────────────────────────────────────────────────────────────

export type CoordinatorState = 'idle' | 'starting' | 'recording' | 'stopping' | 'stopped' | 'canceled' | 'error';

export interface CommittedEvidence {
  streamId: string;
  sha256: string | null;
  byteSize: number;
}

export class RecordingCoordinator {
  private readonly token: string;
  private readonly onState: (state: CoordinatorState, detail?: string) => void;

  private streamId: string | null = null;
  private recorder: MediaRecorder | null = null;
  private micStream: MediaStream | null = null;
  private uploadQueue: Promise<void> = Promise.resolve();
  private discarded = false;
  state: CoordinatorState = 'idle';

  constructor(thresholdToken: string, onState?: (state: CoordinatorState, detail?: string) => void) {
    this.token = thresholdToken;
    this.onState = onState ?? (() => {});
  }

  private setState(state: CoordinatorState, detail?: string) {
    this.state = state;
    this.onState(state, detail);
  }

  /** Begin recording. Throws if the server refuses the capability (no consent → 403). */
  async begin(): Promise<void> {
    if (this.state !== 'idle') throw new Error(`Cannot begin from state ${this.state}`);
    this.setState('starting');
    try {
      const mimeType = pickMimeType();

      // 1. Obtain the stream capability. The server refuses without consent.
      const resp = await fetch(`/api/open/threshold/${this.token}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: mimeType }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error ?? `Stream refused (${resp.status})`);
      }
      this.streamId = (await resp.json()).streamId;

      // 2. Only now touch the microphone.
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });

      // 3. Recorder receives stream + sink. It has no idea consent exists.
      this.recorder = createRecorder(this.micStream, (chunk) => this.enqueue(chunk));
      this.recorder.start(CHUNK_MS);
      this.setState('recording');
    } catch (err) {
      this.releaseMedia();
      // If the capability was granted but the mic failed (denied/unavailable), close the
      // opened stream so no orphaned 'recording' row blocks the next attempt.
      if (this.streamId) {
        const orphan = this.streamId;
        this.streamId = null;
        fetch(`/api/open/threshold/${this.token}/stream/${orphan}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'cancel' }),
        }).catch(() => {});
      }
      this.setState('error', (err as Error).message);
      throw err;
    }
  }

  /** Stop and commit evidence: flush pending chunks, then seal server-side. */
  async stop(): Promise<CommittedEvidence> {
    if (this.state !== 'recording' || !this.streamId) throw new Error(`Cannot stop from state ${this.state}`);
    this.setState('stopping');

    await this.stopRecorderAndFlush();
    this.releaseMedia();

    const resp = await fetch(`/api/open/threshold/${this.token}/stream/${this.streamId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stop' }),
    });
    if (!resp.ok) {
      this.setState('error', 'Failed to commit evidence');
      throw new Error('Failed to commit evidence');
    }
    const data = await resp.json();
    this.setState('stopped');
    return { streamId: this.streamId, sha256: data.sha256 ?? null, byteSize: data.byteSize ?? 0 };
  }

  /** Cancel: discard local queue AND server-side media. Leaves no evidence. */
  async cancel(): Promise<void> {
    if (this.state !== 'recording' || !this.streamId) throw new Error(`Cannot cancel from state ${this.state}`);
    this.setState('stopping');

    this.discarded = true; // drop any in-flight/final chunks instead of uploading them
    await this.stopRecorderAndFlush();
    this.releaseMedia();

    const resp = await fetch(`/api/open/threshold/${this.token}/stream/${this.streamId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' }),
    });
    if (!resp.ok) {
      this.setState('error', 'Failed to cancel stream');
      throw new Error('Failed to cancel stream');
    }
    this.setState('canceled');
  }

  // ── internals ──────────────────────────────────────────────────────────────

  /** Sequential upload queue — preserves chunk append order. */
  private enqueue(chunk: Blob) {
    if (this.discarded) return;
    const streamId = this.streamId;
    if (!streamId) return;
    this.uploadQueue = this.uploadQueue.then(async () => {
      if (this.discarded) return;
      try {
        await fetch(`/api/open/threshold/${this.token}/stream/${streamId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: chunk,
        });
      } catch (err) {
        console.error('[RecordingCoordinator] chunk upload failed:', err);
      }
    });
  }

  private async stopRecorderAndFlush(): Promise<void> {
    const recorder = this.recorder;
    if (recorder && recorder.state !== 'inactive') {
      // stop() fires a final ondataavailable; wait for it before flushing the queue.
      await new Promise<void>((resolve) => {
        recorder.addEventListener('stop', () => resolve(), { once: true });
        recorder.stop();
      });
    }
    await this.uploadQueue;
  }

  private releaseMedia() {
    this.micStream?.getTracks().forEach((t) => t.stop());
    this.micStream = null;
    this.recorder = null;
  }
}
