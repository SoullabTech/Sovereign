/**
 * lib/maia/canonical-turn — CMT-01. Spec: docs/programme/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md
 *
 *   CanonicalTurn          the boundary            (types.ts, construct.ts)
 *   PRODUCER_REGISTRY      what may exist          (producerRegistry.ts)
 *   adjudicateParticipation — MIPA — what may enter (adjudicate.ts, policy.ts)
 *   resolveCanonicalIdentity one resolver          (identity.ts)
 *   TurnParticipationManifest evidence             (manifest.ts)
 *   renderTurnForCognition one renderer            (render.ts)
 *   shadow                 M2 zero-diff instrument (shadow.ts)
 */
export * from './types';
export { PRODUCER_REGISTRY, PRODUCER_IDS, isProducerId, producerSpec, type ProducerId, type ProducerSpec } from './producerRegistry';
export { PARTICIPATION_POLICY_VERSION, RESTRAINT_RULES, POLICY_OVERRIDES, ROOM_POLICIES, policyDecision, producersForRoom } from './policy';
export { adjudicateParticipation, type AdjudicationInput } from './adjudicate';
export { resolveCanonicalIdentity, isMintedIdentity, type ResolveIdentityOptions } from './identity';
export { composeConstitutionalFloor } from './floor';
export { buildManifest, emitManifest, MANIFEST_MARKER } from './manifest';
export { renderTurnForCognition, type TierStrategy, type RenderedPrompt } from './render';
export { constructCanonicalTurn, type ConstructInputs } from './construct';
export {
  SHADOW_MARKER, LEGACY_META_KEY_TO_PRODUCER, candidatesFromLegacyAddenda,
  compareLegacyToCanonical, emitShadowDiff, type LegacyAddenda, type LegacyMetaKey, type ShadowDiff,
} from './shadow';
