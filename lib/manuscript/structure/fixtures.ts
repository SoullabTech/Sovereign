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

import {
  assignUnitIds,
  type EditorialSynthesis, type ProposedUnitDraft, type StructureInterpretation,
} from './interpret';
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
  s: readonly FixtureSection[], from: number, to: number, title: string | null,
  over: Partial<ProposedUnitDraft> = {},
): ProposedUnitDraft => ({
  title, kind: null,
  /* Defaults to the title because a titled division needs no separate label to
     be told from its siblings. The fixture that matters overrides it - see
     `adversarialReading`, where the titles are NULL and the label is the only
     thing distinguishing five identical rows. */
  editorialLabel: title,
  fromSectionId: s[from].id, toSectionId: s[to].id,
  children: [], rationale: `the material from ${from} to ${to} holds together`,
  evidenceRefs: [], uncertainty: [], ...over,
});

/**
 * A well-formed editorial letter for a fixture reading.
 *
 * Present on every fixture because the parser now requires one of MAIA, and a
 * surface witnessed against fixtures that carry no letter would be witnessed
 * against a shape no real reading can have.
 */
const letter = (
  thesis: string, strongestFindings: string[] = [],
  questionsForAuthor: EditorialSynthesis['questionsForAuthor'] = [],
): EditorialSynthesis => ({ thesis, strongestFindings, questionsForAuthor });

const ids = (s: FixtureSection[], from: number, to: number) =>
  s.filter((x) => x.position >= from && x.position <= to).map((x) => x.id);

/** A coherent larger grammar: two parts, one holding chapters. */
export function stableReading(s = fixtureSections()): StructureInterpretation {
  return {
    form: 'stable',
    account: 'The Work divides into two movements; the first holds three shorter passages.',
    editorialSynthesis: letter(
      'A journey in two movements, with the outward leg told in three stages.',
      ['The second movement is a single sustained passage, not three more chapters.']),
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
    editorialSynthesis: letter(
      'The first quarter is a book; I cannot yet tell what the rest is.',
      ['The opening four sections hold together as one part.'],
      [{ label: 'Is the later material writing, or apparatus?',
        explanation: 'The last four sections read as a list rather than as prose, and '
          + 'I could not settle it from the headings.',
        sectionIds: [s[8].id, s[11].id] }]),
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
    editorialSynthesis: letter(
      'Three essays in sequence, and no larger frame that I would not be inventing.',
      ['Nothing in the Work asks to be grouped.']),
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
    editorialSynthesis: letter(
      'A conventional opening part, then two shorter pieces in different forms.',
      ['The irregularity looks deliberate rather than unfinished.']),
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
    editorialSynthesis: letter(
      'This Work divides twice over, and I cannot tell which division is yours.',
      [],
      [{ label: 'Does the turn happen at 4, or at 6?',
        explanation: 'The subject changes at 6 and the address changes at 4. Only you '
          + 'know which of those you were working from.',
        sectionIds: [s[4].id, s[6].id] }]),
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
    editorialSynthesis: letter(
      'This reads as one continuous body of work, and I would be inventing seams.',
      ['Nothing recurs often enough to mark a division.']),
    coverage: coverage(s, 'requested-full'),
    unaccountedSectionIds: s.map((x) => x.id),
    uncertainRegions: [],
  };
}

/**
 * THE ADVERSARIAL FIXTURE. Five identically kinded, untitled siblings.
 *
 * WHY IT EXISTS. The 8B readability witness passed mechanically and failed the
 * moment a person read the page, and the fixture is why it got that far: it was
 * built to have the same SHAPE as the real reading of Elemental Alchemy —
 * nested, mostly null titles, tags on most divisions, three uncertain regions —
 * and gave every division a DIFFERENT kind. The real reading has `element` five
 * times. Shape was the wrong property to copy.
 *
 *     test execution   ≠ type validation
 *     script execution ≠ inclusion in ship program
 *     gate identity    ≠ diagnostic identity
 *     render fidelity  ≠ intelligibility
 *     fixture shape    ≠ fixture content
 *
 * WHAT IT IS AND IS NOT. It reproduces the adversarial PROPERTIES of a real
 * reading, and it is not a reading of that book: the ranges are synthetic, the
 * account is not MAIA's, and nothing here is a target the interpreter is fitted
 * to. It is a target for the SURFACE — the one shape a review room must be able
 * to draw legibly, and the shape every earlier fixture let it dodge.
 *
 * THE FIVE SIBLINGS ARE UNTITLED AND SHARE A KIND, DELIBERATELY. Their
 * `editorialLabel` is the only thing distinguishing them, which is the whole
 * claim of the editorial reading contract: if a surface can draw this fixture
 * so a person can tell the five apart, the labels are doing their work; if it
 * cannot, no layout will save it.
 *
 * Needs 14 sections. Called with fewer, it throws rather than quietly folding
 * the divisions together — a fixture that silently shrank would stop exhibiting
 * the very property it exists for.
 */
export function adversarialReading(s = fixtureSections(14)): StructureInterpretation {
  if (s.length < 14) {
    throw new Error(`adversarialReading needs 14 sections, got ${s.length}`);
  }
  const el = (from: number, to: number, label: string,
    uncertainty: ProposedUnitDraft['uncertainty']) =>
    draft(s, from, to, null, { kind: 'element', editorialLabel: label, uncertainty });

  return {
    form: 'mixed',
    account: 'The contents apparatus promises parts and chapters; the body does not '
      + 'express them. I read the body instead as an opening, five elemental '
      + 'movements in the Work\'s own order, and an applied close.',
    editorialSynthesis: letter(
      'The scheme in your contents list is not the scheme the writing follows.',
      ['The body runs as five elemental movements, in the order the Work names them.',
        'The opening and the closing material are doing different work from each other.'],
      [{ label: 'Where does the first element begin?',
        explanation: 'The last section of the opening could as reasonably open it.',
        sectionIds: [s[2].id, s[3].id] },
      { label: 'Is the closing material a sixth movement, or applied practice?',
        explanation: 'It follows the five in sequence but changes register.',
        sectionIds: [s[13].id] }]),
    coverage: coverage(s, 'requested-full'),
    unaccountedSectionIds: [],
    uncertainRegions: [
      { fromSectionId: s[0].id, toSectionId: s[1].id,
        why: 'These may be a contents list rather than writing.' },
      { fromSectionId: s[2].id, toSectionId: s[3].id,
        why: 'The seam between the opening and the first element could sit either side.' },
      { fromSectionId: s[13].id, toSectionId: s[13].id,
        why: 'This may be a movement of the body rather than applied material.' },
    ],
    units: assignUnitIds([
      draft(s, 0, 1, null, { kind: 'front matter',
        editorialLabel: 'the contents apparatus',
        uncertainty: ['possible-scaffold-contamination'] }),
      draft(s, 2, 13, null, {
        kind: 'body', editorialLabel: 'the book itself',
        uncertainty: ['start-boundary'],
        children: [
          draft(s, 2, 2, null, { kind: 'opening movement',
            editorialLabel: 'the opening ground', uncertainty: ['end-boundary'] }),
          /* The five. Same kind, no titles, told apart by label alone. */
          el(3, 4, 'Fire', ['start-boundary']),
          el(5, 6, 'Water', ['end-boundary']),
          el(7, 8, 'Earth', ['start-boundary', 'end-boundary']),
          el(9, 10, 'Air', []),
          el(11, 12, 'Aether', ['end-boundary']),
          draft(s, 13, 13, null, { kind: 'applied movement',
            editorialLabel: 'the applied close',
            uncertainty: ['kind', 'competing-interpretation'] }),
        ],
      }),
    ]),
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

/**
 * Kept OUT of `allReadings` deliberately.
 *
 * `allReadings` is one reading of each FORM, and every consumer that iterates
 * it is asserting something about the six outcomes. `adversarialReading` is a
 * second `mixed`, so adding it would silently turn "each form once" into "each
 * form once, except mixed twice" in every one of those loops. It is asked for
 * by name, by the surfaces that need to prove they can draw it.
 */

export type FixtureName = keyof typeof allReadings;
