/**
 * Capability Authority Registry v2 — inert descriptive infrastructure.
 *
 * O3 admission boundary:
 * - This module names capability identities and their documentary authority state.
 * - It grants no access, consent, entitlement, invocation, execution, or member-data authority.
 * - It MUST NOT be imported by member-facing runtime during O3.
 * - Existing lib/maia/capabilities.ts remains separate legacy vocabulary.
 */

export const CAPABILITY_AUTHORITY_SCHEMA_VERSION = 2 as const;
export const O3_RUNTIME_ELIGIBILITY = 'NOT_AUTHORIZED_BY_O2R4' as const;

export const CAPABILITY_AUTHORITY_IDS = [
  'journal.create',
  'journal.save',
  'journal.dream',
  'astrology.reading',
  'astrology.transit.current',
  'astrology.transit.personal',
  'wisdom.open',
  'wisdom.surface',
  'wisdom.text.open',
  'relationship.reflect',
  'shadow.open',
  'studio.choose',
  'studio.writer.open',
  'studio.personal.open',
  'studio.pro.open',
  'booking.practitioner.request',
  'studio.session.create',
  'pattern.detect',
] as const;

export type CapabilityAuthorityId = typeof CAPABILITY_AUTHORITY_IDS[number];
export type CapabilityLifecycle = 'DECLARED' | 'WITHHELD';
export type ArchitecturalSpecies = 'modal_action' | 'room' | 'portal' | 'archive' | 'transition' | 'studio' | 'utility' | 'integrative_field';
export type EconomicClass = 'FREE_FOUNDATION' | 'STEWARD_DEPTH' | 'UNRESOLVED' | 'STUDIO_ENTITLEMENT';
export type JarvisRole = 'IMPLEMENTATION_ONLY';
export type AcknowledgmentForm = 'CONTEXTUAL' | 'BOTH' | 'AUDIBLE';
export type ResearchDependency = 'NONE' | 'INTERPRETIVE_STANDING_REQUIRED' | 'SOURCE_GOVERNED' | 'UNKNOWN' | 'HYPOTHESIS_DEPENDENT';
export type OutputEpistemicStandingMode = 'NONE' | 'DYNAMIC';
export type AuthorityGateStanding = 'COMPLETE' | 'PARTIAL' | 'UNRESOLVED' | 'WITHHELD';
export type DescriptorStanding = 'DOCUMENTARY_ONLY';
export type RuntimeEligibility = typeof O3_RUNTIME_ELIGIBILITY;

export interface OutputEpistemicStanding {
  readonly mode: OutputEpistemicStandingMode;
  readonly policyRefs: readonly string[];
}

export interface CapabilityAuthorityRefs {
  readonly resolvedRefs: readonly string[];
  readonly gapRefs: readonly string[];
  readonly unknownRefs: readonly string[];
}

export interface CapabilityAuthorityDescriptor {
  readonly id: CapabilityAuthorityId;
  readonly lifecycle: CapabilityLifecycle;
  readonly species: ArchitecturalSpecies;
  readonly domain: string;
  readonly humanMovement: string;
  readonly consent: string;
  readonly readScopes: readonly string[];
  readonly writeScopes: readonly string[];
  readonly membranes: readonly string[];
  readonly economicClass: EconomicClass;
  readonly ainRoles: readonly string[];
  readonly jarvisRole: JarvisRole;
  readonly ack: AcknowledgmentForm;
  readonly returnTargets: readonly string[];
  readonly researchDependency: ResearchDependency;
  readonly outputEpistemicStanding: OutputEpistemicStanding;
  readonly authority: CapabilityAuthorityRefs;
  readonly descriptorStanding: DescriptorStanding;
  readonly authorityGateStanding: AuthorityGateStanding;
  readonly runtimeEligibility: RuntimeEligibility;
}

export const CAPABILITY_AUTHORITY_REGISTRY: readonly CapabilityAuthorityDescriptor[] = [
  {
    "id": "journal.create",
    "lifecycle": "DECLARED",
    "species": "modal_action",
    "domain": "journal",
    "humanMovement": "expression",
    "consent": "EXPLICIT_MEMBER_REQUEST_OR_SUGGEST_THEN_CONFIRM",
    "readScopes": [],
    "writeScopes": [],
    "membranes": [
      "MEMBER_PRIVATE"
    ],
    "economicClass": "FREE_FOUNDATION",
    "ainRoles": [
      "NONE"
    ],
    "jarvisRole": "IMPLEMENTATION_ONLY",
    "ack": "CONTEXTUAL",
    "returnTargets": [
      "journal",
      "maia"
    ],
    "researchDependency": "NONE",
    "outputEpistemicStanding": {
      "mode": "NONE",
      "policyRefs": []
    },
    "authority": {
      "resolvedRefs": [
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2_CAPABILITY_AUTHORITY_REGISTRY_CONTRACT_v0.1.md",
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md"
      ],
      "gapRefs": [
        "GAP:JOURNAL_CREATE_UNIVERSAL_POLICY"
      ],
      "unknownRefs": []
    },
    "descriptorStanding": "DOCUMENTARY_ONLY",
    "authorityGateStanding": "PARTIAL",
    "runtimeEligibility": "NOT_AUTHORIZED_BY_O2R4"
  },
  {
    "id": "journal.save",
    "lifecycle": "DECLARED",
    "species": "modal_action",
    "domain": "journal",
    "humanMovement": "expression/continuity",
    "consent": "EXPLICIT_MEMBER_REQUEST_OR_SUGGEST_THEN_CONFIRM",
    "readScopes": [
      "conversation.capture_scope"
    ],
    "writeScopes": [
      "member.journal"
    ],
    "membranes": [
      "MEMBER_PRIVATE"
    ],
    "economicClass": "FREE_FOUNDATION",
    "ainRoles": [
      "NONE"
    ],
    "jarvisRole": "IMPLEMENTATION_ONLY",
    "ack": "BOTH",
    "returnTargets": [
      "journal",
      "maia"
    ],
    "researchDependency": "NONE",
    "outputEpistemicStanding": {
      "mode": "NONE",
      "policyRefs": []
    },
    "authority": {
      "resolvedRefs": [
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2_CAPABILITY_AUTHORITY_REGISTRY_CONTRACT_v0.1.md",
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md#journal-capture-scope-ruling"
      ],
      "gapRefs": [
        "NONCONFORMANCE:VOICE_JOURNAL_SAVE_FIXED_LAST5",
        "GAP:CAPTURE_SCOPE_RESOLVER"
      ],
      "unknownRefs": []
    },
    "descriptorStanding": "DOCUMENTARY_ONLY",
    "authorityGateStanding": "PARTIAL",
    "runtimeEligibility": "NOT_AUTHORIZED_BY_O2R4"
  },
  {
    "id": "journal.dream",
    "lifecycle": "DECLARED",
    "species": "modal_action",
    "domain": "journal",
    "humanMovement": "expression/reflection",
    "consent": "EXPLICIT_MEMBER_REQUEST_OR_SUGGEST_THEN_CONFIRM",
    "readScopes": [
      "conversation.authorized_dream_scope"
    ],
    "writeScopes": [
      "member.journal.dream"
    ],
    "membranes": [
      "MEMBER_PRIVATE"
    ],
    "economicClass": "FREE_FOUNDATION",
    "ainRoles": [
      "NONE"
    ],
    "jarvisRole": "IMPLEMENTATION_ONLY",
    "ack": "BOTH",
    "returnTargets": [
      "journal",
      "maia"
    ],
    "researchDependency": "NONE",
    "outputEpistemicStanding": {
      "mode": "NONE",
      "policyRefs": []
    },
    "authority": {
      "resolvedRefs": [
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2_CAPABILITY_AUTHORITY_REGISTRY_CONTRACT_v0.1.md",
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md#journal-capture-scope-ruling"
      ],
      "gapRefs": [
        "NONCONFORMANCE:VOICE_JOURNAL_DREAM_FIXED_LAST5",
        "GAP:DREAM_CAPTURE_SCOPE_RESOLVER"
      ],
      "unknownRefs": []
    },
    "descriptorStanding": "DOCUMENTARY_ONLY",
    "authorityGateStanding": "PARTIAL",
    "runtimeEligibility": "NOT_AUTHORIZED_BY_O2R4"
  },
  {
    "id": "astrology.reading",
    "lifecycle": "DECLARED",
    "species": "room",
    "domain": "astrology",
    "humanMovement": "pattern/learning/reflection",
    "consent": "EXPLICIT_MEMBER_REQUEST_OR_SUGGEST_THEN_CONFIRM",
    "readScopes": [
      "member.authorized_chart_data"
    ],
    "writeScopes": [],
    "membranes": [
      "MEMBER_PRIVATE"
    ],
    "economicClass": "FREE_FOUNDATION",
    "ainRoles": [
      "SYNTHESIS_SUPPORT",
      "EPISTEMIC_GUARD"
    ],
    "jarvisRole": "IMPLEMENTATION_ONLY",
    "ack": "CONTEXTUAL",
    "returnTargets": [
      "astrology",
      "maia"
    ],
    "researchDependency": "INTERPRETIVE_STANDING_REQUIRED",
    "outputEpistemicStanding": {
      "mode": "DYNAMIC",
      "policyRefs": [
        "docs/design/contracts/astrology.md",
        "docs/canon/SYMBOLIC_GUIDANCE_LAYER_DOCTRINE.md"
      ]
    },
    "authority": {
      "resolvedRefs": [
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2_CAPABILITY_AUTHORITY_REGISTRY_CONTRACT_v0.1.md",
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
        "docs/design/contracts/astrology.md",
        "docs/canon/SYMBOLIC_GUIDANCE_LAYER_DOCTRINE.md",
        "docs/design/contracts/astrology.md#identity-boundary"
      ],
      "gapRefs": [],
      "unknownRefs": []
    },
    "descriptorStanding": "DOCUMENTARY_ONLY",
    "authorityGateStanding": "COMPLETE",
    "runtimeEligibility": "NOT_AUTHORIZED_BY_O2R4"
  },
  {
    "id": "astrology.transit.current",
    "lifecycle": "DECLARED",
    "species": "room",
    "domain": "astrology",
    "humanMovement": "pattern/timing",
    "consent": "EXPLICIT_MEMBER_REQUEST_OR_SUGGEST_THEN_CONFIRM",
    "readScopes": [
      "public.current_ephemeris"
    ],
    "writeScopes": [],
    "membranes": [
      "PUBLIC"
    ],
    "economicClass": "FREE_FOUNDATION",
    "ainRoles": [
      "SYNTHESIS_SUPPORT",
      "EPISTEMIC_GUARD"
    ],
    "jarvisRole": "IMPLEMENTATION_ONLY",
    "ack": "AUDIBLE",
    "returnTargets": [
      "astrology",
      "maia"
    ],
    "researchDependency": "INTERPRETIVE_STANDING_REQUIRED",
    "outputEpistemicStanding": {
      "mode": "DYNAMIC",
      "policyRefs": [
        "docs/design/contracts/astrology.md",
        "docs/canon/SYMBOLIC_GUIDANCE_LAYER_DOCTRINE.md"
      ]
    },
    "authority": {
      "resolvedRefs": [
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2_CAPABILITY_AUTHORITY_REGISTRY_CONTRACT_v0.1.md",
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
        "docs/design/contracts/astrology.md",
        "docs/canon/SYMBOLIC_GUIDANCE_LAYER_DOCTRINE.md"
      ],
      "gapRefs": [],
      "unknownRefs": []
    },
    "descriptorStanding": "DOCUMENTARY_ONLY",
    "authorityGateStanding": "COMPLETE",
    "runtimeEligibility": "NOT_AUTHORIZED_BY_O2R4"
  },
  {
    "id": "astrology.transit.personal",
    "lifecycle": "DECLARED",
    "species": "room",
    "domain": "astrology",
    "humanMovement": "pattern/timing/reflection",
    "consent": "EXPLICIT_MEMBER_REQUEST_OR_SUGGEST_THEN_CONFIRM",
    "readScopes": [
      "public.current_ephemeris",
      "member.authorized_chart_data"
    ],
    "writeScopes": [],
    "membranes": [
      "PUBLIC",
      "MEMBER_PRIVATE"
    ],
    "economicClass": "STEWARD_DEPTH",
    "ainRoles": [
      "SYNTHESIS_SUPPORT",
      "EPISTEMIC_GUARD"
    ],
    "jarvisRole": "IMPLEMENTATION_ONLY",
    "ack": "AUDIBLE",
    "returnTargets": [
      "astrology",
      "maia"
    ],
    "researchDependency": "INTERPRETIVE_STANDING_REQUIRED",
    "outputEpistemicStanding": {
      "mode": "DYNAMIC",
      "policyRefs": [
        "docs/design/contracts/astrology.md",
        "docs/canon/SYMBOLIC_GUIDANCE_LAYER_DOCTRINE.md"
      ]
    },
    "authority": {
      "resolvedRefs": [
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2_CAPABILITY_AUTHORITY_REGISTRY_CONTRACT_v0.1.md",
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
        "docs/design/contracts/astrology.md",
        "docs/canon/SYMBOLIC_GUIDANCE_LAYER_DOCTRINE.md",
        "docs/design/contracts/astrology.md#identity-boundary"
      ],
      "gapRefs": [],
      "unknownRefs": []
    },
    "descriptorStanding": "DOCUMENTARY_ONLY",
    "authorityGateStanding": "COMPLETE",
    "runtimeEligibility": "NOT_AUTHORIZED_BY_O2R4"
  },
  {
    "id": "wisdom.open",
    "lifecycle": "DECLARED",
    "species": "portal",
    "domain": "wisdom",
    "humanMovement": "learning/orientation",
    "consent": "EXPLICIT_MEMBER_REQUEST_OR_SUGGEST_THEN_CONFIRM",
    "readScopes": [],
    "writeScopes": [],
    "membranes": [
      "PUBLIC"
    ],
    "economicClass": "FREE_FOUNDATION",
    "ainRoles": [
      "NONE"
    ],
    "jarvisRole": "IMPLEMENTATION_ONLY",
    "ack": "CONTEXTUAL",
    "returnTargets": [
      "wisdom",
      "house"
    ],
    "researchDependency": "NONE",
    "outputEpistemicStanding": {
      "mode": "NONE",
      "policyRefs": []
    },
    "authority": {
      "resolvedRefs": [
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2_CAPABILITY_AUTHORITY_REGISTRY_CONTRACT_v0.1.md",
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md"
      ],
      "gapRefs": [],
      "unknownRefs": []
    },
    "descriptorStanding": "DOCUMENTARY_ONLY",
    "authorityGateStanding": "COMPLETE",
    "runtimeEligibility": "NOT_AUTHORIZED_BY_O2R4"
  },
  {
    "id": "wisdom.surface",
    "lifecycle": "DECLARED",
    "species": "portal",
    "domain": "wisdom",
    "humanMovement": "learning/reflection",
    "consent": "EXPLICIT_MEMBER_REQUEST_OR_SUGGEST_THEN_CONFIRM",
    "readScopes": [
      "authorized.knowledge_sources"
    ],
    "writeScopes": [],
    "membranes": [
      "PUBLIC",
      "MEMBER_PRIVATE"
    ],
    "economicClass": "FREE_FOUNDATION",
    "ainRoles": [
      "RETRIEVAL",
      "EPISTEMIC_GUARD"
    ],
    "jarvisRole": "IMPLEMENTATION_ONLY",
    "ack": "CONTEXTUAL",
    "returnTargets": [
      "wisdom",
      "maia"
    ],
    "researchDependency": "SOURCE_GOVERNED",
    "outputEpistemicStanding": {
      "mode": "DYNAMIC",
      "policyRefs": [
        "docs/canon/CORPUS_DISCIPLINE_PROTOCOL_v1.0.md"
      ]
    },
    "authority": {
      "resolvedRefs": [
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2_CAPABILITY_AUTHORITY_REGISTRY_CONTRACT_v0.1.md",
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
        "docs/canon/CORPUS_DISCIPLINE_PROTOCOL_v1.0.md",
        "docs/canon/CORPUS_WEIGHTING_SCHEMA_v1.0.md"
      ],
      "gapRefs": [],
      "unknownRefs": []
    },
    "descriptorStanding": "DOCUMENTARY_ONLY",
    "authorityGateStanding": "COMPLETE",
    "runtimeEligibility": "NOT_AUTHORIZED_BY_O2R4"
  },
  {
    "id": "wisdom.text.open",
    "lifecycle": "DECLARED",
    "species": "archive",
    "domain": "wisdom",
    "humanMovement": "learning",
    "consent": "EXPLICIT_MEMBER_REQUEST_OR_SUGGEST_THEN_CONFIRM",
    "readScopes": [
      "identified.source_text"
    ],
    "writeScopes": [],
    "membranes": [
      "PUBLIC"
    ],
    "economicClass": "FREE_FOUNDATION",
    "ainRoles": [
      "RETRIEVAL",
      "EPISTEMIC_GUARD"
    ],
    "jarvisRole": "IMPLEMENTATION_ONLY",
    "ack": "CONTEXTUAL",
    "returnTargets": [
      "wisdom",
      "library"
    ],
    "researchDependency": "SOURCE_GOVERNED",
    "outputEpistemicStanding": {
      "mode": "DYNAMIC",
      "policyRefs": [
        "docs/canon/CORPUS_DISCIPLINE_PROTOCOL_v1.0.md"
      ]
    },
    "authority": {
      "resolvedRefs": [
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2_CAPABILITY_AUTHORITY_REGISTRY_CONTRACT_v0.1.md",
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
        "docs/canon/CORPUS_DISCIPLINE_PROTOCOL_v1.0.md"
      ],
      "gapRefs": [],
      "unknownRefs": [
        "UNKNOWN:source-rights-policy"
      ]
    },
    "descriptorStanding": "DOCUMENTARY_ONLY",
    "authorityGateStanding": "UNRESOLVED",
    "runtimeEligibility": "NOT_AUTHORIZED_BY_O2R4"
  },
  {
    "id": "relationship.reflect",
    "lifecycle": "DECLARED",
    "species": "room",
    "domain": "relationships",
    "humanMovement": "relationship/reflection",
    "consent": "EXPLICIT_MEMBER_REQUEST_OR_SUGGEST_THEN_CONFIRM",
    "readScopes": [
      "member.explicit_relationship_context"
    ],
    "writeScopes": [],
    "membranes": [
      "RELATIONSHIP_PRIVATE"
    ],
    "economicClass": "FREE_FOUNDATION",
    "ainRoles": [
      "SYNTHESIS_SUPPORT",
      "EPISTEMIC_GUARD"
    ],
    "jarvisRole": "IMPLEMENTATION_ONLY",
    "ack": "CONTEXTUAL",
    "returnTargets": [
      "relationships",
      "maia"
    ],
    "researchDependency": "NONE",
    "outputEpistemicStanding": {
      "mode": "DYNAMIC",
      "policyRefs": [
        "docs/canon/RELATIONSHIP_ROOM_CONSTITUTION.md"
      ]
    },
    "authority": {
      "resolvedRefs": [
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2_CAPABILITY_AUTHORITY_REGISTRY_CONTRACT_v0.1.md",
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
        "docs/canon/RELATIONSHIP_ROOM_CONSTITUTION.md"
      ],
      "gapRefs": [],
      "unknownRefs": []
    },
    "descriptorStanding": "DOCUMENTARY_ONLY",
    "authorityGateStanding": "COMPLETE",
    "runtimeEligibility": "NOT_AUTHORIZED_BY_O2R4"
  },
  {
    "id": "shadow.open",
    "lifecycle": "DECLARED",
    "species": "modal_action",
    "domain": "shadow",
    "humanMovement": "reflection/discernment",
    "consent": "EXPLICIT_MEMBER_REQUEST_OR_SUGGEST_THEN_CONFIRM",
    "readScopes": [],
    "writeScopes": [],
    "membranes": [
      "MEMBER_PRIVATE"
    ],
    "economicClass": "UNRESOLVED",
    "ainRoles": [
      "NONE"
    ],
    "jarvisRole": "IMPLEMENTATION_ONLY",
    "ack": "CONTEXTUAL",
    "returnTargets": [
      "maia",
      "house"
    ],
    "researchDependency": "UNKNOWN",
    "outputEpistemicStanding": {
      "mode": "DYNAMIC",
      "policyRefs": [
        "UNKNOWN:current-shadow-constitution"
      ]
    },
    "authority": {
      "resolvedRefs": [
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2_CAPABILITY_AUTHORITY_REGISTRY_CONTRACT_v0.1.md",
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md"
      ],
      "gapRefs": [],
      "unknownRefs": [
        "UNKNOWN:current-shadow-constitution"
      ]
    },
    "descriptorStanding": "DOCUMENTARY_ONLY",
    "authorityGateStanding": "UNRESOLVED",
    "runtimeEligibility": "NOT_AUTHORIZED_BY_O2R4"
  },
  {
    "id": "studio.choose",
    "lifecycle": "DECLARED",
    "species": "transition",
    "domain": "studios",
    "humanMovement": "orientation/stewardship",
    "consent": "EXPLICIT_MEMBER_REQUEST_OR_SUGGEST_THEN_CONFIRM",
    "readScopes": [],
    "writeScopes": [],
    "membranes": [
      "MEMBER_PRIVATE"
    ],
    "economicClass": "UNRESOLVED",
    "ainRoles": [
      "NONE"
    ],
    "jarvisRole": "IMPLEMENTATION_ONLY",
    "ack": "CONTEXTUAL",
    "returnTargets": [
      "house",
      "maia"
    ],
    "researchDependency": "NONE",
    "outputEpistemicStanding": {
      "mode": "NONE",
      "policyRefs": []
    },
    "authority": {
      "resolvedRefs": [
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2_CAPABILITY_AUTHORITY_REGISTRY_CONTRACT_v0.1.md",
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
        "app/choose/page.tsx",
        "docs/architecture/SESSION_ROOM_AND_STUDIO_CANDIDATE_2026-07-19.md"
      ],
      "gapRefs": [
        "GAP:STUDIO_THRESHOLD_DOES_NOT_YET_MODEL_WRITER_PERSONAL_PRO_ECOSYSTEM"
      ],
      "unknownRefs": []
    },
    "descriptorStanding": "DOCUMENTARY_ONLY",
    "authorityGateStanding": "PARTIAL",
    "runtimeEligibility": "NOT_AUTHORIZED_BY_O2R4"
  },
  {
    "id": "studio.writer.open",
    "lifecycle": "DECLARED",
    "species": "studio",
    "domain": "writers-studio",
    "humanMovement": "creation/expression",
    "consent": "EXPLICIT_MEMBER_REQUEST_OR_SUGGEST_THEN_CONFIRM",
    "readScopes": [],
    "writeScopes": [],
    "membranes": [
      "WORK_PRIVATE"
    ],
    "economicClass": "STUDIO_ENTITLEMENT",
    "ainRoles": [
      "NONE"
    ],
    "jarvisRole": "IMPLEMENTATION_ONLY",
    "ack": "CONTEXTUAL",
    "returnTargets": [
      "writers-studio",
      "house"
    ],
    "researchDependency": "NONE",
    "outputEpistemicStanding": {
      "mode": "NONE",
      "policyRefs": []
    },
    "authority": {
      "resolvedRefs": [
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2_CAPABILITY_AUTHORITY_REGISTRY_CONTRACT_v0.1.md",
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
        "config/accessMatrix.ts#writers-studio-current-member-facing-policy"
      ],
      "gapRefs": [
        "CONFLICT:CURRENT_WRITERS_STUDIO_FREE_AUTH_VS_PROPOSED_STUDIO_ENTITLEMENT"
      ],
      "unknownRefs": [
        "UNKNOWN:writers-studio-entitlement-policy"
      ]
    },
    "descriptorStanding": "DOCUMENTARY_ONLY",
    "authorityGateStanding": "UNRESOLVED",
    "runtimeEligibility": "NOT_AUTHORIZED_BY_O2R4"
  },
  {
    "id": "studio.personal.open",
    "lifecycle": "DECLARED",
    "species": "studio",
    "domain": "personal-studio",
    "humanMovement": "personal-stewardship",
    "consent": "EXPLICIT_MEMBER_REQUEST_OR_SUGGEST_THEN_CONFIRM",
    "readScopes": [],
    "writeScopes": [],
    "membranes": [
      "MEMBER_PRIVATE"
    ],
    "economicClass": "UNRESOLVED",
    "ainRoles": [
      "NONE"
    ],
    "jarvisRole": "IMPLEMENTATION_ONLY",
    "ack": "CONTEXTUAL",
    "returnTargets": [
      "personal-studio",
      "house"
    ],
    "researchDependency": "NONE",
    "outputEpistemicStanding": {
      "mode": "NONE",
      "policyRefs": []
    },
    "authority": {
      "resolvedRefs": [
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2_CAPABILITY_AUTHORITY_REGISTRY_CONTRACT_v0.1.md",
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
        "app/api/studio/personal/enter/route.ts",
        "lib/studio/personalStudioProvisioning.ts"
      ],
      "gapRefs": [],
      "unknownRefs": [
        "UNKNOWN:personal-studio-product-status"
      ]
    },
    "descriptorStanding": "DOCUMENTARY_ONLY",
    "authorityGateStanding": "UNRESOLVED",
    "runtimeEligibility": "NOT_AUTHORIZED_BY_O2R4"
  },
  {
    "id": "studio.pro.open",
    "lifecycle": "DECLARED",
    "species": "studio",
    "domain": "pro-studio",
    "humanMovement": "professional-stewardship",
    "consent": "ROLE_AND_CONTEXT_BOUND",
    "readScopes": [],
    "writeScopes": [],
    "membranes": [
      "PRACTITIONER_CLIENT"
    ],
    "economicClass": "STUDIO_ENTITLEMENT",
    "ainRoles": [
      "NONE"
    ],
    "jarvisRole": "IMPLEMENTATION_ONLY",
    "ack": "CONTEXTUAL",
    "returnTargets": [
      "pro-studio",
      "house"
    ],
    "researchDependency": "NONE",
    "outputEpistemicStanding": {
      "mode": "NONE",
      "policyRefs": []
    },
    "authority": {
      "resolvedRefs": [
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2_CAPABILITY_AUTHORITY_REGISTRY_CONTRACT_v0.1.md",
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
        "lib/auth/getCurrentPractitioner.ts",
        "config/accessMatrix.ts#studio-current-free-auth-policy"
      ],
      "gapRefs": [
        "GAP:PRO_ROLE_DISCRIMINATOR_PERSONAL_STUDIO_REUSES_PRACTITIONER_SUBSTRATE"
      ],
      "unknownRefs": [
        "UNKNOWN:pro-studio-entitlement-policy"
      ]
    },
    "descriptorStanding": "DOCUMENTARY_ONLY",
    "authorityGateStanding": "UNRESOLVED",
    "runtimeEligibility": "NOT_AUTHORIZED_BY_O2R4"
  },
  {
    "id": "booking.practitioner.request",
    "lifecycle": "DECLARED",
    "species": "utility",
    "domain": "booking",
    "humanMovement": "relationship/stewardship",
    "consent": "EXPLICIT_MEMBER_REQUEST",
    "readScopes": [
      "member.selected_practitioner_service_context"
    ],
    "writeScopes": [],
    "membranes": [
      "MEMBER_PRIVATE"
    ],
    "economicClass": "UNRESOLVED",
    "ainRoles": [
      "NONE"
    ],
    "jarvisRole": "IMPLEMENTATION_ONLY",
    "ack": "BOTH",
    "returnTargets": [
      "maia",
      "house"
    ],
    "researchDependency": "NONE",
    "outputEpistemicStanding": {
      "mode": "NONE",
      "policyRefs": []
    },
    "authority": {
      "resolvedRefs": [
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2_CAPABILITY_AUTHORITY_REGISTRY_CONTRACT_v0.1.md",
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md"
      ],
      "gapRefs": [],
      "unknownRefs": [
        "UNKNOWN:booking-external-effect-policy"
      ]
    },
    "descriptorStanding": "DOCUMENTARY_ONLY",
    "authorityGateStanding": "UNRESOLVED",
    "runtimeEligibility": "NOT_AUTHORIZED_BY_O2R4"
  },
  {
    "id": "studio.session.create",
    "lifecycle": "DECLARED",
    "species": "studio",
    "domain": "pro-studio",
    "humanMovement": "professional-stewardship",
    "consent": "ROLE_AND_CONTEXT_BOUND",
    "readScopes": [
      "authorized.client_context"
    ],
    "writeScopes": [
      "authorized.pro_session_record"
    ],
    "membranes": [
      "PRACTITIONER_CLIENT"
    ],
    "economicClass": "STUDIO_ENTITLEMENT",
    "ainRoles": [
      "NONE"
    ],
    "jarvisRole": "IMPLEMENTATION_ONLY",
    "ack": "BOTH",
    "returnTargets": [
      "pro-studio"
    ],
    "researchDependency": "NONE",
    "outputEpistemicStanding": {
      "mode": "NONE",
      "policyRefs": []
    },
    "authority": {
      "resolvedRefs": [
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2_CAPABILITY_AUTHORITY_REGISTRY_CONTRACT_v0.1.md",
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
        "app/api/studio/sessions/route.ts",
        "lib/auth/getCurrentPractitioner.ts"
      ],
      "gapRefs": [
        "GAP:SESSION_CLIENT_OWNERSHIP_PROOF",
        "GAP:SESSION_EXTERNAL_EFFECT_AUTHORITY",
        "GAP:PRO_ROLE_CONTEXT_RECONCILIATION"
      ],
      "unknownRefs": []
    },
    "descriptorStanding": "DOCUMENTARY_ONLY",
    "authorityGateStanding": "PARTIAL",
    "runtimeEligibility": "NOT_AUTHORIZED_BY_O2R4"
  },
  {
    "id": "pattern.detect",
    "lifecycle": "WITHHELD",
    "species": "integrative_field",
    "domain": "pattern",
    "humanMovement": "pattern/discernment",
    "consent": "NOT_MEMBER_INVOKABLE",
    "readScopes": [],
    "writeScopes": [],
    "membranes": [],
    "economicClass": "UNRESOLVED",
    "ainRoles": [
      "EPISTEMIC_GUARD"
    ],
    "jarvisRole": "IMPLEMENTATION_ONLY",
    "ack": "CONTEXTUAL",
    "returnTargets": [],
    "researchDependency": "HYPOTHESIS_DEPENDENT",
    "outputEpistemicStanding": {
      "mode": "DYNAMIC",
      "policyRefs": [
        "docs/canon/PATTERN_PRIMITIVE.md"
      ]
    },
    "authority": {
      "resolvedRefs": [
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2_CAPABILITY_AUTHORITY_REGISTRY_CONTRACT_v0.1.md",
        "docs/business/FOUNDER-LAUNCH-AND-BUSINESS/08-WHOLE-ORGANISM-ORCHESTRATION/O2R2_RATIFIED_CAPABILITY_IDENTITY_SET_v0.1.md",
        "docs/canon/PATTERN_PRIMITIVE.md"
      ],
      "gapRefs": [],
      "unknownRefs": []
    },
    "descriptorStanding": "DOCUMENTARY_ONLY",
    "authorityGateStanding": "WITHHELD",
    "runtimeEligibility": "NOT_AUTHORIZED_BY_O2R4"
  },
] as const;

export type LegacyCapabilityDisposition =
  | 'RETAIN'
  | 'RETIRE_AMBIGUOUS'
  | 'RETIRE_DESTINATION'
  | 'RETIRE_NAMESPACE'
  | 'WITHHOLD';

export interface LegacyCapabilityRecord {
  readonly id: string;
  readonly disposition: LegacyCapabilityDisposition;
}

// Compatibility ledger only. Deliberately contains no successorId / alias field.
export const LEGACY_CAPABILITY_LEDGER: readonly LegacyCapabilityRecord[] = [
  { id: 'journal.create', disposition: 'RETAIN' },
  { id: 'journal.save', disposition: 'RETAIN' },
  { id: 'journal.dream', disposition: 'RETAIN' },
  { id: 'astrology.reading', disposition: 'RETAIN' },
  { id: 'astrology.transit', disposition: 'RETIRE_AMBIGUOUS' },
  { id: 'pattern.detect', disposition: 'WITHHOLD' },
  { id: 'pattern.show', disposition: 'RETIRE_DESTINATION' },
  { id: 'wisdom.surface', disposition: 'RETAIN' },
  { id: 'wisdom.text', disposition: 'RETIRE_AMBIGUOUS' },
  { id: 'relationship.reflect', disposition: 'RETAIN' },
  { id: 'depth.shadow', disposition: 'RETIRE_NAMESPACE' },
  { id: 'studio.transition', disposition: 'RETIRE_AMBIGUOUS' },
  { id: 'schedule.create', disposition: 'RETIRE_AMBIGUOUS' },
] as const;

const FORBIDDEN_AUTHORITY_KEYS = new Set([
  'authorized',
  'canWrite',
  'userHasAccess',
  'executionAuthorized',
]);

function hasForbiddenAuthorityKey(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some(hasForbiddenAuthorityKey);
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_AUTHORITY_KEYS.has(key)) return true;
    if (hasForbiddenAuthorityKey(child)) return true;
  }
  return false;
}

/**
 * Pure structural validator. It does not evaluate live auth, consent, entitlement,
 * route access, member data, source rights, or runtime availability.
 */
export function validateCapabilityAuthorityRegistry(
  registry: readonly CapabilityAuthorityDescriptor[] = CAPABILITY_AUTHORITY_REGISTRY,
): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const descriptor of registry) {
    if (ids.has(descriptor.id)) errors.push(descriptor.id + ':DUPLICATE_ID');
    ids.add(descriptor.id);

    if (descriptor.runtimeEligibility !== O3_RUNTIME_ELIGIBILITY) {
      errors.push(descriptor.id + ':RUNTIME_ELIGIBILITY_FORBIDDEN');
    }
    if (descriptor.descriptorStanding !== 'DOCUMENTARY_ONLY') {
      errors.push(descriptor.id + ':DESCRIPTOR_STANDING_INVALID');
    }
    if (hasForbiddenAuthorityKey(descriptor)) {
      errors.push(descriptor.id + ':AMBIENT_AUTHORITY_FIELD_FORBIDDEN');
    }

    const { authorityGateStanding: gate, authority, lifecycle } = descriptor;
    if (gate === 'COMPLETE' && (authority.gapRefs.length > 0 || authority.unknownRefs.length > 0)) {
      errors.push(descriptor.id + ':COMPLETE_HAS_OPEN_GATE');
    }
    if (gate === 'PARTIAL' && (authority.gapRefs.length === 0 || authority.unknownRefs.length > 0)) {
      errors.push(descriptor.id + ':PARTIAL_GATE_SHAPE_INVALID');
    }
    if (gate === 'UNRESOLVED' && authority.unknownRefs.length === 0) {
      errors.push(descriptor.id + ':UNRESOLVED_WITHOUT_UNKNOWN');
    }
    if (gate === 'WITHHELD' && lifecycle !== 'WITHHELD') {
      errors.push(descriptor.id + ':WITHHELD_LIFECYCLE_MISMATCH');
    }
    if (gate !== 'WITHHELD' && lifecycle !== 'DECLARED') {
      errors.push(descriptor.id + ':LIFECYCLE_CEILING_BREACH');
    }

    if (authority.unknownRefs.some(ref => !ref.startsWith('UNKNOWN:'))) {
      errors.push(descriptor.id + ':UNKNOWN_REF_PREFIX_INVALID');
    }
    if (authority.gapRefs.some(ref => !/^(GAP|NONCONFORMANCE|CONFLICT):/.test(ref))) {
      errors.push(descriptor.id + ':GAP_REF_PREFIX_INVALID');
    }
  }

  if (registry.length !== CAPABILITY_AUTHORITY_IDS.length) {
    errors.push('REGISTRY:IDENTITY_COUNT_MISMATCH');
  }
  for (const id of CAPABILITY_AUTHORITY_IDS) {
    if (!ids.has(id)) errors.push(id + ':MISSING_CANONICAL_ID');
  }

  return errors;
}
