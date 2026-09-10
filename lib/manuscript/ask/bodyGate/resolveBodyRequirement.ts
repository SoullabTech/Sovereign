/**
 * S3 · P1 — RESOLVING THE BODY REQUIREMENT WITHOUT PROSE, AND ENFORCING W2.
 *
 *   ⭐⭐ Both halves read the ref's KIND and the frozen state's coordinates.
 *       Neither reads a character of the Work.
 *
 * `requirementOf` returns `body | position | structure` from the discriminant
 * alone; `sectionIdsOf` names the sections a ref depends on; `readState.sections`
 * holds ranges and digests and ⛔ never text. So "is body required, and of which
 * sections?" is answerable before `loadRevisionContent` is reachable — which is
 * the hinge the whole repair turns on.
 */

import { requirementOf, sectionIdsOf, type EvidenceRef } from '@/lib/manuscript/development/evidenceRef';
import type { DevelopmentalAskContext } from '../developmentalContext';

export interface BodyRequirement {
  /** True where at least one reference needs the section's prose read in full. */
  readonly bodyRequired: boolean;
  /** ⭐ ONLY the sections whose BODY is required — never every section named. */
  readonly requiredSections: readonly string[];
}

/**
 * ⛔ A `section-run` ref names sections but requires only POSITION depth. Folding
 * its sections into the required set would ask the member to authorize prose the
 * answer never needs — an inflated request is not a safer one, it is a consent
 * act obtained under a false description.
 */
export function resolveBodyRequirement(refs: readonly EvidenceRef[]): BodyRequirement {
  const required = new Set<string>();
  let bodyRequired = false;
  for (const ref of refs) {
    if (requirementOf(ref) !== 'body') continue;
    bodyRequired = true;
    for (const id of sectionIdsOf(ref)) required.add(id);
  }
  return { bodyRequired, requiredSections: [...required].sort() };
}

export interface W2Enforcement {
  /** The context as cognition may receive it. */
  readonly ctx: DevelopmentalAskContext;
  /** Sections whose recovered characters were refused entry. */
  readonly withheld: readonly string[];
}

/**
 * ⭐⭐ THE W2 SECTION BOUNDARY — INDEPENDENT ENFORCEMENT, NOT BOOKKEEPING.
 *
 *   Only body characters derived from an authorized section may enter cognition
 *   under that section's authority.
 *
 * ⛔ THIS MUST NOT REST ON `requiredSections === authorized`. That equality is
 * produced by `resolveBodyRequirement`, and a boundary that trusts the same
 * computation it is supposed to bound cannot fail when that computation is
 * wrong — the tautology this lane has already been burned by once.
 *
 * ⭐ So the predicate reads `recovered.sectionId`, which comes from
 * `recoverEvidence` resolving the frozen state, and admits nothing it cannot
 * positively attribute to an authorized section. A recovered TEXT value whose
 * section was not authorized is withheld even if every upstream computation
 * agreed it should be there.
 */
export function enforceW2SectionBoundary(
  ctx: DevelopmentalAskContext,
  authorized: readonly string[],
): W2Enforcement {
  const permitted = new Set(authorized);
  const withheld = new Set<string>();

  const evidence = ctx.evidence.filter((view) => {
    if (view.kind !== 'verified') return true;          // a refusal carries no characters
    if (view.recovered.kind !== 'text') return true;    // structure/sequence carry no body
    if (permitted.has(view.recovered.sectionId)) return true;
    withheld.add(view.recovered.sectionId);
    return false;
  });

  return { ctx: { ...ctx, evidence }, withheld: [...withheld].sort() };
}
