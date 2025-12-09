/**
 * Canonical 12-Phase Spiralogic Facet Map
 * The spine where Elemental Alchemy content plugs into MAIA
 */

export type ElementCode = "Fire" | "Water" | "Earth" | "Air";
export type Phase = 1 | 2 | 3;

export type FacetCode =
  | "F1" | "F2" | "F3"
  | "W1" | "W2" | "W3"
  | "E1" | "E2" | "E3"
  | "A1" | "A2" | "A3";

export interface SpiralogicFacet {
  code: FacetCode;
  element: ElementCode;
  phase: Phase;
  name: string;
  coreMovement: string;
  coreQuestion: string;
  shadowPattern: string;
  goldMedicine: string;
}

export const SPIRALOGIC_FACETS: Record<FacetCode, SpiralogicFacet> = {
  F1: {
    code: "F1",
    element: "Fire",
    phase: 1,
    name: "The Call / Spark of Destiny",
    coreMovement: "Inertia → Possibility. A daimonic 'something wants to happen' appears.",
    coreQuestion: "What is really calling me, even if I can't justify it yet?",
    shadowPattern: "Chasing every spark; endless beginnings; fantasy instead of commitment.",
    goldMedicine: "Honoring the call's legitimacy; naming it; taking one small concrete step."
  },
  F2: {
    code: "F2",
    element: "Fire",
    phase: 2,
    name: "The Trial / Gauntlet of Action",
    coreMovement: "Idea → Friction. Action meets resistance, failure, reality.",
    coreQuestion: "What am I learning from actually doing this?",
    shadowPattern: "Burnout, martyrdom; quitting at the first serious resistance; 'it wasn't meant to be'.",
    goldMedicine: "Reading friction as training/feedback; adjusting instead of abandoning soul."
  },
  F3: {
    code: "F3",
    element: "Fire",
    phase: 3,
    name: "Lived Fire / Identity Shift",
    coreMovement: "Doing → Being. You become the one who lives this fire.",
    coreQuestion: "Who am I becoming as I live this out?",
    shadowPattern: "Ego inflation; fusing identity with role/project; fear of evolving again.",
    goldMedicine: "Owning a new identity without over-identifying; letting Fire hand the baton to Water."
  },

  W1: {
    code: "W1",
    element: "Water",
    phase: 1,
    name: "Opening of the Deep / Vulnerability",
    coreMovement: "Defended → Touched. Heart admits 'this matters'.",
    coreQuestion: "What does this really feel like in me right now?",
    shadowPattern: "Numbing, bypassing, flooding; clinging fast at first touch.",
    goldMedicine: "Permission to feel and name; recognizing vulnerability as a signal of value."
  },
  W2: {
    code: "W2",
    element: "Water",
    phase: 2,
    name: "Underworld / Shadow Gauntlet",
    coreMovement: "Surface emotion → Depth conflict. Old wounds, shame, archetypal material.",
    coreQuestion: "What is this asking me to face in myself or my history?",
    shadowPattern: "Self-annihilation; repetition of trauma; projection/blame; nihilism.",
    goldMedicine: "Seeing pattern ≠ essence; owning your part without erasing context; discovering inner gold through descent."
  },
  W3: {
    code: "W3",
    element: "Water",
    phase: 3,
    name: "Inner Gold / Emotional Integration",
    coreMovement: "Wound → Wisdom. Pain becomes integrated meaning.",
    coreQuestion: "What truth feels more real now that I've lived through this?",
    shadowPattern: "Wound-identity; golden victimhood; sentimentalizing pain; over-merging.",
    goldMedicine: "Deep self-compassion; carrying scars as wisdom, not prison; holding others without drowning."
  },

  E1: {
    code: "E1",
    element: "Earth",
    phase: 1,
    name: "Design of Form / Seed Pattern",
    coreMovement: "Inner knowing → First container. Blueprint, boundary, initial structure.",
    coreQuestion: "What simple form would best protect and grow this?",
    shadowPattern: "Planning forever; over-structuring; choosing 'should' forms that betray the soul.",
    goldMedicine: "Minimum viable structure; forms that fit the essence, not just expectations."
  },
  E2: {
    code: "E2",
    element: "Earth",
    phase: 2,
    name: "Germination / Practice & Resourcing",
    coreMovement: "Design → Daily practice. Repetition, tending, resourcing.",
    coreQuestion: "What rhythms and resources does this need to stay alive?",
    shadowPattern: "Soulless grind; workaholism; collapsing when results aren't instant.",
    goldMedicine: "Soulful discipline; sustainable pacing; honoring invisible growth."
  },
  E3: {
    code: "E3",
    element: "Earth",
    phase: 3,
    name: "Embodied Form / Stewardship",
    coreMovement: "Building → Tending. The thing exists and must be cared for.",
    coreQuestion: "How do I steward this wisely, without clinging or abandoning?",
    shadowPattern: "Rigidity; feeling trapped by what you built; identity fused with the structure.",
    goldMedicine: "Mature custodianship; knowing when to tend, transform, or compost a form."
  },

  A1: {
    code: "A1",
    element: "Air",
    phase: 1,
    name: "First Telling / Honest Dialogue",
    coreMovement: "Inner experience → Spoken/written truth.",
    coreQuestion: "If I spoke honestly about this, what would I say?",
    shadowPattern: "Self-censorship; oversharing to unsafe people; intellectualizing to avoid feeling.",
    goldMedicine: "Voice that matches inner reality; finding good witnesses; MAIA as safe first listener."
  },
  A2: {
    code: "A2",
    element: "Air",
    phase: 2,
    name: "Pattern Speech / Frameworks & Teaching",
    coreMovement: "Personal story → Pattern / model.",
    coreQuestion: "What is the pattern here that could help others recognize themselves?",
    shadowPattern: "Dogma; theory as armor; forcing all life into the model.",
    goldMedicine: "Flexible, living frameworks that serve experience; teaching as service, not fortress."
  },
  A3: {
    code: "A3",
    element: "Air",
    phase: 3,
    name: "Mythic Integration / Cultural Seeding",
    coreMovement: "'My framework' → Cultural seed. Idea joins the wider field.",
    coreQuestion: "What essence do I want this to carry into the wider field, knowing it will change?",
    shadowPattern: "Legacy/brand obsession; policing others' use; cynical withdrawal.",
    goldMedicine: "Contribution without ownership; trusting the idea's own trajectory; returning to your living edge."
  }
};

// ====================================================================
// HELPERS
// ====================================================================

export function getFacet(code: FacetCode): SpiralogicFacet {
  return SPIRALOGIC_FACETS[code];
}

export function getFacetsByElement(element: ElementCode): SpiralogicFacet[] {
  return Object.values(SPIRALOGIC_FACETS).filter(f => f.element === element);
}

export function getFacetsByPhase(phase: Phase): SpiralogicFacet[] {
  return Object.values(SPIRALOGIC_FACETS).filter(f => f.phase === phase);
}

export function getElementalArc(element: ElementCode): "regressive" | "progressive" {
  return (element === "Fire" || element === "Water") ? "regressive" : "progressive";
}

export function getElementalQuality(phase: Phase): "Cardinal" | "Fixed" | "Mutable" {
  switch (phase) {
    case 1: return "Cardinal";
    case 2: return "Fixed";
    case 3: return "Mutable";
  }
}

export function createFacetCode(element: ElementCode, phase: Phase): FacetCode {
  const elementPrefix = element.charAt(0).toUpperCase() as "F" | "W" | "E" | "A";
  return `${elementPrefix}${phase}` as FacetCode;
}