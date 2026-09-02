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
  /**
   * Derived from authored structure. Requires no section coverage.
   *
   * ⛔ TYPED AND GUARDED, BUT NOT YET HISTORICALLY RECOVERABLE. See
   * `FrozenReadState.structure`: a fingerprint compares, it does not recover.
   * `resolveEvidence` refuses this kind rather than returning something that
   * looks like recovered structure.
   */
  | { kind: 'authored-structure'; reference: StructuralReference };

/* ── ⛔ HEADING EVIDENCE IS HELD UNAVAILABLE ──────────────────────────────────
 *
 * There was a `{ kind: 'heading'; sectionId }` variant here, and it OVERCLAIMED.
 * Its historical display returned the whole frozen section — so a heading-only
 * reading could produce a reference whose display showed prose it was never
 * allowed to have read. The coverage check was right; the resolver made its
 * claim false.
 *
 * ⛔ THE TEMPTING FIX IS THE FORBIDDEN ONE. "The first line is the heading" is
 * an inferred identity, and inferring identity from the shape of prose is what
 * this whole substrate exists to refuse. `composeDraftSlices` knows where a
 * heading ended at the moment a draft was composed, but nothing PERSISTS that
 * boundary: `manuscript_draft_sections` stores `text` and nothing else, and
 * after the member edits, the heading may not exist at all.
 * `manuscript_sections.heading` is the SOURCE's heading — a different object
 * from what the draft now holds.
 *
 * So the variant is removed rather than left typed-but-broken. A shape that
 * type-checks and can be stored, then fails at display time, is exactly the
 * INV-7b failure "discovered latest" — when someone first tries to show an
 * author the evidence behind an old observation.
 *
 * TO RESTORE IT, one thing is needed and it is not a heuristic: a mechanically
 * authoritative heading boundary, frozen as an exact code-point span, from a
 * source that records where the member's heading ended. `ReadDepth`'s `heading`
 * level stays regardless — a section CAN be read at heading depth; what does
 * not yet exist is evidence that rests on the heading itself.
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * What a piece of structural evidence is ABOUT.
 *
 * ⛔ NOT A SINGLE `unitId`. INV-16 rejects that shape by name: one id cannot
 * express a relationship BETWEEN two divisions, a sequence ACROSS several, or a
 * claim about the whole topology. And §9 supersedes on exactly that last
 * dependency — so a representation unable to name it makes its own supersession
 * rule uncomputable. A discriminated relation makes the invalid states
 * unconstructible rather than merely discouraged.
 */
export type StructuralReference =
  /** One authored division. */
  | { scope: 'unit'; unitId: string }
  /** A relationship among several — an ordering, a pairing, a sequence. */
  | { scope: 'units'; unitIds: readonly string[] }
  /** The authored topology as a whole. */
  | { scope: 'topology' };

/** The coverage depth a given kind of evidence must be backed by (INV-8). */
export function requiredDepth(ref: EvidenceRef): ReadDepth | null {
  switch (ref.kind) {
    case 'textual':
      /* The forbidden mismatch INV-8 names: a prose-derived claim resting on
         prose she did not read. */
      return 'body';
    case 'authored-structure':
      /* Not a claim about any section's contents, so no section coverage is
         required. Its dependency is on authored structure instead, checked
         separately — an observation that a division's sections are ordered
         oddly needs structure, not paragraphs. */
      return null;
    /* No default. A new kind must decide its own coverage requirement here,
       rather than inheriting whichever branch happened to be last. */
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
   * The authored structure as it stood. Present only when the reading was given
   * authoritative structure to reason from; `null` says it was not, which is why
   * structure-dependent evidence is refused rather than absent-by-shape
   * (INV-16a: absent, never degraded — it may not reason from the proposal, and
   * may not read draft section order as a declaration of division order).
   */
  structure: FrozenStructure | null;
}

/**
 * Authored structure, digested at the granularity supersession is scoped at.
 *
 * ⛔ THIS IS COMPARISON, NOT RECOVERY. DECIDE ruled it explicitly:
 * `structureFingerprint` detects change, but unless the structure context is
 * itself frozen or points at a durable immutable snapshot, a superseded
 * structure-dependent observation cannot show the author the structure it
 * reasoned from. Per-unit digests make SUPERSESSION scoped — they do not make
 * the structure recoverable, and no number of digests would.
 *
 * The structural analogue of `FrozenSectionState` does not exist yet. It needs
 * a durable address to an exact structure snapshot alongside this fingerprint,
 * and finding the immutable object that can serve as that address is open
 * BUILD-07A work. Until then, structural evidence is typed and guarded and NOT
 * historically recoverable.
 *
 * ⛔ ONE WHOLE-STRUCTURE DIGEST IS NOT ENOUGH. §9 preserves structure-independent
 * observations while superseding structure-aware ones in the same reading, and
 * the same discipline applies WITHIN structural evidence: renaming division 3
 * must not supersede an observation about the ordering of divisions 7 and 8.
 * With only a topology digest, every structural observation in the reading goes
 * stale together — which tells the author that observations still true of their
 * Work are not.
 */
export interface FrozenStructure {
  /** Digest of the authored topology as a whole. */
  topologyFingerprint: string;
  /** Digest per authored unit, so unit-scoped evidence supersedes on its own. */
  unitFingerprints: Readonly<Record<string, string>>;
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
  | 'span_out_of_range'
  /**
   * Structural evidence cannot yet be recovered — only compared.
   *
   * ⛔ This is INV-7b's structural half, and it is OPEN. It is a statement about
   * what the substrate can currently prove, not a defect in a caller's request.
   */
  | 'structure_not_historically_recoverable';

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
    /* ⛔ INV-7b IS UNMET FOR STRUCTURAL EVIDENCE, and this refusal is where that
       is said out loud rather than papered over. A fingerprint detects that the
       structure moved; it cannot reconstruct the structure that was read. Until
       a durable immutable snapshot of the authored structure exists, a
       superseded structure-dependent observation cannot show the author what it
       actually reasoned from — so this returns nothing rather than something
       that would look like recovered structure. */
    return fail('structure_not_historically_recoverable',
      'the reading froze a fingerprint of the authored structure, which compares but does not '
      + 'recover; no durable snapshot of the structure as read exists yet');
  }

  const section = resolveHistorical(state, snapshot, ref.sectionId);
  if (!section.ok) return section as Resolved<string>;

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
export type Currentness =
  /** The frozen evidence still describes today's Work exactly. */
  | 'current'
  /** The Work has moved on. The observation stays inspectable; it no longer describes today. */
  | 'superseded'
  /** What the evidence addressed is gone. A stronger form of the same fact. */
  | 'no_longer_locatable'
  /**
   * The comparison could not be made.
   *
   * ⛔ NOT THE SAME AS `no_longer_locatable`, and the distinction is load-bearing
   * (INV-20's third state). "Your passage was deleted" and "we did not check"
   * are different things to tell an author, and collapsing them makes a surface
   * that cannot say which it means.
   */
  | 'unmeasured';

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
  frozen: FrozenStructure | null,
  current: FrozenStructure | null,
  reference: StructuralReference,
): Currentness {
  /* The reading never held structure, so there is nothing to compare — which is
     a different fact from "the structure is gone", and saying so is the point of
     the third state. */
  if (frozen === null) return 'unmeasured';
  if (current === null) return 'unmeasured';

  switch (reference.scope) {
    case 'topology':
      return frozen.topologyFingerprint === current.topologyFingerprint
        ? 'current' : 'superseded';

    case 'unit': {
      const before = frozen.unitFingerprints[reference.unitId];
      const after = current.unitFingerprints[reference.unitId];
      if (before === undefined) return 'unmeasured';
      /* The division the observation was about no longer exists. ⛔ Never
         matched to a similarly-named one: that would re-anchor the observation
         to a division the member may have created for another purpose. */
      if (after === undefined) return 'no_longer_locatable';
      return before === after ? 'current' : 'superseded';
    }

    case 'units': {
      /* A claim ABOUT a relationship: it survives only while every division it
         relates survives unchanged. One of them moving changes the relationship,
         which is the whole content of the observation. */
      let sawMissing = false;
      for (const id of reference.unitIds) {
        const before = frozen.unitFingerprints[id];
        const after = current.unitFingerprints[id];
        if (before === undefined) return 'unmeasured';
        if (after === undefined) { sawMissing = true; continue; }
        if (before !== after) return 'superseded';
      }
      return sawMissing ? 'no_longer_locatable' : 'current';
    }
  }
}

/* ── INV-17 — structural evidence names AUTHORED structure ───────────────── */

export type StructuralRefusal =
  /** A proposal id, a reviewed unit key, or any id the Work does not declare. */
  | 'not_a_canonical_unit'
  /** A relationship among fewer than two divisions is not a relationship. */
  | 'degenerate_unit_set'
  /** The same division named twice inside one relationship. */
  | 'duplicate_unit_in_set';

export type StructuralCheck =
  | { ok: true }
  | { ok: false; refusal: StructuralRefusal; detail: string };

/**
 * INV-17 — structural evidence names member-authored structure: a canonical
 * unit, a set of them, or the authored topology. Never a proposal id, and never
 * a reviewed unit key.
 *
 * ⛔ THIS IS FIND's F2, ANSWERED. A reading must reason about what the MEMBER
 * declared the Work to be — not about MAIA's own earlier perception of it. A
 * proposal-local key names a division inside a reading MAIA produced; it does
 * not name anything in the Work, it does not survive adoption, and evidence
 * resting on one would be evidence about the machine's previous opinion.
 *
 * `canonicalUnitIds` is the authored set, supplied by the caller: the rule is
 * decided here so it is provable without a database, and the membership is a
 * fact only the database holds.
 */
export function checkStructuralReference(
  reference: StructuralReference,
  canonicalUnitIds: ReadonlySet<string>,
): StructuralCheck {
  if (reference.scope === 'topology') return { ok: true };

  const ids = reference.scope === 'unit' ? [reference.unitId] : reference.unitIds;

  if (reference.scope === 'units') {
    if (ids.length < 2) {
      return {
        ok: false,
        refusal: 'degenerate_unit_set',
        detail: 'a relationship among divisions needs at least two; one division is scope "unit"',
      };
    }
    if (new Set(ids).size !== ids.length) {
      return {
        ok: false,
        refusal: 'duplicate_unit_in_set',
        detail: 'a division cannot stand in a relationship with itself',
      };
    }
  }

  for (const id of ids) {
    if (!canonicalUnitIds.has(id)) {
      return {
        ok: false,
        refusal: 'not_a_canonical_unit',
        detail: `${id} is not a division the member authored — a proposal id or reviewed `
          + 'unit key names MAIA\'s earlier perception of the Work, not the Work',
      };
    }
  }
  return { ok: true };
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
    return state.structure === null
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
