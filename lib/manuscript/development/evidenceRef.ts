/**
 * BUILD-07A — DEVELOPMENTAL EVIDENCE · the reference vocabulary.
 *
 * WHAT AN EvidenceRef IS. A typed pointer from a developmental observation into
 * the exact state of the Work that was read. DECIDE (INV-5) fixed four
 * properties and deferred the variants to this unit:
 *
 *     TYPED        the kind is the discriminant, never inferred from which
 *                  optional fields happen to be populated
 *     DURABLE      it addresses a stable identity — a draft section id, an
 *                  authored unit id — never a character offset into LIVE prose
 *                  and never a heading string
 *     RECOVERABLE  it resolves through its reading's frozen state (readState.ts)
 *     EXPRESSIVE   it can name textual evidence AND authored-structure evidence
 *
 * ⛔ A REF CARRIES NO VERSION (INV-6). The reading's `readState` carries the
 * revision, once. A ref that named its own revision could claim a currency its
 * reading cannot support.
 *
 * ⛔ A REF CARRIES NO PROSE. Quote policy, ruled here for BUILD-07A: a reference
 * does not carry a quotation. The words it points at are RECOVERED from the
 * immutable revision through the frozen state (resolve.ts), never copied into
 * the reference. A quote inside a ref is a second copy of manuscript prose in a
 * place with its own retention and deletion answers — the second custody domain
 * the recoverability ruling rejected, arriving one phrase at a time.
 *
 * ON `passage` OFFSETS. INV-5 forbids offsets into LIVE prose. A passage range is
 * expressed in Unicode code points RELATIVE TO THE SECTION AS READ, and is
 * resolved only through the frozen `SectionState`, which locates that section
 * inside an append-only revision. The target is immutable, so the offset names
 * the same characters forever — the same reasoning that admitted
 * `section_partition` (recoverability boundary §3, option (d)). ⛔ Nothing here
 * may ever be applied to `manuscript_draft_sections.text`.
 *
 * ON STRUCTURAL REFS (INV-16, INV-17). Structural evidence names MEMBER-AUTHORED
 * structure — one unit, several, or the whole authored topology — by canonical
 * unit id. Never a proposal id, never a reviewed unit key. The three shapes are
 * distinct variants because "several units" and "the whole topology" are
 * different claims and supersede differently (INV-21).
 */

export type NonEmptyArray<T> = readonly [T, ...T[]];

/** Inclusive start, exclusive end, in Unicode CODE POINTS — never UTF-16 units. */
export interface CodePointRange {
  start: number;
  end: number;
}

/** The whole body of one draft section, as it was when read. */
export interface SectionRef {
  kind: 'section';
  sectionId: string;
}

/** A range inside one section's body, as it was when read. */
export interface PassageRef {
  kind: 'passage';
  sectionId: string;
  range: CodePointRange;
}

/**
 * The sequence of sections from the first id to the last, as read. Evidence
 * about ORDER and ADJACENCY in the draft — structure-independent, because
 * section order is a fact about the draft, not a member declaration (UNDERSTAND
 * §3). Needs position depth only; no prose is implied.
 */
export interface SectionRunRef {
  kind: 'section-run';
  sectionIds: NonEmptyArray<string>;
}

/** One member-authored division, as it stood in the frozen structure context. */
export interface StructureUnitRef {
  kind: 'structure-unit';
  unitId: string;
}

/** Several authored divisions — a relationship between or across them. */
export interface StructureUnitsRef {
  kind: 'structure-units';
  unitIds: NonEmptyArray<string>;
}

/** The whole authored topology, as frozen. */
export interface StructureTopologyRef {
  kind: 'structure-topology';
}

export type TextualEvidenceRef = SectionRef | PassageRef | SectionRunRef;
export type StructuralEvidenceRef = StructureUnitRef | StructureUnitsRef | StructureTopologyRef;
export type EvidenceRef = TextualEvidenceRef | StructuralEvidenceRef;

export const EVIDENCE_REF_KINDS = [
  'section', 'passage', 'section-run',
  'structure-unit', 'structure-units', 'structure-topology',
] as const;

/**
 * What a reference requires of coverage (INV-8).
 *
 *   body       the section's prose was read in full
 *   position   the section's identity and place in the sequence were known
 *   structure  authoritative structure was supplied to the reading
 *
 * Prose-derived evidence requires body depth. Order-derived evidence requires
 * position. Structure-derived evidence requires a frozen structure context —
 * and where none was supplied, such evidence is ABSENT, not degraded (INV-16a).
 */
export type EvidenceRequirement = 'body' | 'position' | 'structure';

export function requirementOf(ref: EvidenceRef): EvidenceRequirement {
  switch (ref.kind) {
    case 'section':
    case 'passage':
      return 'body';
    case 'section-run':
      return 'position';
    case 'structure-unit':
    case 'structure-units':
    case 'structure-topology':
      return 'structure';
  }
}

export function isStructural(ref: EvidenceRef): ref is StructuralEvidenceRef {
  return requirementOf(ref) === 'structure';
}

/** The draft section ids a reference depends on. Empty for structural refs. */
export function sectionIdsOf(ref: EvidenceRef): readonly string[] {
  switch (ref.kind) {
    case 'section':
    case 'passage':
      return [ref.sectionId];
    case 'section-run':
      return ref.sectionIds;
    default:
      return [];
  }
}

/** The authored unit ids a reference depends on. Empty for textual refs and for the whole topology. */
export function unitIdsOf(ref: EvidenceRef): readonly string[] {
  switch (ref.kind) {
    case 'structure-unit':
      return [ref.unitId];
    case 'structure-units':
      return ref.unitIds;
    default:
      return [];
  }
}

/**
 * Whether an untrusted value is a well-formed EvidenceRef. Shape only — whether
 * it resolves is `bindEvidence`'s question, against a specific evidence object.
 */
export function isEvidenceRef(v: unknown): v is EvidenceRef {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  const id = (x: unknown) => typeof x === 'string' && x.length > 0;
  const ids = (x: unknown) => Array.isArray(x) && x.length > 0 && x.every(id);
  switch (r.kind) {
    case 'section':
      return id(r.sectionId);
    case 'passage': {
      const range = r.range as Record<string, unknown> | undefined;
      return id(r.sectionId)
        && typeof range === 'object' && range !== null
        && Number.isInteger(range.start) && Number.isInteger(range.end)
        && (range.start as number) >= 0 && (range.end as number) >= (range.start as number);
    }
    case 'section-run':
      return ids(r.sectionIds);
    case 'structure-unit':
      return id(r.unitId);
    case 'structure-units':
      return ids(r.unitIds);
    case 'structure-topology':
      return true;
    default:
      return false;
  }
}
