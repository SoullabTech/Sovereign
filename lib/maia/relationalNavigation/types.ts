/**
 * Relational Navigation Room — types
 *
 * Invariant: these types describe the MEMBER's input and MAIA's structured
 * response. There is no type that describes the absent third party — by
 * design. If you find yourself wanting to add `OtherPartyProfile` or
 * `RelationshipModel`, stop. That is the elegant inversion the Spiral
 * Continuity Engine warns about.
 *
 * Spec: docs/specs/RELATIONAL_NAVIGATION_ROOM.md
 */

export type LensKey =
  | 'needs'
  | 'boundaries'
  | 'power'
  | 'protection'
  | 'attachment'
  | 'conflict'
  | 'repair'
  | 'grief'
  | 'shadow'
  | 'somatic'
  | 'systems'
  | 'compassionate_reframe';

export interface Lens {
  key: LensKey;
  label: string;
  invitation: string;
}

export const LENSES: Lens[] = [
  {
    key: 'needs',
    label: 'Needs',
    invitation: 'What is being asked for, on either side?',
  },
  {
    key: 'boundaries',
    label: 'Boundaries',
    invitation: 'What is mine to hold, what is not?',
  },
  {
    key: 'power',
    label: 'Power',
    invitation: 'Where does the power live in this exchange?',
  },
  {
    key: 'protection',
    label: 'Protection',
    invitation: 'What is being protected — in me, by them?',
  },
  {
    key: 'attachment',
    label: 'Attachment',
    invitation: 'What attachment patterns are showing up in me?',
  },
  {
    key: 'conflict',
    label: 'Conflict',
    invitation: 'What is the conflict actually about?',
  },
  {
    key: 'repair',
    label: 'Repair',
    invitation: 'What would repair look like, if either of us wanted it?',
  },
  {
    key: 'grief',
    label: 'Grief',
    invitation: 'What grief, if any, is in this?',
  },
  {
    key: 'shadow',
    label: 'Shadow',
    invitation: 'What am I not seeing in myself here?',
  },
  {
    key: 'somatic',
    label: 'Somatic / Nervous System',
    invitation: 'What is my body telling me?',
  },
  {
    key: 'systems',
    label: 'Systems / Role Pressure',
    invitation: 'What roles or systems are shaping this?',
  },
  {
    key: 'compassionate_reframe',
    label: 'Compassionate Reframe',
    invitation:
      "What's another way of holding this that doesn't deny what's hard?",
  },
];

export type FlowMode = 'prepare' | 'integrate';

export interface PrepareInput {
  mode: 'prepare';
  context: string;
  relationalTag?: string; // optional, member-typed, free text
  whatMatters: string;
  whatIHopeFor: string;
  whatIFear: string;
  whatINeedToStayTrueTo: string;
  lenses: LensKey[]; // member-selected, 1–4
  sanctuary: boolean;
}

export interface IntegrateInput {
  mode: 'integrate';
  context: string;
  relationalTag?: string;
  whatHappened: string;
  whatFeltClear: string;
  whatFeltUnresolved: string;
  whatSurprisedMe: string;
  whatIWishIHadSaid: string;
  possibleNextStep: string;
  lenses: LensKey[];
  sanctuary: boolean;
}

export type FlowInput = PrepareInput | IntegrateInput;

/**
 * Structured response shape. The system prompt instructs the model to return
 * JSON matching this shape so the UI can render section-by-section. If
 * parsing fails, the UI degrades gracefully to a single rendered text block —
 * but the model is also instructed to write the prose so it reads as one
 * coherent reflection, never a robotic checklist.
 */
export interface PrepareResponse {
  mode: 'prepare';
  mirror: string;
  clarifiedIntention: string;
  approaches: string[]; // 3–5, each provisional
  possibleOpening: string;
  nervousSystemCheck: string;
  boundariesAndSupport: string;
  closing: string; // returns authority to member
  knowFeltInferredUnknown: KnowFeltInferredUnknown;
}

export interface IntegrateResponse {
  mode: 'integrate';
  mirror: string;
  possibleReadings: string[]; // 3, explicitly provisional, lens-shaped
  whatBelongsToYou: string;
  whatRemainsUnknown: string;
  nextStepOptions: NextStepOption[];
  closing: string;
  knowFeltInferredUnknown: KnowFeltInferredUnknown;
}

export interface KnowFeltInferredUnknown {
  known: string;
  felt: string;
  inferred: string;
  unknown: string;
}

export interface NextStepOption {
  kind: 'communication' | 'boundary' | 'repair' | 'pause';
  label: string;
  description: string;
}

export type FlowResponse = PrepareResponse | IntegrateResponse;

/**
 * Refusal shape. Used when the request itself is shaped as profiling /
 * diagnosis / certainty about the absent party. We do not throw — we return
 * a structured refusal that the UI renders gently.
 */
export interface FlowRefusal {
  refusal: true;
  reframe: string; // member-facing reframe of the question
  invitation: string; // how MAIA can support instead
}
