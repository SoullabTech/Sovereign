/**
 * detectRelationalSignal — characterization suite.
 *
 * PROVENANCE (two passes, deliberately separated)
 * -----------------------------------------------
 * Pass 1 — characterization. Authored in the `claude/amazing-pascal-5d7cee`
 * lane. It pinned the detector's behaviour as-found, including the presence-gate
 * defect below, and explicitly declined to fix it: "reported separately,
 * deliberately not fixed here." That refusal is why the fix is legible as a
 * change rather than as an assertion about itself.
 *
 * Pass 2 — the fix. Authored in the `claude/gracious-feistel-33b665` lane
 * (Patch C, PRESENCE_INNER_WORDS). It updates exactly one pinned test and adds
 * one paired negative control; the remaining ~86% of this file is pass 1's work
 * verbatim. The two passes were committed together, in the lane carrying the
 * detector change, because a characterization test whose stated job is to make
 * a fix visible cannot be separated from the fix without erasing why it changed.
 *
 * WHY THIS EXISTS
 * ---------------
 * The two keyword registries in the detector are typed against the *full*
 * `CounterpartLabel` / `RelationshipTone` unions but only populated with the
 * Phase 2 subset. Any retyping of those maps (e.g. narrowing them to a
 * "lexically detectable" subset) rests on the claim that runtime behaviour is
 * unchanged. Until this file existed, that claim rested on reading a diff.
 *
 * This suite pins BEHAVIOUR, not implementation. It characterizes what the
 * detector does today — including things that are arguably wrong (see
 * "KNOWN-ODD, PINNED AS-IS" below). It is a regression net, not a spec.
 *
 * THE ONTOLOGY BEING LOCKED
 * -------------------------
 *   1. Lexical inference is PARTIAL. The detector may only ever produce the
 *      Phase 2 canonical tones. The Phase 4 additions (tender, strained,
 *      conflicted, heavy, shut_down) are MEMBER-DECLARED at Relational Field
 *      entry and must never be manufactured from text.
 *   2. Same for counterparts: the abstract Phase 4 labels (group, situation,
 *      self, unnamed_field) are member-chosen. `person` is the sole exception
 *      — it is assigned STRUCTURALLY by the named-entity fallback, never
 *      lexically. That one path is why the result type is the full union.
 *   3. The relational-presence gate returns `empty` before any inference runs.
 *
 * INSTRUMENT NOTE (read before adding cases)
 * ------------------------------------------
 * A `null` field on the result is NOT evidence that inference declined. The
 * below-threshold path returns the same frozen `empty` object as the gate, so
 * every field reads null/0 regardless of what was actually inferred. A probe
 * that does not clear SIGNAL_CONFIDENCE_THRESHOLD measures NOTHING about the
 * dimension it claims to test.
 *
 * Therefore every boundary probe below uses a frame that clears threshold via
 * contributors which do NOT themselves set the field under test:
 *   counterpart (0.25) + rupture (0.25) = 0.50, neither of which sets `tone`.
 * Each boundary block is paired with a liveness control in the IDENTICAL frame
 * that proves the channel can emit. Absent that control, "never emits X" is
 * indistinguishable from a dead instrument.
 *
 * FIXED SINCE THE CHARACTERIZATION PASS:
 *   - The presence gate's vocabulary used to be entirely interpersonal, so
 *     purely inner-relational language ("a part of me wants to leave") was
 *     rejected before the `inner` counterpart it would have matched was ever
 *     consulted. Patch C (PRESENCE_INNER_WORDS) closes that; the gate's
 *     vocabulary must cover every realm a downstream registry claims to serve.
 *     See "inner-relational language alone reaches the inference written for
 *     it" below, and its paired non-relational control.
 *
 * KNOWN-ODD, PINNED AS-IS (reported separately, deliberately not fixed here):
 *   - Below-threshold and gate-rejected are indistinguishable in the return
 *     value; only the log line separates them.
 *   - The gate covers 'outer' and 'inner' but not the third declared realm,
 *     'transpersonal' (types.ts). That is not an unreachability defect: no
 *     counterpart or dynamic registry speaks that realm, so there is nothing
 *     downstream for a gate token to reach.
 */
import { beforeEach, afterEach, describe, expect, it, jest } from '@jest/globals';

import { detectRelationalSignal } from '../detectRelationalSignal';
import {
  CANONICAL_COUNTERPART_LABELS,
  CANONICAL_TONES,
  SIGNAL_CONFIDENCE_THRESHOLD,
  type CounterpartLabel,
  type DetectedSignal,
  type RelationshipTone,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// The inference boundary, stated as data.
// ─────────────────────────────────────────────────────────────────────────────

/** Tones the detector is permitted to infer from text. */
const PHASE_2_TONES: RelationshipTone[] = [
  'tense', 'warm', 'distant', 'unresolved', 'fragile',
  'quiet', 'open', 'contracted', 'active', 'unclear',
];

/** Member-declared at Relational Field entry. The detector must never emit these. */
const PHASE_4_TONES: RelationshipTone[] = [
  'tender', 'strained', 'conflicted', 'heavy', 'shut_down',
];

/** Counterparts the detector may infer lexically. */
const PHASE_2_COUNTERPARTS: CounterpartLabel[] = [
  'partner', 'mother', 'father', 'child', 'sibling',
  'family', 'friend', 'professional', 'ex', 'inner', 'unspecified',
];

/**
 * Member-chosen abstract labels. `person` is deliberately EXCLUDED — it is
 * reachable, but only through the structural named-entity path, never lexically.
 */
const MEMBER_ONLY_COUNTERPARTS: CounterpartLabel[] = [
  'group', 'situation', 'self', 'unnamed_field',
];

const EMPTY: DetectedSignal = {
  detected: false,
  confidence: 0,
  counterpartLabel: null,
  tone: null,
  ruptureState: null,
  dynamicTags: [],
  frameworksApplied: [],
};

/**
 * Frame that clears threshold on counterpart + rupture alone (0.50), leaving
 * `tone` free to be observed. `probe` is interpolated verbatim.
 */
const toneProbeFrame = (probe: string) => `My partner feels ${probe}. We broke up.`;

// The detector logs on both refusal paths. Capture rather than silence — the
// marker is the only thing that distinguishes gate-rejection from below-threshold.
let logs: string[];
let logSpy: ReturnType<typeof jest.spyOn>;

beforeEach(() => {
  logs = [];
  logSpy = jest
    .spyOn(console, 'log')
    .mockImplementation((...args: unknown[]) => {
      // The detector logs a diagnostic OBJECT as its second argument; String()
      // would flatten it to "[object Object]" and silently blind the assertions.
      logs.push(
        args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '),
      );
    });
});

afterEach(() => logSpy.mockRestore());

const refusedAtGate = () => logs.some((l) => l.includes('gate: no relational presence'));
const refusedAtThreshold = () => logs.some((l) => l.includes('below threshold'));

// ─────────────────────────────────────────────────────────────────────────────

describe('the relational-presence gate', () => {
  it('returns the empty signal for text with no relational presence', () => {
    for (const text of [
      'The build failed again on the third step.',
      'I am refactoring the parser today.',
      'Deploy finished in four minutes.',
    ]) {
      logs = [];
      expect(detectRelationalSignal(text)).toEqual(EMPTY);
      expect(refusedAtGate()).toBe(true);
    }
  });

  it('returns the empty signal for empty and whitespace-only input', () => {
    for (const text of ['', '   ', '\n\t ']) {
      expect(detectRelationalSignal(text)).toEqual(EMPTY);
    }
    // Undefined-ish input is coerced, not thrown on.
    expect(detectRelationalSignal(undefined as unknown as string)).toEqual(EMPTY);
  });

  /**
   * A/B CONTROL for every gate assertion above. Without this, "the gate
   * rejected it" is indistinguishable from "the detector rejects everything".
   * Same tone/rupture payload; the ONLY delta is a presence token.
   */
  it('control — the identical payload IS detected once a presence token appears', () => {
    // NB: "we broke up" cannot be used here — 'we ' is itself a presence token.
    // Lowercase throughout so the named-entity path cannot contribute either.
    // Both strings score 0.45 (tense 0.20 + estranged 0.25) on their own, so the
    // ONLY thing separating them is whether the gate lets inference run at all.
    const withoutPresence = 'it has felt tense lately. totally estranged now.';
    const withPresence = 'it has felt tense with my partner lately. totally estranged now.';

    logs = [];
    expect(detectRelationalSignal(withoutPresence).detected).toBe(false);
    const gated = refusedAtGate();

    logs = [];
    const detected = detectRelationalSignal(withPresence);
    expect(detected.detected).toBe(true);
    expect(detected.tone).toBe('tense');
    expect(detected.ruptureState).toBe('ruptured');

    // The refusal above was the gate, not a weak score.
    expect(gated).toBe(true);
  });

  it('short kinship tokens do not match as substrings (Patch A boundaries)', () => {
    // 'person' ⊅ son, 'context'/'expertise' ⊅ ex, 'another' ⊅ her.
    for (const text of [
      'That person said something tense.',
      'The context of my expertise is tense.',
      'I moved another file and it felt tense.',
    ]) {
      logs = [];
      expect(detectRelationalSignal(text)).toEqual(EMPTY);
      expect(refusedAtGate()).toBe(true);
    }
  });

  it('control — the same short tokens DO pass when standing as whole words', () => {
    for (const text of [
      'My son and I are tense. We broke up.',
      'My ex and I are tense. We broke up.',
      'I am tense with her. We broke up.',
    ]) {
      expect(detectRelationalSignal(text).detected).toBe(true);
    }
  });

  /**
   * WAS "KNOWN-ODD, PINNED AS-IS" — now fixed by Patch C (inner-realm presence).
   *
   * Previously the gate's vocabulary was entirely interpersonal, so purely
   * inner-relational language was refused before the `inner` counterpart it
   * would have matched was ever consulted. The three registries authored for
   * that realm (COUNTERPART_KEYWORDS.inner, DYNAMIC_SIGNALS['parts-polarization'],
   * FRAMEWORK_KEYWORDS.ifs) were reachable only by accident, when an unrelated
   * interpersonal token happened to co-occur.
   *
   * The assertion is now the STRONGEST form of the fix: the interpersonal token
   * is no longer load-bearing, so the two readings must be *identical*. The
   * paired control below is unchanged from when it pinned the defect — it
   * passed then and passes now, which is what makes the delta legible.
   */
  it('inner-relational language alone reaches the inference written for it', () => {
    const innerOnly = 'A part of me wants to leave, another part is scared, it is tense.';
    logs = [];
    const r = detectRelationalSignal(innerOnly);

    expect(r.detected).toBe(true);
    expect(refusedAtGate()).toBe(false);
    expect(r.counterpartLabel).toBe('inner');
    expect(r.tone).toBe('tense');
    expect(r.dynamicTags).toContain('parts-polarization');
    expect(r.frameworksApplied).toContain('ifs');

    // Control, verbatim from the characterization era: identical inner language
    // with one interpersonal token prepended. It reached inference before the
    // fix and still does — the token is now inert, not load-bearing.
    const innerPlusPresence =
      'We talked and a part of me wants to leave, another part is scared, it is tense.';
    const withPresence = detectRelationalSignal(innerPlusPresence);
    expect(withPresence.detected).toBe(true);
    expect(withPresence.counterpartLabel).toBe('inner');
    expect(withPresence.dynamicTags).toContain('parts-polarization');

    // The whole point: the interpersonal token changes nothing.
    expect(r).toEqual(withPresence);
  });

  /**
   * The paired risk of Patch C. Widening the gate's vocabulary must not make
   * non-relational text detectable. The inner phrases are multi-word and
   * self-anchoring, so — unlike Patch A's short kinship tokens — they do not
   * collide as substrings. 'another part' is NOT a gate token: it is a
   * parts-polarization *dynamic*, downstream of the gate, and must stay there.
   */
  it('Patch C does not admit non-relational text that merely contains "part"', () => {
    for (const text of [
      'I moved another part of the parser and it felt tense.',
      'The tense part failed on the third step.',
      'Deploy finished — the inner loop is fine.',
    ]) {
      logs = [];
      expect(detectRelationalSignal(text)).toEqual(EMPTY);
      expect(refusedAtGate()).toBe(true);
    }
  });
});

describe('lexical inference is partial — Phase 4 tones are member-declared', () => {
  /**
   * The load-bearing test. Every case clears threshold on counterpart+rupture,
   * so `tone` is genuinely observed rather than erased by the empty return.
   */
  it.each([
    // probe word        detected tone (null = no Phase 2 keyword matched)
    ['tender', 'warm'],
    ['strained', null],
    ['conflicted', null],
    ['heavy', null],
    ['shut down', 'contracted'],
  ] as const)(
    'the word "%s" never yields a Phase 4 tone (yields %s)',
    (probe, expectedTone) => {
      const r = detectRelationalSignal(toneProbeFrame(probe));

      // Instrument liveness: the result is a real reading, not an empty.
      expect(r.detected).toBe(true);
      expect(r.confidence).toBeGreaterThanOrEqual(SIGNAL_CONFIDENCE_THRESHOLD);

      expect(r.tone).toBe(expectedTone);
      expect(PHASE_4_TONES).not.toContain(r.tone);
    },
  );

  it('control — the tone channel demonstrably emits in the identical frame', () => {
    // If this fails, every assertion above is decorative.
    expect(detectRelationalSignal(toneProbeFrame('tense')).tone).toBe('tense');
    expect(detectRelationalSignal(toneProbeFrame('warm')).tone).toBe('warm');
    expect(detectRelationalSignal(toneProbeFrame('distant')).tone).toBe('distant');
  });

  it('sweeps the whole canonical union and emits only Phase 2 tones', () => {
    const emitted = new Set<RelationshipTone>();
    let observations = 0;

    for (const tone of CANONICAL_TONES) {
      for (const probe of [tone, tone.replace(/_/g, ' ')]) {
        const r = detectRelationalSignal(toneProbeFrame(probe));
        // Only count readings that actually cleared threshold.
        if (!r.detected) continue;
        observations += 1;
        if (r.tone) emitted.add(r.tone);
      }
    }

    // The sweep saw something — guards against a silently dead loop.
    expect(observations).toBeGreaterThan(CANONICAL_TONES.length);
    expect(emitted.size).toBeGreaterThan(0);

    for (const tone of emitted) {
      expect(PHASE_2_TONES).toContain(tone);
      expect(PHASE_4_TONES).not.toContain(tone);
    }
  });

  it('a Phase 4 tone word does not leak through the assistant message either', () => {
    const r = detectRelationalSignal(
      'My partner and I are figuring things out. We broke up.',
      'That sounds tender and heavy and conflicted.',
    );
    expect(r.detected).toBe(true);
    expect(PHASE_4_TONES).not.toContain(r.tone);
    expect(r.tone).toBe('warm'); // 'tender' reads as the Phase 2 tone `warm`
  });
});

describe('counterpart labels', () => {
  it.each([
    ['My partner and I are tense.', 'partner'],
    ['My mother and I barely talk these days.', 'mother'],
    ['My father and I are tense.', 'father'],
    ['My friend and I are tense.', 'friend'],
    ['My ex and I are tense.', 'ex'],
  ] as const)('infers a Phase 2 label lexically: %s → %s', (text, label) => {
    const r = detectRelationalSignal(text);
    expect(r.detected).toBe(true);
    expect(r.counterpartLabel).toBe(label);
  });

  it('never emits a member-only abstract label, even when the word is present', () => {
    const emitted = new Set<CounterpartLabel>();
    let observations = 0;

    for (const label of CANONICAL_COUNTERPART_LABELS) {
      for (const probe of [label, label.replace(/_/g, ' ')]) {
        // tone(0.2) + rupture(0.25) clears threshold with no counterpart help,
        // so `counterpartLabel` is genuinely observed.
        const r = detectRelationalSignal(
          `The ${probe} is tense between us. We broke up.`,
        );
        if (!r.detected) continue;
        observations += 1;
        if (r.counterpartLabel) emitted.add(r.counterpartLabel);
      }
    }

    expect(observations).toBeGreaterThan(CANONICAL_COUNTERPART_LABELS.length);
    for (const label of emitted) {
      expect(MEMBER_ONLY_COUNTERPARTS).not.toContain(label);
      expect(PHASE_2_COUNTERPARTS).toContain(label);
    }
  });

  describe("'person' — the one non-lexical label, assigned structurally", () => {
    it('assigns person via the named-entity + interaction-verb fallback', () => {
      const r = detectRelationalSignal('I need to talk to Sarah, it has felt tense.');
      expect(r.detected).toBe(true);
      expect(r.counterpartLabel).toBe('person');
      // Structural assignment scores 0.30, not the lexical 0.25.
      expect(r.confidence).toBeCloseTo(0.5, 5);
    });

    it('requires BOTH a named entity and an interaction verb', () => {
      // Name, no interaction verb → no presence at all.
      logs = [];
      expect(detectRelationalSignal('I saw Sarah yesterday afternoon.')).toEqual(EMPTY);
      expect(refusedAtGate()).toBe(true);

      // Interaction verb, no name → no presence at all.
      logs = [];
      expect(detectRelationalSignal('I need to talk about the project.')).toEqual(EMPTY);
      expect(refusedAtGate()).toBe(true);
    });

    it('a lexical keyword outranks the structural fallback', () => {
      const r = detectRelationalSignal('I need to talk to Sarah, my mother, it is tense.');
      expect(r.counterpartLabel).toBe('mother');
      // Scored as lexical (0.25 + 0.20), NOT as named-entity (0.30 + 0.20).
      expect(r.confidence).toBeCloseTo(0.45, 5);
    });

    it('the named-entity path alone does not clear threshold', () => {
      logs = [];
      // 0.30 structural counterpart and nothing else < 0.40.
      expect(detectRelationalSignal('I need to talk to Sarah about the project.'))
        .toEqual(EMPTY);
      expect(refusedAtThreshold()).toBe(true);
      expect(refusedAtGate()).toBe(false);
    });
  });

  it("coalesces a missing counterpart to 'unspecified' on the detected path", () => {
    // Presence via 'relationship'; score from tone(0.2) + rupture(0.25).
    const r = detectRelationalSignal('The relationship is tense and we broke up.');
    expect(r.detected).toBe(true);
    expect(r.counterpartLabel).toBe('unspecified');
    // …whereas the refusal paths return a literal null, never 'unspecified'.
    expect(detectRelationalSignal('The build failed.').counterpartLabel).toBeNull();
  });
});

describe('the user message and the assistant message are not interchangeable', () => {
  const userOnly = 'It is tense between us.';

  it('tone, dynamics and frameworks may come from the assistant message', () => {
    const r = detectRelationalSignal(
      'My partner and I are figuring things out.',
      'That sounds tense. anxious attachment. i keep reaching, they pull back.',
    );
    expect(r.tone).toBe('tense');
    expect(r.frameworksApplied).toContain('attachment');
    expect(r.dynamicTags).toContain('pursue-withdraw');
  });

  it('the counterpart label is read from the user message only', () => {
    const r = detectRelationalSignal(userOnly, 'Your mother sounds important. my mother');
    // Would have scored 0.25 + 0.20 = 0.45 had the assistant text counted.
    expect(r).toEqual(EMPTY);
    expect(refusedAtThreshold()).toBe(true);
  });

  it('the rupture state is read from the user message only', () => {
    const r = detectRelationalSignal(userOnly, 'we broke up. betrayed. estranged.');
    expect(r).toEqual(EMPTY);
    expect(refusedAtThreshold()).toBe(true);
  });

  it('the presence gate is read from the user message only', () => {
    logs = [];
    const r = detectRelationalSignal(
      'The build failed again.',
      'my partner. between us. we broke up. it is tense.',
    );
    expect(r).toEqual(EMPTY);
    expect(refusedAtGate()).toBe(true);
  });

  it('control — those same tokens DO score when they appear in the user message', () => {
    expect(detectRelationalSignal(`${userOnly} my mother`).detected).toBe(true);
    expect(detectRelationalSignal(`${userOnly} we broke up`).detected).toBe(true);
  });
});

describe('rupture state', () => {
  it('ruptured outranks strained when both are present', () => {
    const r = detectRelationalSignal('My partner hurt me and then we broke up.');
    expect(r.ruptureState).toBe('ruptured');
  });

  it('detects strained on its own', () => {
    const r = detectRelationalSignal('My partner hurt me and there is tension.');
    expect(r.ruptureState).toBe('strained');
  });

  it("never emits 'none' or 'unclear' — those registries are empty by design", () => {
    for (const text of [
      'My partner and I are warm and close.',
      'My mother and I barely talk these days.',
      'The relationship is tense and we broke up.',
    ]) {
      const r = detectRelationalSignal(text);
      expect(r.ruptureState === 'none' || r.ruptureState === 'unclear').toBe(false);
    }
  });

  it("the word 'strained' is not itself a rupture keyword", () => {
    // Pinned as-is: rupture is inferred from what happened, not from the label.
    const r = detectRelationalSignal(toneProbeFrame('strained'));
    expect(r.detected).toBe(true);
    expect(detectRelationalSignal('My partner feels strained.')).toEqual(EMPTY);
  });
});

describe('confidence', () => {
  it('caps at 0.95 — the detector never claims certainty', () => {
    const everything =
      'My partner betrayed me, we broke up, i keep reaching, they pull back, ' +
      'anxious attachment, we tried to repair, it is tense.';
    const r = detectRelationalSignal(everything);
    expect(r.confidence).toBe(0.95);
    expect(r.confidence).toBeLessThan(1);
  });

  it('erases the computed score on the refusal path', () => {
    logs = [];
    // Scores 0.20 (tone only) — a real reading, reported as 0.
    const r = detectRelationalSignal('It is tense between us.');
    expect(r.confidence).toBe(0);
    expect(refusedAtThreshold()).toBe(true);
    // The score existed — it was computed, logged, then discarded.
    expect(logs.join(' ')).toContain('"confidence":0.2');
  });

  it('reports at least the threshold whenever detected is true', () => {
    for (const text of [
      'My partner and I are tense.',
      'My mother and I barely talk these days.',
      'I need to talk to Sarah, it has felt tense.',
      'The relationship is tense and we broke up.',
    ]) {
      const r = detectRelationalSignal(text);
      expect(r.detected).toBe(true);
      expect(r.confidence).toBeGreaterThanOrEqual(SIGNAL_CONFIDENCE_THRESHOLD);
    }
  });
});

describe('dynamic tags and frameworks', () => {
  it('caps dynamic tags at two so the reading does not overstate', () => {
    const many =
      'my partner: i keep reaching, they pull back. part of me wants to go. ' +
      'reminds me of my father. flooded and overwhelmed. it is tense.';
    const r = detectRelationalSignal(many);
    expect(r.dynamicTags).toHaveLength(2);
    expect(r.dynamicTags).toEqual(['pursue-withdraw', 'projection-loop']);
  });

  it('collects every matching framework id, uncapped', () => {
    const r = detectRelationalSignal(
      'My partner and I are tense. anxious attachment. part of me. ' +
      'nervous system. differentiation.',
    );
    expect(r.frameworksApplied).toEqual(
      expect.arrayContaining(['attachment', 'ifs', 'polyvagal', 'bowen']),
    );
  });
});

describe('the returned shape', () => {
  it('never carries a movement cue — that is member-declared in the labtool', () => {
    const r = detectRelationalSignal('My partner and I are tense. We broke up.');
    expect(r.detected).toBe(true);
    expect(r.movementCue ?? null).toBeNull();
  });

  it('returns arrays, never undefined, on both paths', () => {
    for (const r of [
      detectRelationalSignal('The build failed.'),
      detectRelationalSignal('My partner and I are tense.'),
    ]) {
      expect(Array.isArray(r.dynamicTags)).toBe(true);
      expect(Array.isArray(r.frameworksApplied)).toBe(true);
    }
  });

  it('the empty signal is not shared mutable state between calls', () => {
    const a = detectRelationalSignal('The build failed.');
    a.dynamicTags.push('triangulation');
    const b = detectRelationalSignal('The build failed.');
    expect(b.dynamicTags).toEqual([]);
  });
});
