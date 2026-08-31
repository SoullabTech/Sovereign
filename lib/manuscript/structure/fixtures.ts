/**
 * WS2-05B step 5 - a reading of each kind, without a model.
 *
 * The review surface must be able to render every outcome the interpreter can
 * produce, including the two that carry no structure at all. Fixtures make that
 * testable now, and keep it testable after MAIA enters at 5.5: if she ever
 * returns an ambiguous reading and the room has never drawn one, the member
 * meets that gap instead of the finding.
 *
 * NOT A MODEL, AND NOT A TARGET. These are shapes, not answers. Nothing here
 * encodes a reading of Elemental Alchemy - fitting the interpreter to a fixture
 * would be the failure this programme has refused since 86bab2094.
 */

import { assignUnitIds, type ProposedUnitDraft, type StructureInterpretation } from './interpret';
import type { EvidenceCoverage } from './evidence';
import { DEFAULT_READ_SCOPE } from './readScope';

export interface FixtureSection { id: string; position: number; heading: string | null }

/** A plain synthetic Work. Twelve sections, no meaning in the headings. */
export function fixtureSections(n = 12): FixtureSection[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `s${i}`, position: i, heading: `SECTION ${i}`,
  }));
}

/**
 * Parameterised on the sections passed in, for the same reason `draft` is.
 * Hardcoded `s3`/`s4` named sections a real draft does not hold, which made the
 * frozen reading uncheckable against the draft it was seeded onto - the
 * staleness comparison had nothing to read.
 */
const coverage = (
  s: readonly FixtureSection[],
  mode: EvidenceCoverage['bodies']['mode'] = 'none',
): EvidenceCoverage => {
  const sectionIds = mode === 'none' ? [] : [s[3].id, s[4].id];
  return {
    headings: 'all',
    bodies: {
      mode, sectionIds,
      /* A plausible size for two sections. Fixtures carry the ceilings too, so
         a surface drawing coverage is drawing the same shape it will get from a
         real reading. */
      totalChars: sectionIds.length * 2_400,
      truncated: false,
      sectionLimit: DEFAULT_READ_SCOPE.maxSections,
      charLimit: DEFAULT_READ_SCOPE.maxChars,
    },
    passes: mode === 'none' ? 1 : 2,
  };
};

/**
 * Built against the sections actually passed in, so a fixture reading can be
 * seeded onto ANY manuscript with enough sections - a synthetic one in a test,
 * or a real draft in a witness. Hardcoding `s0`..`s11` would have made these
 * usable only against the fixture manuscript, which is exactly the sort of
 * limit that gets discovered in the browser.
 */
const draft = (
  s: readonly FixtureSection[], from: number, to: number, title: string,
  over: Partial<ProposedUnitDraft> = {},
): ProposedUnitDraft => ({
  title, kind: null,
  fromSectionId: s[from].id, toSectionId: s[to].id,
  children: [], rationale: `the material from ${from} to ${to} holds together`,
  evidenceRefs: [], uncertainty: [], ...over,
});

const ids = (s: FixtureSection[], from: number, to: number) =>
  s.filter((x) => x.position >= from && x.position <= to).map((x) => x.id);

/** A coherent larger grammar: two parts, one holding chapters. */
export function stableReading(s = fixtureSections()): StructureInterpretation {
  return {
    form: 'stable',
    account: 'The Work divides into two movements; the first holds three shorter passages.',
    coverage: coverage(s),
    unaccountedSectionIds: [],
    uncertainRegions: [],
    units: assignUnitIds([
      draft(s, 0, 5, 'Departure', {
        kind: 'Part',
        children: [draft(s, 0, 1, 'Setting out', { kind: 'Chapter' }),
                   draft(s, 2, 3, 'The road', { kind: 'Chapter' }),
                   draft(s, 4, 5, 'The turn', { kind: 'Chapter' })],
      }),
      draft(s, 6, 11, 'Return', { kind: 'Part' }),
    ]),
  };
}

/** Some of the Work reads; some does not, and says so in place. */
export function partialReading(s = fixtureSections()): StructureInterpretation {
  return {
    form: 'partial',
    account: 'The opening organises clearly. The later material does not yet.',
    coverage: coverage(s, 'requested-full'),
    unaccountedSectionIds: ids(s, 4, 11),
    uncertainRegions: [{
      fromSectionId: s[8].id, toSectionId: s[11].id,
      why: 'These read as a contents list rather than as writing.',
    }],
    units: assignUnitIds([draft(s, 0, 3, 'Opening', { kind: 'Part' })]),
  };
}

/** Meaningfully sequential. No larger hierarchy, and none invented. */
export function flatReading(s = fixtureSections()): StructureInterpretation {
  return {
    form: 'flat',
    account: 'A sequence of essays. Nothing groups them, and nothing appears to want to.',
    coverage: coverage(s),
    unaccountedSectionIds: [],
    uncertainRegions: [],
    units: assignUnitIds([
      draft(s, 0, 3, 'On beginning', { kind: 'Essay' }),
      draft(s, 4, 7, 'On the middle', { kind: 'Essay' }),
      draft(s, 8, 11, 'On stopping', { kind: 'Essay' }),
    ]),
  };
}

/** Different regions organise differently, and siblings differ in kind. */
export function mixedReading(s = fixtureSections()): StructureInterpretation {
  return {
    form: 'mixed',
    account: 'A part of chapters, then a letter and a vignette. The form is irregular, not broken.',
    coverage: coverage(s),
    unaccountedSectionIds: [],
    uncertainRegions: [],
    units: assignUnitIds([
      draft(s, 0, 5, 'Departure', {
        kind: 'Part',
        children: [draft(s, 0, 2, 'Setting out', { kind: 'Chapter' }),
                   draft(s, 3, 5, 'The road', { kind: 'Chapter' })],
      }),
      draft(s, 6, 8, 'A letter home', { kind: 'Letter' }),
      draft(s, 9, 11, 'The window', { kind: 'Vignette' }),
    ]),
  };
}

/** Two defensible readings, and no winner chosen. */
export function ambiguousReading(s = fixtureSections()): StructureInterpretation {
  return {
    form: 'ambiguous',
    account: 'Two readings remain plausible, and the evidence does not separate them.',
    coverage: coverage(s, 'requested-full'),
    /* Nothing is accounted for: no alternative has been taken up. */
    unaccountedSectionIds: s.map((x) => x.id),
    uncertainRegions: [],
    alternatives: [
      { id: 'a1', label: 'by movement', why: 'The subject turns at 6.',
        units: assignUnitIds([draft(s, 0, 5, 'First movement'), draft(s, 6, 11, 'Second movement')]) },
      { id: 'a2', label: 'by voice', why: 'The address changes at 4.',
        units: assignUnitIds([draft(s, 0, 3, 'Spoken'), draft(s, 4, 11, 'Written')]) },
    ],
  };
}

/**
 * No larger structure is evident.
 *
 * The load-bearing fixture. A complete result with no units field at all - not
 * an empty tree, not a failure, not an empty state to apologise for. If the
 * surface cannot draw this one, the interpreter will eventually be asked not to
 * produce it.
 */
export function noStructureReading(s = fixtureSections()): StructureInterpretation {
  return {
    form: 'none',
    account: 'No stable larger structure is evident yet. The sections read as '
      + 'a continuous body of work without divisions I can see.',
    coverage: coverage(s, 'requested-full'),
    unaccountedSectionIds: s.map((x) => x.id),
    uncertainRegions: [],
  };
}

export const allReadings = {
  stable: stableReading,
  partial: partialReading,
  flat: flatReading,
  mixed: mixedReading,
  ambiguous: ambiguousReading,
  none: noStructureReading,
} as const;

export type FixtureName = keyof typeof allReadings;
