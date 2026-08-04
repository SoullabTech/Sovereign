import {
  buildIntegrityRecord,
  formatClockTime,
  integrityWarnings,
  isUninterruptedTwoSourceRecord,
  laneLossMessage,
  uploadFailureMessage,
  type CaptureIntegrityEvent,
} from '../captureIntegrity';

const at = (clock: string): Pick<CaptureIntegrityEvent, 'atMs' | 'atIso' | 'atClock'> => ({
  atMs: 60_000,
  atIso: '2026-08-04T16:41:00.000Z',
  atClock: clock,
});

describe('laneLossMessage', () => {
  it('names what stopped, when, and what the transcript may now be missing', () => {
    expect(laneLossMessage('participants', '12:41 PM')).toBe(
      "Participant audio stopped at 12:41 PM. The transcript after this point may contain only the practitioner's microphone.",
    );
    expect(laneLossMessage('practitioner', '12:41 PM')).toBe(
      'Practitioner microphone stopped at 12:41 PM. The transcript after this point may contain only meeting audio.',
    );
  });

  it('never reassures — no "continues", no "don\'t worry"', () => {
    for (const channel of ['practitioner', 'participants'] as const) {
      const msg = laneLossMessage(channel, '9:00 AM');
      expect(msg).not.toMatch(/continu|fine|still working|no action/i);
    }
  });
});

describe('uploadFailureMessage', () => {
  it('says the audio is missing, not merely that a request failed', () => {
    const msg = uploadFailureMessage(3, '12:41 PM');
    expect(msg).toContain('3 audio segments');
    expect(msg).toContain('missing from the transcript');
  });

  it('reads correctly for a single failure', () => {
    expect(uploadFailureMessage(1, '12:41 PM')).toContain('1 audio segment failed');
  });
});

describe('integrityWarnings', () => {
  it('is empty for a clean recording', () => {
    expect(integrityWarnings([])).toEqual([]);
  });

  it('reports a lane loss once even if the track and the recorder both report it', () => {
    const events: CaptureIntegrityEvent[] = [
      { kind: 'lane_lost', channel: 'participants', reason: 'track ended', ...at('12:41 PM') },
      { kind: 'lane_lost', channel: 'participants', reason: 'recorder error', ...at('12:41 PM') },
    ];
    expect(integrityWarnings(events)).toHaveLength(1);
  });

  it('reports both lanes when both are lost', () => {
    const events: CaptureIntegrityEvent[] = [
      { kind: 'lane_lost', channel: 'participants', ...at('12:41 PM') },
      { kind: 'lane_lost', channel: 'practitioner', ...at('12:44 PM') },
    ];
    const warnings = integrityWarnings(events);
    expect(warnings).toHaveLength(2);
    expect(warnings[0]).toContain('Participant audio stopped at 12:41 PM');
    expect(warnings[1]).toContain('Practitioner microphone stopped at 12:44 PM');
  });

  it('collapses many upload failures into one counted warning, timed from the first', () => {
    const events: CaptureIntegrityEvent[] = Array.from({ length: 40 }, (_, i) => ({
      kind: 'upload_failed' as const,
      channel: 'practitioner' as const,
      chunkIndex: i * 2,
      ...at(i === 0 ? '12:41 PM' : '12:45 PM'),
    }));
    const warnings = integrityWarnings(events);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('40 audio segments');
    expect(warnings[0]).toContain('12:41 PM');
  });
});

describe('isUninterruptedTwoSourceRecord', () => {
  const loss: CaptureIntegrityEvent = {
    kind: 'lane_lost',
    channel: 'participants',
    ...at('12:41 PM'),
  };
  const failedUpload: CaptureIntegrityEvent = {
    kind: 'upload_failed',
    channel: 'practitioner',
    chunkIndex: 8,
    ...at('12:41 PM'),
  };

  it('is true only for a two-source session with nothing lost', () => {
    expect(isUninterruptedTwoSourceRecord([], true)).toBe(true);
  });

  it('is false once a lane is lost', () => {
    expect(isUninterruptedTwoSourceRecord([loss], true)).toBe(false);
  });

  // A dropped chunk leaves a hole even though both lanes stayed up. The
  // transcript is still not the complete record it appears to be.
  it('is false when a chunk failed to upload, even with both lanes alive', () => {
    expect(isUninterruptedTwoSourceRecord([failedUpload], true)).toBe(false);
  });

  // A mic-only session is not "interrupted" — it never claimed two sources.
  // It is labeled Unattributed by the capture layer instead.
  it('is false for a single-source session, which never made the claim', () => {
    expect(isUninterruptedTwoSourceRecord([], false)).toBe(false);
  });
});

describe('buildIntegrityRecord', () => {
  it('records a clean two-source session as uninterrupted', () => {
    expect(buildIntegrityRecord([], true)).toEqual({
      hadTwoSources: true,
      uninterrupted: true,
      events: [],
    });
  });

  it('carries the events so the finished session keeps the evidence', () => {
    const events: CaptureIntegrityEvent[] = [
      { kind: 'lane_lost', channel: 'participants', ...at('12:41 PM') },
    ];
    const record = buildIntegrityRecord(events, true);
    expect(record.uninterrupted).toBe(false);
    expect(record.events).toEqual(events);
  });
});

describe('formatClockTime', () => {
  it('renders a clock reading a practitioner can match against the wall', () => {
    // Fixed UTC instant; assert shape rather than a timezone-dependent value.
    expect(formatClockTime(new Date('2026-08-04T16:41:00Z'))).toMatch(/^\d{1,2}:\d{2}\s?(AM|PM)$/);
  });
});
