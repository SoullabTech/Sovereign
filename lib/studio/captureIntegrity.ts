/**
 * captureIntegrity — truthful degradation for Session Room recording.
 *
 * Dual-channel capture makes a claim to the practitioner: "your microphone and
 * the meeting participants are both being recorded." The Session Room shows
 * both sources as connected, and the transcript that results is read as a
 * complete record of the conversation.
 *
 * That claim is made once, at the start. Audio sources can end at any moment —
 * the practitioner stops screen-sharing, a device is unplugged, a recorder
 * faults. When that happens the interface must stop making the claim. A
 * transcript that silently becomes half a conversation while still presenting
 * as a two-source record is the same failure this whole lane exists to fix:
 * originally the two sources were captured and their distinction discarded;
 * here they would appear connected while one is no longer recorded. Different
 * mechanism, identical result for the practitioner — a transcript that looks
 * complete and is not.
 *
 * So loss is: detected, timestamped, shown without a dismiss affordance, and
 * persisted onto the session so the completed record carries it too. Recovery
 * is deliberately NOT attempted here. Knowing a lane went quiet is what makes
 * the transcript honest; getting it back is a separate problem.
 */

import type { CaptureChannel } from '@/lib/studio/audioChannels';

export type CaptureIntegrityKind = 'lane_lost' | 'upload_failed';

export interface CaptureIntegrityEvent {
  kind: CaptureIntegrityKind;
  /** Which capture lane. Upload failures carry the lane the chunk came from. */
  channel: CaptureChannel;
  /** Milliseconds since recording started — stable regardless of clock changes. */
  atMs: number;
  /** Wall-clock ISO timestamp, for the persisted record. */
  atIso: string;
  /** Human clock reading used in the warning copy, e.g. "12:41 PM". */
  atClock: string;
  /** Upload failures only: which chunk, and why. */
  chunkIndex?: number;
  reason?: string;
}

/** "12:41 PM" — the reading a practitioner can match against their own clock. */
export function formatClockTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * The warning shown when a capture lane ends mid-session.
 *
 * Says what stopped, when, and what the transcript may be missing from that
 * point. It does not speculate about why, and it does not reassure.
 */
export function laneLossMessage(channel: CaptureChannel, atClock: string): string {
  return channel === 'participants'
    ? `Participant audio stopped at ${atClock}. The transcript after this point may contain only the practitioner's microphone.`
    : `Practitioner microphone stopped at ${atClock}. The transcript after this point may contain only meeting audio.`;
}

/**
 * The warning shown when transcript chunks fail to upload.
 *
 * There is no retry yet. A failed chunk is simply gone, so the only honest
 * thing to do is say a gap exists rather than let the transcript read as
 * continuous. Counts rather than per-chunk noise: the practitioner needs to
 * know the record is incomplete, not which index failed.
 */
export function uploadFailureMessage(count: number, firstAtClock: string): string {
  const chunks = count === 1 ? '1 audio segment' : `${count} audio segments`;
  return `${chunks} failed to upload, starting at ${firstAtClock}. Those parts of the conversation are missing from the transcript.`;
}

/**
 * Warnings to display, derived from the event log.
 *
 * Lane losses are reported once per lane — a lane can only be lost once, and
 * repeating it would bury the upload warning underneath. Upload failures
 * collapse into a single count so a flaky minute does not produce forty
 * banners.
 */
export function integrityWarnings(events: CaptureIntegrityEvent[]): string[] {
  const warnings: string[] = [];

  const seenLanes = new Set<CaptureChannel>();
  for (const e of events) {
    if (e.kind !== 'lane_lost' || seenLanes.has(e.channel)) continue;
    seenLanes.add(e.channel);
    warnings.push(laneLossMessage(e.channel, e.atClock));
  }

  const failures = events.filter((e) => e.kind === 'upload_failed');
  if (failures.length > 0) {
    warnings.push(uploadFailureMessage(failures.length, failures[0].atClock));
  }

  return warnings;
}

/**
 * Whether the finished recording is an uninterrupted two-source record.
 *
 * `false` whenever any lane ended early or any chunk was lost — the completed
 * transcript must not present itself as complete in either case. Sessions that
 * never had two sources are not "interrupted"; they were single-source from
 * the start and are labeled Unattributed by the capture layer instead.
 */
export function isUninterruptedTwoSourceRecord(
  events: CaptureIntegrityEvent[],
  hadTwoSources: boolean,
): boolean {
  return hadTwoSources && events.length === 0;
}

/** Shape persisted onto supervision_sessions.metadata. */
export interface CaptureIntegrityRecord {
  hadTwoSources: boolean;
  uninterrupted: boolean;
  events: CaptureIntegrityEvent[];
}

export function buildIntegrityRecord(
  events: CaptureIntegrityEvent[],
  hadTwoSources: boolean,
): CaptureIntegrityRecord {
  return {
    hadTwoSources,
    uninterrupted: isUninterruptedTwoSourceRecord(events, hadTwoSources),
    events,
  };
}
