/**
 * Practitioner Source — permission compiler
 *
 * Pure functions implementing the composability rules from
 * docs/governance/PRACTITIONER_FIELD_AUTHORITY_SCHEMA.md Part 1 (§1.1's
 * validation rule). This module does NOT touch the database — it compiles a
 * decision from typed inputs the caller already holds.
 *
 * Scope note: this compiles SOURCE composability (may this row's content
 * enter a corpus at all), not the full AttachmentAPermission behavior matrix
 * (Part 1.2 / Part 2 — ground/offer/reference_only/private/never,
 * may_retrieve/may_summarize/may_offer/may_generate_from). That matrix is a
 * separate, not-yet-authorized piece. Nothing here should be read as
 * implementing it.
 *
 * The governing rule this file exists to make unrepresentable (spec §1.1,
 * the 2026-08-03 incident): a row claiming `derived_from_primary` must name
 * its sources, and each must resolve to a `kind: 'primary'` row that is
 * itself fully composable. If any named source resolves to an
 * `interpretation`, a `selection`, or is unresolvable, THE COMPILE FAILS —
 * it never silently downgrades to a weaker-but-passing result.
 *
 * ⭐ Missing provenance ⊥ negative provenance. `unknown` state is the
 * ABSENCE of a claim; `asserted` is a claim not yet confirmed by the source
 * practitioner. Both block composition, but they are different reasons and
 * must not be reported as the same failure.
 */

export type SourceType =
  | 'authored_framework'
  | 'teaching'
  | 'exercise'
  | 'recording'
  | 'transcript'
  | 'selected_lineage'
  | 'third_party_reference'
  | 'derived_summary';

export type SourceRelationshipState = 'unknown' | 'asserted' | 'validated';

export type SourceRelationshipKind =
  | 'primary'
  | 'derived_from_primary'
  | 'interpretation'
  | 'selection';

export type SourceStatus = 'discovered' | 'reviewed' | 'ratified' | 'rejected';

/**
 * Minimal shape the compiler needs. Deliberately narrower than the full DB
 * row — callers may pass rows straight from `practitioner_sources` (extra
 * columns are ignored) or synthetic fixtures in tests.
 */
export interface PractitionerSourceInput {
  id: string;
  source_type: SourceType;
  source_relationship_state: SourceRelationshipState;
  source_relationship_kind: SourceRelationshipKind | null;
  derived_from: string[];
  validated_by: string | null;
  validated_at: string | null;
  status: SourceStatus;
}

export type ComposabilityBlockReason =
  | 'unknown_provenance'        // source_relationship_state === 'unknown' — an absence, not a claim
  | 'not_validated'             // source_relationship_state === 'asserted' — claimed, not confirmed
  | 'not_ratified'               // status is 'discovered' or 'reviewed'
  | 'rejected'                    // status === 'rejected' — a completed negative decision
  | 'invalid_kind'                // kind is 'interpretation' or 'selection' at the top level
  | 'missing_relationship_kind'  // state !== 'unknown' but kind is null (defensive; DB also forbids this)
  | 'invalid_derivation'          // a derived_from id is unresolvable, or resolves to a non-primary
                                    // row, or resolves to a primary row that is not itself composable
  | 'no_composable_source';       // aggregate-only: no source in the set composes

export interface ComposabilityResult {
  composable: boolean;
  reason?: ComposabilityBlockReason;
  detail?: string;
}

const COMPOSABLE: ComposabilityResult = { composable: true };

function blocked(reason: ComposabilityBlockReason, detail?: string): ComposabilityResult {
  return { composable: false, reason, detail };
}

/**
 * Compile a single source's composability.
 *
 * `allSources` is the pool `derived_from` ids are resolved against — pass
 * every source known for the field (or at minimum, every source reachable
 * by this row's derivation chain). A derived_from id absent from the pool
 * is treated as unresolvable, never as "assume primary."
 *
 * Deterministic: same inputs in, same result out. No defaults that widen —
 * every unrecognized or missing condition blocks rather than passes.
 */
export function compileSourceComposability(
  source: PractitionerSourceInput,
  allSources: PractitionerSourceInput[],
  _seen: ReadonlySet<string> = new Set()
): ComposabilityResult {
  // Cycle guard: derived_from should never point back at itself or into a
  // loop, but a pure function must not infinite-loop on a malformed graph.
  if (_seen.has(source.id)) {
    return blocked('invalid_derivation', `cycle detected at source ${source.id}`);
  }
  const seen = new Set(_seen);
  seen.add(source.id);

  // ── status gate — readiness is not authority; only 'ratified' is eligible ──
  if (source.status === 'rejected') {
    return blocked('rejected');
  }
  if (source.status !== 'ratified') {
    return blocked('not_ratified', `status is '${source.status}'`);
  }

  // ── source_relationship.state — missing ⊥ negative provenance ──
  if (source.source_relationship_state === 'unknown') {
    return blocked('unknown_provenance');
  }
  if (source.source_relationship_state === 'asserted') {
    return blocked('not_validated');
  }
  // state === 'validated' from here down.

  if (!source.source_relationship_kind) {
    // Defensive: the DB schema forbids this combination, but the compiler
    // must not assume the caller's data satisfies the schema.
    return blocked('missing_relationship_kind');
  }

  if (
    source.source_relationship_kind === 'interpretation' ||
    source.source_relationship_kind === 'selection'
  ) {
    return blocked('invalid_kind', `kind is '${source.source_relationship_kind}'`);
  }

  if (source.source_relationship_kind === 'primary') {
    return COMPOSABLE;
  }

  // source_relationship_kind === 'derived_from_primary'
  if (!source.derived_from || source.derived_from.length === 0) {
    return blocked('invalid_derivation', 'derived_from_primary with no derived_from entries');
  }

  const byId = new Map(allSources.map((s) => [s.id, s]));

  for (const parentId of source.derived_from) {
    const parent = byId.get(parentId);
    if (!parent) {
      return blocked('invalid_derivation', `derived_from id '${parentId}' does not resolve`);
    }
    // The spec is explicit: each named source must resolve to a row with
    // kind 'primary' — not merely to a composable row, and not to a further
    // 'derived_from_primary' chain. Naming an interpretation or a selection
    // here is exactly the incident this rule exists to make unrepresentable.
    if (parent.source_relationship_kind !== 'primary') {
      return blocked(
        'invalid_derivation',
        `derived_from id '${parentId}' resolves to kind '${parent.source_relationship_kind ?? 'unknown'}', not 'primary'`
      );
    }
    // The resolved primary parent must itself be composable (ratified +
    // validated). A primary source that is merely discovered/asserted
    // cannot lend its authority to a derived row — the block propagates
    // rather than being silently absorbed.
    const parentResult = compileSourceComposability(parent, allSources, seen);
    if (!parentResult.composable) {
      return blocked(
        'invalid_derivation',
        `derived_from id '${parentId}' is not itself composable (${parentResult.reason})`
      );
    }
  }

  return COMPOSABLE;
}

/**
 * Aggregate check for a field's corpus: is there at least one composable
 * source backing it? This is the check `corpusIsComposable` delegates to.
 *
 * An empty source list is treated as `unknown_provenance` — the same
 * absence the schema defaults `source_relationship_state` to. No sources
 * recorded is not a different failure mode from "no confirmed relationship
 * recorded"; both are the absence of a claim.
 */
export function compileFieldCorpusComposability(
  sources: PractitionerSourceInput[]
): ComposabilityResult {
  if (sources.length === 0) {
    return blocked('unknown_provenance', 'no practitioner sources recorded for this field');
  }

  for (const source of sources) {
    const result = compileSourceComposability(source, sources);
    if (result.composable) {
      return COMPOSABLE;
    }
  }

  return blocked('no_composable_source', 'no source in the set compiles to composable');
}
