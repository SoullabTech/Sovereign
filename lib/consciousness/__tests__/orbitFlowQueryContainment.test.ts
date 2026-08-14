/**
 * MEMBER-CONTENT LOG CONTAINMENT — the member's query text in OrbitFlow.
 *
 * `OrbitFlow.executeOrbit` logged `Query: "${context.userQuery}"` — the
 * member's own words, verbatim, at the top of every orbit.
 *
 * This suite also fixes the classification of the surrounding lines: the
 * per-element `insight` and `question` strings in this module are hard-coded
 * system templates, NOT member content, and they are asserted to survive. A
 * containment change that silenced them would be over-reach; a change that
 * leaked the query would be the original defect. Both are pinned.
 *
 * The capture SERIALIZES its arguments. `String(arg)` renders objects as
 * "[object Object]", which would make every negative assertion below vacuously
 * true; the CONTROL test proves the check can fail.
 */
import OrbitFlow, {
  FireProcessor,
  WaterProcessor,
  EarthProcessor,
  AirProcessor,
  AetherProcessor,
} from '../OrbitFlow';

const MEMBER_QUERY =
  'zqx-fixture-3308 I am stuck between leaving my marriage and abandoning my daughter';

let logs: string[];
const spies: ReturnType<typeof jest.spyOn>[] = [];

const capture = (sink: string[]) => (...args: unknown[]) => {
  sink.push(
    args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '),
  );
};

const buildOrbit = () => {
  const orbit = new OrbitFlow();
  orbit.registerProcessor('fire', new FireProcessor());
  orbit.registerProcessor('water', new WaterProcessor());
  orbit.registerProcessor('earth', new EarthProcessor());
  orbit.registerProcessor('air', new AirProcessor());
  orbit.registerProcessor('aether', new AetherProcessor());
  return orbit;
};

beforeEach(() => {
  logs = [];
  for (const level of ['log', 'warn', 'error'] as const) {
    spies.push(jest.spyOn(console, level).mockImplementation(capture(logs)));
  }
});

afterEach(() => {
  while (spies.length) spies.pop()!.mockRestore();
});

const captured = () => logs.join('\n');

describe('OrbitFlow — NEGATIVE: the member query never reaches stdout', () => {
  it('does not emit the query text anywhere across a full orbit', async () => {
    await buildOrbit().executeOrbit({ userQuery: MEMBER_QUERY });
    expect(captured()).not.toContain(MEMBER_QUERY);
  });

  it('does not emit an excerpt, prefix or digest of the query', async () => {
    const { createHash } = require('node:crypto') as typeof import('node:crypto');
    await buildOrbit().executeOrbit({ userQuery: MEMBER_QUERY });
    const out = captured();

    for (let n = 8; n <= MEMBER_QUERY.length; n++) {
      expect(out).not.toContain(MEMBER_QUERY.slice(0, n));
    }
    for (const word of ['zqx-fixture-3308', 'marriage', 'daughter', 'abandoning']) {
      expect(out).not.toContain(word);
    }
    for (const algo of ['sha256', 'sha1', 'md5']) {
      const hex = createHash(algo).update(MEMBER_QUERY).digest('hex');
      expect(out).not.toContain(hex);
      expect(out).not.toContain(hex.slice(0, 12));
    }
    expect(out).not.toContain(Buffer.from(MEMBER_QUERY).toString('base64'));
  });

  /**
   * NON-VACUITY CONTROL — the assertions above are only meaningful if this
   * capture would actually catch the pre-fix line, including content buried
   * inside an object argument.
   */
  it('CONTROL: the containment check is capable of failing', () => {
    const control: string[] = [];
    capture(control)(`Query: "${MEMBER_QUERY}"\n`);
    expect(control.join('\n')).toContain(MEMBER_QUERY);

    const control2: string[] = [];
    capture(control2)('orbit', { userQuery: MEMBER_QUERY });
    expect(control2.join('\n')).toContain(MEMBER_QUERY);
  });
});

describe('OrbitFlow — POSITIVE: the event and its diagnostics survive', () => {
  it('still announces the orbit and its completion', async () => {
    await buildOrbit().executeOrbit({ userQuery: MEMBER_QUERY });
    const out = captured();
    expect(out).toContain('MICROCOSMIC ORBIT EXECUTION');
    expect(out).toContain('ORBIT COMPLETE');
    expect(out).toContain('Query received');
    expect(out).toContain('Circuit health');
  });

  it('still emits the hard-coded elemental system strings — these are NOT member content', async () => {
    await buildOrbit().executeOrbit({ userQuery: MEMBER_QUERY });
    const out = captured();
    // Fixed template literals in FireProcessor / WaterProcessor: system-authored,
    // deliberately left in place by this unit.
    expect(out).toContain('[FIRE ASCENT]');
    expect(out).toContain('START NOW');
  });

  it('still returns the orbit result unchanged — containment touched logging only', async () => {
    const result = await buildOrbit().executeOrbit({ userQuery: MEMBER_QUERY });
    expect(result.context.userQuery).toBe(MEMBER_QUERY);
    expect(result.ascent.fire).toBeDefined();
    expect(result.response.length).toBeGreaterThan(0);
  });
});
