# SPM-F5 Repair P3 — Architecture Selection — 2026-09-17

**Standing:** SELECTED FOR P4 FALSIFICATION · NOT IMPLEMENTATION AUTHORITY

## 0 · Bound authority

- SPM-FC-01 blob: b52c53eae03851fb6bf21dbc41a1f38fe3a003d1
- Examined organism: 89b79a4a59f42a1cd5951d6a9686d3a47772ddef
- Ratified conformance commit: bbb1672d5e454f1f9051bdca76b8f71e681e88d8
- Repair contracts commit lineage: 95c0e2fded9a3f81abfba78719f5db26934c4c25
- P2 contract set: SPM-F5_REPAIR_P2_CONTRACTS_2026-09-17.md
- RC-2 caller census: SPM-F5_REPAIR_P2_RC2_CALLER_CENSUS_2026-09-17.md
- RC-5 surface census: SPM-F5_REPAIR_P3_RESPONSE_SURFACE_CENSUS_2026-09-17.md

P3 chooses authority-bearing repair boundaries only. It does not authorize source, schema, migration, UI, deployment, or production mutation.

## 1 · Selection rule

For each repair contract, prefer the smallest boundary that:
- actually owns the authority question;
- eliminates every known bypass;
- can fail closed;
- preserves the six PASS laws; and
- can be falsified before implementation.

A smaller boundary is rejected if a known bypass survives.
A larger boundary is rejected if it imports unrelated authority or creates a new constitutional claim.
# A1 — RC-1 · Retire the legacy sovereignty deletion experience

**Contracts:** RC-1 · I-1 I-2 I-3 I-25 I-30 I-31

## Selected architecture

Treat the old sovereignty deletion feature as one legacy experience corridor:

    Lab Tools sovereignty UI
      ├─ my-data-summary route / deletion_info claims
      ├─ delete-my-memory Next route
      ├─ standalone legacy sovereignty service
      └─ access-matrix lexical inheritance

The selected repair posture is **retirement / hard containment**, not hardening this corridor into a second destructive authority system.

A future complete member-erasure capability belongs to RC-3 and the modern account-closure lineage.

## Why this boundary

Smaller is insufficient:
- retiring only the delete route leaves the data-summary surface promising deletion is available/permanent/immediate;
- hiding only the UI leaves API/service reachability;
- adding only explicit auth leaves body-selected subject and false success;
- fixing only false success preserves an obsolete five-table deletion promise.

Larger is unnecessary:
- RC-1 does not require redesigning modern account closure;
- full custody/disposition belongs to RC-3.

## Data/schema implication

None is selected by A1. Retirement should require no new deletion schema.
## Rollback / containment posture

The safe state is non-executability. Re-enabling the feature later requires a new authority decision and RC-3-compatible design.

## Bypass eliminated

No legacy UI, Next route, standalone service, or sibling summary claim may remain capable of asserting the retired destructive act.

# A2 — RC-2 · Server-attested origin + separate member adoption act

**Contracts:** RC-2 · I-4 I-27

## Selected architecture

Separate two facts currently collapsed by generated_by='member-gesture':

    SOURCE PRODUCER / WORDING ORIGIN
        independent server-attested fact

    MEMBER ACT
        keep / adopt / file / hold / protect
        separate fact

The shared Keep mint remains a useful convergence boundary, but it may mint an authorship/producer claim only from **attested material**, never raw caller assertions.

Each source family resolves the exact material and its producer before the mint:
- owned capsule → server-resolved source;
- current member turn → exact authenticated member utterance identity;
- MAIA-produced material → exact durable MAIA producer object/turn/offer;
- practitioner material → practitioner writer/provenance path;
- unknown caller-carried material → remains unproven/unknown, never upgraded to member-authored.

The member's Keep gesture can be recorded even when the source producer is MAIA or another person.
## Why this boundary

Smaller is insufficient:
- route-local validation leaves other keepSource() callers;
- source-id existence does not prove exact wording origin;
- changing only generated_by labels does not establish the referent.

Larger is unnecessary:
- this does not require redesigning the whole Portfolio or standing system;
- adoption and source authorship can remain distinct without universal provenance redesign.

## Schema implication

Likely additive because the current atom shape overloads producer/origin and member gesture. P3 selects the semantic two-axis model, not exact column/table names.

## Bypass eliminated

No caller may transform “I clicked Keep” into “I authored these bytes.”

# A3 — RC-3 · Governed custody/disposition planner

**Contracts:** RC-3 · I-20 I-21 I-22 I-23 I-24 I-32

## Selected architecture

Member-wide destructive acts use one governed disposition process:

    SEMANTIC CUSTODY REGISTRY
            +
    SCHEMA / EXTERNAL-CUSTODY CENSUS
            ↓
    READ-ONLY DISPOSITION PLAN
            ↓
    REVALIDATE / LOCK RELEVANT STATE
            ↓
    EXECUTE EXPLICIT PLAN
            ↓
    DURABLE MANIFEST + OUTCOMES
            ↓
    MEMBER ROW / AUTH FINALIZATION LAST
The semantic registry declares governed object classes, stakeholder roles, allowed dispositions, and external custody semantics.

A repository/schema census verifies every member-affiliated class is represented by the registry or an explicit governed exclusion. Newly introduced unmatched classes fail the verification gate rather than silently surviving by omission.

The runtime planner computes the act-specific disposition before mutation, including:
- FK cascade/restrict consequences;
- text/non-FK ownership;
- multi-sovereign stakes;
- surviving representation warrants;
- external/file custody;
- domain-specific refusal/tombstone laws.

Execution revalidates the plan against current state before destructive commit.

The existing deletion manifest vocabulary is retained where lawful and extended only as required to record actual per-class/object outcomes.

## Why this boundary

Smaller is insufficient:
- a longer manual table list still drifts;
- FK introspection lacks semantic ownership and multi-sovereign law;
- schema fixes alone do not explain disposition;
- manifests written after arbitrary cascades merely document an ungoverned act.

Larger is unnecessary:
- the planner need not redesign every domain's local erasure mechanism;
- domain-specific erasers remain authoritative implementations under one member-wide plan.
## Data/schema implications for A3

Possible later changes include:
- an explicit registry representation;
- durable plan/manifest outcome records;
- correction of FKs whose current cascade semantics violate plurality;
- adapters for external/file custody.

P3 does not authorize or finalize those structures.

## Rollback / containment posture

Until A3 exists and is witnessed, modern account closure keeps its current refusal posture for governed content rather than claiming complete erasure.

## Bypass eliminated

- no member-bound class can disappear from the act merely because it was omitted from a route array;
- no FK cascade can be treated as an unexplained side effect;
- no non-FK shared authority can survive accidentally;
- no second sovereign's record is destroyed solely by the departing member's act.

# A4 — RC-4 · Immutable derivation edges

**Contracts:** RC-4 · I-26 I-28

## Selected architecture

Persistent governed derivatives carry durable lineage edges:

    DERIVATIVE
      child_kind + child_id
           ↓
    LINEAGE EDGE(S)
      source_kind + source_id
      source_version/state/digest when mutable
      derivation role
           ↓
    EXACT SOURCE MATERIAL
Multi-source derivations carry multiple edges.

The lineage write is atomic with derivative creation or the derivative is not admitted as a governed derivative.

Where source content can later be erased, durable non-content source identity/tombstone may remain where governing erasure law permits, so history does not become false.

Legacy derivatives with no provable lineage are not guessed or semantically backfilled. They remain explicitly unresolved or are legitimately re-derived under a new governed act.

## Why this boundary

Smaller is insufficient:
- member/session/container ids do not identify source material;
- co-location/cascade is not lineage;
- later reconstruction by similarity/timestamp is not historical provenance.

Larger is unnecessary:
- domain content need not move into one universal derivative store;
- a common edge contract can coexist with domain-local derivative tables.

# A5 — RC-5 · Canonical participation cognition handoff

**Contracts:** RC-5 · I-10 I-11 I-12 I-13 I-14 I-15

## Selected architecture

All live stored-member-context cognition families must cross one authority seam before a response-producing model sees that context:

    SURFACE-SPECIFIC LOADERS / CANDIDATES
            ↓
    CANONICAL PARTICIPATION ADJUDICATION
            ↓
    FROZEN ADMITTED BUNDLE / TURN
            ↓
    SURFACE-SPECIFIC COGNITION STRATEGY
            ↓
    MODEL
The authority seam owns **membership**, not model strategy.

The current four live families are:
- /api/sovereign/app/maia/list — typed and spoken;
- /api/between/chat;
- /api/now-what/interview turn;
- /api/maia/vision-studio/interview turn.

Writer's Studio is the existing response-producing exemplar: tiers may choose strategy after canonical participation has fixed membership.

No downstream cognition stage may independently reload member-specific stored context outside the admitted bundle.

Dormant response routes receive a reactivation condition: they cannot regain live authority without the same cognition-handoff contract.

## Hard dependency

A5 implementation is barred until A2/RC-2 provenance authority is proven. Otherwise the universal gate would consistently trust false provenance.

## Why this boundary

Smaller is insufficient:
- loader-only fixes leave route composition authority duplicated;
- /maia/list only leaves Between and rooms;
- route-local copies recreate divergent constitutional logic;
- controlling only the first model call is insufficient if downstream stages can reload member context.

Larger is unnecessary:
- cognition engines, prompts, tier strategy, provider choice, and room-specific creative intelligence remain surface-specific;
- the repair governs who/what participates, not how MAIA thinks once participation is lawfully fixed.
## Data/schema implications for A5

No new persistence substrate is selected by P3. Existing canonical-turn / producer / policy structures are the preferred authority family, subject to P4 falsification.

Withdrawal/adoption semantics may require source-read corrections before candidate construction, including eliminating vector/fallback paths that ignore current permission.

## Rollback / containment posture

Cutovers are per response-producing family behind explicit observation/witness gates. A family is not “canonical” while its old prompt-membership path remains capable of injecting beside the governed bundle.

## Bypass eliminated

- shadow-only canonical construction cannot coexist as the supposed authority;
- raw legacy addenda cannot bypass adjudication;
- roomComposition cannot remain an independent membership authority;
- downstream stages cannot quietly reload excluded material;
- dormant routes cannot be reactivated outside the governed handoff.

# A6 — RC-6 · Narrow revision-offer representation warrant + activation lock

**Contract:** RC-6 · I-17

## Selected architecture

The exact D9 specimen stays narrow.

For a persistent manuscript_revision_offer with origin='work':

    S3 / Work-reading authority
            ↓
    READING
            ≠
    REPRESENTATION AUTHORITY
            ↓
    SEPARATE EXACT REVISION-OFFER WARRANT
            ↓
    PERSIST MAIA OFFER

The second warrant is bound to the exact member, Work/draft/section, purpose, producing act/turn, and representation crossing. It cannot be inferred from reading authority, standing, or model confidence.
Because the offer table currently has no runtime writer, **activation is locked**: no runtime origin=work offer writer may be introduced before the separate warrant substrate and enforcement exist.

This is not a general MAIA-speaking law and confers nothing outside the revision-offer specimen.

## Why this boundary

Smaller is insufficient:
- reusing the reading authority repeats I-17;
- a comment/JSON label saying “representation” without an independent act is not authority.

Larger is unnecessary:
- I-19 remains GAP;
- ordinary member-facing MAIA speech is not constitutionalized here.

# A7 — RC-7 · Writer's Studio transformed-state provenance events

**Contract:** RC-7 · I-5

## Selected architecture

When an authorized transformation changes persistent Work wording, the resulting Work state receives immutable provenance lineage to the exact authored formulation and authorization that produced that state.

The architecture is state/version based rather than a mutable “author” label:

    section state/version/digest N
       ← transformation event
          actor/member act
          wording producer
          exact source proposal/version
          exact authorization
          prior state/version

A later member edit creates a new state/event rather than rewriting the earlier transformation provenance.
The current state may truthfully be described as mixed/revised when its history contains multiple authorship events; the system must not collapse a mixed state into one global author.

A7 may reuse A4 lineage primitives only if P4 proves the semantics fit. Shared vocabulary does not force one table.

## Why this boundary

Smaller is insufficient:
- a mutable section-level author label lies after mixed/later edits;
- keeping provenance only on the proposal/authorization side leaves the transformed Work unable to identify its own transformation lineage.

Larger is unnecessary:
- byte-level permanent authorship attribution for all writing history is not required by I-5;
- the contract concerns transformed persistent states and their exact producing formulation.

## Data/schema implication

Likely additive immutable event/lineage records keyed to section + resulting Work version/digest. Exact representation is deferred to P5/P6 after P4.

# A8 — RC-8 · Typed end-to-end deletion outcome

**Contract:** RC-8 · I-29

## Selected architecture

Account deletion exposes one typed governed outcome from server through client:

    REQUEST ID / ACT ID
           ↓
    SERVER DISPOSITION
      succeeded | refused | partial | failed | unknown/in-flight
           ↓
    durable plan/manifest reference where applicable
           ↓
    HTTP transport
           ↓
    CLIENT PARSES OUTCOME
           ↓
    MEMBER-VISIBLE TRUTH
The client renders:
- whether anything changed;
- bounded retained/disposed categories;
- governed reason;
- next lawful step;
- outcome-unknown state when transport loss prevents the client from knowing whether execution completed.

Final complete-erasure wording derives from A3/RC-3, not from UI aspiration.

## Why this boundary

Smaller is insufficient:
- server-only truth already failed I-29;
- UI-only copy cannot know actual disposition;
- res.ok cannot express refused/partial/unknown outcomes.

Larger is unnecessary:
- A8 need not redesign account settings generally;
- it consumes A3's governed disposition rather than duplicating custody law.

# AX1 — XC-1 · Trace-before-influence for accountable Cut-1

**Imported contract:** XC-1 · I-33

## Selected architecture

For Cut-1 occasions claimed as historically accountable:

    READ / DECIDE CANDIDATES
            +
    PERSIST EXACT OCCASION TRACE
            ↓
    ONLY AFTER BOTH SUCCEED
    RETURN CANDIDATES TO RESPONSE-PRODUCING COGNITION

The existing trace identity/table is retained if P4 proves it sufficient.

Trace persistence failure may not fall back to an untraced accountable read that still influences cognition.

Idempotent replay returns the already-recorded occasion when identical; a conflicting reuse refuses.

This companion remains outside the local 31-law denominator.
## 2 · Selected design dependencies

    A1  legacy retirement                     independent bounded containment

    A2  provenance authority
     └── required before ───────────────────▶ A5 participation cutover

    A3  custody/disposition
     └── supplies final semantics ──────────▶ A8 deletion outcome

    A4  derivation lineage
     └── may supply primitives ─────────────▶ A7 transformed-state provenance
         but shared implementation is not assumed

    A6  revision-offer warrant
     └── must exist before any runtime writer activates that crossing

    AX1 trace-before-influence                   independent imported companion

## 3 · Proposed implementation-wave order — sequencing only

No wave is authorized yet.

    W1  A1  legacy sovereignty retirement / containment
    W2  A2  provenance mint authority
    W3  AX1 Cut-1 trace-before-influence
    W4  A3  custody/disposition substrate + planner
    W5  A4  derivation-lineage substrate
    W6  A5  participation cognition handoff  (after W2)
    W7  A6  narrow revision-offer warrant     (before offer activation)
    W8  A7  transformed-state provenance
    W9  A8  member-visible account outcome    (final semantics after W4)

P5 may authorize one wave, several bounded waves, or none. This ordering creates no implementation authority.
## 4 · P3 standing

The architectures above are **selected only for hostile design falsification**.

    P0  authority binding              COMPLETE
    P1  dependency map                 COMPLETE
    P2  repair contracts               COMPLETE
    P3  architecture selection         COMPLETE — CANDIDATES SELECTED

    P4  design falsification           NEXT
    P5  founder implementation grant   CLOSED
    P6  implementation                 CLOSED

    SOURCE / SCHEMA / UI MUTATION      NOT AUTHORIZED
    PRODUCTION                         UNTOUCHED

Any P4 attack that defeats an architecture sends that architecture back to P3 refinement. No selection survives by elegance alone.
