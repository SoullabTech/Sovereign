/**
 * A READING IS A READING AT A TIME.
 *
 * `JARVIS-WRITERS-STUDIO-COMPLETE-01 / B0` — Review substrate.
 *
 * ⭐⭐ THE LAW THIS FILE EXISTS FOR.
 *
 * A reading is frozen against the Work as it stood. The writer then keeps
 * writing. ⛔ Presenting a frozen reading as though it still describes the
 * current Work is the quietest untruth available to this product: nothing looks
 * wrong, every finding still cites a real section, and the member has no way to
 * know that the sentence being discussed no longer exists.
 *
 * ⛔ The two wrong repairs, both rejected:
 *   ⛔ silently re-anchor the finding to whatever is there now — that would make
 *      MAIA appear to have read text she never read;
 *   ⛔ silently re-read to refresh — a commission inferred from navigation,
 *      which `L-B` refuses at the tab boundary and which would arrive here
 *      through the back door.
 *
 * ⭐ The lawful repair is DISCLOSURE. The finding says its passage has moved,
 * offers the frozen text it was made against, and lets the member decide.
 */

export type Freshness =
  /** Read at the Work's current revision. */
  | { readonly kind: 'current'; readonly when: string }
  /** ⭐ The Work moved. The reading is still TRUE OF WHAT IT READ. */
  | { readonly kind: 'stale'; readonly when: string; readonly changedSince: number }
  /** ⛔ A later reading of the same scope exists. ⭐ This one is NOT deleted —
   *  what MAIA believed before a correction is part of the record. */
  | { readonly kind: 'superseded'; readonly when: string; readonly bySupersedingWhen: string };

/**
 * ⭐⭐ WHAT CHANGED, ITEMISED.
 *
 * *N sections have changed* is true and nearly useless. ⭐ **3 passages added ·
 * 1 revised (including p. 112) · 2 moved** tells the member whether the change
 * touches the finding they are looking at — which is the only question they
 * actually have.
 */
export interface WorkChange {
  readonly added: number;
  readonly revised: number;
  readonly moved: number;
  /** ⭐ Named where a revised passage is one the current findings cite. */
  readonly revisedIncludes?: readonly string[];
}

export function changeLines(c: WorkChange): readonly string[] {
  const out: string[] = [];
  const plural = (n: number) => (n === 1 ? 'passage' : 'passages');
  if (c.added > 0) out.push(`${c.added} ${plural(c.added)} added`);
  if (c.revised > 0) {
    out.push(`${c.revised} ${plural(c.revised)} revised`
      + (c.revisedIncludes?.length ? ` (including ${c.revisedIncludes.join(', ')})` : ''));
  }
  if (c.moved > 0) out.push(`${c.moved} ${plural(c.moved)} moved`);
  return out;
}

/**
 * ⭐⭐ THE TRUST LINE, and it is not decoration.
 *
 * The room enforces *no commission from navigation* mechanically. This says it
 * **out loud, to the member, at the one moment it matters** — when MAIA's
 * reading is visibly out of date and the obvious thing for software to do would
 * be to quietly refresh itself.
 *
 * ⭐ Enforcement prevents harm; ⭐ saying it builds trust. The member learns the
 * rule by being told it exactly where they would otherwise assume the opposite.
 */
export const REREAD_IS_THE_MEMBERS_CALL =
  'MAIA will not read the new version without your request. Your work remains in your hands.';

export function freshnessLine(f: Freshness): string {
  switch (f.kind) {
    case 'current':
      return `Read ${f.when}. Nothing has changed since.`;
    case 'stale':
      return `Read ${f.when}. ${f.changedSince} ${f.changedSince === 1 ? 'section has' : 'sections have'} changed since — `
        + `what’s below is true of what MAIA read, not of what’s there now.`;
    case 'superseded':
      return `Read ${f.when}. A later reading from ${f.bySupersedingWhen} has replaced this one. Kept so you can see what changed.`;
  }
}

/** Per finding, because a reading can be stale in places and current elsewhere. */
export type CitationState =
  | { readonly kind: 'intact' }
  /** ⭐ The cited text changed. ⛔ Never silently re-anchored. */
  | { readonly kind: 'moved'; readonly frozenText: string }
  /** ⭐ The cited section is gone. ⛔ The finding is not deleted with it. */
  | { readonly kind: 'removed'; readonly frozenText: string };

export function citationLine(c: CitationState): string | null {
  switch (c.kind) {
    case 'intact': return null;
    case 'moved': return 'This passage has changed since MAIA read it.';
    case 'removed': return 'This passage is no longer in your work.';
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   SCOPE — ⭐ a chapter review and a whole-Work review are different claims
   ══════════════════════════════════════════════════════════════════════════ */

export type ReviewScope =
  | { readonly kind: 'chapter'; readonly label: string; readonly sectionId: string }
  | { readonly kind: 'work' };

export function scopeLine(s: ReviewScope, workKind: string): string {
  return s.kind === 'chapter'
    ? `${s.label} only. Patterns across the whole ${workKind} need their own reading.`
    : `Your whole ${workKind}.`;
}

/**
 * ⭐⭐ A LENS IS A FILTER, ⛔ NEVER A COMMISSION.
 *
 * ⛔ Clicking a lens must not read. Where no reading exists the surface says so
 * and offers a **separate deliberate gesture**. ⭐ Navigation is not consent.
 *
 * ⚠️ `read-nothing-noticed` and `not-read` are DIFFERENT and must never render
 * as one empty list: a completed reading that surfaced nothing is a RESULT; an
 * absent reading is an ABSENCE. Collapsing them tells the member their Work has
 * no continuity problems when in fact nothing was read.
 */
export type LensAvailability =
  | { readonly kind: 'not-read' }
  | { readonly kind: 'partially-read'; readonly found: number; readonly remaining: number }
  | { readonly kind: 'read'; readonly found: number }
  | { readonly kind: 'read-nothing-noticed' };

export function availabilityLine(a: LensAvailability, lensPlain: string): string {
  switch (a.kind) {
    case 'not-read':
      return `MAIA hasn’t read your work for ${lensPlain.toLowerCase()} yet.`;
    case 'partially-read':
      return `${a.found} so far · ${a.remaining} sections not read yet`;
    case 'read':
      return `${a.found} to look at`;
    case 'read-nothing-noticed':
      return `MAIA read the whole work for this and found nothing to bring you.`;
  }
}

/** ⭐ The ONLY thing in Review that may commission. ⛔ Never a tab, never a
 *  navigation act, never a return-to-passage. */
export function commissionOffer(a: LensAvailability, lensPlain: string): string | null {
  switch (a.kind) {
    case 'not-read': return `Read for ${lensPlain.toLowerCase()}`;
    case 'partially-read': return `Read the remaining ${a.remaining}`;
    default: return null;
  }
}
