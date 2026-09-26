import type { PresentationReconciliationRecord } from './contract';

export const REFERENCE: readonly PresentationReconciliationRecord[] = [
  {
    "capabilityId": "journal.create",
    "standing": "APPROVED",
    "name": "New Journal Entry",
    "purpose": "Begin a new Journal entry for something you want to write down.",
    "sourceRefs": [
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
      "lib/sovereign/platformKnowledge.ts"
    ],
    "authorship": "FOUNDER_AUTHORED_O7R1",
    "platformKnowledgeReconciliation": "COMPATIBLE",
    "utteranceContextCandidate": "EXPLICIT_CAPABILITY_INQUIRY_DESCRIPTION_ONLY",
    "runtimeUtterance": "NOT_AUTHORIZED"
  },
  {
    "capabilityId": "journal.save",
    "standing": "APPROVED",
    "name": "Save to Journal",
    "purpose": "Preserve the part of an exchange you choose in your Journal.",
    "sourceRefs": [
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md"
    ],
    "authorship": "FOUNDER_AUTHORED_O7R1",
    "platformKnowledgeReconciliation": "STALE_MAP_SENSITIVE",
    "utteranceContextCandidate": "EXPLICIT_CAPABILITY_INQUIRY_DESCRIPTION_ONLY",
    "runtimeUtterance": "NOT_AUTHORIZED"
  },
  {
    "capabilityId": "journal.dream",
    "standing": "APPROVED",
    "name": "Record a Dream",
    "purpose": "Preserve a dream you choose to record in your Journal.",
    "sourceRefs": [
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
      "lib/sovereign/platformKnowledge.ts"
    ],
    "authorship": "FOUNDER_AUTHORED_O7R1",
    "platformKnowledgeReconciliation": "COMPATIBLE",
    "utteranceContextCandidate": "EXPLICIT_CAPABILITY_INQUIRY_DESCRIPTION_ONLY",
    "runtimeUtterance": "NOT_AUTHORIZED"
  },
  {
    "capabilityId": "astrology.reading",
    "standing": "APPROVED",
    "name": "Astrology Reading",
    "purpose": "Explore your birth chart as a symbolic map for reflection, not as a verdict about who you are.",
    "sourceRefs": [
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
      "docs/design/contracts/astrology.md",
      "lib/sovereign/platformKnowledge.ts"
    ],
    "authorship": "FOUNDER_AUTHORED_O7R1",
    "platformKnowledgeReconciliation": "COMPATIBLE",
    "utteranceContextCandidate": "EXPLICIT_CAPABILITY_INQUIRY_DESCRIPTION_ONLY",
    "runtimeUtterance": "NOT_AUTHORIZED"
  },
  {
    "capabilityId": "astrology.transit.current",
    "standing": "APPROVED",
    "name": "Current Transits",
    "purpose": "Explore the planetary patterns of the present moment as a symbolic timing lens.",
    "sourceRefs": [
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
      "docs/design/contracts/astrology.md"
    ],
    "authorship": "FOUNDER_AUTHORED_O7R1",
    "platformKnowledgeReconciliation": "STALE_MAP_SENSITIVE",
    "utteranceContextCandidate": "EXPLICIT_CAPABILITY_INQUIRY_DESCRIPTION_ONLY",
    "runtimeUtterance": "NOT_AUTHORIZED"
  },
  {
    "capabilityId": "astrology.transit.personal",
    "standing": "APPROVED",
    "name": "Personal Transits",
    "purpose": "Explore current transits in relation to your birth chart as a symbolic lens for reflection.",
    "sourceRefs": [
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
      "docs/design/contracts/astrology.md"
    ],
    "authorship": "FOUNDER_AUTHORED_O7R1",
    "platformKnowledgeReconciliation": "STALE_MAP_SENSITIVE",
    "utteranceContextCandidate": "EXPLICIT_CAPABILITY_INQUIRY_DESCRIPTION_ONLY",
    "runtimeUtterance": "NOT_AUTHORIZED"
  },
  {
    "capabilityId": "wisdom.open",
    "standing": "APPROVED",
    "name": "Wisdom Inquiry",
    "purpose": "Orient toward teachings and sources that can deepen a question you are holding.",
    "sourceRefs": [
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
      "lib/sovereign/platformKnowledge.ts"
    ],
    "authorship": "FOUNDER_AUTHORED_O7R1",
    "platformKnowledgeReconciliation": "NOT_REPRESENTED",
    "utteranceContextCandidate": "EXPLICIT_CAPABILITY_INQUIRY_DESCRIPTION_ONLY",
    "runtimeUtterance": "NOT_AUTHORIZED"
  },
  {
    "capabilityId": "wisdom.surface",
    "standing": "APPROVED",
    "name": "Wisdom Sources",
    "purpose": "Bring forward relevant teachings or sources while preserving where they come from and how they should be understood.",
    "sourceRefs": [
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
      "docs/canon/CORPUS_DISCIPLINE_PROTOCOL_v1.0.md"
    ],
    "authorship": "FOUNDER_AUTHORED_O7R1",
    "platformKnowledgeReconciliation": "STALE_MAP_SENSITIVE",
    "utteranceContextCandidate": "EXPLICIT_CAPABILITY_INQUIRY_DESCRIPTION_ONLY",
    "runtimeUtterance": "NOT_AUTHORIZED"
  },
  {
    "capabilityId": "wisdom.text.open",
    "standing": "UNRESOLVED",
    "sourceRefs": [
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R3_AUTHORITY_REFERENCE_CENSUS_v0.1.md",
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O6_CAPABILITY_HOUSE_PLACE_TOPOLOGY_RELATIONSHIP_CONTRACT_v0.1.md"
    ],
    "authorship": "NEW_FOUNDER_LANGUAGE_AFTER_GATES",
    "platformKnowledgeReconciliation": "NOT_ELIGIBLE_FOR_RECONCILIATION",
    "utteranceContextCandidate": "NONE",
    "runtimeUtterance": "NOT_AUTHORIZED"
  },
  {
    "capabilityId": "relationship.reflect",
    "standing": "APPROVED",
    "name": "Relationship Reflection",
    "purpose": "Reflect on one relationship from your own lived experience while keeping your perspective distinct from assumptions about the other person.",
    "sourceRefs": [
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
      "docs/canon/RELATIONSHIP_ROOM_CONSTITUTION.md",
      "lib/sovereign/platformKnowledge.ts"
    ],
    "authorship": "FOUNDER_AUTHORED_O7R1",
    "platformKnowledgeReconciliation": "STALE_MAP_SENSITIVE",
    "utteranceContextCandidate": "EXPLICIT_CAPABILITY_INQUIRY_DESCRIPTION_ONLY",
    "runtimeUtterance": "NOT_AUTHORIZED"
  },
  {
    "capabilityId": "shadow.open",
    "standing": "UNRESOLVED",
    "sourceRefs": [
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R3_AUTHORITY_REFERENCE_CENSUS_v0.1.md",
      "docs/programme/MAIA-RELATIONAL-FIELD-SHADOW-01_CHARTER_2026-09-16.md"
    ],
    "authorship": "NEW_FOUNDER_LANGUAGE_AFTER_MEMBER_CONSTITUTION",
    "platformKnowledgeReconciliation": "NOT_ELIGIBLE_FOR_RECONCILIATION",
    "utteranceContextCandidate": "NONE",
    "runtimeUtterance": "NOT_AUTHORIZED"
  },
  {
    "capabilityId": "studio.choose",
    "standing": "APPROVED",
    "name": "Choose a Studio",
    "purpose": "An orientation to the different Studio environments and what each is for.",
    "sourceRefs": [
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
      "lib/sovereign/platformKnowledge.ts"
    ],
    "authorship": "FOUNDER_AUTHORED_O7R1",
    "platformKnowledgeReconciliation": "STALE_MAP_SENSITIVE",
    "utteranceContextCandidate": "EXPLICIT_CAPABILITY_INQUIRY_DESCRIPTION_ONLY",
    "runtimeUtterance": "NOT_AUTHORIZED"
  },
  {
    "capabilityId": "studio.writer.open",
    "standing": "APPROVED",
    "name": "Writer's Studio",
    "purpose": "A specialist writing environment for developing a work with MAIA while keeping the manuscript and the writer's authorship primary.",
    "sourceRefs": [
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
      "docs/releases/WRITERS_STUDIO_PHASE1_RELEASE_WALK_2026-08-02.md"
    ],
    "authorship": "FOUNDER_AUTHORED_O7R1",
    "platformKnowledgeReconciliation": "NOT_REPRESENTED",
    "utteranceContextCandidate": "EXPLICIT_CAPABILITY_INQUIRY_DESCRIPTION_ONLY",
    "runtimeUtterance": "NOT_AUTHORIZED"
  },
  {
    "capabilityId": "studio.personal.open",
    "standing": "UNRESOLVED",
    "sourceRefs": [
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R3_AUTHORITY_REFERENCE_CENSUS_v0.1.md",
      "lib/studio/personalStudioProvisioning.ts"
    ],
    "authorship": "NEW_FOUNDER_LANGUAGE_AFTER_PRODUCT_STATUS",
    "platformKnowledgeReconciliation": "NOT_ELIGIBLE_FOR_RECONCILIATION",
    "utteranceContextCandidate": "NONE",
    "runtimeUtterance": "NOT_AUTHORIZED"
  },
  {
    "capabilityId": "studio.pro.open",
    "standing": "UNRESOLVED",
    "sourceRefs": [
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R3_AUTHORITY_REFERENCE_CENSUS_v0.1.md",
      "lib/sovereign/platformKnowledge.ts"
    ],
    "authorship": "NEW_FOUNDER_LANGUAGE_AFTER_ROLE_ENTITLEMENT_RECONCILIATION",
    "platformKnowledgeReconciliation": "NOT_ELIGIBLE_FOR_RECONCILIATION",
    "utteranceContextCandidate": "NONE",
    "runtimeUtterance": "NOT_AUTHORIZED"
  },
  {
    "capabilityId": "booking.practitioner.request",
    "standing": "UNRESOLVED",
    "sourceRefs": [
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R3_AUTHORITY_REFERENCE_CENSUS_v0.1.md"
    ],
    "authorship": "NEW_FOUNDER_LANGUAGE_AFTER_BOOKING_CONTRACT",
    "platformKnowledgeReconciliation": "NOT_ELIGIBLE_FOR_RECONCILIATION",
    "utteranceContextCandidate": "NONE",
    "runtimeUtterance": "NOT_AUTHORIZED"
  },
  {
    "capabilityId": "studio.session.create",
    "standing": "APPROVED",
    "name": "Create Session",
    "purpose": "Set up a client session within the practitioner's Studio context.",
    "sourceRefs": [
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
      "app/api/studio/sessions/route.ts",
      "lib/sovereign/platformKnowledge.ts"
    ],
    "authorship": "FOUNDER_AUTHORED_O7R1",
    "platformKnowledgeReconciliation": "STALE_MAP_SENSITIVE",
    "utteranceContextCandidate": "EXPLICIT_CAPABILITY_INQUIRY_DESCRIPTION_ONLY",
    "runtimeUtterance": "NOT_AUTHORIZED"
  },
  {
    "capabilityId": "pattern.detect",
    "standing": "WITHHOLD",
    "sourceRefs": [
      "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
      "docs/canon/PATTERN_PRIMITIVE.md"
    ],
    "authorship": "NO_MEMBER_COPY_WHILE_WITHHELD",
    "platformKnowledgeReconciliation": "NOT_ELIGIBLE_FOR_RECONCILIATION",
    "utteranceContextCandidate": "NONE",
    "runtimeUtterance": "NOT_AUTHORIZED"
  }
] as const;

function clone(): any[] { return JSON.parse(JSON.stringify(REFERENCE)); }
function row(rows: any[], id: string): any {
  const found = rows.find((r) => r.capabilityId === id);
  if (!found) throw new Error('MISSING_PRESENTATION_ROW:' + id);
  return found;
}

export const DEFEAT_CANDIDATES: Readonly<Record<string, () => any[]>> = {
  'FALLBACK-COPY-ON-SHADOW': () => { const x=clone(); const r=row(x,'shadow.open'); r.name='Shadow'; r.purpose='Explore shadow material.'; return x; },
  'ROUTE-INJECTION': () => { const x=clone(); row(x,'journal.create').route='/journal'; return x; },
  'ENTITLEMENT-INJECTION': () => { const x=clone(); row(x,'studio.choose').entitlement='studio'; return x; },
  'AVAILABILITY-INJECTION': () => { const x=clone(); row(x,'journal.dream').available=true; return x; },
  'OFFER-INJECTION': () => { const x=clone(); row(x,'astrology.reading').cta='Would you like me to open it?'; return x; },
  'OFFER-LANGUAGE-IN-PURPOSE': () => { const x=clone(); row(x,'journal.create').purpose += ' Would you like me to do that?'; return x; },
  'RUNTIME-UTTERANCE-PROMOTION': () => { const x=clone(); row(x,'journal.create').runtimeUtterance='AUTHORIZED'; return x; },
  'STALE-MAP-PROMOTED-COMPATIBLE': () => { const x=clone(); row(x,'journal.save').platformKnowledgeReconciliation='COMPATIBLE'; return x; },
  'NOT-REPRESENTED-PROMOTED-COMPATIBLE': () => { const x=clone(); row(x,'wisdom.open').platformKnowledgeReconciliation='COMPATIBLE'; return x; },
  'HELD-MADE-RECONCILABLE': () => { const x=clone(); row(x,'shadow.open').platformKnowledgeReconciliation='COMPATIBLE'; return x; },
  'HELD-GIVEN-EXPLICIT-CONTEXT': () => { const x=clone(); row(x,'wisdom.text.open').utteranceContextCandidate='EXPLICIT_CAPABILITY_INQUIRY_DESCRIPTION_ONLY'; return x; },
  'APPROVED-NAME-REMOVED': () => { const x=clone(); delete row(x,'journal.create').name; return x; },
  'SOURCE-REFS-REMOVED': () => { const x=clone(); row(x,'journal.create').sourceRefs=[]; return x; },
};

export const NAMED_KILL: Readonly<Record<string,string>> = {
  'FALLBACK-COPY-ON-SHADOW':'HELD_SET_SILENCE',
  'ROUTE-INJECTION':'PRESENTATION_ROUTING_FORBIDDEN',
  'ENTITLEMENT-INJECTION':'PRESENTATION_ACCESS_SEMANTICS_FORBIDDEN',
  'AVAILABILITY-INJECTION':'PRESENTATION_ACCESS_SEMANTICS_FORBIDDEN',
  'OFFER-INJECTION':'PRESENTATION_OFFER_FORBIDDEN',
  'OFFER-LANGUAGE-IN-PURPOSE':'PRESENTATION_OFFER_FORBIDDEN',
  'RUNTIME-UTTERANCE-PROMOTION':'RUNTIME_UTTERANCE_CLOSED',
  'STALE-MAP-PROMOTED-COMPATIBLE':'RECONCILIATION_CUSTODY',
  'NOT-REPRESENTED-PROMOTED-COMPATIBLE':'RECONCILIATION_CUSTODY',
  'HELD-MADE-RECONCILABLE':'RECONCILIATION_CUSTODY',
  'HELD-GIVEN-EXPLICIT-CONTEXT':'UTTERANCE_CONTEXT_CUSTODY',
  'APPROVED-NAME-REMOVED':'APPROVED_PRESENTATION_SHAPE',
  'SOURCE-REFS-REMOVED':'SOURCE_REFS_REQUIRED',
};

export const CLASSIFIED_COLLATERAL: Readonly<Record<string, readonly string[]>> = {
  'SOURCE-REFS-REMOVED': ['APPROVED_PRESENTATION_SHAPE'],
  'STALE-MAP-PROMOTED-COMPATIBLE': ['RECONCILIATION_COUNTS'],
  'NOT-REPRESENTED-PROMOTED-COMPATIBLE': ['RECONCILIATION_COUNTS'],
  'HELD-MADE-RECONCILABLE': ['RECONCILIATION_COUNTS'],
};
