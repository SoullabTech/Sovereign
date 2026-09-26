import type { CapabilityAwarenessRecord } from '../../../../lib/maia/capabilityAwarenessProjection';

export const REFERENCE: readonly CapabilityAwarenessRecord[] = [
  {
    "id": "journal.create",
    "domain": "journal",
    "humanMovement": "expression",
    "species": "modal_action",
    "lifecycle": "DECLARED",
    "authorityGateStanding": "PARTIAL",
    "researchDependency": "NONE"
  },
  {
    "id": "journal.save",
    "domain": "journal",
    "humanMovement": "expression/continuity",
    "species": "modal_action",
    "lifecycle": "DECLARED",
    "authorityGateStanding": "PARTIAL",
    "researchDependency": "NONE"
  },
  {
    "id": "journal.dream",
    "domain": "journal",
    "humanMovement": "expression/reflection",
    "species": "modal_action",
    "lifecycle": "DECLARED",
    "authorityGateStanding": "PARTIAL",
    "researchDependency": "NONE"
  },
  {
    "id": "astrology.reading",
    "domain": "astrology",
    "humanMovement": "pattern/learning/reflection",
    "species": "room",
    "lifecycle": "DECLARED",
    "authorityGateStanding": "COMPLETE",
    "researchDependency": "INTERPRETIVE_STANDING_REQUIRED"
  },
  {
    "id": "astrology.transit.current",
    "domain": "astrology",
    "humanMovement": "pattern/timing",
    "species": "room",
    "lifecycle": "DECLARED",
    "authorityGateStanding": "COMPLETE",
    "researchDependency": "INTERPRETIVE_STANDING_REQUIRED"
  },
  {
    "id": "astrology.transit.personal",
    "domain": "astrology",
    "humanMovement": "pattern/timing/reflection",
    "species": "room",
    "lifecycle": "DECLARED",
    "authorityGateStanding": "COMPLETE",
    "researchDependency": "INTERPRETIVE_STANDING_REQUIRED"
  },
  {
    "id": "wisdom.open",
    "domain": "wisdom",
    "humanMovement": "learning/orientation",
    "species": "portal",
    "lifecycle": "DECLARED",
    "authorityGateStanding": "COMPLETE",
    "researchDependency": "NONE"
  },
  {
    "id": "wisdom.surface",
    "domain": "wisdom",
    "humanMovement": "learning/reflection",
    "species": "portal",
    "lifecycle": "DECLARED",
    "authorityGateStanding": "COMPLETE",
    "researchDependency": "SOURCE_GOVERNED"
  },
  {
    "id": "wisdom.text.open",
    "domain": "wisdom",
    "humanMovement": "learning",
    "species": "archive",
    "lifecycle": "DECLARED",
    "authorityGateStanding": "UNRESOLVED",
    "researchDependency": "SOURCE_GOVERNED"
  },
  {
    "id": "relationship.reflect",
    "domain": "relationships",
    "humanMovement": "relationship/reflection",
    "species": "room",
    "lifecycle": "DECLARED",
    "authorityGateStanding": "COMPLETE",
    "researchDependency": "NONE"
  },
  {
    "id": "shadow.open",
    "domain": "shadow",
    "humanMovement": "reflection/discernment",
    "species": "modal_action",
    "lifecycle": "DECLARED",
    "authorityGateStanding": "UNRESOLVED",
    "researchDependency": "UNKNOWN"
  },
  {
    "id": "studio.choose",
    "domain": "studios",
    "humanMovement": "orientation/stewardship",
    "species": "transition",
    "lifecycle": "DECLARED",
    "authorityGateStanding": "PARTIAL",
    "researchDependency": "NONE"
  },
  {
    "id": "studio.writer.open",
    "domain": "writers-studio",
    "humanMovement": "creation/expression",
    "species": "studio",
    "lifecycle": "DECLARED",
    "authorityGateStanding": "UNRESOLVED",
    "researchDependency": "NONE"
  },
  {
    "id": "studio.personal.open",
    "domain": "personal-studio",
    "humanMovement": "personal-stewardship",
    "species": "studio",
    "lifecycle": "DECLARED",
    "authorityGateStanding": "UNRESOLVED",
    "researchDependency": "NONE"
  },
  {
    "id": "studio.pro.open",
    "domain": "pro-studio",
    "humanMovement": "professional-stewardship",
    "species": "studio",
    "lifecycle": "DECLARED",
    "authorityGateStanding": "UNRESOLVED",
    "researchDependency": "NONE"
  },
  {
    "id": "booking.practitioner.request",
    "domain": "booking",
    "humanMovement": "relationship/stewardship",
    "species": "utility",
    "lifecycle": "DECLARED",
    "authorityGateStanding": "UNRESOLVED",
    "researchDependency": "NONE"
  },
  {
    "id": "studio.session.create",
    "domain": "pro-studio",
    "humanMovement": "professional-stewardship",
    "species": "studio",
    "lifecycle": "DECLARED",
    "authorityGateStanding": "PARTIAL",
    "researchDependency": "NONE"
  },
  {
    "id": "pattern.detect",
    "domain": "pattern",
    "humanMovement": "pattern/discernment",
    "species": "integrative_field",
    "lifecycle": "WITHHELD",
    "authorityGateStanding": "WITHHELD",
    "researchDependency": "HYPOTHESIS_DEPENDENT"
  }
] as const;

function clone(): any[] {
  return JSON.parse(JSON.stringify(REFERENCE));
}

export const DEFEAT_CANDIDATES: Readonly<Record<string, () => any[]>> = {
  'DROP-ONE-ID': () => { const x = clone(); x.splice(3, 1); return x; },
  'DUPLICATE-ID': () => { const x = clone(); x[5].id = x[4].id; return x; },
  'REORDER-TWO': () => { const x = clone(); [x[0], x[1]] = [x[1], x[0]]; return x; },
  'PATTERN-DECLARED': () => { const x = clone(); x[17].lifecycle = 'DECLARED'; return x; },
  'PATTERN-ROOM': () => { const x = clone(); x[17].species = 'room'; return x; },
  'COLLAPSE-ASTROLOGY-TRANSIT-ID': () => { const x = clone(); x[5].id = 'astrology.transit.current'; return x; },
  'WISDOM-TEXT-AS-PORTAL': () => { const x = clone(); x[8].species = 'portal'; return x; },
  'REINTRODUCE-DEPTH-SHADOW': () => { const x = clone(); x[10].id = 'depth.shadow'; return x; },
  'STUDIO-CHOOSER-AS-STUDIO': () => { const x = clone(); x[11].species = 'studio'; return x; },
  'BOOKING-AS-STUDIO': () => { const x = clone(); x[15].species = 'studio'; return x; },
  'ADD-AVAILABLE': () => { const x = clone(); x[0].available = true; return x; },
  'ADD-ECONOMIC-CLASS': () => { const x = clone(); x[0].economicClass = 'FREE_FOUNDATION'; return x; },
  'ADD-MEMBER-ID': () => { const x = clone(); x[0].memberId = 'member-secret'; return x; },
};

export const NAMED_KILL: Readonly<Record<string, string>> = {
  'DROP-ONE-ID': 'IDENTITY_COMPLETENESS',
  'DUPLICATE-ID': 'IDENTITY_COMPLETENESS',
  'REORDER-TWO': 'ORDER_CUSTODY',
  'PATTERN-DECLARED': 'WITHHELD_LEGIBILITY',
  'PATTERN-ROOM': 'WITHHELD_LEGIBILITY',
  'COLLAPSE-ASTROLOGY-TRANSIT-ID': 'ASTROLOGY_FAMILY_CUSTODY',
  'WISDOM-TEXT-AS-PORTAL': 'WISDOM_DIFFERENTIATION',
  'REINTRODUCE-DEPTH-SHADOW': 'NO_LEGACY_IDENTITIES',
  'STUDIO-CHOOSER-AS-STUDIO': 'STUDIO_DIFFERENTIATION',
  'BOOKING-AS-STUDIO': 'BOOKING_DIFFERENTIATION',
  'ADD-AVAILABLE': 'NO_OPERATIONAL_AWARENESS',
  'ADD-ECONOMIC-CLASS': 'NO_OPERATIONAL_AWARENESS',
  'ADD-MEMBER-ID': 'NO_MEMBER_RELATIVE_RESULT',
};

export const CLASSIFIED_COLLATERAL: Readonly<Record<string, readonly string[]>> = {
  'DROP-ONE-ID': ['ORDER_CUSTODY', 'ASTROLOGY_FAMILY_CUSTODY'],
  'DUPLICATE-ID': ['ORDER_CUSTODY', 'ASTROLOGY_FAMILY_CUSTODY'],
  'COLLAPSE-ASTROLOGY-TRANSIT-ID': ['IDENTITY_COMPLETENESS', 'ORDER_CUSTODY'],
  'REINTRODUCE-DEPTH-SHADOW': ['IDENTITY_COMPLETENESS', 'ORDER_CUSTODY', 'SHADOW_NAMING_CUSTODY'],
};
