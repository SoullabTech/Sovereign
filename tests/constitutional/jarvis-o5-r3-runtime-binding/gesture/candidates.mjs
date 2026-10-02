/** O5-R3 RB-A5 — deliberate wrong readings of gesture separation. */
import { REAL_GESTURE } from './falsifiers.mjs';

export const REAL = REAL_GESTURE;
const variant = (patch) => Object.freeze({ ...REAL, ...patch });
const candidate = (id, named, law, subject) => ({ id, named, law, subject });

export const GS_CANDIDATES = Object.freeze([
  candidate('DC-GS1', 'GS-1 no grant remains review-only',
    'absence of a grant is treated as already authorized',
    variant({ activeGrantPrimaryAction: () => 'REVIEW_AUTHORIZED' })),
  candidate('DC-GS2', 'GS-2 active grant does not expose Confirm directly',
    'an ACTIVE grant immediately becomes a Confirm Execute affordance',
    variant({ activeGrantPrimaryAction: (g) => g ? 'CONFIRM_EXECUTE' : 'REVIEW_EXACT' })),
  candidate('DC-GS3', 'GS-3 active grant without review cannot confirm',
    'missing post-authorization review is treated as implicit approval',
    variant({ confirmationReviewed: (g, r) => g && !r ? true : REAL.confirmationReviewed(g, r) })),
  candidate('DC-GS4', 'GS-4 pre-authorization review cannot be reused',
    'a same-grant preview is reusable even though it predates authorization',
    variant({ confirmationReviewed: (g, r) => !!(g && r && r.grant_id === g) })),
  candidate('DC-GS5', 'GS-5 review for another grant cannot confirm',
    'fresh-review flag is checked but exact grant identity is ignored',
    variant({ confirmationReviewed: (g, r) => !!(g && r?.confirmation_review === true) })),
  candidate('DC-GS6', 'GS-6 exact fresh review may expose Confirm',
    'Confirm Execute can never become available even after the separate lawful review',
    variant({ confirmationReviewed: () => false })),
  candidate('DC-GS7', 'GS-7 confirm arm is Work Unit-bound',
    'the final UI arm ignores Work Unit identity',
    variant({ confirmArmed: (_wu, g, r) => !!(g && r?.grant_id === g && r?.confirmation_review === true) })),
  candidate('DC-GS8', 'GS-8 exact confirm arm may cross the membrane',
    'the final reviewed execution gesture can never invoke Confirm',
    variant({ confirmArmed: () => false })),
  candidate('DC-GS9', 'GS-9 confirm arm is grant-bound',
    'the final UI arm ignores grant identity',
    variant({ confirmArmed: (wu, _g, r) => !!(wu && r?.work_unit_id === wu && r?.confirmation_review === true) })),
]);
