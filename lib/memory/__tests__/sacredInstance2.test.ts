/**
 * SACRED-AS-SYMPTOM · INSTANCE 2 — the repair, bound to its mechanism.
 *
 * ⭐⭐ A sacred subject may be the CONTENT of an encounter. It may not become
 *     EVIDENCE that the encounter is pathological.
 *
 * The defect: `bypassRisk: event.element === 'aether' ? 'spiritual' : 'none'` —
 * a psychological/safety classification manufactured solely from an element name.
 */

import { MaiaBeadsPlugin } from '../beads-sync/MaiaBeadsPlugin';

/**
 * ⚠️ DELIBERATELY NOT IN `beads-sync/__tests__/` — jest.config.js:37 excludes that
 * directory as "Beads infra tests", so a witness placed there would never run and
 * the canon repair would have looked verified while being unverified. This is a
 * CANON test, not an infra test, and it lives where it executes.
 */

const created: Record<string, any>[] = [];

/* The constructor takes a URL and builds its own client; the client is injected
   afterwards, as the existing infra suite does. Passing a client object made the
   plugin try to fetch `[object Object]/beads/task` — a second instrument fault,
   found and fixed before reading any verdict. */
const build = () => {
  const plugin = new MaiaBeadsPlugin('http://localhost:3100');
  (plugin as any).client = {
    createTask: async (p: Record<string, any>) => { created.push(p); return { beadsId: 'b1' }; },
    completeTask: async () => ({}),
    getReadyTasks: async () => [],
  };
  return plugin;
};

/* The real event shape — read from the signature, not guessed. My first fixture
   omitted `recommendedProtocols` and `matrix` and failed inside the plugin
   rather than at the assertion: an instrument fault, fixed before reading the
   verdict. */
const imbalance = (element: string) => ({
  element,
  severity: 6,
  type: 'deficient' as const,
  recommendedProtocols: [`${element}-restoration`],
  matrix: { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 },
});

const profile = (spiritual: number) => ({
  currentLevel: 4, rollingAverage: 4.0, stability: 'stable',
  bypassingFrequency: { spiritual, intellectual: 0.1 },
}) as any;

beforeEach(() => { created.length = 0; });

/** 1 · the substitution test, bound to THIS mechanism */
describe('changing only the element changes no classification', () => {
  it('earth and aether produce identical cognitive metadata', async () => {
    const plugin = build();
    await plugin.onFieldImbalance('u1', 's1', imbalance('earth') as any, profile(0.1));
    await plugin.onFieldImbalance('u1', 's1', imbalance('aether') as any, profile(0.1));
    const [earth, aether] = created.map(c => c.maiaMeta?.cognitive);
    expect(aether).toEqual(earth);
  });

  it.each(['fire', 'water', 'earth', 'air', 'aether'])(
    'no risk classification appears for %s', async element => {
      const plugin = build();
      await plugin.onFieldImbalance('u1', 's1', imbalance(element) as any, profile(0.1));
      expect(JSON.stringify(created.at(-1))).not.toMatch(/bypassRisk|spiritual/i);
    });
});

/** 2 · the task-level concept is gone, not neutralised */
describe('no task-level bypassRisk exists at all', () => {
  it('is absent from a field-imbalance task', async () => {
    const plugin = build();
    await plugin.onFieldImbalance('u1', 's1', imbalance('aether') as any, profile(0.9));
    expect(created.at(-1)!.maiaMeta.cognitive).not.toHaveProperty('bypassRisk');
  });

  it('⛔ is NOT present as "none" either — that is still an unevidenced claim', async () => {
    const plugin = build();
    await plugin.onFieldImbalance('u1', 's1', imbalance('earth') as any, profile(0.1));
    expect(JSON.stringify(created.at(-1))).not.toContain('none');
  });

  it('the surrounding cognitive metadata still works', async () => {
    const plugin = build();
    await plugin.onFieldImbalance('u1', 's1', imbalance('water') as any, profile(0.1));
    const c = created.at(-1)!.maiaMeta.cognitive;
    expect(c.requiredLevel).toBeDefined();
    expect(c.recommendedLevel).toBeDefined();
  });
});

/** 4 · the canon boundary — measurement is still lawful */
describe('the MEASURED member attribute is untouched', () => {
  it('the profile still carries bypassingFrequency, and it is not what was removed', () => {
    // ⭐ The canon forbids inferring from the SUBJECT MATTER of an encounter.
    // It does not forbid measuring a member's actual pattern. This assertion
    // exists so a later reader cannot mistake the repair for a ban on
    // recognising bypassing at all.
    const p = profile(0.7);
    expect(p.bypassingFrequency.spiritual).toBe(0.7);
    expect(p.bypassingFrequency.intellectual).toBe(0.1);
  });

  it('a high measured frequency still does not leak into the task', async () => {
    const plugin = build();
    await plugin.onFieldImbalance('u1', 's1', imbalance('aether') as any, profile(0.9));
    // The member's measured frequency is lawful evidence — but it is the
    // ROUTER's to consult, not something a task carries as a label.
    expect(JSON.stringify(created.at(-1))).not.toContain('0.9');
  });
});

/** 3 · the persistence seam must not recreate the claim */
describe('absence is persisted as NULL, never as "none"', () => {
  /**
   * A source assertion, and honestly labelled as one: exercising the seam would
   * require standing up the beads-sync server. What it checks is exact — that the
   * `|| 'none'` fallback is gone from the binding.
   *
   * ⭐ Comments are stripped before scanning. This file's own explanation contains
   * the forbidden string, and a scanner that reads prose can fail on a file
   * precisely because that file documents its own compliance — the C21 lesson.
   */
  const source = () => {
    const raw = require('fs').readFileSync(
      require('path').join(__dirname, '../beads-sync/server.ts'), 'utf8');
    return raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  };

  it('no longer defaults a missing bypass risk to a value', () => {
    expect(source()).not.toMatch(/bypassRisk\s*\|\|/);
  });

  it('reads no bypassRisk at the persistence boundary at all', () => {
    expect(source()).not.toContain('bypassRisk');
  });

  it('⭐ deleting the producer alone would NOT have been enough', () => {
    // The seam converted absence into an assertion at the next layer. This test
    // exists so a future reader understands why two files changed for one defect.
    expect(source()).toMatch(/null,/);
  });
});
