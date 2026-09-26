// lib/council/councilQuestions.ts
//
// Council Lens — the six elder-functions (single source of truth).
//
// These translate an elderhood *relational pattern* into MAIA: courage where
// there is fear, agreement where there is conflict, the long view, the voice
// least heard, and hope / interdependence. They are facets of one reflection —
// NOT personified councillors, named elders, or authorities of any tradition.
//
// Borrowed pattern, never a brand: no affiliation with, or reference to, "The
// Elders" or any named person is implied or permitted.
//
// Design brief: docs/specs/COUNCIL_LENS_DESIGN_2026-06-11.md
//
// Imported by the client lens buttons (components/studio/SessionReviewChat.tsx)
// so the wording has one home. The server-side runtime guardrail lives beside
// it in ./councilPreamble.

import type { Element } from '@/lib/types/interpretive-ledger';

export interface CouncilFunction {
  /** stable key */
  key: string;
  /** short button label */
  label: string;
  /** the element whose register carries this function */
  element: Element;
  /** the question this function asks of the session material */
  question: string;
}

/**
 * Five elemental voices, one elder-function each — mirroring the latent
 * "Council Report — one voice per element" primitive. Interdependence / ubuntu
 * is folded into the Aether voice (hope & the whole).
 */
export const COUNCIL_FUNCTIONS: CouncilFunction[] = [
  {
    key: 'courage',
    label: 'Courage & fear',
    element: 'fire',
    question:
      'What courage was being asked for in this session, and what fear was operating against it?',
  },
  {
    key: 'unheard',
    label: 'The unheard voice',
    element: 'water',
    question:
      'Whose voice was least represented in this session — present or absent — and what might they say if they were here?',
  },
  {
    key: 'long-view',
    label: 'The long view',
    element: 'earth',
    question:
      'What is the long view here? What root cause is being worked around for short-term relief?',
  },
  {
    key: 'agreement',
    label: 'Conflict & agreement',
    element: 'air',
    question:
      'Where is conflict masking a possible agreement? What is each side actually protecting?',
  },
  {
    key: 'hope',
    label: 'Hope & the whole',
    element: 'aether',
    question:
      'Where is hope still structurally available — not as reassurance but as real option — and what does the whole field need, not only its loudest part?',
  },
];

/**
 * The full-council prompt: convene every elemental voice in one reflection.
 * Mirrors the "one voice per element" primitive already latent in the
 * Spiralogic lens, organised around the elder-functions.
 */
export const COUNCIL_FULL_PROMPT =
  'Convene a full council reflection on this session — one short passage per element (Fire: courage & fear · Water: the unheard voice · Earth: the long view · Air: conflict & agreement · Aether: hope & the whole). Let the voices stand side by side, permitted to disagree, and leave me with the question to weigh.';
