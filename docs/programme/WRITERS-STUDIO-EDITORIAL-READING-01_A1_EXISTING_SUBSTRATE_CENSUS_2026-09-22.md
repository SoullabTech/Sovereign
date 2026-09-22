# WRITERS-STUDIO-EDITORIAL-READING-01 · A1 — EXISTING-SUBSTRATE CENSUS · 2026-09-22

**Status:** CENSUS CANDIDATE · DOCUMENTARY ONLY · NO RUNTIME / SCHEMA / ROUTE / PROMPT / MODEL / UI CHANGE

## I. Authority and exact census base

A0 constituted Editorial Reading as:

> a revision-bound, coverage-licensed synthesis of admitted developmental observations about a Work.

A1 is limited to the two questions A0 assigned it:

1. **What observation, coverage, revision, provenance, persistence, and synthesis substrate already exists and can be reused?**
2. **Which ratified constraints from sibling programmes bind an Editorial Reading, and at which seam?**

This census is taken against exact canonical:

`578e5ee10d747846f6d4fe54e116e5b131cdbe30`

on:

`clean-main-no-secrets`

A1 authorizes no design or implementation.

## II. Census result in one sentence

The canonical repository already contains the governed substrate needed to establish **what was read, which revision was read, what was observed, what evidence supports each observation, what the observation does not establish, who/what produced it, how it is persisted, how the member may later discuss a locus, and how an exact proposed revision may be authorized/applied**.

What it does **not** contain is the governed object A0 constituted above those readings:

> **there is no canonical Editorial Reading contract, persistence object, coverage-composition warrant, synthesis provenance record, synthesis runtime, or writer-facing Editorial Reading surface.**

The missing capability is therefore not a second reader and not a second mutation system. It is the governed synthesis layer A0 named.

## III. Existing substrate — exact reuse census

| Domain | Canonical substrate | What already exists | A1 reuse determination |
|---|---|---|---|
| Admitted developmental observation | `lib/manuscript/developmentalReading/contract.ts` | `DevelopmentalObservation` carries read-local `key`, opaque `observationId`, `admissionIndex`, `basisFingerprint`, nullable manuscript `position`, commissioned `lens`, optional phenomenon, non-empty `evidenceRefs`, verbatim observation text, non-empty `doesNotEstablish`, and structure dependency | **REUSE AS SOURCE EVIDENCE.** Editorial Reading must not invent a parallel observation shape. |
| Observation admission | `lib/manuscript/developmentalReading/freeze.ts` + `observationIdentity.ts` | `freezeReading()` is the single admission seam; it mints `observationId`, assigns the read-local key, admission index, basis fingerprint and position | **REUSE / DO NOT DUPLICATE.** Editorial synthesis consumes admitted observations; it does not re-admit them. |
| Frozen Work revision | `lib/manuscript/development/readState.ts` | Immutable draft revision number, whole-revision digest, ordered section topology, per-section code-point ranges and digests, input fingerprint, and optional frozen authored-structure context/fingerprint | **REUSE AS REVISION AUTHORITY.** This is the existing proof of what Work state a source reading actually read. |
| Coverage | `DevelopmentalCoverage` in `readState.ts` | Every section in the frozen topology is recorded at `position` or `body` depth | **REUSE AS SOURCE COVERAGE.** No second coverage vocabulary is needed for individual readings. Cross-reading composition does not yet exist. |
| Writer-declared reading scope | `lib/manuscript/developmentalReading/scope.ts` | `whole | section | unit | range`, resolved only against member topology; inverted, unknown or empty scopes refuse; order comes from the Work | **REUSE FOR SOURCE READINGS.** A1 does not redesign scope or make the writer operate future pass mechanics. |
| Reading commission | `lib/manuscript/developmentalReading/commission.ts` | One commission runs `capture → recover → read → classify → freeze → store`; one commissioned lens; no scope widening or retry-on-refusal | **REUSE AS THE SOURCE-READING PIPELINE.** Editorial Reading is above this seam, not another path around it. |
| Reader contract and non-conclusions | `lib/manuscript/developmentalReader/contract.ts` | Seven lenses; closed eight-member `DEVELOPMENTAL_NON_CONCLUSIONS`; exact recovered-body contract; 500,000-code-point read ceiling | **REUSE AS BINDING SOURCE LAW.** Editorial synthesis inherits rather than rewrites it. |
| Reading provenance | `DevelopmentalReadingProvenance` | Reader provider/model/prompt hash/version, classifier identity, reading-contract version and server-stamped freeze time | **REUSE AS SOURCE PROVENANCE.** No Editorial Reading synthesis provenance object exists yet. |
| Reading persistence | `lib/manuscript/developmentalReading/store.ts` + `developmental_readings` migrations | Member-scoped frozen readings; append-only/immutable semantics; observations live inside the frozen record; load by id and list by Work | **REUSE AS SOURCE-READING CUSTODY.** No canonical persistence object currently represents an Editorial Reading. |
| Observation identity compatibility | `database/migrations/20260921000001_developmental_reading_observation_identity_compatibility.sql` | Canonical observation identity group is all-or-none: `observationId · admissionIndex · basisFingerprint · position`; legacy rows are not backfilled | **REUSE WITHOUT HISTORICAL FABRICATION.** Synthesis must tolerate truthful legacy/canonical distinction rather than invent admission identity retroactively. |
| Observation address resolution | `lib/manuscript/developmentalReading/observationAddress.ts` | Read-only `observationId → member-owned reading → stored observationKey` resolution; ambiguous identity refuses; resolver writes nothing | **REUSE READ-ONLY.** It does not authorize a new standing/write address. |
| Member standing | `developmental_observation_standing_events` + `lib/manuscript/standing/store.ts` | Append-only member standing keyed by `(member_id, reading_id, observation_key)`; no row means UNSET; current is latest event | **REUSE AS EXISTING CUSTODY ONLY.** Do not duplicate or silently migrate it under Editorial Reading. |
| Editorial conversation | `ask_threads`, `proposal_chain_insights`, `proposal_chain_directions`, `lib/manuscript/editorialRuntime/*` | Member-owned editorial thread, exact locus, turns, insights, directions, proposal versions and explicit relationships | **REUSE DOWNSTREAM WHEN DISCUSSION BEGINS.** It is not the Editorial Reading synthesis object itself. |
| Proposal succession | `lib/manuscript/proposalChain/*` | One locus-scoped chain; append-only authored versions; explicit `maia | member` authorship; explicit succession | **REUSE FOR OPTIONAL LATER INTERVENTION.** A synthesis never becomes executable merely by existing. |
| Revision authorization | `lib/manuscript/revisionAuthorization/*` + authorization migration | Member authorizes one exact proposal version against one exact Work state; permission is durable and single-use | **REUSE UNCHANGED.** Editorial Reading gains no mutation authority. |
| Apply / recovery | `revisionAuthorization/execute.ts` + editorial adoption/recovery substrate | Exact-text guarded mutation, transactionally spent authorization, resulting Work version and application recovery | **REUSE UNCHANGED.** Any future revision handoff enters this path; A1 opens no second mutation substrate. |
| Non-evaluative presentation order | `compareAdmitted()` in `observationIdentity.ts` | Positioned observations order by manuscript position; structural-only observations follow; admission index breaks ties | **REUSE AS REACHABILITY ORDER, NOT RANKING.** Position never means importance. |

## IV. Synthesis-shaped substrate that is **not** the A0 Editorial Reading

A1 found three nearby objects whose names or behavior could invite accidental reuse. None satisfies the A0 chain by itself.

### 1. Structure-reader `editorialSynthesis`

`lib/manuscript/structure/maiaReader.ts` already emits an `editorialSynthesis` while interpreting the Work's organizing grammar.

That object belongs to the earlier Structure Reader. It is produced inside a different reader contract from headings, mechanical structural observations and bounded prose supplied to that reader. It is not a synthesis over admitted `DevelopmentalObservation` records and does not carry the A0 Editorial Reading coverage/non-conclusion chain.

**Census determination:** existing implementation may be informative as prior art, but its `editorialSynthesis` is **NOT an admissible substitute for Editorial Reading authority**.

### 2. Generic `recognitions`

`database/migrations/20260701000003_observation_primitive.sql` defines generic `recognitions` as an explicit cross-observation synthesis over generic observation ids.

That schema predates and is independent of the Developmental Reading custody model. It does not bind the exact manuscript revision, Developmental Coverage, Developmental non-conclusions, or the A0 whole-Work warrant.

**Census determination:** it proves the repository has a generic synthesis concept; it does **not** presently satisfy the Editorial Reading object.

### 3. `proposal_chain_insights`

The editorial ontology permits MAIA-authored insights on one proposal chain, including an insight with no proposal version.

That is important because it proves **observation need not manufacture intervention**. But it is locus-scoped conversation material, downstream of a chosen editorial locus, not a many-reading, coverage-licensed synthesis of the Work.

**Census determination:** reuse as downstream editorial conversation substrate; **not** as the Editorial Reading root object.

## V. What does not exist at this canonical

A canonical search of `lib/manuscript`, `app/api`, and `database/migrations` finds no runtime object, route, table or store named or functioning as the A0 Editorial Reading.

The following gaps are therefore real and are **not solved under A1**:

- no `EditorialReading` contract/type;
- no durable Editorial Reading identity or persistence record;
- no explicit set of source reading ids / source observation ids constituting one synthesis;
- no Editorial Reading synthesis provenance/version record;
- no rule yet for whether/how readings from different manuscript revisions may compose into one revision-bound Editorial Reading;
- no cross-reading coverage-composition / whole-Work warrant object;
- no governed PASS object or multi-pass orchestration;
- no composition contract governing the synthesis language;
- no Editorial Reading prompt, model call or runtime;
- no Editorial Reading API surface;
- no writer-facing Editorial Reading surface;
- no cross-reading semantic deduplication or reconciliation — and sibling law explicitly does **not** authorize inventing one;
- no ranking, severity or prioritization authority.

A1 records those absences. It does not choose their future representation.

## VI. Sibling law — exact seam map

### A. `WRITERS-STUDIO-OBSERVATION-IDENTITY-01`

**Binds at:** source-observation ingestion, synthesis traceability, presentation and facets.

The admitted observation already has one canonical identity. Editorial Reading must preserve that identity rather than mint a synthesis-local replacement for the same observation.

Identity means **this admitted observation from this reading**. It does not establish semantic sameness across readings. Cross-reading deduplication/reconciliation is therefore not an implied A1 capability.

Manuscript position and admission index may support non-evaluative reachability order. They may not become ranking.

### B. `WRITERS-STUDIO-OBSERVATION-ADDRESS-01`

**Binds at:** any member action on an observation.

`observation_id` is the canonical member-facing identity, while existing standing custody is still addressed by `(reading_id, observation_key)`.

The read-only resolver may be reused to locate that existing address. A1 does **not** authorize a second standing stream, a silent key migration, or a new write addressed directly by `observation_id`.

### C. `WRITERS-STUDIO-CONVERGENCE-01` — preserved law, not its retired sequencing

**Binds at:** coverage warrant, synthesis input, reachability, presentation, acceptance and revision handoff.

The preserved laws require:

- Work primary;
- recorded coverage visible as the ground of trust;
- unranked observations, all reachable;
- whole-Work authority only from sufficient recorded coverage;
- synthesis over observations, not raw prose;
- no dead end and no loss of manuscript place;
- no unauthorized prose mutation.

`WRITERS-STUDIO-NEXT-01` supersedes Convergence's old future **step numbering**, not these laws, defeat candidates, evidence or acceptance conditions.

### D. Closed developmental non-conclusions

**Binds at:** every synthesis claim.

The eight-member vocabulary remains closed:

`outside-coverage · across-unread-span · whole-work-pattern · authored-structure-relation · chronology · author-intent · reader-effect · editorial-consequence`.

A0 already ruled:

- `author-intent` permanent;
- `reader-effect` permanent;
- `editorial-consequence` remains no inference of defect, importance, priority or necessity of change;
- only `whole-work-pattern`, `across-unread-span` and `outside-coverage` may be discharged by coverage, and only under the complete whole-Work warrant.

A1 finds no substrate that lawfully widens those rules.

### E. 500,000-code-point reading ceiling

**Binds at:** every source read and future pass composition.

`DEVELOPMENTAL_READ_CEILING_CODE_POINTS = 500_000` stands.

The existing behavior remains:

> **refused whole, nothing trimmed**

A1 finds no lawful larger-reader bypass. Future multi-pass composition belongs to A3, not A1.

### F. Elemental Alchemy isolation and Work Compass separation

**Binds at:** source-reader inputs and whole-Work acceptance.

When Elemental Alchemy is the manuscript under review, EA-as-governed-knowledge must be unreachable to the reader; otherwise the reading cannot distinguish textual perception from recollection.

Work Compass / member-declared orientation is likewise not reader evidence, not coverage, not a whole-Work warrant and not a way to discharge a non-conclusion.

### G. `WRITERS-STUDIO-FACETS-01` / current A0 facet law

**Binds at:** presentation of the same governed observation.

Current facets are:

`GUIDED · LEARNING · DIRECT`.

For the same Work, scope and commission, facet choice may change translation, teaching and disclosure depth. It may not change the underlying observation, evidence, `doesNotEstablish` boundary, authorial custody, authority or certainty.

A facet renderer therefore may not trigger a fresh developmental read in order to create a different truth.

### H. `WS-EDITORIAL-SCOPE-01` and admitted revision law

**Binds at:** the transition from seeing/discussing to proposing and changing.

The existing editorial-scope law distinguishes what MAIA may read for context from the exact locus a proposal may replace, measures proposal latitude against the exact locus shown to MAIA, and preserves writer voice/choice before authorization.

The existing proposal/authorization/execution substrate then binds any actual change to a member-selected exact proposal version and exact Work state.

**A1 consequence:** Editorial Reading may point toward discussion or a later proposal; it cannot itself become a proposal, authorization, or write path.

## VII. Reuse boundary

The clean reuse boundary established by A1 is:

```text
frozen manuscript revision
        ↓
governed Developmental Reading(s)
        ↓
admitted DevelopmentalObservation(s)
        ↓
[ Editorial Reading — MISSING GOVERNED OBJECT ]
        ↓
optional discussion
        ↓
existing locus-scoped proposal succession
        ↓
existing exact-version member authorization
        ↓
existing guarded apply / recovery
```

Everything above the bracket already supplies source custody.

Everything below the bracket already supplies intervention custody.

The bracket itself is the capability A0 constituted and later acts must define.

That is the central A1 finding.

## VIII. A1 stop conditions honored

A1 performed no:

- schema or migration change;
- runtime or model change;
- prompt change;
- route change;
- UI change;
- persistence implementation;
- pass orchestration;
- synthesis implementation;
- cross-reading deduplication;
- standing migration;
- ranking or prioritization;
- manuscript mutation;
- deployment.

## IX. A1 standing

> **WRITERS-STUDIO-EDITORIAL-READING-01 / A1 — EXISTING SUBSTRATE CENSUSED · REUSE BOUNDARIES ESTABLISHED · SIBLING-LAW SEAMS MAPPED · SYNTHESIS OBJECT CONFIRMED ABSENT · DOCUMENTARY ONLY · READY FOR FOUNDER ADJUDICATION**

If A1 is adjudicated, the next bounded act named by A0 is:

> **A2 — EDITORIAL READING CONTRACT**

A2 remains unopened here.
