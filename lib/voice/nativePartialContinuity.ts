/**
 * IOS-VOICE-TRANSCRIPT-RESET-01: keep a member's words when iOS restarts a partial.
 *
 * Each native partial normally carries the whole segment so far, so replacing the
 * previous partial is correct. iOS can also restart that segment mid-speech without
 * a listeningState stop. Production telemetry on 2026-11-18 showed one spoken turn
 * fall from 454 to 2, 293 to 3 and 185 to 3 characters, and only the final 3
 * characters were sent to MAIA.
 *
 * A large drop is therefore treated as a new segment. If the recognizer was really
 * revising itself, the member sees some repeated words. That is recoverable; losing
 * what they said is not.
 */

/** Below this length, a shorter partial is more likely a revision than a restart. */
const MIN_SEGMENT_CHARS_FOR_RESET = 20;
/** A restart leaves the new partial under this fraction of the previous segment. */
const RESET_LENGTH_RATIO = 0.5;

export interface NativePartialInput {
  /** Words already kept from earlier segments of this turn. */
  heldPrefix: string;
  /** The whole turn as currently accumulated, including `heldPrefix`. */
  accumulated: string;
  /** The latest partial reported by the native recognizer. */
  incoming: string;
}

export interface NativePartialResult {
  heldPrefix: string;
  accumulated: string;
  segmentReset: boolean;
  previousSegmentLength: number;
}

export function mergeNativePartial({
  heldPrefix,
  accumulated,
  incoming,
}: NativePartialInput): NativePartialResult {
  const current = accumulated.trim();
  // An empty turn has nothing to continue, so a prefix left by a cleared turn is stale.
  const prefix = current ? heldPrefix.trim() : '';
  const next = incoming.trim();
  const previousSegment = prefix && current.startsWith(prefix)
    ? current.slice(prefix.length).trim()
    : current;

  if (!next) {
    return {
      heldPrefix: prefix,
      accumulated: current,
      segmentReset: false,
      previousSegmentLength: previousSegment.length,
    };
  }

  const segmentReset =
    previousSegment.length >= MIN_SEGMENT_CHARS_FOR_RESET &&
    next.length < previousSegment.length * RESET_LENGTH_RATIO;
  const nextPrefix = segmentReset ? current : prefix;

  return {
    heldPrefix: nextPrefix,
    accumulated: nextPrefix ? `${nextPrefix} ${next}` : next,
    segmentReset,
    previousSegmentLength: previousSegment.length,
  };
}
