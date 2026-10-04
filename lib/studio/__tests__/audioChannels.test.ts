/**
 * audioChannels — capture-channel attribution invariants.
 *
 * These tests guard the three properties that make channel-derived speaker
 * attribution honest:
 *
 *   1. Two lanes never collide on chunk_index. The transcript table drops
 *      collisions via ON CONFLICT DO NOTHING, so a collision would delete a
 *      real utterance with no error raised anywhere.
 *   2. Per-session in-memory state is separable by lane. A shared key would
 *      splice one speaker's partial sentence onto the other's.
 *   3. Absent attribution never degrades into a confident single-speaker
 *      label. This is the specific regression that produced a transcript
 *      where every line read "Speaker 1".
 */

import {
  CAPTURE_CHANNELS,
  CHANNEL_LABELS,
  UNATTRIBUTED_LABEL,
  isCaptureChannel,
  laneKey,
  speakerLabelForChannel,
  stripedChunkIndex,
} from '../audioChannels';

describe('stripedChunkIndex', () => {
  it('never collides across lanes over a long session', () => {
    // 5s chunks × 720 = a full hour per lane.
    const seen = new Set<number>();
    for (let seq = 0; seq < 720; seq++) {
      for (const channel of CAPTURE_CHANNELS) {
        const idx = stripedChunkIndex(channel, seq);
        expect(seen.has(idx)).toBe(false);
        seen.add(idx);
      }
    }
    expect(seen.size).toBe(720 * CAPTURE_CHANNELS.length);
  });

  it('is stable and monotonic within a lane', () => {
    const indices = [0, 1, 2, 3].map(seq => stripedChunkIndex('participants', seq));
    expect(indices).toEqual([1, 3, 5, 7]);
    // Same input, same output — replays must not shift.
    expect(stripedChunkIndex('participants', 2)).toBe(5);
  });

  it('leaves unattributed sequences unstriped', () => {
    // Mic-only sessions have a single lane, so the raw sequence is already
    // unique and must not be perturbed.
    expect(stripedChunkIndex(null, 0)).toBe(0);
    expect(stripedChunkIndex(null, 7)).toBe(7);
  });

  it('produces non-negative indices, so striped chunks stay under the uniqueness constraint', () => {
    // The DB constraint is scoped `WHERE chunk_index >= 0`; a negative index
    // would silently opt out of collision protection.
    for (const channel of CAPTURE_CHANNELS) {
      expect(stripedChunkIndex(channel, 0)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('laneKey', () => {
  it('separates the two lanes of one session', () => {
    expect(laneKey('s1', 'practitioner')).not.toBe(laneKey('s1', 'participants'));
  });

  it('separates the same lane across different sessions', () => {
    expect(laneKey('s1', 'practitioner')).not.toBe(laneKey('s2', 'practitioner'));
  });

  it('falls back to the bare session id when nothing is attributable', () => {
    expect(laneKey('s1', null)).toBe('s1');
  });
});

describe('speakerLabelForChannel', () => {
  it('labels the mic lane as the practitioner', () => {
    expect(speakerLabelForChannel('practitioner')).toBe(CHANNEL_LABELS.practitioner);
  });

  it('labels the meeting lane with an unnamed plural', () => {
    // The tab may carry one remote person or six; the channel cannot tell.
    // The label must not imply a headcount or an identity.
    expect(speakerLabelForChannel('participants')).toBe('Participants');
  });

  it('never returns a numbered single-speaker label', () => {
    // Regression: the pipeline used to hardcode 'Speaker 1' on every chunk,
    // which read as a confident identification of one person.
    const allLabels = [
      ...CAPTURE_CHANNELS.map(speakerLabelForChannel),
      speakerLabelForChannel(null),
    ];
    for (const label of allLabels) {
      expect(label).not.toMatch(/speaker\s*\d/i);
    }
  });

  it('reports unattributed audio as unattributed rather than guessing', () => {
    expect(speakerLabelForChannel(null)).toBe(UNATTRIBUTED_LABEL);
    expect(UNATTRIBUTED_LABEL).not.toBe(CHANNEL_LABELS.practitioner);
    expect(UNATTRIBUTED_LABEL).not.toBe(CHANNEL_LABELS.participants);
  });
});

describe('isCaptureChannel', () => {
  it('accepts exactly the known channels', () => {
    for (const channel of CAPTURE_CHANNELS) {
      expect(isCaptureChannel(channel)).toBe(true);
    }
  });

  it('rejects anything else, so an unrecognised value degrades to unattributed', () => {
    // The route derives the speaker label from this guard. Any value that
    // fails it must land on UNATTRIBUTED_LABEL, never on a person.
    const rejected = [null, undefined, '', 'Speaker 1', 'client', 'PRACTITIONER', 42, {}];
    for (const value of rejected) {
      expect(isCaptureChannel(value)).toBe(false);
      expect(speakerLabelForChannel(isCaptureChannel(value) ? value : null))
        .toBe(UNATTRIBUTED_LABEL);
    }
  });
});
