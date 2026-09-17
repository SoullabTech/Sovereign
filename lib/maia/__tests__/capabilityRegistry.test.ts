/**
 * MAIA-NODE-03 — NAVIGATE + bounded ORIENT.
 *
 * The drift guard lives here. `HouseDestination.id` is typed `string`, so
 * TypeScript cannot enforce that a capability names a real place; these tests
 * are the mechanical enforcement, in the idiom of
 * `lib/navigation/__tests__/houseNavDrift.test.ts`. Renaming or removing a
 * referenced House destination fails the build.
 */

import {
  CAPABILITY_REGISTRY,
  getCapability,
  type CapabilityDefinition,
} from '../capabilities';
import {
  navigationCapabilities,
  isExecutable,
  resolveNavigationIntent,
  resolveDestination,
  resolveNavigationTarget,
  resolveOrientation,
  orientationLine,
} from '../capabilityResolution';
import { HOUSE_DESTINATIONS, getDestination } from '@/lib/navigation/houseDestinations';

const NAVIGATE_SLICE = [
  'journal.open',
  'relationships.open',
  'livingField.open',
  'keeps.open',
  'writersStudio.open',
] as const;

// ───────────────────────────────────────────────────────────────────────────
describe('MAIA-NODE-03 · registry', () => {
  it('resolves a known capability', () => {
    expect(getCapability('journal.open')?.label).toBe('Journal');
  });

  it('does not make an unknown capability executable', () => {
    expect(resolveDestination('does.not.exist' as never)).toBeNull();
  });

  it('treats absent availability as unknown, never as permission', () => {
    // The thirteen pre-existing capabilities carry no availability. None of
    // them may execute merely because a field was never filled in.
    const legacy = CAPABILITY_REGISTRY.filter((c) => !c.availability);
    expect(legacy.length).toBeGreaterThan(0);
    for (const c of legacy) {
      expect(isExecutable(c)).toBe(false);
      expect(resolveDestination(c.id)).toBeNull();
    }
  });

  it('refuses a withheld capability', () => {
    for (const id of ['astrology.reading', 'astrology.transit'] as const) {
      const cap = getCapability(id)!;
      expect(cap.availability?.state).toBe('withheld');
      expect(isExecutable(cap)).toBe(false);
      expect(resolveDestination(id)).toBeNull();
    }
  });

  it('keeps the pre-existing capabilities valid and unchanged in shape', () => {
    for (const id of ['journal.create', 'wisdom.text', 'schedule.create'] as const) {
      const cap = getCapability(id);
      expect(cap).toBeDefined();
      expect(Array.isArray(cap!.voicePhrases)).toBe(true);
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('MAIA-NODE-03 · drift guard', () => {
  it('every executable NAVIGATE capability names a destination the House registers', () => {
    for (const cap of CAPABILITY_REGISTRY) {
      if (!isExecutable(cap) || cap.operationClass !== 'NAVIGATE') continue;
      expect(cap.destinationId).toBeTruthy();
      const d = getDestination(cap.destinationId!);
      // Fails loudly if a House destination is renamed or removed.
      expect({ capability: cap.id, destinationId: cap.destinationId, resolved: Boolean(d) })
        .toEqual({ capability: cap.id, destinationId: cap.destinationId, resolved: true });
    }
  });

  it('every executable capability names SOMETHING that owns execution', () => {
    // The guard generalizes rather than weakens: a NAVIGATE capability defers to
    // a House destination, a READ capability defers to a domain authority, and
    // an executable capability that defers to NEITHER would be MAIA claiming to
    // own the operation herself — which is the one thing the nodal architecture
    // forbids.
    for (const cap of CAPABILITY_REGISTRY) {
      if (!isExecutable(cap)) continue;
      const owns = Boolean(cap.destinationId) || Boolean(cap.authority);
      expect({ capability: cap.id, hasOwner: owns })
        .toEqual({ capability: cap.id, hasOwner: true });
    }
  });

  it('a capability naming a nonexistent destination cannot resolve', () => {
    const phantom: CapabilityDefinition = {
      id: 'journal.open',
      label: 'Phantom',
      voicePhrases: [],
      operationClass: 'NAVIGATE',
      destinationId: 'no-such-destination',
      availability: { state: 'executable' },
    };
    expect(getDestination(phantom.destinationId!)).toBeUndefined();
  });

  it('getDestination never synthesizes a path', () => {
    expect(getDestination('/journal')).toBeUndefined();     // a path is not an id
    expect(getDestination('')).toBeUndefined();
    expect(getDestination('journal')?.route).toBe('/journal');
  });

  it('no capability carries a member-facing NAVIGATION route of its own', () => {
    // The law is that the House owns where places ARE. A capability may name the
    // canonical API operation that owns execution (see the next test) — that is
    // a different kind of path and naming it is the point. What it may never do
    // is restate a route a member navigates to.
    const houseRoutes = HOUSE_DESTINATIONS.map((d) => d.route).filter(Boolean) as string[];
    for (const cap of CAPABILITY_REGISTRY) {
      const { authority, ...rest } = cap;
      const serialized = JSON.stringify(rest);
      expect(serialized).not.toMatch(/"\/[a-z]/);
      for (const route of houseRoutes) {
        expect(serialized).not.toContain(route);
      }
    }
  });

  it('an authority path is an API operation, never a member-facing route', () => {
    const houseRoutes = new Set(
      HOUSE_DESTINATIONS.map((d) => d.route).filter(Boolean) as string[],
    );
    for (const cap of CAPABILITY_REGISTRY) {
      if (cap.authority?.kind !== 'route') continue;
      expect(cap.authority.path.startsWith('/api/')).toBe(true);
      expect(houseRoutes.has(cap.authority.path)).toBe(false);
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('MAIA-NODE-03 · NAVIGATE resolves canonically', () => {
  it.each([
    ['take me to my journal',        'journal.open',         '/journal'],
    ['open relationships',           'relationships.open',   '/relationships'],
    ['take me to living field',      'livingField.open',     '/maia/living-field'],
    ['show me my keeps',             'keeps.open',           '/maia/keep-capture'],
    ["open writer's studio",         'writersStudio.open',   '/writers-studio'],
  ])('%s → %s', (utterance, capabilityId, route) => {
    const target = resolveNavigationTarget(utterance);
    expect(target).not.toBeNull();
    expect(target!.capability.id).toBe(capabilityId);
    // The route comes from the House, never from the capability.
    expect(target!.destination.route).toBe(route);
  });

  it('Keeps resolves to the personal Keep gesture, not a manuscript object', () => {
    const t = resolveNavigationTarget('open my keeps')!;
    expect(t.destination.id).toBe('keeps');
    expect(t.destination.route).toBe('/maia/keep-capture');
    // Saved Passages have no House destination and cannot be reached this way.
    expect(t.destination.route).not.toMatch(/manuscript|sovereign\/keeps/);
  });

  it('routes only on a whole authored phrase, never a bare noun', () => {
    // MAIA-NODE-03 §6 — MAIA may simply stay.
    for (const utterance of [
      "I'm worried about Sophie",
      'my relationship with my daughter is hard right now',
      'I keep thinking about this',
      'I wrote something in a journal years ago',
      'this feels like studio work',
      'nothing is exactly wrong, my life is just changing',
    ]) {
      expect(resolveNavigationIntent(utterance)).toBeNull();
      expect(resolveNavigationTarget(utterance)).toBeNull();
    }
  });

  it('prefers the longest authored phrase', () => {
    expect(resolveNavigationIntent('take me to my journal')!.id).toBe('journal.open');
  });

  it('is unaffected by punctuation and casing', () => {
    expect(resolveNavigationTarget('MAIA, Open Relationships!')!.capability.id)
      .toBe('relationships.open');
  });

  it('exposes exactly the five slice capabilities as navigable', () => {
    expect(navigationCapabilities().map((c) => c.id).sort())
      .toEqual([...NAVIGATE_SLICE].sort());
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('MAIA-NODE-03 · ORIENT is advisory and governed', () => {
  it('answers from authored purpose', () => {
    const o = resolveOrientation('what is living field for?');
    expect(o).not.toBeNull();
    expect(o!.capability.id).toBe('livingField.open');
    expect(o!.purpose).toBe(getCapability('livingField.open')!.purpose);
  });

  it('offers rather than instructs', () => {
    const line = orientationLine(resolveOrientation('what is living field for?')!);
    expect(line).toContain("I can take you there if you'd like.");
    expect(line).not.toMatch(/you should|you need to|you must|recommended/i);
  });

  it('does not navigate when asked a question', () => {
    // Answering "what is X for" by moving the member is not an answer.
    expect(resolveNavigationIntent('what is living field for?')).toBeNull();
    expect(resolveNavigationIntent('where do i journal?')).toBeNull();
  });

  it('says nothing about a place it has no authored purpose for', () => {
    expect(resolveOrientation('what is shadow work for?')).toBeNull();
  });

  it('ignores ordinary conversation', () => {
    expect(resolveOrientation("I'm worried about Sophie")).toBeNull();
    expect(resolveOrientation('what a day')).toBeNull();
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('MAIA-NODE-03 · safety', () => {
  it('unregistered legacy paths are not reachable as capabilities', () => {
    // Census §5: these literals exist in OracleConversation and have no House
    // destination. Old code containing a URL must not make it executable.
    for (const id of ['decisions', 'patterns', 'journey', 'worlds']) {
      expect(getDestination(id)).toBeUndefined();
    }
    const routes = HOUSE_DESTINATIONS.map((d) => d.route);
    for (const legacy of ['/studio/decisions', '/worlds/patterns', '/worlds/journey']) {
      expect(routes).not.toContain(legacy);
    }
  });

  it('Astrology cannot execute through MAIA', () => {
    expect(resolveDestination('astrology.reading')).toBeNull();
    expect(resolveNavigationTarget('show me my chart')).toBeNull();
  });

  it('no slice module performs a write, a query or a fetch', () => {
    // Scoped to CALLS, not to the words. `CapabilityAuthority` legitimately
    // declares 'DELETE' as a method a future capability could name — declaring
    // that a domain operation exists is not performing one, and a test that
    // could not tell those apart would be the kind of scanner that fails a file
    // for documenting itself.
    const read = (rel: string) =>
      require('fs')
        .readFileSync(require('path').join(process.cwd(), rel), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/[^\n]*$/gm, '');
    const modules = [
      'lib/maia/capabilityResolution.ts',
      'lib/maia/capabilities.ts',
      'lib/maia/continuity/changesContinuity.ts',
    ];
    for (const rel of modules) {
      const code = read(rel);
      for (const call of ['fetch(', 'apiFetch(', 'query(', 'db.', 'INSERT INTO', 'UPDATE ', 'DELETE FROM']) {
        expect({ module: rel, call, present: code.includes(call) })
          .toEqual({ module: rel, call, present: false });
      }
    }
  });

  it('resolution mutates no state — repeated calls are identical', () => {
    const before = CAPABILITY_REGISTRY.length;
    const beforeSnapshot = JSON.stringify(CAPABILITY_REGISTRY);
    const a = resolveNavigationTarget('open relationships');
    resolveOrientation('what is living field for?');
    resolveNavigationIntent('take me to my journal');
    const b = resolveNavigationTarget('open relationships');
    expect(a!.destination).toEqual(b!.destination);
    // Measured before/after, not a constant that would have to be edited every
    // time the registry grows — and not a comparison of a value with itself.
    expect(CAPABILITY_REGISTRY.length).toBe(before);
    expect(JSON.stringify(CAPABILITY_REGISTRY)).toBe(beforeSnapshot);
  });
});

// ───────────────────────────────────────────────────────────────────────────
describe('MAIA-NODE-03 · bounded literal conversion (§8)', () => {
  const oracle = require('fs').readFileSync(
    require('path').join(process.cwd(), 'components/OracleConversation.tsx'), 'utf8',
  );

  it('the Journal doorway resolves through the House instead of a literal', () => {
    const block = oracle.slice(
      oracle.indexOf("case 'open_journal'"),
      oracle.indexOf("case 'open_reflection'"),
    );
    expect(block).toContain("resolveDestination('journal.open')");
    expect(block).toContain('dispatchHouseDestination');
    expect(block).not.toContain("router.push('/journal')");
  });

  it('records the residual literals rather than silently refactoring them', () => {
    // MAIA-NODE-03 §8: convert only the slice path, list the rest. This test is
    // the list — it fails if one disappears or a new one is added, so the
    // residual set stays a deliberate record instead of drifting.
    const residual = [
      "router.push('/maia/ideas')",
      "router.push('/studio/decisions')",
      "router.push('/studio/changes')",
      "router.push('/worlds/patterns')",
      "router.push('/worlds/journey')",
    ];
    for (const lit of residual) expect(oracle).toContain(lit);
    // Exactly these five remain as single-quoted literals. The Journal one is
    // gone; /reflections/{id} is a template literal and is counted separately
    // below rather than folded in on an assumption.
    const pushCount = (oracle.match(/router\.push\('\//g) ?? []).length;
    expect(pushCount).toBe(residual.length);
    expect(oracle).toContain('router.push(`/reflections/${capsuleId}`)');
  });
});
