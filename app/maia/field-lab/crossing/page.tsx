'use client';

/**
 * The Crossing — inside Field Lab.
 *
 * The first experiment in Reflective Companionship: one conversation in which
 * MAIA helps a member recognize a thread that feels genuinely theirs, which the
 * member then authors — or chooses not to. The authored crossing, not the
 * conversation, is the product.
 *
 * Invariant (load-bearing — do not soften):
 *   - The member is always free to leave with nothing. That is a success.
 *   - Nothing here builds a model of the person (no categories, no elements, no
 *     scores). The conversation is ephemeral; only an authored thread crosses.
 *   - MAIA proposes; she never declares. Proposing nothing is faithful.
 *
 * Spec: docs/specs/FIELD_LAB_CONVERSATIONAL_INTERVIEW_SPEC_2026-06-26.md
 */

import { FieldLabFrame } from '@/components/maia/field-lab/FieldLabFrame';
import { CrossingRoom } from '@/components/maia/field-lab/CrossingRoom';

export default function CrossingPage() {
  return (
    <FieldLabFrame
      title="The Crossing"
      status="Experimental · Recognition not extraction · No persistence yet"
      exploring="Whether MAIA can help a member recognize something true about themselves that they choose to author — without becoming the author of it. Recognition ends the conversation; the clock never does, and you are always free to leave with nothing."
    >
      <CrossingRoom />
    </FieldLabFrame>
  );
}
