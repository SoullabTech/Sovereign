/**
 * Speaker-attribution provenance guard.
 *
 * The re-presentation rule corrects how pre-dual-channel transcripts are
 * DISPLAYED. Two failure directions matter equally:
 *
 *   - under-correcting: a mixed-stream session keeps rendering "Speaker 1",
 *     asserting an identification nothing ever made;
 *   - over-correcting: a session that does carry real capture-channel
 *     attribution gets flattened to Unattributed, destroying true provenance.
 */

import {
  isSingleSpeakerTranscript,
  shouldRepresentAsUnattributed,
  displaySpeakerLabel,
} from '../attributionGuard';
import { CHANNEL_LABELS, UNATTRIBUTED_LABEL } from '@/lib/studio/audioChannels';

const legacy = (n: number) => Array.from({ length: n }, () => 'Speaker 1');

describe('isSingleSpeakerTranscript', () => {
  it('is true when every line carries the same label', () => {
    expect(isSingleSpeakerTranscript(legacy(12))).toBe(true);
  });

  it('is false when labels differ', () => {
    expect(isSingleSpeakerTranscript(['Speaker 1', 'Speaker 2'])).toBe(false);
  });

  it('is false for an empty transcript — no attribution to qualify', () => {
    expect(isSingleSpeakerTranscript([])).toBe(false);
  });
});

describe('shouldRepresentAsUnattributed', () => {
  it('corrects a legacy mixed-stream session', () => {
    // The exact shape of the 2026-08-04 session: every chunk hardcoded.
    expect(shouldRepresentAsUnattributed(legacy(40))).toBe(true);
  });

  it('leaves a dual-channel session alone', () => {
    const speakers = [
      CHANNEL_LABELS.practitioner,
      CHANNEL_LABELS.participants,
      CHANNEL_LABELS.practitioner,
    ];
    expect(shouldRepresentAsUnattributed(speakers)).toBe(false);
  });

  it('leaves a single-lane session that only ever heard one channel alone', () => {
    // Real provenance, genuinely one speaker — not a mixed stream. Flattening
    // this to Unattributed would discard a true, captured attribution.
    expect(shouldRepresentAsUnattributed([CHANNEL_LABELS.practitioner])).toBe(false);
    expect(shouldRepresentAsUnattributed([CHANNEL_LABELS.participants])).toBe(false);
  });

  it('is a no-op on transcripts already recorded as unattributed', () => {
    // Mic-only sessions under the new capture path. Already honest.
    expect(displaySpeakerLabel(UNATTRIBUTED_LABEL, [UNATTRIBUTED_LABEL]))
      .toBe(UNATTRIBUTED_LABEL);
  });

  it('does not fire on an empty transcript', () => {
    expect(shouldRepresentAsUnattributed([])).toBe(false);
  });

  it('leaves a multi-label imported transcript alone', () => {
    // An import that carried real speaker names is captured attribution from
    // its own source; this rule has no authority over it.
    expect(shouldRepresentAsUnattributed(['Kelly', 'Cece', 'Kelly'])).toBe(false);
  });
});

describe('displaySpeakerLabel', () => {
  it('renders legacy segments as unattributed without touching the text record', () => {
    const speakers = legacy(3);
    for (const speaker of speakers) {
      expect(displaySpeakerLabel(speaker, speakers)).toBe(UNATTRIBUTED_LABEL);
    }
  });

  it('passes real capture-channel labels through unchanged', () => {
    const speakers = [CHANNEL_LABELS.practitioner, CHANNEL_LABELS.participants];
    expect(displaySpeakerLabel(CHANNEL_LABELS.practitioner, speakers))
      .toBe(CHANNEL_LABELS.practitioner);
    expect(displaySpeakerLabel(CHANNEL_LABELS.participants, speakers))
      .toBe(CHANNEL_LABELS.participants);
  });

  it('judges the session, not the line', () => {
    // A single legacy label inside an otherwise-attributed transcript must not
    // drag the whole session to Unattributed — the mixed-stream condition is a
    // property of how the session was captured.
    const mixed = [CHANNEL_LABELS.practitioner, CHANNEL_LABELS.participants, 'Speaker 1'];
    expect(displaySpeakerLabel('Speaker 1', mixed)).toBe('Speaker 1');
  });
});
