/**
 * Elemental Invitation Gate — the constraint that turns "a lens is a vantage, not a verdict"
 * from a principle into a gate with a test.
 *
 * The architectural rule (docs/lenses/ELEMENTAL_VANTAGE_NOT_VERDICT_2026-06-07.md): elemental
 * lenses are *modes of attending* MAIA looks FROM — they may organize MAIA's attention and inform
 * its invitations; they may NOT classify the member or diagnose the member's interior. The breach is
 * not noticing — it is *declaring*. "I'm attending in an Air direction" / "the word 'freedom' seems
 * to carry several meanings" is a vantage on the material. "You're in Air" / "you need clarity" /
 * "you're intellectualizing" is a verdict on the person.
 *
 * This gate is the OUTPUT half of the constraint: a drafted elemental invitation may surface only if
 * it carries no verdict-about-the-member. It is *fail-closed* with respect to what the hearth detects:
 * any blocking category present ⇒ the invitation does not surface. Detection is the existing
 * epistemicLint heuristic — so the gate is only as complete as that heuristic, and it errs toward
 * blocking (a false positive costs one suppressed invitation; a false negative costs a breach).
 *
 * It does NOT implement the TRIGGER half (there must be no code path from an inferred member-state to
 * a surfaced offer — offers fire only on member-authoring or an inspectable feature of the content).
 * That is a structural constraint, specced in the doctrine doc and enforceable by a static guard in
 * the spirit of `check:no-supabase`; it cannot be a single pure function and is not asserted here.
 *
 * STATUS: Designed → built + unit-tested. NOT wired to author or filter any member-facing output
 * (vessel discipline: inspectable before powerful). Wire-in is a separate, explicit step.
 */

import { lintEpistemicVoice, type EpistemicLintResult, type DeclaringCategory } from '../epistemicLint';
import { deriveContentFeature, type ContentFeatureResult } from './contentFeature';

/**
 * Categories that are verdicts ABOUT THE MEMBER (or borrowed authority over them) and therefore may
 * never surface inside an elemental invitation. `over_certainty` is intentionally excluded — on its
 * own it is mild ('watch', not a breach) and blocking on it would suppress ordinary speech.
 */
export const BLOCKING_CATEGORIES: readonly DeclaringCategory[] = [
  'member_state_verdict',
  'identity_declaration',
  'imperative_command',
  'ontological_self_claim',
  'external_authority',
  'oracle_or_destiny',
] as const;

export interface InvitationGateResult {
  /** true only when the text carries no detected verdict-about-the-member */
  maySurface: boolean;
  /** the blocking categories that fired (empty when maySurface is true) */
  reasons: DeclaringCategory[];
  /** the full hearth result, for inspection */
  lint: EpistemicLintResult;
}

/**
 * Gate a drafted elemental invitation. Pure and side-effect-free.
 * `maySurface` is false if any blocking category is present in the text.
 */
export function gateElementalInvitation(text: string): InvitationGateResult {
  const lint = lintEpistemicVoice(text);
  const reasons = Array.from(
    new Set(
      lint.declaringHits
        .map((h) => h.category)
        .filter((c) => BLOCKING_CATEGORIES.includes(c)),
    ),
  );
  return { maySurface: reasons.length === 0, reasons, lint };
}

/** Convenience: true when a drafted invitation is clean enough to surface to the member. */
export function maySurfaceToMember(text: string): boolean {
  return gateElementalInvitation(text).maySurface;
}

export interface OfferDecision {
  /** true only when BOTH halves pass: an inspectable trigger exists AND the draft carries no verdict */
  mayOffer: boolean;
  reason: 'ok' | 'no-inspectable-content-feature' | DeclaringCategory;
  /** the derived trigger (over member text — never a caller-asserted boolean) */
  trigger: ContentFeatureResult;
  /** the output-gate result on the drafted invitation */
  gate: InvitationGateResult;
}

/**
 * The full offer-gate: an elemental invitation may be offered only if (a) the trigger is *derived*
 * from an inspectable feature of the MEMBER's text — never asserted by the caller, never from MAIA's
 * inference about the member's interior — and (b) the drafted invitation carries no verdict-about-the-
 * member. `deriveContentFeature` takes only `memberText`, so there is no parameter through which an
 * inferred member-state can reach this decision. That is "no code path" as a property, not a promise.
 *
 * `memberText` must be the member's own words / shared material, never MAIA's draft (a static guard,
 * not yet written, must enforce that at the call sites). Pure and side-effect-free.
 */
export function mayOfferElementalInvitation(memberText: string, draft: string): OfferDecision {
  const trigger = deriveContentFeature(memberText);
  const gate = gateElementalInvitation(draft);
  if (!trigger.feature) return { mayOffer: false, reason: 'no-inspectable-content-feature', trigger, gate };
  if (!gate.maySurface) return { mayOffer: false, reason: gate.reasons[0] ?? 'member_state_verdict', trigger, gate };
  return { mayOffer: true, reason: 'ok', trigger, gate };
}
