'use client';

/**
 * Vision Studio — inside Field Lab (Center of Inquiry: project).
 *
 * The same recognition engine as the Legacy Field (../crossing) — center-swapped
 * from the person to the WORK. One conversation in which MAIA helps the maker
 * recognize what their work is asking to become, which the maker then authors — or
 * chooses not to. The authored thread, not the conversation, is the product.
 *
 * Invariant (load-bearing — do not soften):
 *   - The maker is always free to leave with nothing. That is a success.
 *   - Nothing here builds a model of the project or the maker — no roadmap, no
 *     maturity score, no category, no Spiralogic mapping. Only an authored thread
 *     crosses, by consent.
 *   - MAIA proposes; she never declares. Proposing nothing is faithful.
 *
 * This page is the live test of a pre-registered prediction: if the recognition
 * primitive is real, a new Center of Inquiry is CONFIGURATION, not a rebuild —
 * this surface differs from the Legacy Field only by `center="project"`.
 */

import { FieldLabFrame } from '@/components/maia/field-lab/FieldLabFrame';
import { CrossingRoom } from '@/components/maia/field-lab/CrossingRoom';

export default function VisionStudioPage() {
  return (
    <FieldLabFrame
      title="Vision Studio"
      status="Experimental · Recognition, not a roadmap · Consent-gated · Always free to leave with nothing"
      exploring="A reflective conversation about the work — what it is asking to become, in your own words. MAIA helps you recognize the threads the work keeps returning to; you author the ones that are the work's own — or keep nothing. Recognition ends the conversation; the clock never does."
    >
      <CrossingRoom center="project" />
    </FieldLabFrame>
  );
}
