# SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O2R3

## DESCRIPTOR FIXTURE COMPLETENESS + AUTHORITY-REFERENCE CENSUS ONLY

**Status:** READ-ONLY AUTHORITY CENSUS · NO FIXTURE MUTATION · NO SOURCE IMPLEMENTATION · NO RUNTIME WIRING

## Purpose

O2R3 traces every `UNKNOWN:` authority reference in the O2R2 descriptor fixtures against existing repository law and runtime evidence.

Outcome vocabulary:
- **RESOLVED** — a governing authority exists and fits the question.
- **PARTIAL** — governing law exists, but runtime enforcement or exact product scope is incomplete.
- **UNRESOLVED** — no adequate authority exists, or current authorities conflict.
- **DEFECT / CONTRADICTION** — current runtime behavior conflicts with governing law.

## Summary

The O2R2 fixture set contains 19 `UNKNOWN:` occurrences across 17 descriptors, representing 17 distinct authority-reference types.

Distinct reference-type disposition:
- **RESOLVED:** 5
- **PARTIAL / law-runtime gap:** 6
- **UNRESOLVED:** 6

One PARTIAL item — Journal capture scope — contains a direct current-runtime nonconformance.## A. Journal

### `UNKNOWN:create-write-policy` — PARTIAL

**Evidence found**
- `QuickJournalSheet` opens and resets content locally.
- Merely opening the sheet does not create a durable Journal row.
- Durable persistence occurs only through explicit `handleSave()`.
- O2R2 already establishes that opening Journal is not itself persistence authority.

**Authority**
- O2R2 Journal identity and capture law.
- Current Journal UI is implementation evidence consistent with that law.

**Why PARTIAL**
No standalone pre-O2 Journal constitution was located that defines create-versus-save authority across every Journal surface.

**Future reference replacement**
`O2R2:JOURNAL_CREATE_NO_WRITE` plus current Journal write-path evidence.

### `UNKNOWN:capture-scope-runtime-policy` — PARTIAL / DEFECT

**Governing law:** O2R2 says that “Save this” authorizes preservation of material the member is presently indicating, not an implementation-chosen fixed transcript window.

**Current runtime:** voice `journal-save` captures the last five conversation messages automatically.

**Standing:** the authority is known; current runtime does not conform.### `UNKNOWN:dream-capture-scope-runtime-policy` — PARTIAL / CURRENT NONCONFORMANCE

O2R2 supplies the governing semantic law:
- only authorized indicated material may be captured;
- classification as dream material must be intentional.

Current voice `journal-dream` also uses the fixed last-five-message window.

**Future reference replacement:** `O2R2:JOURNAL_CAPTURE_SCOPE`.

A later implementation act must create a real CaptureScope resolver rather than preserving an arbitrary message count.

## B. Astrology

### `UNKNOWN:astrology-standing-policy` — RESOLVED

**Authorities:**
- `docs/design/contracts/astrology.md`
- `docs/canon/SYMBOLIC_GUIDANCE_LAYER_DOCTRINE.md`

Established law:
- Astrology is a symbolic map for reflection.
- It is not diagnosis, prediction, fate declaration, ranking, or authority over the member.
- MAIA remains a reflective companion rather than astrological authority.
- Symbolic guidance must remain optional, scoped, reversible, and non-authoritarian.

**Future reference replacement:** `ASTROLOGY_EXPERIENCE_CONTRACT` + `SYMBOLIC_GUIDANCE_LAYER_DOCTRINE`.### `UNKNOWN:chart-data-policy` — RESOLVED

**Authority:** Astrology Experience Contract, Identity Boundary.

Established law:
- chart data is member-scoped;
- authoritative member identity comes from a verified server session;
- an unbound local cache may not establish whose birth data is being used;
- `UNAVAILABLE` is not the same as `ABSENT`;
- no chart is better than the wrong person's chart.

**Future reference replacement:** `ASTROLOGY_EXPERIENCE_CONTRACT#Identity-boundary`.

This resolves chart identity/member scoping. It does not automatically authorize chart data to cross into unrelated Estate domains.

## C. Wisdom / source material

### `UNKNOWN:wisdom-retrieval-provenance-policy` — RESOLVED

**Authorities:**
- `CORPUS_DISCIPLINE_PROTOCOL_v1.0.md`
- `CORPUS_WEIGHTING_SCHEMA_v1.0.md`

Corpus governance already requires document-level provenance and retrieval metadata including:
- tier, authority, source type;
- title, author, version, date;
- status;
- explicit `safe_for_retrieval` human sign-off.

Only stable material should be active in retrieval.

**Future reference replacement:** `CORPUS_DISCIPLINE_PROTOCOL_v1.0`.### `UNKNOWN:source-rights-policy` — UNRESOLVED

Existing Wisdom programme evidence identifies a real rights gap:
- source schema does not comprehensively carry copyright/license status;
- public retrieval of corpus chunks can create rights exposure;
- rights-model work remains unfinished.

Corpus provenance metadata is not sufficient to establish legal or ethical republication rights.

**Standing:** keep UNKNOWN.

A future source-rights contract should cover at minimum:
- copyright / license / public-domain status;
- permitted retrieval, display, quotation, and redistribution mode;
- attribution requirements;
- traditional, cultural, or lineage restrictions where applicable.

## D. Relationships

### `UNKNOWN:relationship-context-policy` — RESOLVED

**Authority:** ratified `RELATIONSHIP_ROOM_CONSTITUTION.md`.

It establishes:
- the object is the member's relationship, not a profile of the other person;
- explicit relationship identity is required;
- member declaration, MAIA observation, inference, and unknown remain distinct;
- permission to retain/retrieve is distinct from permission to speak/share;
- unknown relationship attribution may not be guessed;
- Sanctuary governs relational persistence, inference, recall, and surfacing.

**Future reference replacement:** `RELATIONSHIP_ROOM_CONSTITUTION`.## E. Shadow

### `UNKNOWN:current-shadow-constitution` — UNRESOLVED

The located `MAIA-RELATIONAL-FIELD-SHADOW-01` charter is **not** member-facing Shadow authority.

It explicitly states:
- mode: shadow-only implementation;
- member-facing authority: NONE;
- output invisible to members;
- no memory, standing, prompt, or live-response mutation;
- allowlisted research execution only.

Repository search did not locate a separate ratified member-facing Shadow constitution corresponding to `shadow.open`.

Therefore:
- the research-shadow charter cannot be borrowed as product authority;
- `shadow.open` remains documentary `DECLARED` only;
- its product/research standing remains unresolved.

**Standing:** keep UNKNOWN until the member-facing Shadow constitution is located or authored.

## F. Studios

### `UNKNOWN:studio-threshold-policy` — PARTIAL

**Current evidence:** `/choose` is a real Studio orientation surface.
It:
- authenticates the member;
- checks current Studio identity;
- distinguishes `studioMode: personal | practice`;
- routes personal choice into Personal Studio provisioning;
- routes practice choice into Studio creation flow.

Session Room / Studio architecture also distinguishes accompaniment from stewardship.**Why PARTIAL**
The current chooser predates the new Writer / Personal / Pro Studio ecosystem and does not govern future Studio entitlements.

**Future reference:** current `/choose` behavior + Session Room/Studio architecture, explicitly marked transitional.

### `UNKNOWN:writers-studio-entitlement-policy` — UNRESOLVED / CURRENT POLICY CONFLICT

Current access authority says:
- `/writers-studio` is member-facing;
- every authenticated member qualifies through `minTier: free`;
- no Steward/founder tier gate applies.

Current business architecture proposes Writer's Studio as a separately entitled Studio for Stewards.

These are different policies and cannot be silently collapsed.

**Standing:** keep UNKNOWN until a deliberate access/economic migration act reconciles them.

### `UNKNOWN:personal-studio-product-status` — UNRESOLVED

**Resolved substrate:** Personal Studio is real.
It has:
- authenticated provisioning;
- `portal_type='personal'`;
- `studio_mode='personal'`;
- dedicated modules/theme;
- suspension/collision invariants.

**Unresolved product question:** U2-B explicitly says its separate Studio qualification is plausible but not yet earned.

Infrastructure existence does not establish a separately paid product.

**Standing:** keep UNKNOWN.### `UNKNOWN:pro-studio-role-policy` — PARTIAL

Current professional identity machinery resolves:
- verified member session;
- active practitioner row;
- practitioner id;
- portal type;
- enabled modules;
- `studioMode: personal | practice`.

But Personal Studio provisioning deliberately creates a practitioner-shaped row too.

Therefore:
> active practitioner row ≠ sufficient proof of Pro Studio professional role.

`studioMode='practice'`, portal type, and professional routes are evidence, but no single ratified Pro-role discriminator was located.

**Standing:** PARTIAL; stronger semantic Pro-role contract required.

### `UNKNOWN:pro-studio-entitlement-policy` — UNRESOLVED / CURRENT POLICY CONFLICT

Current route law says:
- `/studio` is open to all authenticated members;
- `/api/studio` is also authenticated at the legacy free tier.

New economic architecture proposes:
- Steward prerequisite;
- separate Pro Studio entitlement;
- practitioner role distinct from payment entitlement.

That future entitlement model is not current route authority.

**Standing:** keep UNKNOWN until an explicit entitlement migration is authorized.## G. Booking and sessions

### `UNKNOWN:booking-external-effect-policy` — UNRESOLVED

No canonical member-side booking capability was located corresponding to `booking.practitioner.request`.

O2R3 therefore cannot infer:
- booking provider or calendar effect;
- who may book;
- practitioner acceptance semantics;
- cancellation/reschedule authority;
- payment effect;
- notification semantics.

**Standing:** keep UNKNOWN.

### `UNKNOWN:session-create-policy` — PARTIAL + AUTHORITY RISK

Current `POST /api/studio/sessions` establishes:
- verified member identity;
- practitioner identity derived from that member;
- required client + scheduled time;
- session row written under the derived practitioner id;
- calendar disclosure choice;
- asynchronous client notifications;
- asynchronous Google Calendar synchronization.

This is real practitioner-side session-creation substrate.

However, O2R3 did not find an explicit client-ownership check in the POST path before the supplied `client_id` is used to create the session.

No claim is made here about unseen database constraints.

Because the act can also trigger external notifications and calendar effects, its authority contract is broader than a database insert.**Standing:** PARTIAL.

Full resolution requires evidence for:
- client ownership / authorized client scope;
- notification authority;
- calendar-write authority;
- Pro role/context;
- failure behavior around those external effects.

## H. Pattern

### `UNKNOWN:pattern-epistemic-definition` — RESOLVED

**Authority:** `docs/canon/PATTERN_PRIMITIVE.md`.

It establishes:
- pattern ≠ fact about member;
- pattern = conditional relational tendency under field conditions;
- member-confirmed patterns are legitimate with consent;
- system-inferred patterns wait for corpus evidence;
- observation-only patterns do not surface;
- patterns must be threshold-gated;
- patterns must not become identity claims;
- the doctrine itself authorizes no runtime implementation.

**Future reference replacement:** `PATTERN_PRIMITIVE`.

`pattern.detect` remains WITHHELD despite this epistemic definition being resolved because runtime prerequisites and implementation standing remain unopened.

## Cross-cutting findings

### CF1 — Static researchStatus is too coarse

For Wisdom and Astrology, epistemic standing depends on the specific source, interpretation, or output at invocation time.

A single capability-level status cannot represent the difference among traditional teaching, authored framework, external reference, empirical research, hypothesis, and symbolic interpretation.O2R3 therefore recommends a future descriptive split:
- `capability.researchDependency` — static capability property;
- `invocation/output.epistemicStanding` — dynamic result property.

No O2 schema mutation is performed here.

### CF2 — Current access policy is not future economic architecture

Writer's Studio and Pro Studio are the clearest examples.

O2R3 preserves both facts:
- what `accessMatrix.ts` authorizes now;
- what the new business architecture proposes later.

The capability registry may not pretend the future model is already enforced.

### CF3 — Infrastructure role is not semantic role

Personal Studio reuses practitioner infrastructure.

Therefore practitioner-shaped rows and `is_practitioner` infrastructure flags cannot by themselves establish professional Pro authority.

## Authority-reference disposition table

| Reference type | Result | Strongest authority / evidence |
| --- | --- | --- |
| create-write-policy | PARTIAL | O2R2 + QuickJournalSheet explicit-save behavior |
| capture-scope-runtime-policy | PARTIAL / DEFECT | O2R2 capture-scope law; current last-five voice capture conflicts |
| dream-capture-scope-runtime-policy | PARTIAL / NONCONFORMING | O2R2 capture-scope law |
| astrology-standing-policy | RESOLVED | Astrology Experience Contract + Symbolic Guidance Doctrine |
| chart-data-policy | RESOLVED | Astrology Experience Contract identity boundary |
| wisdom-retrieval-provenance-policy | RESOLVED | Corpus Discipline Protocol |
| source-rights-policy | UNRESOLVED | Wisdom programme identifies rights metadata gap |
| relationship-context-policy | RESOLVED | Ratified Relationship Room Constitution |
| current-shadow-constitution | UNRESOLVED | located shadow charter has member-facing authority NONE |
| studio-threshold-policy | PARTIAL | `/choose` + Session Room/Studio architecture |
| writers-studio-entitlement-policy | UNRESOLVED | current free-member route law conflicts with future Studio model |
| personal-studio-product-status | UNRESOLVED | real substrate; U2-B says paid distinctness not earned |
| pro-studio-role-policy | PARTIAL | practitioner identity exists; Personal Studio shares practitioner substrate |
| pro-studio-entitlement-policy | UNRESOLVED | current `/studio` free-auth rule conflicts with future entitlement |
| booking-external-effect-policy | UNRESOLVED | no canonical member-booking contract located |
| session-create-policy | PARTIAL | real POST route; client/external-effect authority incomplete |
| pattern-epistemic-definition | RESOLVED | Pattern Primitive |

## Completeness ruling

### References eligible for replacement with real authority refs
- astrology-standing-policy;
- chart-data-policy;
- wisdom-retrieval-provenance-policy;
- relationship-context-policy;
- pattern-epistemic-definition.

### References eligible for replacement with law + explicit runtime-gap markers
- create-write-policy;
- capture-scope-runtime-policy;
- dream-capture-scope-runtime-policy;
- studio-threshold-policy;
- pro-studio-role-policy;
- session-create-policy.

### References that must remain UNKNOWN
- source-rights-policy;
- current-shadow-constitution;
- writers-studio-entitlement-policy;
- personal-studio-product-status;
- pro-studio-entitlement-policy;
- booking-external-effect-policy.

## Standing

> **O2R3 — AUTHORITY-REFERENCE CENSUS DELIVERED · 5 REFERENCE TYPES RESOLVED · 6 PARTIAL / LAW-RUNTIME GAPS · 6 CORE GOVERNANCE QUESTIONS REMAIN UNKNOWN · JOURNAL CAPTURE NONCONFORMANCE RECORDED · STUDIO ROLE/ENTITLEMENT COLLISION EXPOSED · NO FIXTURE OR RUNTIME MUTATION**

## Exact next boundary

> **SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O2R4 — DESCRIPTOR REFERENCE RECONCILIATION + UNRESOLVED-GATE CONTRACT ONLY**

O2R4 should produce a revised documentary fixture set that:
- replaces only genuinely resolved references;
- encodes explicit runtime-gap markers for partial items;
- preserves unresolved gates as UNKNOWN;
- introduces the static-vs-dynamic epistemic-standing distinction;
- still performs no production wiring.