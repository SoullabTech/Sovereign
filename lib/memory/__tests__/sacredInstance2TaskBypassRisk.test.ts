/**
 * SACRED-AS-SYMPTOM · INSTANCE 2 — the falsifier, bound to this exact mechanism.
 *
 * ⭐ **A sacred subject may be the content of an encounter. It may not become
 * the evidence that the encounter is pathological.**
 *
 * The repaired defect: `MaiaBeadsPlugin` manufactured a task-level
 * `bypassRisk` from the element name — `event.element === 'aether' ?
 * 'spiritual' : 'none'` — so a task about Aether carried a spiritual-bypass
 * classification and the identical task about Earth did not. A spec-designed
 * readiness gate would then have withheld that task from a member whose
 * measured spiritual bypassing exceeded a threshold. Latent in production, and
 * with a written future.
 *
 * ⛔ SETTING IT TO 'none' WOULD NOT HAVE BEEN THE REPAIR. `none` is also a
 * claim; absence of bypass risk was never established either. The socket is
 * removed, because a vacant socket invites a producer.
 *
 * ⚠️ WHERE THIS FILE LIVES, AND WHY IT IS NOT NEXT TO ITS SUBJECT.
 * `lib/memory/beads-sync/__tests__/` is listed in the root jest config's
 * `testPathIgnorePatterns`, so nothing under it runs in the project gate. A
 * falsifier placed beside the code it guards would never have executed —
 * an instrument that cannot be re-witnessed is not an instrument.
 */

import { MaiaBeadsPlugin } from '@/lib/memory/beads-sync/MaiaBeadsPlugin';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('@/lib/consciousness/cognitiveProfileService', () => ({
  getCognitiveProfile: jest.fn().mockResolvedValue({
    currentLevel: 4,
    rollingAverage: 4.2,
    stability: 'stable',
    bypassingFrequency: { spiritual: 0.9, intellectual: 0.1 },
  }),
}));

jest.mock('@/lib/consciousness/memory/MAIAMemoryArchitecture', () => ({
  maiaMemory: {
    generateCoherenceFieldReading: jest.fn().mockResolvedValue({
      overallCoherence: 0.7,
      spiralPosition: { currentElement: 'earth', currentPhase: 1 },
    }),
  },
}));

const matrix = {
  elementalField: { fire: 0.5, water: 0.5, earth: 0.5, air: 0.5, aether: 0.5 },
  spiralPosition: { currentElement: 'earth', currentPhase: 1, depth: 1 },
  coherence: { overall: 0.7, byElement: {} },
  cognitive: { currentLevel: 4 },
} as never;

/** One imbalance event, identical in every respect but the element. */
const imbalance = (element: string) => ({
  element,
  severity: 7,
  type: 'deficient' as const,
  recommendedProtocols: ['restoration'],
  matrix,
});

/** Everything anywhere in a created task that could carry a risk claim. */
function riskClaims(params: any): unknown[] {
  const found: unknown[] = [];
  const walk = (node: any) => {
    if (!node || typeof node !== 'object') return;
    for (const [k, v] of Object.entries(node)) {
      if (/bypass|risk/i.test(k)) found.push([k, v]);
      walk(v);
    }
  };
  walk(params);
  return found;
}

describe('the element cannot classify the member', () => {
  let plugin: MaiaBeadsPlugin;
  let created: any[];

  beforeEach(() => {
    created = [];
    plugin = new MaiaBeadsPlugin('http://localhost:0');
    (plugin as any).client = {
      createTask: jest.fn(async (params: any) => {
        created.push(params);
        return { beadsId: 'test-bead' };
      }),
      completeTask: jest.fn(),
      getReadyTasks: jest.fn(),
    };
  });

  /**
   * ⭐ ASSERTION 1 — THE SACRED-LANGUAGE SUBSTITUTION TEST, on this mechanism.
   * Changing ONLY the element must not create or change any risk classification.
   */
  it('earth ↔ aether changes no bypass-risk classification', async () => {
    await plugin.onFieldImbalance('u1', 's1', imbalance('earth'));
    await plugin.onFieldImbalance('u1', 's1', imbalance('aether'));
    expect(created).toHaveLength(2);

    const [earth, aether] = created;
    expect(riskClaims(earth)).toEqual([]);
    expect(riskClaims(aether)).toEqual([]);
    /* And the two tasks' cognitive blocks are identical, so nothing subtler
       than a named field carries the distinction either. */
    expect(aether.maiaMeta.cognitive).toEqual(earth.maiaMeta.cognitive);
  });

  /**
   * ⭐ ASSERTION 2 — STRONGER THAN EQUALITY. Not "both say none" but "the field
   * is not there at all", so the vacant socket cannot return and be filled by
   * the next producer that finds it.
   */
  it('a created task carries no task-level bypass-risk field at all', async () => {
    await plugin.onFieldImbalance('u1', 's1', imbalance('aether'));
    /* The somatic path writes tasks too, and wrote 'none' before the repair. */
    await plugin.onSomaticTensionSpike('u1', 's1', {
      bodyRegion: 'shoulders', tensionLevel: 8, matrix,
    });
    expect(created.length).toBeGreaterThanOrEqual(2);
    for (const params of created) {
      expect(riskClaims(params)).toEqual([]);
      expect(params.maiaMeta.cognitive).not.toHaveProperty('bypassRisk');
    }
  });

  /**
   * The type must not offer the socket either. A declared optional field is an
   * invitation with a schema attached.
   */
  it('the task contract declares no bypass-risk field', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'lib/memory/beads-sync/MaiaBeadsPlugin.ts'), 'utf8',
    );
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
    expect(code).not.toContain('bypassRisk');
  });
});

describe('the persistence seam manufactures nothing', () => {
  /**
   * ⭐ ASSERTION 3 — missing bypass-risk data becomes NULL, never 'none'.
   *
   * ⚠️ Asserted at source, and said so rather than dressed up: the bind sits
   * inside `syncTaskToPostgres`, a module-local function in a service that is
   * not in the production compose file and has no exported seam to call. What
   * this proves is that the code no longer defaults; it does not execute the
   * insert.
   */
  it('binds null, not a manufactured classification', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'lib/memory/beads-sync/server.ts'), 'utf8',
    );
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
    expect(code).not.toContain("bypassRisk || 'none'");
    expect(code).not.toContain('bypassRisk');
  });
});

describe('the written future no longer instructs its own reintroduction', () => {
  const read = (rel: string) =>
    fs.readFileSync(path.join(process.cwd(), rel), 'utf8');

  /**
   * ⛔ Correcting the code while leaving the spec's gate live would remove the
   * violation from the runtime and leave the instructions to rebuild it.
   */
  it('the spec designs no live bypass-risk field, producer or gate', () => {
    const spec = read('docs/SPIRAL_MEMORY_MESH_SPEC.md');
    /* Every surviving mention must be commented out inside a fenced example,
       or prose in the superseding notice. None may be live spec code. */
    for (const line of spec.split('\n')) {
      if (!line.includes('bypassRisk')) continue;
      const t = line.trim();
      const inert = t.startsWith('//') || t.startsWith('>') || t.startsWith('*');
      expect(inert).toBe(true);
    }
    expect(spec).toContain('SUPERSEDED');
  });

  it('the payload samples no longer show the field as ordinary', () => {
    expect(read('lib/memory/beads-sync/README.md')).not.toContain('bypassRisk');
    expect(read('docs/SPIRAL_MEMORY_MESH_SPEC.md'))
      .not.toContain('"bypassRisk"');
  });
});

/**
 * ⭐ THE BOUNDARY ASSERTION.
 *
 * This repair says the SACRED IS NOT A SYMPTOM. It must not be allowed to drift
 * into "spiritual bypassing can never be measured". The member's own measured
 * bypassing frequency is lawful evidence, and decisions that consume it are
 * expected to keep changing when it changes.
 */
describe('the measured member profile is untouched and still decides', () => {
  it('changing measured spiritual bypassing still changes a lawful decision', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { routePanconsciousField } = require('@/lib/field/panconsciousFieldRouter');
    const profile = (spiritual: number) => ({
      currentLevel: 5,
      rollingAverage: 4.5,
      stability: 'stable',
      bypassingFrequency: { spiritual, intellectual: 0.1 },
    });
    const low = routePanconsciousField({ cognitiveProfile: profile(0.1) } as never);
    const high = routePanconsciousField({ cognitiveProfile: profile(0.9) } as never);
    expect(high).not.toEqual(low);
    expect(String(high.reasoning)).toMatch(/bypass/i);
  });
});
