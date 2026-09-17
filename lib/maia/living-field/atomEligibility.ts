/**
 * LF-SCOPE-01 — the one definition of which atoms a Living Field read may touch.
 *
 * WHY THIS EXISTS. The Living Field read paths carried the sacred/protected
 * guards and nothing else. They did not carry the scope boundary that the
 * canonical memory-atoms path has enforced since 20260630000005, so:
 *
 *   - a non-personal atom (colab / client / encounter scope) could contribute
 *     to a personal Living Field count and appear in personal gathered results;
 *   - a practitioner_observation atom — written ABOUT the member BY a
 *     practitioner — could surface under copy that calls the result
 *     "Keeps you have held";
 *   - an observation the member had explicitly REJECTED could still surface,
 *     because member_response_status was never consulted here.
 *
 * Only the first of those is a scope defect. The second and third are
 * authorship defects: the row is in the right member's pool and is still not
 * the member's own kept material. Both classes are closed here.
 *
 * NOT A SECOND INTERPRETATION OF THE BOUNDARY. Every clause below is taken
 * from an existing canonical reader rather than re-derived:
 *
 *   memory_scope = 'personal'            lib/maia/memoryAtomsLoader.ts (scope model)
 *   PRACTITIONER_ATTRIBUTION_GUARD       imported from that loader — the symbol
 *                                        itself, so it cannot drift from its origin
 *   member_response_status <> 'rejected' lib/maia/memoryAtomsLoader.ts
 *   posture_at_creation <> 'sanctuary'   lib/workbench/sources/keep.ts
 *
 * THREE DELIBERATE DEPARTURES, each stated rather than silently taken:
 *
 *  1. status stays a DENYLIST. The canonical readers use the allowlist
 *     `status IN ('active','still_alive')`; the Living Field paths have always
 *     used `NOT IN ('protected','archived')`, which additionally admits
 *     'set_aside'. Narrowing it here would remove material members can see
 *     today, which is a behaviour change and not containment. Left as found.
 *
 *  2. generated_by is NOT restricted to 'member-gesture'. keep.ts does restrict
 *     it, but that column defaults to 'unattributed-historical' for every row
 *     minted before 20260718000001, so the allowlist would silently empty the
 *     Living Field of every pre-provenance Keep. The authorship boundary that
 *     allowlist exists to enforce is enforced here directly, on source_type,
 *     without the historical collateral.
 *
 *  3. return_preference is NOT filtered. The canonical loader restricts it
 *     because MAIA surfaces material unbidden there; Living Field is a surface
 *     the member deliberately opens, and opening it IS asking. Filtering
 *     'member_pulled' here would withhold material from the member's own
 *     direct request.
 *
 * The practitioner clause is deliberately doubled: `source_type <>
 * 'practitioner_observation'` is the operative exclusion, and the imported
 * attribution guard is kept beneath it so that relaxing the first — if a future
 * act decides attributed observations may appear WITH attribution — cannot
 * silently re-admit the unattributed historical rows as well.
 *
 * ⛔ This module reads. It defines no write, alters no affinity, and changes no
 * practitioner-observation semantics: an excluded row is untouched and still
 * reachable everywhere it was legitimately reachable before.
 */

import { PRACTITIONER_ATTRIBUTION_GUARD } from '@/lib/maia/memoryAtomsLoader';

/**
 * SQL predicate restricting `member_memory_atoms` rows to the member's own
 * personal kept material.
 *
 * @param alias table alias used for `member_memory_atoms` in the caller's
 *   query ('a' in the join reads, '' when the table is queried unaliased).
 *
 * `PRACTITIONER_ATTRIBUTION_GUARD` is spliced unqualified. That is safe in
 * every current call site: `source_type` and `facilitator_id` exist on
 * `member_memory_atoms` and on no other table in these joins, so they cannot
 * be ambiguous. `member_id` is NOT part of this predicate precisely because it
 * IS ambiguous in the join reads — each caller states its own ownership clause.
 */
export function livingFieldAtomGuards(alias = ''): string {
  const c = alias ? `${alias}.` : '';
  return `${c}status NOT IN ('protected', 'archived')
       AND ${c}primary_register IS DISTINCT FROM 'sacred_protected'
       AND NOT ('sacred_protected' = ANY(${c}registers))
       AND ${c}memory_scope = 'personal'
       AND ${c}source_type <> 'practitioner_observation'
       AND ${PRACTITIONER_ATTRIBUTION_GUARD}
       AND ${c}member_response_status IS DISTINCT FROM 'rejected'
       AND ${c}posture_at_creation IS DISTINCT FROM 'sanctuary'`;
}
