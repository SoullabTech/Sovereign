/**
 * BUILD-07A — the frozen evidence substrate, model-free.
 *
 * THE QUESTION THIS ANSWERS, and the one it refuses:
 *
 *     HISTORICAL DISPLAY   what did this observation rest on?
 *                          → resolves against the reading's frozen state
 *                          → MUST always succeed, or the reading was never
 *                            recoverable and INV-7b is unmet
 *
 *     CURRENT LOCATION     where is that passage in the Work as it stands now?
 *                          → MAY fail
 *                          → failure is a SUPERSESSION SIGNAL, not an error
 *
 * ⛔ CONFLATING THEM IS THE DEFECT. An implementation that fuzzy-matches a moved
 * passage to keep the second operation succeeding has invented evidence for the
 * first. Nothing here matches text approximately, ever.
 *
 * ⛔ A DIGEST COMPARES; IT DOES NOT RECOVER. INV-7b: a bare content hash proves
 * the live text differs from what was read while being unable to reconstruct
 * what was read, and an observation whose evidence cannot be recovered is an
 * assertion the author cannot check. Recovery here runs through an IMMUTABLE
 * revision plus its section partition — the relation the recoverability ruling
 * authorized in place of a second prose store.
 *
 * ⛔ NO PROSE IS STORED HERE. A frozen section state carries an ADDRESS, not
 * text. The words live in `working_draft_revisions`, once, and are resolved on
 * demand. Anything in this file that came to hold a copy of the member's
 * sentences would be the second custody domain the ruling rejected.
 *
 * ⛔ THE UNICODE DISCIPLINE CARRIES FORWARD. Partition ranges are CODE-POINT
 * locators, and so are the spans here. They are never handed to
 * `String.prototype.slice`, which indexes UTF-16 code units: the two index
 * spaces differ on every astral character, and a mismatched slice returns a lone
 * surrogate where a character was — evidence the member never wrote, in the one
 * path whose entire purpose is exactness.
 *
 * WHAT THIS FILE IS NOT. No model call, no provider import, no interpretation,
 * no DevelopmentalReading, no surface. It answers mechanical questions only.
 */
import {
  codePointLength,
  sectionsFromPartition,
  type DraftSectionState,
  type RevisionSectionRange,
} from '@/lib/manuscript/draftSections';

/* ── coverage ────────────────────────────────────────────────────────────── */

/**
 * How deeply one section was actually read.
 *
 * Ordered: `body` includes `heading`. A section whose prose was read was also
 * seen titled; the reverse is not true, and INV-8 turns on exactly that
 * asymmetry.
 *
 * ⛔ NOT A PERCENTAGE. Coverage is reported at the granularity of the claim, so
 * it is per section and named, never a fraction that averages away which
 * sections went unread.
 */
export type ReadDepth = 'heading' | 'body';

const DEPTH_RANK: Record<ReadDepth, number> = { heading: 0, body: 1 };

/** Whether `held` satisfies a requirement for at least `required`. */
export function depthSatisfies(held: ReadDepth, required: ReadDepth): boolean {
  return DEPTH_RANK[held] >= DEPTH_RANK[required];
}

/* ── evidence ────────────────────────────────────────────────────────────── */

/**
 * A span within one section, in CODE POINTS, half-open.
 *
 * Section-relative rather than revision-relative: "this passage of section S" is
 * what the locator means, and it stays meaningful when read back beside the
 * section it belongs to.
 */
export interface CodePointSpan {
  start: number;
  /** Exclusive. */
  end: number;
}

/**
 * A durable locator into a reading's frozen state.
 *
 * ⛔ IT CARRIES NO VERSION OF ITS OWN (INV-6). The READING carries the revision;
 * a ref that carried its own would let two refs in one reading disagree about
 * which Work they read, and the reading could no longer say what it rested on.
 *
 * ⛔ THE KIND IS DECLARED, NEVER INFERRED FROM WHICH OPTIONAL FIELDS ARE PRESENT
 * (falsifier 9). Every variant is discriminated and total; a ref whose kind had
 * to be guessed from the shape of its payload is a ref whose coverage
 * requirement can be dodged by omitting a field.
 */
export type EvidenceRef =
  /** Derived from the member's prose. Requires body depth. */
  | { kind: 'textual'; sectionId: string; span: CodePointSpan }
  /** Derived from the member's own heading line. Requires heading depth. */
  | { kind: 'heading'; sectionId: string }
  /** Derived from authored structure. Requires no section coverage at all. */
  | { kind: 'authored-structure'; unitId: string };

/** The coverage depth a given kind of evidence must be backed by (INV-8). */
export function requiredDepth(ref: EvidenceRef): ReadDepth | null {
  switch (ref.kind) {
    case 'textual':
      /* The forbidden mismatch INV-8 names: a prose-derived claim resting on
         prose she did not read. */
      return 'body';
    case 'heading':
      return 'heading';
    case 'authored-structure':
      /* Not a claim about any section's contents, so no section coverage is
         required. Its dependency is on authored structure instead, checked
         separately — an observation that a division's sections are ordered
         oddly needs structure, not paragraphs. */
      return null;
  }
}

/* ── the frozen state ────────────────────────────────────────────────────── */

/**
 * One section as a reading found it — an ADDRESS and a depth, never text.
 */
export interface FrozenSectionState {
  sectionId: string;
  depth: ReadDepth;
}

/**
 * Everything a reading froze about the Work it read.
 *
 * `revisionNumber` is the immutable revision of `draftId`. That pair, plus the
 * revision's own recorded partition, is what makes every section's exact text
 * recoverable later without storing any of it here.
 */
export interface FrozenReadState {
  draftId: string;
  revisionNumber: number;
  sections: readonly FrozenSectionState[];
  /**
   * The authored structure as it stood, digested. Present only when the reading
   * was given authored structure to reason from; `null` says it was not, which
   * is why structure-dependent evidence is refused rather than absent-by-shape.
   */
  structureFingerprint: string | null;
}

/**
 * The revision's own words and boundaries, as read back from the database.
 *
 * ⛔ THIS IS NOT STORAGE. It is what one immutable revision row already holds,
 * handed to a pure function so the resolution rules can be proven without a
 * Postgres. Nothing here writes, and nothing retains it.
 */
export interface RevisionSnapshot {
  revisionNumber: number;
  content: string;
  partition: readonly RevisionSectionRange[] | null;
}

export type ResolveFailure =
  /** The reading never covered this section, so it froze no state for it. */
  | 'section_not_in_read_state'
  /** The snapshot is not the revision this reading froze. */
  | 'revision_mismatch'
  /** The revision's boundaries were never observed — it predates addressability. */
  | 'partition_not_recorded'
  /** The revision no longer contains a section this reading covered. */
  | 'section_absent_from_revision'
  /** The span reaches past the section it addresses. */
  | 'span_out_of_range';

export type Resolved<T> =
  | { ok: true; value: T }
  | { ok: false; failure: ResolveFailure; detail: string };

const fail = <T>(failure: ResolveFailure, detail: string): Resolved<T> =>
  ({ ok: false, failure, detail });

/**
 * HISTORICAL DISPLAY — the exact text a reading rested on, recovered.
 *
 * ⛔ THIS MUST SUCCEED. Every failure it can return names a way the reading was
 * never recoverable in the first place, not a way the Work has since moved. A
 * failure here is a defect in what was frozen; a failure to find the passage
 * TODAY is `locateCurrent`'s business and is an ordinary outcome there. Keeping
 * the two apart is what stops "it changed" from being reported as "we cannot
 * show you what she read."
 */
export function resolveHistorical(
  state: FrozenReadState,
  snapshot: RevisionSnapshot,
  sectionId: string,
): Resolved<DraftSectionState> {
  if (snapshot.revisionNumber !== state.revisionNumber) {
    return fail('revision_mismatch',
      `the reading froze revision ${state.revisionNumber}; this snapshot is ${snapshot.revisionNumber}`);
  }
  if (!state.sections.some((s) => s.sectionId === sectionId)) {
    return fail('section_not_in_read_state',
      `${sectionId} was not covered by this reading`);
  }

  /* ⛔ Through the partition, never by re-partitioning. Re-deriving boundaries
     from older prose produces slices with no id continuity to the sections that
     exist now — the option the recoverability ruling rejected, and the one that
     would silently show an author a passage nobody ever read. This is also the
     single place the code-point/code-unit discipline lives: sectionsFromPartition
     resolves ranges through a boundary table rather than slice(). */
  const rebuilt = sectionsFromPartition(
    snapshot.content,
    snapshot.partition,
    /* The revision's OWN id order, not the reading's: the reading may have
       covered a subset, and a partition is judged complete against the draft. */
    (snapshot.partition ?? []).map((r) => r.sectionId),
  );
  if (!rebuilt.ok) {
    return fail(
      rebuilt.refusal === 'partition_not_recorded'
        ? 'partition_not_recorded'
        : 'section_absent_from_revision',
      rebuilt.detail);
  }

  const found = rebuilt.value.find((s) => s.id === sectionId);
  if (!found) {
    return fail('section_absent_from_revision',
      `revision ${snapshot.revisionNumber} holds no section ${sectionId}`);
  }
  return { ok: true, value: found };
}

/** HISTORICAL DISPLAY for one piece of evidence, span included. */
export function resolveEvidence(
  state: FrozenReadState,
  snapshot: RevisionSnapshot,
  ref: EvidenceRef,
): Resolved<string> {
  if (ref.kind === 'authored-structure') {
    return fail('section_not_in_read_state',
      'structural evidence resolves against the frozen structure, not against a section');
  }

  const section = resolveHistorical(state, snapshot, ref.sectionId);
  if (!section.ok) return section as Resolved<string>;

  if (ref.kind === 'heading') return { ok: true, value: section.value.text };

  const total = codePointLength(section.value.text);
  if (ref.span.start < 0 || ref.span.end < ref.span.start || ref.span.end > total) {
    return fail('span_out_of_range',
      `span ${ref.span.start}–${ref.span.end} against ${total} code points`);
  }
  /* Code points to code units, through the same boundary discipline the
     partition uses. ⛔ Never section.value.text.slice(span.start, span.end). */
  const boundaries = spanBoundaries(section.value.text);
  return { ok: true, value: section.value.text.slice(boundaries[ref.span.start], boundaries[ref.span.end]) };
}

/** UTF-16 index of each code-point boundary, plus a final entry at the end. */
function spanBoundaries(s: string): number[] {
  const out: number[] = [];
  let i = 0;
  while (i < s.length) {
    out.push(i);
    i += (s.codePointAt(i) as number) > 0xffff ? 2 : 1;
  }
  out.push(s.length);
  return out;
}

/* ── currentness ─────────────────────────────────────────────────────────── */

/**
 * Where a piece of evidence stands against the Work as it is NOW.
 *
 * ⛔ `superseded` IS NOT AN ERROR. It is the honest answer when the author has
 * moved on, and it is the reason the historical resolver has to keep working:
 * the observation is still inspectable, it simply no longer describes today's
 * Work. `no_longer_locatable` says the section itself is gone — a stronger form
 * of the same fact, never an invitation to guess where it went.
 */
export type Currentness = 'current' | 'superseded' | 'no_longer_locatable';

/**
 * CURRENT LOCATION — does the frozen evidence still describe today's Work?
 *
 * ⛔ EXACT COMPARISON ONLY. Compared as bytes, because two different sequences of
 * code points can compare equal after normalization and a normalized match would
 * let a passage the member re-typed differently call itself unchanged. There is
 * no similarity threshold here and there must never be one: an implementation
 * that fuzzy-matched a moved passage to keep this succeeding would have invented
 * evidence for the historical view.
 */
export function locateCurrent(
  historical: string,
  currentSection: DraftSectionState | null,
): Currentness {
  if (currentSection === null) return 'no_longer_locatable';
  return Buffer.from(historical, 'utf8').equals(Buffer.from(currentSection.text, 'utf8'))
    ? 'current'
    : 'superseded';
}

/**
 * Currentness of STRUCTURAL evidence, which turns on authored structure rather
 * than on any section's prose.
 *
 * ⛔ SCOPED SUPERSESSION. A structure change supersedes structure-dependent
 * evidence and NOTHING ELSE; a prose edit in one section supersedes evidence
 * resting on that section and NOTHING ELSE. Superseding a whole reading because
 * one part of it moved would tell the author that observations still true of
 * their Work are stale.
 */
export function locateCurrentStructure(
  frozenFingerprint: string | null,
  currentFingerprint: string | null,
): Currentness {
  if (frozenFingerprint === null) return 'no_longer_locatable';
  if (currentFingerprint === null) return 'no_longer_locatable';
  return frozenFingerprint === currentFingerprint ? 'current' : 'superseded';
}

/* ── coverage validation ─────────────────────────────────────────────────── */

export type CoverageRefusal =
  /** Evidence rests on a section the reading did not cover at all. */
  | 'evidence_without_coverage'
  /** Evidence rests on prose the reading only saw the heading of (INV-8). */
  | 'evidence_exceeds_coverage_depth'
  /** Structural evidence, but the reading was given no authored structure. */
  | 'structure_dependent_without_authored_structure';

export type CoverageCheck =
  | { ok: true }
  | { ok: false; refusal: CoverageRefusal; detail: string };

/**
 * INV-8 — every evidence reference must be backed by coverage at at least the
 * depth THAT evidence requires.
 *
 * ⛔ The forbidden case is precise: a prose-derived claim resting on prose she
 * did not read. Requiring body depth universally would have made whole classes
 * of honest observation unconstructible — a remark about how a division's
 * sections are ordered needs structure, not paragraphs.
 */
export function checkCoverage(state: FrozenReadState, ref: EvidenceRef): CoverageCheck {
  if (ref.kind === 'authored-structure') {
    /* Falsifier 5: structure-dependent evidence with no authored structure is
       refused, not quietly treated as absent. */
    return state.structureFingerprint === null
      ? {
          ok: false,
          refusal: 'structure_dependent_without_authored_structure',
          detail: 'this reading was given no authored structure to depend on',
        }
      : { ok: true };
  }

  const covered = state.sections.find((s) => s.sectionId === ref.sectionId);
  if (!covered) {
    return {
      ok: false,
      refusal: 'evidence_without_coverage',
      detail: `evidence rests on ${ref.sectionId}, which this reading did not read`,
    };
  }

  const need = requiredDepth(ref);
  if (need !== null && !depthSatisfies(covered.depth, need)) {
    return {
      ok: false,
      refusal: 'evidence_exceeds_coverage_depth',
      detail: `${ref.kind} evidence needs ${need} depth; ${ref.sectionId} was read at ${covered.depth}`,
    };
  }
  return { ok: true };
}
