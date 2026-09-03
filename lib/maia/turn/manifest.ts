/**
 * The Turn Participation Manifest — CMT-01, Step 2.
 *
 * Authority: docs/architecture/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md §7
 *
 * The answer P3 could not obtain from the codebase: *what actually had the
 * ability to enter this MAIA turn?* Only the constructor can answer it, because
 * only the constructor knows which providers it invited.
 *
 * Six states per provider, each a real distinction:
 *
 *     registered   in the Stage 1 registry at all
 *     invoked      selected by this turn's profile and actually run
 *     returned     candidates the provider handed back
 *     excluded     candidates the boundary refused, by reason
 *     admitted     candidates the boundary admitted
 *     composed     admitted candidates that entered the bundle
 *
 * `held` is the state between registered and invoked: eligible under the
 * profile but not run, with the reason — sanctuary, or a consent gate the
 * member has turned off. "Held" and "returned nothing" are different answers
 * and the manifest never collapses them.
 *
 * ── NO BODIES ───────────────────────────────────────────────────────────────
 *
 * Identifiers, counts, reasons and provenance classes only. A manifest that
 * logs member content is a memory leak with a schema.
 *
 * ── FAILURE IS VISIBLE ──────────────────────────────────────────────────────
 *
 * A provider error is recorded as `error`, never as zero candidates. The P1a
 * rule — an export that silently omits is worse than one that openly does not
 * cover — applied to turns.
 */

import type { ExclusionReason, AuthoredBy, AuthorityClass } from '../participationGate';
import type { ProviderId, ProviderScope, ParticipationStatus, UpstreamGate as CertifiedGate } from './providers';

export type HeldReason =
  | 'sanctuary'
  | 'consent_gate_off'
  | 'not_in_profile';

export interface ProviderManifestEntry {
  id: ProviderId;
  scope: ProviderScope;
  participationStatus: ParticipationStatus;
  governedBy: readonly CertifiedGate[];
  invoked: boolean;
  held?: { reason: HeldReason; gate?: string };
  returned: number;
  excluded: number;
  excludedByReason: Partial<Record<ExclusionReason, number>>;
  admitted: number;
  /** Admitted on the strength of a named upstream certified gate, not re-adjudicated here. */
  admittedUpstream: number;
  /** Admitted ONLY because a legacy profile lists an uncertified provider. Never under 'canonical'. */
  admittedLegacyUncertified: number;
  composed: number;
  error?: string;
}

export interface ParticipationManifest {
  version: 'cmt-01.manifest.v1';
  /** SHADOW until authoritative cutover (§11 step 5). */
  mode: 'shadow';
  identity: {
    memberIdPrefix: string;   // never the full id, never a credential
    credentialPath: string;
  };
  encounter: {
    sessionIdPrefix: string;
    mode: string;
    modality: string;
    sanctuary: boolean;
  };
  profile: string;
  policyVersion: string;
  runtimeContextVersion: string;
  providers: ProviderManifestEntry[];
  /** authored_by × authority_class, aggregated over admitted material. */
  provenanceClasses: Partial<Record<`${AuthoredBy}:${AuthorityClass}`, number>>;
  cognition: { kind: 'MEMBER_TURN'; invoked: false };
  constructedAt: string;
}

/** The member's own words never appear here. A prefix identifies without disclosing. */
export function idPrefix(id: string | null | undefined): string {
  if (!id) return '(none)';
  return id.length <= 8 ? id : `${id.slice(0, 8)}…`;
}
