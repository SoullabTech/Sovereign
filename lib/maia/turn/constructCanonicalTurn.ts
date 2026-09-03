/**
 * The canonical turn constructor — CMT-01, Step 2. SHADOW ONLY.
 *
 * Authority: docs/architecture/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md §4, §4.1, §7
 *
 * ── WHAT THIS IS AT STEP 2 ──────────────────────────────────────────────────
 *
 * The one place a member turn is assembled — and, at this step, a place with
 * NO AUTHORITATIVE CALLER. It constructs a typed bundle and a Participation
 * Manifest and hands them back. It does not invoke cognition. It does not
 * change any route's capability. It does not produce a response. Rollback is
 * deletion.
 *
 * Step 3 runs it in SHADOW beside each route's legacy assembly for the same
 * turn and compares structure. Only after a zero-diff witness does it become
 * authoritative (§11, step 5), and at that point route-local assembly is
 * removed — not flagged off.
 *
 * ── WHAT IT OWNS ────────────────────────────────────────────────────────────
 *
 *   WHICH providers are invited      ← by profile, subtractive
 *           ↓
 *   candidate acquisition            ← providers, in parallel, frame only
 *           ↓
 *   MIPA adjudication                ← the SHARED gate; verdicts carried, never upgraded
 *           ↓
 *   composition                      ← typed bundle; excluded arms have no body
 *           ↓
 *   participation evidence           ← the manifest
 *
 * Sanctuary is honoured HERE: a sanctuary frame invokes no member-scoped
 * provider and the manifest records every one as held. Sanctuary is a property
 * of construction, not a flag each route remembers to check.
 */

import { adjudicateParticipation } from '../participationGate';
import type { ExclusionReason, AuthoredBy, AuthorityClass } from '../participationGate';
import { __brandCanonicalTurn, type CanonicalTurn } from './invocation';
import {
  STAGE1_PROVIDER_REGISTRY,
  consentAllows,
  type TurnFrame,
  type ProviderId,
  type IntelligenceProvider,
  type Candidate,
} from './providers';
import { TURN_PROFILES } from './profiles';
import { idPrefix, type ParticipationManifest, type ProviderManifestEntry } from './manifest';

export const POLICY_VERSION = 'mipa-phase0-closed-2026-09-03';
export const RUNTIME_CONTEXT_VERSION = 'cmt-01.step2';

/** How a composed item earned its place. Auditable, never a body. */
export type AdmissionBasis =
  | { kind: 'canonical'; provenance: { authoredBy: AuthoredBy; authorityClass: AuthorityClass } }
  | { kind: 'upstream'; gate: string }
  | { kind: 'legacy_uncertified' };

export interface ComposedItem {
  id: string;
  basis: AdmissionBasis;
  body: unknown;
}

/**
 * Typed by provider. There is no `meta`; there is no `Record<string, unknown>`.
 * A provider absent from the profile is absent from the bundle — not present
 * and empty, because "not invited" and "invited and found nothing" are
 * different facts and the manifest keeps them apart.
 */
export type CanonicalContextBundle = Readonly<Partial<Record<ProviderId, readonly ComposedItem[]>>>;

export interface Adjudicated {
  admitted: ComposedItem[];
  excludedByReason: Partial<Record<ExclusionReason, number>>;
  admittedUpstream: number;
  admittedLegacyUncertified: number;
}

/**
 * Exported for certification. The `profileIsLegacy` guard on the
 * LEGACY_UNCERTIFIED arm is unreachable through the public constructor at
 * Stage 1 — the canonical profile lists no providers — and a guard nothing
 * reaches is not certified. Mutation K6 removed it and every test passed.
 */
export function adjudicateCandidates(
  provider: IntelligenceProvider,
  candidates: readonly Candidate[],
  profileIsLegacy: boolean,
): Adjudicated {
  const out: Adjudicated = { admitted: [], excludedByReason: {}, admittedUpstream: 0, admittedLegacyUncertified: 0 };
  const exclude = (r: ExclusionReason) => {
    out.excludedByReason[r] = (out.excludedByReason[r] ?? 0) + 1;
  };

  for (const c of candidates) {
    const a = c.adjudication;
    if (a.kind === 'upstream') {
      // A certified gate spoke. Carried, never upgraded.
      if (a.verdict === 'excluded') exclude(a.reason ?? 'uncertified_provenance');
      else {
        out.admittedUpstream++;
        out.admitted.push({ id: c.id, basis: { kind: 'upstream', gate: a.gate }, body: c.body });
      }
      continue;
    }
    if (a.kind === 'legacy_uncertified') {
      // Composable ONLY under a legacy profile that lists an uncertified
      // provider. Under 'canonical' this is a refusal, not a pass-through.
      if (profileIsLegacy && provider.participationStatus === 'LEGACY_UNCERTIFIED') {
        out.admittedLegacyUncertified++;
        out.admitted.push({ id: c.id, basis: { kind: 'legacy_uncertified' }, body: c.body });
      } else {
        exclude('uncertified_provenance');
      }
      continue;
    }
    // No gate has spoken: the shared adjudicator decides.
    const v = adjudicateParticipation({ provenance: a.provenance, endorsement: a.endorsement });
    if (!v.admitted) exclude(v.reason);
    else out.admitted.push({ id: c.id, basis: { kind: 'canonical', provenance: v.provenance }, body: c.body });
  }
  return out;
}

export async function constructCanonicalTurn(frame: TurnFrame): Promise<CanonicalTurn> {
  const profile = TURN_PROFILES[frame.profile];
  const profileIsLegacy = profile.id !== 'canonical';
  const entries: ProviderManifestEntry[] = [];
  const bundle: Partial<Record<ProviderId, ComposedItem[]>> = {};
  const provenanceClasses: ParticipationManifest['provenanceClasses'] = {};

  const invocations = (Object.keys(STAGE1_PROVIDER_REGISTRY) as ProviderId[]).map(async (id) => {
    const provider = STAGE1_PROVIDER_REGISTRY[id];
    const entry: ProviderManifestEntry = {
      id,
      scope: provider.scope,
      participationStatus: provider.participationStatus,
      governedBy: provider.governedBy,
      invoked: false,
      returned: 0,
      excluded: 0,
      excludedByReason: {},
      admitted: 0,
      admittedUpstream: 0,
      admittedLegacyUncertified: 0,
      composed: 0,
    };

    const params = profile.providers[id];
    if (!params) {
      entry.held = { reason: 'not_in_profile' };
      return entry;
    }
    if (frame.encounter.sanctuary && provider.scope === 'member') {
      entry.held = { reason: 'sanctuary' };
      return entry;
    }
    if (provider.consentGate) {
      const allowed = await consentAllows(frame.identity.memberId, provider.consentGate);
      if (!allowed) {
        entry.held = { reason: 'consent_gate_off', gate: provider.consentGate };
        return entry;
      }
    }

    entry.invoked = true;
    const result = await provider.retrieve(frame, params);
    if (result.error) entry.error = result.error;
    entry.returned = result.candidates.length;

    const adj = adjudicateCandidates(provider, result.candidates, profileIsLegacy);
    entry.excludedByReason = adj.excludedByReason;
    entry.excluded = Object.values(adj.excludedByReason).reduce((a, b) => a + (b ?? 0), 0);
    entry.admitted = adj.admitted.length;
    entry.admittedUpstream = adj.admittedUpstream;
    entry.admittedLegacyUncertified = adj.admittedLegacyUncertified;

    if (adj.admitted.length > 0) {
      bundle[id] = adj.admitted;
      entry.composed = adj.admitted.length;
      for (const item of adj.admitted) {
        if (item.basis.kind === 'canonical') {
          const k = `${item.basis.provenance.authoredBy}:${item.basis.provenance.authorityClass}` as const;
          provenanceClasses[k] = (provenanceClasses[k] ?? 0) + 1;
        }
      }
    }
    return entry;
  });

  const settled = await Promise.all(invocations);
  entries.push(...settled);

  const manifest: ParticipationManifest = {
    version: 'cmt-01.manifest.v1',
    mode: 'shadow',
    identity: {
      memberIdPrefix: idPrefix(frame.identity.memberId),
      credentialPath: frame.identity.credentialPath,
    },
    encounter: {
      sessionIdPrefix: idPrefix(frame.encounter.sessionId),
      mode: frame.encounter.mode,
      modality: frame.encounter.modality,
      sanctuary: frame.encounter.sanctuary,
    },
    profile: profile.id,
    policyVersion: POLICY_VERSION,
    runtimeContextVersion: RUNTIME_CONTEXT_VERSION,
    providers: entries,
    provenanceClasses,
    cognition: { kind: 'MEMBER_TURN', invoked: false },
    constructedAt: new Date().toISOString(),
  };

  return __brandCanonicalTurn({
    frame,
    bundle,
    manifest,
    policyVersion: POLICY_VERSION,
    runtimeContextVersion: RUNTIME_CONTEXT_VERSION,
  });
}
