/**
 * Legacy capability profiles — CMT-01, Step 2 (transitional).
 *
 * Authority: docs/architecture/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md §5
 *
 * ── ONE CONSTRUCTION MECHANISM BEFORE ONE CAPABILITY SET ───────────────────
 *
 * A's richest current assembly is NOT the canonical baseline. Making it so
 * would combine architectural convergence with capability expansion in one
 * migration and destroy the ability to attribute a behavioural change to
 * either. So Stage 1 gives each surface a profile that reproduces what it
 * invokes TODAY, and only that.
 *
 * A profile is DATA: a provider subset plus per-provider parameters. It can
 * only SUBTRACT from the Stage 1 registry — a route cannot say "and also load
 * X"; it can only name a profile. Every legacy profile carries a `sunset`
 * naming the Stage 2 adjudication that retires it; a profile without one fails
 * certification, because a "temporary" profile with no end is a permanent one.
 *
 * ── WHAT THE TWO PROFILES RECORD ────────────────────────────────────────────
 *
 * Derived from source (CANONICAL_TURN_SEAM_TOPOLOGY.md §3, spec §3.2):
 *
 *   A  /api/sovereign/app/maia/list   atoms · conversation · episodes ·
 *                                     relationship · relationship_essence ·
 *                                     developmental · themes · member_web ·
 *                                     anchors · session_recall (fallback)
 *
 *   C  /api/between/chat              relationship · significant_moments ·
 *                                     selflet (LEGACY_UNCERTIFIED) ·
 *                                     memory_bundle · ain_knowledge
 *                                     (LEGACY_UNCERTIFIED) · session_recall
 *
 * Where C reaches a provider A does not, keeping it in profile C is
 * RETENTION. Where A reaches one C does not, keeping it out of C is NOT
 * REMOVAL — C never had it. Stage 1 changes no surface's capability; that is
 * the acceptance test, witnessed in shadow (§4.1).
 */

import type { ProviderId } from './providers';

export type ProfileId = 'legacy:A' | 'legacy:C' | 'canonical';

export interface ProviderParams {
  limit?: number;
  maxThemes?: number;
  maxBreakthroughs?: number;
  includePatterns?: boolean;
  maxBullets?: number;
}

export interface TurnProfile {
  id: ProfileId;
  /** Which surface this reproduces. */
  reproduces: string;
  /** Providers invited into the turn. Subtractive against the registry. */
  providers: Readonly<Partial<Record<ProviderId, ProviderParams>>>;
  /** Legacy profiles only: the Stage 2 adjudication that retires this profile. */
  sunset?: string;
}

export const LEGACY_PROFILE_A: TurnProfile = {
  id: 'legacy:A',
  reproduces: 'app/api/sovereign/app/maia/list/route.ts — currently authorized assembly',
  providers: {
    atoms: { limit: 8 },
    conversation: { limit: 6 },
    episodes: { limit: 5 },
    relationship: { maxThemes: 5, maxBreakthroughs: 3, includePatterns: true },
    relationship_essence: {},
    developmental: { limit: 3 },
    themes: { limit: 10 },
    member_web: {},
    anchors: { limit: 3 },
    session_recall: {},
  },
  sunset: 'Stage 2 per-provider adjudication (spec §6) — profile deleted when every A-only provider is PROMOTE/REMOVE/RETAIN/DEFER-adjudicated',
};

export const LEGACY_PROFILE_C: TurnProfile = {
  id: 'legacy:C',
  reproduces: 'app/api/between/chat/route.ts via lib/consciousness/maiaOrchestrator.ts — currently authorized assembly',
  providers: {
    relationship: { maxThemes: 5, maxBreakthroughs: 3, includePatterns: true },
    significant_moments: { maxBreakthroughs: 10 },
    selflet: {},
    memory_bundle: { maxBullets: 5 },
    ain_knowledge: {},
    session_recall: {},
  },
  sunset: 'Stage 2 per-provider adjudication (spec §6) — the two LEGACY_UNCERTIFIED providers require independent certification before PROMOTE; profile deleted after',
};

/**
 * The end state. Deliberately EMPTY at Stage 1: it is populated only by Stage 2
 * PROMOTE decisions, never by copying a legacy profile. An empty canonical
 * profile is the honest statement that no provider has yet been adjudicated
 * canonical across surfaces.
 */
export const CANONICAL_PROFILE: TurnProfile = {
  id: 'canonical',
  reproduces: 'no surface — populated by Stage 2 PROMOTE decisions only',
  providers: {},
};

export const TURN_PROFILES: Readonly<Record<ProfileId, TurnProfile>> = {
  'legacy:A': LEGACY_PROFILE_A,
  'legacy:C': LEGACY_PROFILE_C,
  canonical: CANONICAL_PROFILE,
};
