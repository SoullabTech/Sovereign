'use client';

/**
 * Legacy Field — inside Field Lab (Center of Inquiry: person).
 *
 * One conversation in which MAIA helps a member recognize the threads of what is
 * most alive in their life and work, which the member then authors — or chooses
 * not to. The authored crossing, not the conversation, is the product.
 *
 * Invariant (load-bearing — do not soften):
 *   - The member is always free to leave with nothing. That is a success.
 *   - Nothing here builds a model of the person (no categories, no elements, no
 *     scores, no Spiralogic mapping). Only an authored thread crosses, by consent.
 *   - MAIA proposes; she never declares. Proposing nothing is faithful.
 *
 * Same recognition engine as Vision Studio (../vision-studio); only the Center of
 * Inquiry differs. Spec: docs/specs/FIELD_LAB_CONVERSATIONAL_INTERVIEW_SPEC_2026-06-26.md
 */

import { FieldLabFrame } from '@/components/maia/field-lab/FieldLabFrame';
import { CrossingRoom } from '@/components/maia/field-lab/CrossingRoom';

export default function LegacyFieldPage() {
  return (
    <FieldLabFrame
      title="Legacy Field"
      status="Experimental · Recognition, not assessment · Consent-gated · Always free to leave with nothing"
      exploring="A reflective conversation in your own words. MAIA helps you recognize what is most alive in your life and work; you author the threads that are yours — or keep nothing. Recognition ends the conversation; the clock never does."
    >
      <CrossingRoom center="person" />
    </FieldLabFrame>
  );
}
