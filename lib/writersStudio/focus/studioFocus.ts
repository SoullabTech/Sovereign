/**
 * WRITERS-STUDIO-EXPERIENCE-REBUILD-01 — the canonical Focus.
 *
 * ⭐⭐ ONE OBJECT ANSWERS "WHERE AM I". Every surface reads this one. The room
 * that produced the 2026-09-16 failure had three location authorities and let
 * them diverge: the rail showed one section, the writer had chosen another,
 * and the durable relationship landed on draft position 0 — front matter.
 *
 * ⛔ NO SURFACE MAY KEEP ITS OWN. A component that caches location has
 * re-created the defect this module exists to end.
 *
 * ⛔ AND `sectionId` IS A BANNED WORD HERE. Two id namespaces meet in this
 * product and look identical — both uuids on an object with a heading and a
 * position (see `outlineRows.ts`):
 *
 *   manuscript_draft_sections.id   navigation and writing. What the outline
 *                                  clicks, the save queue and the editor speak.
 *   manuscript_sections.id         the immutable Source. What disclosure,
 *                                  authorization and provenance speak.
 *
 * A single field called `sectionId` cannot say which it is, so Focus carries
 * BOTH by name and never a bare one. Silent namespace confusion is precisely
 * how a gesture aimed at Chapter 10 persists against front matter.
 */

/** The scope MAIA acts at. ⛔ DERIVED, NEVER CHOSEN — see `focusOn`. */
export type FocusScope = 'whole_work' | 'section' | 'passage';

/** Where the writer is, in both namespaces at once. */
export interface FocusSection {
  /** Navigation + writing identity. `manuscript_draft_sections.id`. */
  draftSectionId: string;
  /**
   * Source identity. `manuscript_sections.id`.
   *
   * `null` is honest and expected: a draft section written in the Studio has
   * no Source row until it is committed. ⛔ A null here must REFUSE a
   * Source-scoped act, never fall back to another section.
   */
  sourceSectionId: string | null;
  position: number;
  heading: string | null;
  /** 1 part · 2 chapter · 3 sub-section. `null` when the Work carries no depth. */
  depth: 1 | 2 | 3 | null;
}

/**
 * The writer's selected passage.
 *
 * ⛔ REVISION-BOUND OR IT IS A LIE. Offsets without the revision they were
 * taken against name different characters the moment the section is edited —
 * the standing evidence law from BUILD-07A, applied at the surface.
 */
export interface FocusSelection {
  /** Code-point offsets, half-open [from, to). ⛔ Never UTF-16 units. */
  from: number;
  to: number;
  revisionNumber: number;
}

export interface StudioFocus {
  workRef: string;
  manuscriptId: string;
  /** `null` means no section is in view. ⛔ It NEVER means front matter. */
  section: FocusSection | null;
  selection: FocusSelection | null;
  /** Derived from the two above. Present so readers need no rules of their own. */
  scope: FocusScope;
}

export interface FocusInput {
  workRef: string;
  manuscriptId: string;
  section?: FocusSection | null;
  selection?: FocusSelection | null;
}

/**
 * ⭐ THE ONLY CONSTRUCTOR. Scope is computed here and nowhere else, so no
 * surface can disagree about what the writer is pointing at.
 *
 *   text selected      → passage
 *   a section in view  → section
 *   neither            → whole_work
 *
 * The writer never picks a scope. They point at something, and scope follows.
 */
export function focusOn(input: FocusInput): StudioFocus {
  const section = input.section ?? null;
  /* ⛔ A selection without a section is incoherent, and silently keeping it
     would let a passage act run against no passage. Dropped, not repaired. */
  const selection = section ? (input.selection ?? null) : null;
  return {
    workRef: input.workRef,
    manuscriptId: input.manuscriptId,
    section,
    selection,
    scope: selection ? 'passage' : section ? 'section' : 'whole_work',
  };
}

/**
 * What the composer says. ⭐ The ONLY place scope is ever named to the writer,
 * and it is named in their words — never `whole_work`, never `scopeKind`.
 */
export function composerPrompt(focus: StudioFocus): string {
  if (focus.scope === 'passage') return 'Ask MAIA about this passage…';
  if (focus.scope === 'section') {
    return focus.section?.depth === 2
      ? 'Ask MAIA about this chapter…'
      : 'Ask MAIA about this section…';
  }
  return 'Ask MAIA about this work…';
}

/**
 * Everything the server's focus boundary needs, and nothing else.
 *
 * ⭐⭐ THE CLIENT SPEAKS THE SERVER'S VOCABULARY. `/api/writers-studio/focus`
 * has accepted `workRef · scopeKind · sectionRef · range` all along; the live
 * editorial lane was built beside it speaking a sectionId-only dialect with no
 * scope and no range. That dialect is what could not express "this passage".
 *
 * ⛔ `sectionRef` IS THE SOURCE ID. The boundary authorizes disclosure of
 * authored Work, which is Source-addressed. Handing it a draft id would ask
 * the wrong question of the right guard.
 *
 * ⛔ AND NO WORK TEXT TRAVELS. The server reads the passage after the boundary
 * authorizes; a caller-supplied excerpt would make that boundary decorative.
 */
export function focusRequest(focus: StudioFocus): {
  workRef: string;
  scopeKind: FocusScope;
  sectionRef: string | null;
  range: { start: number; end: number } | null;
} | null {
  /* A Source-scoped act on a section with no Source row is refused here rather
     than downgraded to the Work. ⛔ Silent widening is how a passage question
     becomes a whole-book answer. */
  if (focus.scope !== 'whole_work' && !focus.section?.sourceSectionId) return null;
  return {
    workRef: focus.workRef,
    scopeKind: focus.scope,
    sectionRef: focus.section?.sourceSectionId ?? null,
    range: focus.selection
      ? { start: focus.selection.from, end: focus.selection.to }
      : null,
  };
}
