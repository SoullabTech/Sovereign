# SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O2

## CAPABILITY & AUTHORITY REGISTRY CONTRACT ONLY

**Status:** CONTRACT + FALSIFIER DESIGN ONLY · NO RUNTIME CONSUMER · NO CAPABILITY WIRED · NO AUTHORITY GRANTED

## Purpose

O2 defines one descriptive contract for member-facing SOULLAB capabilities.

It does not replace:
- route/auth enforcement;
- consent ledgers;
- Studio ownership checks;
- AIN epistemic standing;
- JARVIS authority planning;
- Research/Lab integration gates;
- economic entitlement enforcement.

> **The registry describes the conditions under which a capability may be considered. It never grants those conditions.**

## Existing substrate carried forward

Current canonical substrate:
- `lib/maia/capabilities.ts`: 13 member-capability IDs;
- `CAPABILITY_REGISTRY`: canonical but currently inert;
- `MaiaCapability`: already used as a type in cognition events;
- `capability_available`: declared but not emitted;
- separate member-visible `capability-offer` insight kind: unbound to registry and also presently un-emitted.

O2 governs their future convergence but changes none of them.
## Constitutional distinctions

O2 freezes these separations:

> REGISTRATION ≠ AVAILABILITY  
> AVAILABILITY ≠ SUGGESTION  
> SUGGESTION ≠ CONFIRMATION  
> CONFIRMATION ≠ INVOCATION  
> INVOCATION ELIGIBILITY ≠ EXECUTION  
> READ AUTHORITY ≠ WRITE AUTHORITY  
> ROLE ≠ ENTITLEMENT  
> ENTITLEMENT ≠ DATA ACCESS  
> ECONOMIC CLASS ≠ INTELLIGENCE QUALITY  
> AIN REASONING ≠ HUMAN AUTHORITY  
> RESEARCH STANDING ≠ PRODUCT AUTHORITY  
> JARVIS CAPABILITY ≠ MEMBER CAPABILITY

No later consumer may collapse these distinctions.

## Registry identity law

A capability has one stable member-facing identity.

A member-visible offer that proposes a capability must carry the exact registered `capabilityId`.

Free-text insight kinds such as `capability-offer` may remain presentation vocabulary, but they may not create, rename, or imply a capability outside the registry.

Unknown IDs fail closed.
## Capability schema — descriptive contract

```ts
interface CapabilityDescriptor {
  identity: CapabilityIdentity
  purpose: CapabilityPurpose
  placement: CapabilityPlacement
  lifecycle: CapabilityLifecycleStanding

  suggestion: SuggestionContract
  invocation: InvocationContract
  effects: EffectContract
  membranes: MembraneContract

  access: AccessDescription
  intelligence: IntelligenceContract
  work: WorkContract
  research: ResearchContract

  completion: CompletionContract
  governance: GovernanceRefs
}
```

The descriptor contains **requirements and references**, never ambient grants.

There is deliberately no field named:
- `authorized: true`;
- `canWrite: true`;
- `userHasAccess: true`;
- `executionAuthorized: true`.

Those are runtime facts produced by other authorities.
## 1. Identity

```ts
interface CapabilityIdentity {
  id: string                 // stable, namespaced: e.g. journal.create
  schemaVersion: number
  label: string
  owningDomain: string       // semantic owner, not necessarily a nav world
}
```

Laws:
- ID is stable across UI renames.
- ID is not inferred from voice text.
- One ID names one member-intelligible act.
- Compound acts require separate capability IDs or an explicit compound contract.
- JARVIS/operator capabilities use a separate namespace and registry.

## 2. Purpose

```ts
interface CapabilityPurpose {
  humanMovement: string
  objectHeld: string
  description: string
}
```

A capability must be explainable in human-purpose language before it is routable.
## 3. Placement / architectural species

```ts
type ArchitecturalSpecies =
  | 'room'
  | 'ritual'
  | 'portal'
  | 'archive'
  | 'integrative_field'
  | 'studio'
  | 'collaborative_environment'
  | 'modal_action'
  | 'transition'
  | 'utility'

interface CapabilityPlacement {
  species: ArchitecturalSpecies
  routeTarget?: string
  modalTarget?: string
  presentationContext?: string
}
```

`MaiaWorldId` may remain a navigation implementation detail, but it cannot define the universe of valid Estate capabilities.

A capability may target a route without that route becoming its authority source.
## 4. Lifecycle standing

```ts
type CapabilityLifecycleStanding =
  | 'DECLARED'
  | 'WIRED'
  | 'WITNESSED'
  | 'PRODUCTION'
  | 'WITHHELD'
  | 'RETIRED'
```

Laws:
- `DECLARED` must never be presented as executable.
- `WIRED` means connected, not proven safe.
- `WITNESSED` requires named evidence.
- `PRODUCTION` requires separate release authority.
- `WITHHELD` preserves semantic recognition without execution.
- `RETIRED` remains historically legible and cannot silently alias to another act.

Current 13-capability registry is not promoted by O2.
## 5. Suggestion contract

```ts
type Suggestor = 'member' | 'maia' | 'ui'

interface SuggestionContract {
  allowedSuggestors: readonly Suggestor[]
  policyRefs: readonly string[]
  maxConcurrentOffers: number
}
```

Laws:
- suggestion authority is not invocation authority;
- MAIA suggestion requires a registered capability ID;
- one capability suggestion may not authorize another;
- current Standard 5 law remains: maximum one active suggestion at a time unless separately changed by founder ruling.

AIN and JARVIS are not member-facing suggestors.

AIN may provide reasoning to MAIA.
JARVIS may work on implementation under operator authority.
Neither speaks an offer to the member by virtue of those roles.
## 6. Invocation contract

```ts
type ConsentMode =
  | 'EXPLICIT_MEMBER_REQUEST'
  | 'SUGGEST_THEN_CONFIRM'
  | 'ROLE_AND_CONTEXT_BOUND'
  | 'EXTERNAL_AUTHORITY_REQUIRED'
  | 'NOT_MEMBER_INVOKABLE'

interface InvocationContract {
  allowedInitiators: readonly ('member' | 'maia_after_confirmation' | 'ui')[]
  consentMode: ConsentMode
  requirementRefs: readonly string[]
}
```

The registry states what evidence is required.

It does not decide whether that evidence is currently present.

An explicit member request can satisfy only the exact capability requested within its declared scope.
## 7. Effect contract

```ts
interface EffectContract {
  readScopes: readonly string[]
  writeScopes: readonly string[]
  externalEffects: readonly string[]
}
```

Laws:
- read and write scopes are separate;
- no implicit wildcard scope;
- no write authority follows from read authority;
- no cross-domain read follows from owning-domain membership;
- external effects (email, booking, publishing, provider spend, external network, etc.) must be separately named.

An empty scope means no such effect.

Unknown effect scope fails closed.
## 8. Membrane contract

```ts
type DataMembrane =
  | 'PUBLIC'
  | 'MEMBER_PRIVATE'
  | 'RELATIONSHIP_PRIVATE'
  | 'WORK_PRIVATE'
  | 'PRACTITIONER_CLIENT'
  | 'TEAM'
  | 'COMMUNITY'
  | 'SANCTUARY'
  | 'SYSTEM'

interface MembraneContract {
  readsFrom: readonly DataMembrane[]
  writesTo: readonly DataMembrane[]
  crossMembranePolicyRefs: readonly string[]
}
```

Laws:
- multiple membranes do not imply carriage between them;
- cross-membrane use requires an explicit governing policy reference;
- `SANCTUARY` never becomes persistent/crossing authority merely because a capability supports persistence elsewhere;
- member ownership remains distinct from platform visibility.
## 9. Access description

```ts
type EconomicClass =
  | 'FREE_FOUNDATION'
  | 'STEWARD_DEPTH'
  | 'STUDIO_ENTITLEMENT'
  | 'CAPACITY_EVENT'
  | 'TEAM_ORG'
  | 'UNRESOLVED'

interface AccessDescription {
  identityRequirementRef?: string
  roleRequirementRefs: readonly string[]
  entitlementRequirementRefs: readonly string[]
  economicClass: EconomicClass
  enforcementRefs: readonly string[]
}
```

This block is descriptive only.

The current `accessMatrix.ts` remains its own route/auth authority until separately reconciled.

Legacy `free/personal/pro` route tiers are not silently redefined as the new Free/Steward/Studio economic model.

Role and entitlement must remain separate facts.
## 10. Intelligence contract

```ts
type AINRole =
  | 'NONE'
  | 'RETRIEVAL'
  | 'COUNCIL'
  | 'EPISTEMIC_GUARD'
  | 'SYNTHESIS_SUPPORT'

interface IntelligenceContract {
  ainRoles: readonly AINRole[]
  standingPolicyRefs: readonly string[]
  providerPolicyRefs: readonly string[]
}
```

Laws:
- AIN output may inform MAIA; it does not gain member-facing authority from confidence or complexity;
- a high-confidence synthesis cannot bypass consent;
- provider availability does not create capability authority;
- epistemic standing must survive translation into MAIA language.
## 11. JARVIS work contract

```ts
type JarvisWorkRole =
  | 'NONE'
  | 'IMPLEMENTATION_ONLY'
  | 'AUTHORIZED_WORK_OBJECT'

interface WorkContract {
  jarvisRole: JarvisWorkRole
  authorityPolicyRefs: readonly string[]
  memberDataAuthority: false
}
```

Default law:

> **Member-facing capability registration grants JARVIS zero member-data authority.**

JARVIS may modify or test capability implementation only inside separately granted repository/work authority.

A JARVIS deterministic capability ID cannot be supplied where a member capability ID is required, and vice versa.
## 12. Research contract

```ts
type ResearchStatus =
  | 'NO_RESEARCH_DEPENDENCY'
  | 'RESEARCH_DERIVED'
  | 'HYPOTHESIS_BEARING'
  | 'EXPERIMENTAL'
  | 'HUMAN_RESEARCH_RESTRICTED'
  | 'UNKNOWN'

interface ResearchContract {
  status: ResearchStatus
  standingRefs: readonly string[]
  productIntegrationGateRefs: readonly string[]
}
```

Laws:
- research-derived does not mean production-authorized;
- a hypothesis-bearing capability must not render its hypothesis as established fact;
- human-subject research restrictions cannot be overridden by product entitlement;
- absence of research metadata must not be interpreted as “established.”
## 13. Completion contract

```ts
interface CompletionContract {
  acknowledgmentRequired: boolean
  acknowledgmentForm: 'VISUAL' | 'AUDIBLE' | 'BOTH' | 'CONTEXTUAL'
  returnTargets: readonly string[]
  failureDisclosureRequired: boolean
}
```

Existing Standard 5 law remains:

> No silent execution.

Every invoked effect needs acknowledgment.

A failed or withheld capability must report truthful non-execution rather than silently substituting another act.

Return targets preserve orientation after a boundary crossing.
## 14. Governance references

```ts
interface GovernanceRefs {
  sourceOfTruthRefs: readonly string[]
  privacyRefs: readonly string[]
  consentRefs: readonly string[]
  economicRefs: readonly string[]
  researchRefs: readonly string[]
}
```

A descriptor without sufficient authority references may exist as `DECLARED`, but it cannot infer missing law.

The registry is an index into governing authorities, not their replacement.

## Registry relationship to current cognition events

Future convergence law:

```text
ConversationInsight(type='capability-offer')
        ↓ MUST carry
registered capabilityId
        ↓
registry descriptor
        ↓
separate runtime authority/consent evaluation
        ↓
offer may or may not render
```

Presentation vocabulary cannot bypass capability identity.
# Invariants

## O2-INV-01 — Registry non-authority
Registration cannot grant access, consent, data authority, execution authority, economic entitlement, or research authority.

## O2-INV-02 — Unknown capability fails closed
An unknown capability ID cannot be normalized, guessed, or converted into a nearby capability.

## O2-INV-03 — One member-capability identity
Every member-visible capability offer references exactly one registered member capability ID.

## O2-INV-04 — Namespace separation
Member capabilities and JARVIS/operator capabilities remain separate registries/namespaces.

## O2-INV-05 — Suggestion non-inheritance
Permission to suggest does not imply permission to invoke.

## O2-INV-06 — Confirmation purpose binding
Member confirmation/request applies only to the declared capability and scope.

## O2-INV-07 — Read/write separation
Read scope never implies write scope.
## O2-INV-08 — Membrane non-inheritance
Presence in or access to one membrane does not grant access to another.

## O2-INV-09 — Cross-Estate carriage must be named
Cross-room/cross-membrane synthesis requires a specific carriage policy reference.

## O2-INV-10 — Sanctuary dominance
No registry metadata may weaken existing Sanctuary non-retention/non-continuation law.

## O2-INV-11 — Role / entitlement separation
Professional/member role does not imply commercial entitlement; entitlement does not imply professional role.

## O2-INV-12 — Economic neutrality of MAIA
Economic class may govern capability depth/capacity/entitlement, never the constitutional identity of MAIA.

## O2-INV-13 — AIN non-authority
AIN reasoning standing does not create human consent, product authority, or member meaning.

## O2-INV-14 — Research non-promotion
Research status cannot self-promote a capability into production or a hypothesis into fact.

## O2-INV-15 — JARVIS non-inheritance
JARVIS work capability/authority does not inherit member capability/data authority.
## O2-INV-16 — Truthful availability
A declared but unwired/withheld capability cannot be represented as executable.

## O2-INV-17 — No semantic fallback
If the requested capability is unavailable, the registry cannot silently substitute a different act.

## O2-INV-18 — Acknowledged effects
Any completed side effect is acknowledged to the member.

## O2-INV-19 — Return orientation
Boundary-crossing capabilities name at least one valid return target or explicitly declare terminal completion.

## O2-INV-20 — Species truth
A capability's architectural species is explicit; a portal, ritual, field, and Studio are not silently flattened into equivalent “worlds.”

## O2-INV-21 — Access-matrix non-replacement
The registry cannot override or weaken route/server authorization.

## O2-INV-22 — No ambient authority
Availability of model, provider, credential, role, tier, route, or context cannot fill a missing authority requirement.
# Pre-implementation falsifier matrix

Every future falsifier varies one proposition only.

| ID | Proposition under attack | Required refusal / death |
| --- | --- | --- |
| F-O2-01 | Registry entry sets `authorized=true` | `REGISTRY_AUTHORITY_GRANT_FORBIDDEN` |
| F-O2-02 | Unknown member capability is normalized to nearest ID | `UNKNOWN_MEMBER_CAPABILITY` |
| F-O2-03 | Member-visible capability offer has no registered capabilityId | `UNBOUND_CAPABILITY_OFFER` |
| F-O2-04 | JARVIS capability ID supplied as member capability | `CAPABILITY_NAMESPACE_CROSSING` |
| F-O2-05 | MAIA suggestion treated as invocation consent | `SUGGESTION_NOT_CONSENT` |
| F-O2-06 | Confirmation for A invokes B | `CONFIRMATION_SCOPE_MISMATCH` |
| F-O2-07 | Read scope used to authorize write | `READ_IS_NOT_WRITE` |
| F-O2-08 | Unknown/wildcard write scope accepted | `UNBOUNDED_EFFECT_SCOPE` |
| F-O2-09 | Cross-membrane read without policy ref | `CROSS_MEMBRANE_POLICY_REQUIRED` |
| F-O2-10 | Sanctuary capability persists continuation/history | `SANCTUARY_PERSISTENCE_FORBIDDEN` |
| F-O2-11 | Practitioner role substitutes for Studio entitlement | `ROLE_NOT_ENTITLEMENT` |
| F-O2-12 | Studio entitlement substitutes for practitioner role | `ENTITLEMENT_NOT_ROLE` |
| F-O2-13 | Steward economic class selects a constitutionally “better MAIA” | `ECONOMIC_MAIA_DEGRADATION_FORBIDDEN` |
| F-O2-14 | High AIN confidence bypasses member confirmation | `AIN_STANDING_NOT_CONSENT` |
| F-O2-15 | Research-derived capability self-marks PRODUCTION | `RESEARCH_NOT_PRODUCT_AUTHORITY` |
| F-O2-16 | Human-research restriction bypassed by paid entitlement | `RESEARCH_RESTRICTION_DOMINATES` |
| F-O2-17 | JARVIS implementation authority reads member-private data | `JARVIS_MEMBER_DATA_AUTHORITY_FORBIDDEN` |
| F-O2-18 | DECLARED capability rendered as executable | `CAPABILITY_NOT_EXECUTABLE` |
| F-O2-19 | Unavailable CONTINUE falls back to KEEP | `SEMANTIC_FALLBACK_FORBIDDEN` |
| F-O2-20 | Side effect completes without acknowledgment | `SILENT_EFFECT_FORBIDDEN` |
| F-O2-21 | Boundary transition has no return contract | `RETURN_CONTRACT_REQUIRED` |
| F-O2-22 | Registry metadata weakens route auth | `ACCESS_AUTHORITY_OVERRIDE_FORBIDDEN` |
| F-O2-23 | Provider availability fills missing invoke authority | `AMBIENT_AUTHORITY_INHERITANCE` |
| F-O2-24 | Portal declared as generic room without species | `ARCHITECTURAL_SPECIES_REQUIRED` |

# Lawful baseline examples

## Journal capture

Descriptor may say:
- human movement: expression;
- species: room/modal action;
- MAIA may suggest;
- invocation: explicit request OR suggest-then-confirm;
- write scope: member journal only;
- membrane: MEMBER_PRIVATE;
- economic class: FREE_FOUNDATION;
- acknowledgment required.
It may not say:
- current member is authorized;
- current request owns a journal;
- any conversation text may be saved automatically.

## Decision Council

Descriptor may say:
- human movement: discernment;
- AIN role: COUNCIL;
- invocation requires explicit member act;
- effect writes only to owned decision history;
- economic class for a specific act may be Free or capacity-bounded by policy.

AIN's council result does not become authority over the member's decision.

## Living Field refinement

Descriptor may say:
- species: integrative_field;
- reads explicitly gathered/provenance-bearing sources;
- AIN role: SYNTHESIS_SUPPORT / EPISTEMIC_GUARD;
- cross-membrane carriage requires named policy;
- member acceptance governs persistence of candidate expression.

It may not infer access to every Estate room because Living Field is integrative.
# Compatibility rulings

## Existing `lib/maia/capabilities.ts`
O2 does not replace it in this act.

Future implementation may evolve it into or adapt it to this contract.

No field is added by O2 itself.

## Existing cognition events
`capability_available` and member-visible `capability-offer` remain inert/currently un-emitted.

Future wiring must bind member-visible offers to the registered capability ID.

## Existing access matrix
Remains route/auth source of truth until separately reconciled.

O2 economic/access metadata is descriptive and may expose contradictions; it may not repair them.

## Existing JARVIS capability registry
Remains independent.

O2 may reference JARVIS work-role metadata but may not compose member and operator capability namespaces.

## Existing research constitutions
Remain authoritative for research standing and integration gates.

The capability registry carries references to those laws; it does not re-adjudicate research.
# O2 closure conditions

O2 contract is conceptually closed when founder adjudication accepts:

1. the registry is descriptive, not authoritative;
2. member and JARVIS capability namespaces remain separate;
3. one member-visible offer must bind to one registered capability ID;
4. read/write, role/entitlement, research/product, economic/intelligence, and AIN/human authority remain separate;
5. cross-membrane carriage is explicit;
6. lifecycle standing prevents unwired capabilities from pretending to execute;
7. acknowledgment and return contracts are first-class;
8. the falsifier matrix covers every load-bearing law.

No implementation is authorized by closure.

## Standing

> **O2 — CAPABILITY & AUTHORITY REGISTRY CONTRACT DELIVERED · DESCRIPTIVE SCHEMA DEFINED · 22 INVARIANTS · 24 SINGLE-PROPOSITION FALSIFIERS · EXISTING MAIA REGISTRY PRESERVED INERT · NO RUNTIME WIRING · NO AUTHORITY EXPANSION**

## Exact next boundary

> **SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O2R1 — REGISTRY CONTRACT FOUNDER ADJUDICATION + CURRENT 13-CAPABILITY RECONCILIATION DESIGN ONLY**

O2R1 should map each of the existing 13 MAIA capability IDs into the new contract, mark unknown fields honestly, identify vocabulary conflicts, and stop before source implementation.
