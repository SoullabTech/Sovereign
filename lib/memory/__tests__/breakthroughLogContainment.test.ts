/**
 * MEMBER-CONTENT LOG CONTAINMENT — breakthrough insight text.
 *
 * The defect this locks: `saveBreakthroughMoment` wrote the member's own
 * breakthrough insight, verbatim and in quotes, to container stdout.
 *
 * The containment rule is exact, and the near-misses are the point:
 *   · the plaintext is removed from the log;
 *   · it is NOT replaced by a hash, digest, fingerprint, embedding, excerpt,
 *     prefix, truncation, or any reversible encoding — a digest of an insight
 *     is still a handle on that insight;
 *   · the event and its member correlation survive, as do non-content
 *     diagnostics.
 *
 * Both sides are asserted here. A negative-only suite silently passes when the
 * event stops emitting at all, and a capture that stringifies with `String(arg)`
 * flattens objects to "[object Object]" — which would make every negative
 * assertion below vacuously true. The capture therefore SERIALIZES, and a
 * dedicated control test proves the check is capable of failing.
 */

const mockDbQuery = jest.fn();

jest.mock('@/lib/db/postgres', () => ({
  query: (...args: unknown[]) => mockDbQuery(...args),
}));

// The module also pulls in the lattice; it is not exercised by this function.
jest.mock('../ConsciousnessMemoryLattice', () => ({ lattice: {} }));

import { saveBreakthroughMoment } from '../RelationshipMemoryService';

// A fixture distinctive enough that an accidental substring match is not
// plausible, and containing no token the containment line could legitimately
// emit on its own.
const MEMBER_INSIGHT =
  'zqx-fixture-7741 I finally saw that the fear of being left is older than this relationship';
const MEMBER_ID = '11111111-2222-3333-4444-555555555555';

let logs: string[];
let logSpy: ReturnType<typeof jest.spyOn>;
let warnSpy: ReturnType<typeof jest.spyOn>;

/**
 * Serializing capture. `String(arg)` would render any object argument as
 * "[object Object]", so a log that passed member content inside an object
 * would sail past the negative assertions. JSON.stringify keeps it visible.
 */
const capture = (sink: string[]) => (...args: unknown[]) => {
  sink.push(
    args
      .map((a) => (typeof a === 'string' ? a : JSON.stringify(a)))
      .join(' '),
  );
};

beforeEach(() => {
  logs = [];
  mockDbQuery.mockReset().mockResolvedValue({ rows: [] });
  logSpy = jest.spyOn(console, 'log').mockImplementation(capture(logs));
  warnSpy = jest.spyOn(console, 'warn').mockImplementation(capture(logs));
});

afterEach(() => {
  logSpy.mockRestore();
  warnSpy.mockRestore();
});

const captured = () => logs.join('\n');

describe('saveBreakthroughMoment — NEGATIVE: member content never reaches stdout', () => {
  it('does not emit the insight text', async () => {
    await saveBreakthroughMoment(MEMBER_ID, MEMBER_INSIGHT, 'water', ['abandonment']);
    expect(captured()).not.toContain(MEMBER_INSIGHT);
  });

  it('does not emit any excerpt, prefix or truncation of the insight', async () => {
    await saveBreakthroughMoment(MEMBER_ID, MEMBER_INSIGHT, 'water', []);
    const out = captured();
    // Every prefix from 8 chars up. A truncation substitute would trip one.
    for (let n = 8; n <= MEMBER_INSIGHT.length; n++) {
      expect(out).not.toContain(MEMBER_INSIGHT.slice(0, n));
    }
    // ...and any distinctive interior word.
    for (const word of ['zqx-fixture-7741', 'abandonment', 'relationship', 'fear']) {
      expect(out).not.toContain(word);
    }
  });

  it('does not substitute a digest, fingerprint or encoding of the insight', async () => {
    const { createHash } = require('node:crypto') as typeof import('node:crypto');
    await saveBreakthroughMoment(MEMBER_ID, MEMBER_INSIGHT, 'water', []);
    const out = captured();

    for (const algo of ['sha256', 'sha1', 'md5']) {
      const hex = createHash(algo).update(MEMBER_INSIGHT).digest('hex');
      expect(out).not.toContain(hex);
      expect(out).not.toContain(hex.slice(0, 12));
      expect(out).not.toContain(createHash(algo).update(MEMBER_INSIGHT).digest('base64'));
    }
    expect(out).not.toContain(Buffer.from(MEMBER_INSIGHT).toString('base64'));
    expect(out).not.toContain(encodeURIComponent(MEMBER_INSIGHT));
  });

  /**
   * NON-VACUITY CONTROL. Without this, every assertion above would still pass
   * if the capture were broken, the spy never installed, or the fixture never
   * reached the code under test. Here the same capture is deliberately fed the
   * pre-fix log line, and the check must FAIL to detect it.
   */
  it('CONTROL: the containment check is capable of failing', () => {
    const control: string[] = [];
    const sink = capture(control);
    // Exactly the shape of the defect being removed.
    sink(`💡 [BREAKTHROUGH] Saved for ${MEMBER_ID}: "${MEMBER_INSIGHT}"`);
    expect(control.join('\n')).toContain(MEMBER_INSIGHT);

    // And it must see content hidden inside an OBJECT argument too — this is
    // the case a String(arg) capture would flatten to "[object Object]".
    const control2: string[] = [];
    capture(control2)('event', { insight: MEMBER_INSIGHT });
    expect(control2.join('\n')).toContain(MEMBER_INSIGHT);
  });
});

describe('saveBreakthroughMoment — POSITIVE: the event and its diagnostics survive', () => {
  it('still emits the breakthrough event marker', async () => {
    await saveBreakthroughMoment(MEMBER_ID, MEMBER_INSIGHT, 'water', []);
    expect(captured()).toContain('[BREAKTHROUGH]');
  });

  it('still carries member correlation for the event', async () => {
    await saveBreakthroughMoment(MEMBER_ID, MEMBER_INSIGHT, 'water', []);
    expect(captured()).toContain(MEMBER_ID);
  });

  it('still persists the insight — containment is about the LOG, not the record', async () => {
    await saveBreakthroughMoment(MEMBER_ID, MEMBER_INSIGHT, 'water', ['abandonment']);
    expect(mockDbQuery).toHaveBeenCalledTimes(1);
    const params = mockDbQuery.mock.calls[0][1] as unknown[];
    expect(params).toEqual([MEMBER_ID, MEMBER_INSIGHT, 'water', ['abandonment']]);
  });

  it('still reports failure without leaking the insight', async () => {
    mockDbQuery.mockRejectedValueOnce(new Error('connection refused'));
    await saveBreakthroughMoment(MEMBER_ID, MEMBER_INSIGHT, 'water', []);
    const out = captured();
    expect(out).toContain('Could not save breakthrough moment');
    expect(out).not.toContain(MEMBER_INSIGHT);
  });
});
