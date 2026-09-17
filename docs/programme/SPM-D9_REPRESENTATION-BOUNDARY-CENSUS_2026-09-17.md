# SPM · D9-A — CURRENT-ORGANISM REPRESENTATION CENSUS

**Read-only governance/evidence census. No repair. No design. No authorization.**

---

## 0 · STANDING OF THIS DOCUMENT

This is the D9-A pass: a map of what the organism *actually does* with member-specific
knowledge, and where authority over representing that knowledge originates, changes, or
fails to exist.

It records findings. It does **not** propose fields, capabilities, tokens, relations,
policy engines, derived state, consumer contracts, or any other repair. Every `ABSENT`
and `UNKNOWN` below is a statement that a distinction has no executable representation
**at that site** — not a statement about what should be built.

**D9-A completion is evidence, not authorization.**

### 0.1 · ⚠️ CHARTER-PROVENANCE DECLARATION (read first)

The instruction names *"the previously ratified D9 — Representation Boundary Falsification /
D9-A Current-Organism Representation Census charter"* as the complete authority for this pass.

**That charter does not exist in this repository.** Verified:

```
grep -rlI -E "SPM-D9|D9-A|D9-B|Representation Boundary Falsification|SPM implementation" docs/   → no matches
grep -rlI -E "\bSPM\b" docs/                                                                      → no matches
```

The charter was ratified in a prior thread and was never committed. Therefore the operative
scope surface for this pass is the **§§A1–A6 enumeration in the execution instruction itself**,
which is reproduced verbatim in §2.1 below. Where the unrecorded charter contained obligations
narrower or wider than that enumeration, this census cannot have honoured them.

This is recorded as a **method limitation, not a deferral**. It is also, in its own right, an
instance of the class of finding D9 exists to surface: *an authority that governs a downstream
act but has no durable representation at the site where the act occurs.* It is named here, not
repaired.

No census instrumentation, probe, or test was created. Nothing under `lib/`, `app/`,
`database/`, `components/`, or any prompt was modified. Only this file was added.

---

## 1 · BINDING: BRANCH, SHA, TREE STATE

| | |
|---|---|
| Canonical branch (checked out) | `claude/festive-sagan-apvfs5` |
| Pinned HEAD SHA | `8b80ec21060a102ee2007d12f3182049c7c6ad43` |
| HEAD subject | `Merge pull request #1334 from SoullabTech/fix/ws-insight-preserve-live-20260917` |
| HEAD commit date | `2026-09-17 10:32:42 -0400` |
| Working tree | **clean** — `git status --porcelain` returned 0 lines |
| Pass type | read-only governance/evidence census |

Every finding below is bound to this SHA. Line numbers are orientation for a reader today;
the **operation** cited is the identity of the evidence (execution discipline D1, carried from
`S3-F8-WITNESS-01`).

---

## 2 · SEARCH / METHOD SCOPE

### 2.1 · Obligations executed (from the instruction)

* A1 — census every materially relevant consumer of member-specific knowledge
* A2 — census the existing authority vocabulary
* A3 — trace actual authority transitions
* A4 — inspect first-person generation specifically
* A5 — inspect synthesis / derived-claim pathways specifically
* A6 — inspect whether authority or permission silently travels between purposes/consumers

### 2.2 · Classification scheme (as instructed)

| Class | Meaning |
|---|---|
| **ENFORCED** | Structurally required or prevented — a database constraint/trigger, a type the compiler refuses, a nominal class, an absent column/join, a fail-closed predicate |
| **EXPRESSED** | Represented in the system (computed, typed, logged, recorded) but not structurally guaranteed at the point where it would matter |
| **CONVENTION** | Prompt text, comment, doc, or code habit only |
| **ABSENT** | No executable representation found |
| **UNKNOWN** | Evidence insufficient at this SHA by repository inspection alone |

### 2.3 · Method and its limits

* Repository truth only — **no live database read, no production read, no runtime observation.**
  Where a programme document and the repository disagreed, the repository was taken (per the
  instruction). Several CLAUDE.md claims were re-verified independently rather than inherited;
  where they held, that is noted; where inspection went further, that is noted.
* Call-graph reachability was established by `grep` over `lib/`, `app/`, `components/`,
  `scripts/`, `database/`, `tests/`, `__tests__/`, excluding `node_modules`. Dynamic `import()`
  and string-keyed dispatch are **not** covered; a "zero callers" finding below means *zero
  static callers*, and is labelled as such.
* The repository contains ~6,400 `.ts`/`.tsx` files across `lib/`, `app/`, `components/`. The
  census is scoped to paths that are **materially relevant**: those that read member-specific
  knowledge and either place it before cognition, place it before another human, or record a
  claim about the member. Dormant/legacy subsystems are named where they bear on a finding and
  otherwise excluded.
* Where a module's reachability could not be settled statically, it is recorded **UNKNOWN**
  rather than assumed dead.

---

## 3 · CONSUMER CENSUS (A1)

### 3.1 · Consumers that place member-specific knowledge before MAIA's cognition

| # | Consumer | Reachability evidence | Member knowledge it consumes | Passes a disclosure/authority boundary? |
|---|---|---|---|---|
| C1 | `app/api/sovereign/app/maia/list/route.ts` (2,006 lines) | 22 client references to `api/sovereign/app/maia/list` | 16 named addenda: atoms, conversational recall, episodic recall, memory influence, forward readiness, relational context, member web, place, wuxing, astrology, studio, practice field, knowledge gate, 3× divination | **No** |
| C2 | `app/api/oracle/conversation/route.ts` (3,088 lines) | 13 client references | atoms, prior cross-session exchanges, developmental memories, theme signals | **No** |
| C3 | `app/api/between/chat/route.ts` (2,665 lines) | 13 client references | atoms, developmental memories (`developmentalMemory.retrieveMemories`, `:729`) | **No** |
| C4 | `app/api/voice/stream-conversation/route.ts` (1,642 lines) | 1 client reference | `MemoryBundleService` | **No** |
| C5 | `app/api/sovereign/app/maia/route.ts` (532 lines) | via `getMaiaResponse` | tier-composed context | **No** |
| C6 | `app/api/now-what/interview/route.ts` (440 lines) | 5 client references | via `lib/maia/roomComposition.ts` — atoms, memory influence, **prior cross-session exchanges** | **No** |
| C7 | `app/api/maia/vision-studio/interview/route.ts` (413 lines) | 0 client references (**UNKNOWN** reachability) | same as C6 | **No** |
| C8 | `lib/writers-studio/focusCrossing.ts` → `writersStudioCognition.ts` | called from writers-studio routes | the member's Work (Focus) | **YES** — `establishDisclosureBoundary` (`:105`), `confirmDisclosureCrossed` (`:186`) |
| C9 | `app/api/sovereign/manuscripts/[id]/ask/route.ts` | writers-studio Ask surface | the member's Work body, section-scoped | **YES** — `establishDisclosureBoundary` (`:848`), `confirmDisclosureCrossedWithClient` (`:976`) |

**Finding C-1.** `establishDisclosureBoundary` has exactly **two** non-test call sites in the
entire repository (C8, C9). Both are Writer's Studio. **No path that serves the member's
ordinary conversation with MAIA crosses a disclosure boundary.**

> Evidence: `grep -rIn "establishDisclosureBoundary|mintDisclosureAttempt|confirmDisclosureCrossed"` over
> `lib app components __tests__ tests` returns, excluding `lib/disclosure/` itself and test files,
> only `lib/writers-studio/focusCrossing.ts` and `app/api/sovereign/manuscripts/[id]/ask/route.ts`.

**Class: ENFORCED (C8, C9) · ABSENT (C1–C7).**

### 3.2 · Consumers that place member-specific knowledge before another human

| # | Consumer | What it may know | Mechanism |
|---|---|---|---|
| C10 | `lib/coachField/practitionerProjection.ts` | **RELATIONSHIP FIELD only** — `practitioner_clients`, `coach_client_processes`, `coach_program_enrollments`, `coach_program_definitions`, `coach_program_stages` | Structural unreachability + external source-scan verifier |
| C11 | `lib/caseload/*` (`CaseMemoryService`, `CasePatternService`, `CaseStore`, `SpiralogicConsultationContext`) | practitioner-side case material | **UNKNOWN** — reachability from a live route not established at this SHA |

**Finding C-2 (the strongest ENFORCED purpose boundary in the organism).**
`practitionerProjection.ts` does not filter the client's sovereign field out of a result. It is
**structurally unable to name it**. The module deliberately contains **no denylist**, on the
stated reasoning that *"a module that names a table is one edit away from joining it."* The
boundary is enforced from outside: `scripts/verify-practitioner-projection.ts` fails if this
module's source so much as mentions a protected table.

The type `PractitionerClientProjection` has no `focus`, no `reflections`, no `notes`, no
`atoms` — *"not set to null, not omitted at serialization time: absent from the shape."*
The client's selected focus is keyed on the member and carries no `relationship_id`, so no
relationship-scoped query has a column by which to reach it.

**Class: ENFORCED.** This is the clearest repository instance of *authority for one purpose ≠
authority for another purpose*.

### 3.3 · Surfaces that present derived claims *about* the member back *to* the member

| # | Surface | Evidence |
|---|---|---|
| C12 | `components/memory/PatternDrawer.tsx` + `PatternChips` — **mounted** in `components/OracleConversation.tsx:62, :10884` | reads `/api/memory/patterns/{id}/evidence`, writes `/api/memory/patterns/{id}/feedback` |
| C13 | `components/memory/PreferenceConfirmation.tsx` — **zero mount sites** | `grep -rIn "PreferenceConfirmation" app components` returns only the component's own file |
| C14 | `app/api/memory/stale-preferences/route.ts` — **zero client callers** | `grep -rIn "stale-preferences" app components lib` returns only the route's own file and one comment cross-reference |

**Finding C-3.** Of the two member-confirmation surfaces present in the repository, **one is
reachable (C12) and one is not (C13/C14).** Repository truth here agrees with the CLAUDE.md
note about `PreferenceConfirmation` being mounted nowhere, and additionally establishes that the
`patterns/{id}/feedback` route **is** reachable through a mounted drawer — a fact the programme
record does not carry.

---

## 4 · AUTHORITY-VOCABULARY CENSUS (A2)

### 4.1 · Frequency scan (whole repo, `lib app database components`, excl. `node_modules`)

| Term | Files | Note |
|---|---|---|
| `representation_authority` | **0** | **ABSENT as an executable term anywhere in the organism** |
| `disclosure_boundary` | 1 | `lib/disclosure/disclosureBoundary.ts` |
| `participation_basis` | 5 | receipts vocabulary |
| `source_class` | 5 | receipts vocabulary |
| `scope_kind` | 6 | Focus/receipt scope |
| `confirmed_by_user` | 6 | developmental memory |
| `authorized_by` | 8 | receipts vocabulary |
| `may_cross` | 9 | boundary outcome |
| `runtime_consent_state` | 10 | consent precondition |
| `authored_by` | 13 | mixed |
| `consent_state` | 22 | mixed |

### 4.2 · The six distinct authority vocabularies in the organism

These do **not** compose. Each governs a different question, and none of them governs
representation.

**V1 — S5 Provenance** (`lib/provenance/provenance.ts`)
Answers *who created this durable object, and what generated it.*
* `CreatedBy` = `member | maia | practitioner | system | import | migration`
* `GeneratedBy` = `member-gesture | member-utterance | inference | synthesis | derivation | practitioner-observation | unattributed-historical`
* `PostureAtCreation` = `normal | sanctuary | unknown-historical`
* `PersistencePolicy` = `{ durable, collectiveEligible, restorable }`
* Minting requires a real `TurnPosture` instance (nominal class, **private constructor**) —
  `{ sanctuary: false }` does not typecheck and a JS bypass fails `instanceof` inside the store
  guard (`lib/sanctuary/turnPosture.ts`).

**V2 — Participation Disposition Contract `pdc-1`** (`lib/maia/canonical-turn/participationDisposition.ts`)
Answers *what kind of thing is this candidate, and may it participate in this turn.* Three axes,
deliberately not one scalar:
* `AuthoredBy` = `house | member | practitioner | system | collective`
* `ParticipationClass` = `constitutional | authored | placed | marked | declared | retrieved | computed | inferred | collective`
* `Authority` = **`situate | compute | infer`**
* Dispositions = `AVAILABLE | HELD | OFFERED | ADMITTED | EXCLUDED`; speaking dispositions =
  `OFFERED | ADMITTED`.

**V3 — Disclosure boundary / receipts** (`lib/disclosure/*`, `20260909000001_context_disclosure_receipts.sql`)
Answers *may this context cross into cognition, and is the crossing accounted for.*
`BoundaryOutcome` = `may_cross | consent_unavailable | receipt_refused`. Receipt vocabulary:
`source_class`, `participation_basis`, `scope_kind`, singular `section_ref`, `authorized_by`,
`boundary`, `gesture`.

**V4 — Ask authorization acts** (`20260913000001_ask_authorization_acts.sql`, `lib/disclosure/authorizationAct.ts`)
Answers *did this member, on this Ask, authorize these named sections to be read, once.*
Bound columns: `member_id`, `manuscript_id`, `thread_id`, `reading_id`, `observation_key`,
`expires_at`; consumption table with `act_id UNIQUE`, `claimed_at`, `completed_at`,
`completion_ref`.

**V5 — Member standing over a developmental observation** (`lib/manuscript/standing/contract.ts`)
Answers *what is this writer's ruling on this one frozen observation.*
`Standing` = **`keep | dismiss | unresolved`**. `UNSET` is deliberately not a value — it is
zero events. Refusals: `reading_unknown | observation_unknown | stale_expectation | …`.

**V6 — Revision offer → proposal → authorization** (`lib/manuscript/revisionAuthorization/*`,
`20260914000002`, `20260914000004`)
Answers *has the member permitted this exact wording to change the Work.*
Three separate objects by ruling: `RevisionOffer` → `proposal_chains`/`proposal_versions` →
`manuscript_revision_authorizations`. *"Before the member authorizes an exact version, there is
no row here. The existence of the row IS the permission."*

### 4.3 · ⭐ THE DECISIVE VOCABULARY FINDING

**The word `authority` in V2 does not mean representation authority.** Its three values —
`situate`, `compute`, `infer` — classify *epistemic mode*: how a candidate is entitled to
influence MAIA's thinking. It answers *how strongly may this shape cognition*, never *on whose
authority may MAIA say this.*

`representation_authority`, or any executable synonym for it, returns **zero hits repository-wide.**

**Class: ABSENT.** The organism has six vocabularies for admission, crossing, permission, and
standing, and **none** for representation.

---

## 5 · ACTUAL AUTHORITY-TRANSITION MAP (A3)

### 5.1 · The conversational path (C1–C7) — where authority originates and what happens to it

```
member utterance
   │
   ├─▶ TurnPosture.resolve()  ── ENFORCED (nominal class, private ctor, fail-closed)
   │
   ├─▶ TurnsStore.addTurn(posture, …)
   │      └─ Provenance.mint(): member→'member-utterance' | maia→'synthesis'
   │         ENFORCED by DB trigger s5_require_minted_provenance on conversation_turns
   │
   ├─▶ 16 addenda assembled in-route, each by its own loader
   │      each loader applies its OWN gate (§5.2); no shared authority object
   │
   ├─▶ [MAIA/manifest] + [MAIA/shadow]  ◀── V2 classification computed HERE
   │      SHADOW ONLY. Touches nothing. See Finding T-1.
   │
   ├─▶ string concatenation → system prompt          ◀── AUTHORITY ENDS HERE
   │
   ├─▶ cognition
   │
   ├─▶ scrubMemoryAmnesia()  ── ENFORCED post-generation regex (self-architecture claims only)
   │
   └─▶ response to member.  No durable record binds this response to the authority
       of its inputs. [MAIA/memprov] is a log line, explicitly NOT A STORE.
```

**Finding T-1 — the classification is computed and then discarded.**
`app/api/sovereign/app/maia/list/route.ts:1274` onward constructs a `CanonicalTurn` in shadow.
Its own header states: *"WHAT THIS DOES NOT DO: touch `meta`, the prompt, the response, or any
write."* The three-axis classification of all 54 registered producers is computed for every
live turn on the primary conversational surface — **and has no effect on it.**

**Finding T-2 — the renderer discards provenance by construction.**
`lib/maia/canonical-turn/render.ts` composes the prompt as
`[...floorFirst, scaffold?, ...participants.map(p => p.text), repairInstruction?, ...floorLast]`.
The only thing that reaches cognition is `p.text`. `authoredBy`, `participationClass` and
`authority` govern **admission** and are **not present at representation**. Whatever provenance
the model sees is whatever each producer happened to write into its own prose.

**Finding T-3 — MAIA's own synthesis is minted as synthesis and retrieved as unmarked text.**
* Write: `lib/memory/stores/TurnsStore.ts:24–32` mints the assistant turn as
  `createdBy: 'maia', generatedBy: 'synthesis'`. **ENFORCED** by the DB trigger.
* Read: `lib/maia/memoryLoaders.ts` `loadPriorCrossSessionExchanges` issues
  `SELECT session_id, role, created_at, LEFT(content, 600) …` — **it does not select the
  `provenance` column.** The minted `generatedBy: 'synthesis'` is dropped at retrieval.
* Render: `lib/maia/conversationalRecallBlock.ts:139` emits
  `const speaker = ex.role === 'user' ? 'Member' : 'MAIA'` — a prose label.

So the distinction survives the round trip **as text for the model to interpret**, not as
structure. **Class: ENFORCED at write · ABSENT at retrieval · CONVENTION at representation.**

**Finding T-4 — `Provenance.mint` has exactly one call site in the repository.**
`lib/memory/stores/TurnsStore.ts:24`. The S5 provenance constitution therefore governs
`conversation_turns` and nothing else that this scan found. `developmental_memories`,
`breakthrough_moments`, and the derived-claim tables carry no minted provenance.
DB-side attestation triggers exist for `conversation_turns`, `agent_runs`, `integration_passes`
(`20260718000001:189, 197, 203`) and a separate `s5_require_atom_attestation` for
`member_memory_atoms` (`:338`).

### 5.2 · Per-loader gates on the conversational path — what each one actually checks

| Loader | Gate | Axis the gate is on | Class |
|---|---|---|---|
| `loadMemberMemoryAtomsForPrompt` | `memory_scope` ∈ personal/colab/client/encounter (team/client/encounter-bound); `status IN ('active','still_alive')`; `return_preference IN ('contextual_doorway','ritual_review_opt_in')`; `NOT ('sacred_protected' = ANY(registers))`; `PRACTITIONER_ATTRIBUTION_GUARD`; `member_response_status IS DISTINCT FROM 'rejected'` | **audience scope + return mode + register + rejection** | ENFORCED |
| `loadPriorCrossSessionExchanges` | `members.conversational_recall_enabled` — a **single global boolean** | **on/off, no scope** | ENFORCED (as on/off) |
| `loadRecentMarkedEpisodes` | `members.episodic_recall_enabled` — a single global boolean | on/off, no scope | ENFORCED (as on/off) |
| `loadRecentAnchors` | `surface_preference IN ('contextual_doorway','ritual_review_opt_in')` | return mode | ENFORCED |
| `MemoryBundleService.getSemanticMemories` (primary, non-vector) | `valid_to IS NULL OR valid_to > NOW()`; `content_text IS NOT NULL`; `ORDER BY score DESC LIMIT 12` | present validity + rank | ENFORCED |
| `MemoryBundleService.getSemanticMemories` (**vector fallback**) | `user_id = $2 AND vector_embedding IS NOT NULL` only | **no validity filter** | **see Finding T-6** |

**Finding T-5 — every conversational gate is an ON/OFF or a MODE, never a PURPOSE.**
`conversational_recall_enabled` and `episodic_recall_enabled` are booleans on `members`.
`return_preference` and `surface_preference` describe *how* material returns
(`member_pulled | contextual_doorway | ritual_review_opt_in`), not *to which consumer* or
*for which purpose*. `memory_scope` on atoms is the one genuine audience axis
(personal/colab/client/encounter) and is bound to `team_id`/`client_id`/`encounter_id`.
**No gate anywhere on this path is keyed to a consumer or a purpose.**

**Finding T-6 — a member-withdrawn memory is reachable on the vector fallback path.**
Bound to operation, not line: in `lib/memory/MemoryBundle.ts`, `getSemanticMemories` runs the
non-vector baseline first; *"If non-vector returns nothing, try vector search."* The baseline
(`lib/memory/cut1Trace.ts`, `CUT1_BASELINE_NONVECTOR_SQL`) carries
`AND (valid_to IS NULL OR valid_to > NOW())`. The vector SQL carries
`WHERE user_id = $2 AND vector_embedding IS NOT NULL` and **no `valid_to` predicate and no
`content_text` predicate.**

The condition under which the fallback fires is *the baseline returned zero rows* — i.e. the
member has no currently-valid, non-null-content developmental memory. That is precisely the
state a member produces by withdrawing their memories. **A member who has withdrawn everything
is the member for whom the unfiltered path runs.**

`PreferenceConfirmationStore.record()` writes `valid_to = NOW()` on the `expired` action, and
its `confirmed` branch is explicitly guarded: *"a confirmation may refresh a live record. It may
NOT resurrect a withdrawn one"* (`AND (valid_to IS NULL OR valid_to > NOW())`, returning
`refusedReason = 'withdrawn_by_member'` on zero rows). That guard is **ENFORCED** on the
confirmation path and **not honoured** by the vector fallback read.

**Class: ENFORCED on the primary read · ABSENT on the fallback read.**
Recorded as a discovered divergence. **No repair proposed; none authorized.**

### 5.3 · The Writer's Studio path — where authority transitions are real

```
member gesture
   │
   ├─▶ requireConsentState()             ENFORCED, awaited, fail-closed
   │      not established → REFUSE. No Work context is assembled at all.
   │
   ├─▶ mintDisclosureAttempt()           ENFORCED, ON CONFLICT single-winner
   │      → may_cross | consent_unavailable | receipt_refused
   │      (the outcome type EXCLUDES `minted` so a refusal cannot carry a mint)
   │
   ├─▶ [for the developmental Ask] claimAct()   ENFORCED single-use
   │      INSERT…SELECT…WHERE member AND expires_at > NOW() ON CONFLICT DO NOTHING
   │      a foreign or expired act produces NO ROW to conflict over
   │
   ├─▶ CALLER assembles and crosses      (the module never calls cognition —
   │                                      "a seam that both authorized and executed
   │                                      would make the two indistinguishable")
   │
   ├─▶ confirmDisclosureCrossed()        ENFORCED, in the same transaction as the turn
   │
   ├─▶ MAIA authors a RevisionOffer      ← authority recorded as `authority jsonb`
   │                                        (Finding T-8)
   ├─▶ proposal_chains / proposal_versions
   │
   ├─▶ member ADOPTS → authorizeVersion()      act 1: a permission comes into existence
   │                 → executeAuthorization()  act 2: Work re-read, re-fitted, mutated
   │
   └─▶ manuscript_draft_sections.text is changed.  ← Finding T-9
```

**Finding T-7 — the three-object ruling is ENFORCED by shape, not by check.**
`manuscript_revision_authorizations` carries **no** `replacement_text`, **no** `rationale`,
**no** `head/current/latest`, **no** `execution_authority`, **no** `inspection_only`. An
authorization names ONE EXACT VERSION. Consequence, true by shape:
*"Changing the proposal wording cannot change what an existing authorization permits."*
`classifyAuthorizeRefusal` / `classifyExecutionRefusal` in
`lib/manuscript/editorialRuntime/adoption.ts` are exhaustive switches with **no `default`**, so
a new refusal reason fails typecheck rather than falling into whichever family was last.
**Class: ENFORCED.**

**Finding T-8 — retrieval authority is recorded on a representation artifact, opaquely.**
`manuscript_revision_offers.authority jsonb` is documented as *"The S3 disclosure that licensed
the reading."* It is `jsonb`, **not a foreign key** to the receipt or the act. The CHECK
`origin <> 'work' OR authority IS NOT NULL` requires it to be present for work-origin offers
and forbids implying one for candidate-origin offers (*"the writer handed that text over in the
conversation, so no disclosure surface was raised and none may be implied"*).

So: the **reading** permission is recorded on the **offer**. There is no second field for
whether MAIA may *represent* what it read. **Class: EXPRESSED** (a label, not a referential
binding) — and the representation half is **ABSENT**.

**Finding T-9 — after adoption, MAIA-drafted text is indistinguishable from member-authored text
in the Work.**
`executeAuthorization` calls `saveSectionInTransaction(...)` writing the replacement into
`manuscript_draft_sections`. That table (`20260830000001_manuscript_draft_sections.sql:51–64`)
has columns `id, draft_id, position, text, source_section_id, created_at, updated_at` — **no
authorship column, no origin column, no per-range attribution.** `source_section_id` is
documented *"Provenance only. Nullable by design; never a source of text"* and points at a
manuscript section, not at an author.

The record that MAIA authored that wording lives **only** in the separate authorization receipt
(`accepted_at`, `resulting_version`) and the proposal chain. It is recoverable by joining back;
it is not present at the point of consumption.

**Class: EXPRESSED (recoverable via the authorization chain) · ABSENT at the Work.**
This is the sharpest available evidence on *adoption ≠ authorship*: the **act** is separated
ENFORCED; the **artifact** is not separated at all.

### 5.4 · The member-confirmation transition

| Site | State vocabulary | Writer | Class |
|---|---|---|---|
| `member_memory_atoms.member_response_status` | `confirmed \| rejected \| modified`, NULL = no response; `member_response_coherent` CHECK binds verdict and timestamp | **`confirmed`/`modified` have no runtime writer** — the column comment states so explicitly: *"reserved forward-compat verdicts with no runtime writer yet."* Only `rejected` is reachable, via `POST/DELETE /api/sovereign/atoms/[id]/decline` | Schema **ENFORCED**; `confirmed` transition **ABSENT** |
| `developmental_memories.confirmed_by_user` / `last_confirmed_at` | boolean + timestamp | `PreferenceConfirmationStore.record()`, reached from `app/api/memory/patterns/[patternId]/feedback/route.ts` (`confirm`→`confirmed`, `reject`→`expired`, `refine`→`updated`), reachable via mounted `PatternDrawer` | **ENFORCED and reachable** |
| `developmental_observation_standing_events` | `keep \| dismiss \| unresolved`; UNSET is zero events; CAS token + UNIQUE index for simultaneity *and* staleness | `lib/manuscript/standing/store.ts` — writes exactly one table; `member_id` in the SQL predicate of every statement, never a post-filter; owner **not** derived from the reading's owner | **ENFORCED** |

**Finding T-10 — confirmation confers almost no differential standing where it is reachable.**
`loadMemberMemoryAtomsForPrompt` filters `member_response_status IS DISTINCT FROM 'rejected'`.
An atom the member has **never confirmed** and an atom the member **has** confirmed satisfy that
predicate identically. Confirmation changes nothing about whether the atom surfaces.

In the developmental Cut-1 score (`CUT1_BASELINE_NONVECTOR_SQL`), the member's explicit
confirmation is worth at most `0.15 × 0.15 = 0.0225`.

**Class: EXPRESSED, not ENFORCED** — confirmation is recorded, and does not govern.

---

## 6 · FIRST-PERSON-GENERATION FINDINGS (A4)

Two distinct senses were inspected.

### 6.1 · MAIA's first person about MAIA

**`lib/maia/prompts/memoryCanonGuard.ts`** — the single canonical source for Memory Canon
§V/§VI. Exports `MEMORY_CANON_GUARD_PROMPT` (prose), `FORBIDDEN_AMNESIA_PATTERNS` (regex array
with verb-synonym coverage), and `scrubMemoryAmnesia(text, opts)` which **replaces** the
generated text when a forbidden pattern fires.

The patterns are anchored on *"a first-person subject ('I' / 'I'm')"* plus a memory noun. The
module's stated origin is a real production drift: MAIA said *"I don't carry memory between
conversations"*, which the prior `maiaService` scrubber missed because it targeted only
*"have memory."*

* Prompt block: **CONVENTION** (instruction to the model).
* `scrubMemoryAmnesia`: **ENFORCED** (mechanical post-generation substitution).
* Scope: **claims about MAIA's own architecture only.** The module states it does not touch
  identity guards, loads no memory layer, and decides nothing about what is surfaced.

**There is no equivalent scrubber for MAIA's first-person claims *about the member*.**
**Class: ABSENT.**

### 6.2 · Generation that could borrow the member's first person

**`scripts/research/structural-standing/standing-envelope.ts`** contains the only executable
refusal of borrowed voice found anywhere:

```
const refuseBorrowedFirstPerson = (text, where) => {
  // The renderer owns MAIA's first-person voice. A generated segment saying "my work",
  // "my life", etc. can silently borrow the member's voice even when metadata is honest.
  if (/\b(?:i|me|my|mine|myself)\b/i.test(text))
    throw new StandingEnvelopeRefused('borrowed_first_person', where);
  return text;
};
```

alongside `refuseRoleLeak` (`member_role_leak`) for the inverse failure — internal role language
leaking into member-facing speech and *"obscur[ing] who owns a claim."*

**Finding F-1 — the only borrowed-first-person refusal in the organism lives in `scripts/research/`,
and its consumer is shadow.**
`lib/maia/relational-field-shadow/` imports it (`runner.ts`, `types.ts`). That runner is
launched from `app/api/sovereign/app/maia/list/route.ts:1913`, **after** the route response
object already exists, gated by `MAIA_RELATIONAL_FIELD_SHADOW === '1'` **and** an explicit
member-ID allowlist (`MAIA_RELATIONAL_FIELD_SHADOW_MEMBER_IDS`). Its own contract test asserts
the call is not awaited. It produces no member-facing output.

**Class: ENFORCED within a shadow that produces nothing · ABSENT on every response-producing path.**

### 6.3 · First-person drafting of the member's Work

The Writer's Studio revision path (§5.3) is the organism's only first-person-drafting
pathway: MAIA composes prose intended to sit inside the member's manuscript, in the member's
book, in the member's voice.

What is ENFORCED: MAIA's wording cannot enter the Work without an authorization row naming that
exact version (T-7). What is ABSENT: any marker on the resulting text (T-9).

**Finding F-2 — *first-person drafting ≠ member authorship* is enforced as a gate on the
transition and is unrepresented on the product of the transition.**
The organism can prove *that* the member permitted the wording. It cannot, from the Work
itself, say *whose wording it is.*

---

## 7 · SYNTHESIS FINDINGS (A5)

### 7.1 · Where derived claims about the member are produced

| Producer | Writes | Gate on the derivation |
|---|---|---|
| `DevelopmentalMemoryService.formMemory` (`lib/memory/DevelopmentalMemory.ts:105–150`) | `developmental_memories` — types `breakthrough_emergence`, `spiral_transition`, `correction`, `effective_practice`, `ain_deliberation`, `ineffective_practice`, `pattern`; `significance` defaulted **by type** (0.60–0.95) with no member input | none |
| `SemanticMemoryService.recordPattern` (`lib/memory/SemanticMemoryService.ts:447, 458, 480, 490, 626`) | patterns `elemental_affinity`, `breakthrough_catalyst`, `language_preference`, **`crisis_trigger`**, `transition_pattern` | none |
| `ConsciousnessMemoryLattice` (`:263–268, :541`) | `PatternMemoryStore.upsertByKey`, `developmentalMemory.formMemory` | none |
| `PatternAwarenessModule.recordPatternShift` ← `StateInjectionMiddleware:117` | pattern shift | none |
| Registry-classified inferrers: `inferred.memory_influence`, `inferred.cognitive_scaffolding`, `inferred.wisdom_routing`, `inferred.selflet`, `inferred.field_wisdom`, `computed.forward_readiness`, `computed.consultation`, `retrieved.relationship_memory` — all `authority: 'infer'` | prompt blocks | V2 `inferenceCap` in `RESTRAINT_RULES` (`adjudicate.ts:116–120`) — **shadow only on C1** |

**Finding S-1 — derived claims about the member are written with no provenance mint.**
Per T-4, `Provenance.mint` is called only by `TurnsStore`. `developmental_memories` rows —
including `crisis_trigger` and `pattern` — carry no `createdBy`/`generatedBy`. The `GeneratedBy`
vocabulary contains exactly the values that would distinguish these (`inference`, `synthesis`,
`derivation`) and it is not applied to them.

**Class: the vocabulary is EXPRESSED (it exists, typed) · its application to derived claims is ABSENT.**

### 7.2 · Where derived claims are consumed as knowledge

**Finding S-2 — the Cut-1 ranking weights system repetition above member confirmation.**
From `lib/memory/cut1Trace.ts`, `CUT1_BASELINE_NONVECTOR_SQL`:

```
0.40 * COALESCE(calculate_decayed_confidence(significance, memory_type, last_confirmed_at, formed_at), significance)
+ 0.35 * EXP(-age/30d)
+ 0.15 * CASE WHEN confirmed_by_user THEN 0.15 ELSE 0 END      → max 0.0225
+ 0.10 * LEAST(recall_count / 10.0, 1.0)                        → max 0.10
```

`recall_count` is incremented by `DevelopmentalMemoryService.incrementRecallCounts`
(`lib/memory/DevelopmentalMemory.ts:402–410`), called at `:219` and `:270` — i.e. **whenever the
system retrieves the memory.** No member act is involved.

So within this formula the maximum contribution available to *the system having retrieved a
claim repeatedly* is **≈ 4.4×** the maximum contribution available to *the member having
confirmed it.*

Two qualifications, stated rather than elided:
1. The writer (`DevelopmentalMemoryService.recall`/`retrieveMemories`) and the reader
   (`MemoryBundle.getSemanticMemories`) are **different retrieval paths**, so the loop is
   partial, not closed. Whether `recall_count` is non-zero in production is **UNKNOWN** from the
   repository — this census performed no database read.
2. This is a property of the formula, not an observed effect.

**Bearing on the candidate distinction *repetition ≠ confirmation*: the repository contains a
scoring rule in which repetition is the stronger term.** **Class: the distinction is contradicted
by the scorer.**

**Finding S-3 — the only structural restraint on derived claims entering the prompt is prose.**
`lib/maia/conversationalRecallBlock.ts` prepends:

> *"Recency is the only ordering — there is no relevance score, no thematic clustering, no
> system interpretation. … **Do not synthesize across them. Do not name patterns that cross
> sessions unless the member names them first.**"*
> *"(End of prior exchanges. The member retains the meaning of their own words.)"*

and `knowledgeGateAddendum` (`app/api/sovereign/app/maia/list/route.ts:848`) appends
*"Use as background intelligence. Do not quote this section directly."*

Both are instructions to the model. Nothing structurally prevents either.
**Class: CONVENTION.**

### 7.3 · Member material → collective

**Finding S-4 — the member→collective crossing is ENFORCED shut, absolutely.**
`member_memory_atoms` (`20260521000001:138–139`):

```
crossing_allowed  BOOLEAN NOT NULL DEFAULT FALSE,
CONSTRAINT crossing_must_be_false CHECK (crossing_allowed = FALSE),
```

`lib/psyche/portfolio.ts` never writes the column; `lib/orientation/spiralOrientation.ts:22`
carries the same rule (*"no cross-domain synthesis"*). `s5_refuse_unknown_collective`
(`20260718000001:346+`) additionally refuses newly enabling it on unattested rows, while leaving
existing member-set values untouched — *"revoking silently would punish the member for the
system's past."*

`PersistencePolicy.collectiveEligible` defaults `false` and has **no writer anywhere**
(`grep` returns only its declaration and its default in `lib/provenance/provenance.ts:56, 91`).

**Class: ENFORCED.**

---

## 8 · PURPOSE-TRAVEL FINDINGS (A6)

### 8.1 · ⭐ THE HEADLINE FINDING

**Finding P-1 — the member's MAIA conversation history travels into two coaching-interview rooms
on the strength of a single global boolean, without passing the room-admission machinery.**

`lib/maia/roomComposition.ts` is the shared prompt-composition block for
`/api/now-what/interview` and `/api/maia/vision-studio/interview`. At `:201–209` it calls:

```
const recallEnabled = await loadConversationalRecallPref(memberId);
const prior = await loadPriorCrossSessionExchanges(memberId, ephemeralSessionId, 6);
const recall = formatPriorExchangesForPrompt(prior, { recallEnabled, … });
if (recall.block) blocks.push({ key: 'conversational', text: recall.block });
```

and at `:196–198` the same for `loadMemberMemoryAtomsForPrompt` / `formatAtomsForPrompt`.

Three facts together:
1. `members.conversational_recall_enabled` is **one boolean on the member row**
   (`lib/maia/memoryLoaders.ts:244–249`), constituted for the MAIA conversational surface. It
   carries no room, consumer, or purpose dimension.
2. `roomComposition` composes blocks **directly**, not through `PRODUCER_REGISTRY`. The room
   membrane (`lib/writers-studio/membrane.ts`) and the room-admission rule
   (`adjudicate.ts:58–63`, `EXCLUDED: 'not_registered_for_room'`) are not on this path at all.
3. The member consented to cross-session recall **in one room** and it is present **in another**.

`vision-studio/interview` has **0 client references** — its reachability is **UNKNOWN**.
`now-what/interview` has **5**.

**Class: ABSENT** (no purpose-scoping representation exists at this site).

### 8.2 · The same shape, four more times

`loadMemberMemoryAtomsForPrompt` is called from **four** distinct consumers:
`app/api/between/chat/route.ts:1869`, `app/api/oracle/conversation/route.ts:674`,
`app/api/sovereign/app/maia/list/route.ts:995`, and `lib/maia/roomComposition.ts:197`
(→ two interview rooms). The only per-consumer differentiation available is the optional
`AtomScopeContext` (`teamId`/`clientId`/`encounterId`), and it is an **audience** axis, not a
purpose axis — *"Absence = restriction, not widening."*

`loadPriorCrossSessionExchanges` is called from `oracle/conversation:665`,
`sovereign/app/maia/list:1053`, and `roomComposition:202`.

### 8.3 · Where purpose travel is ENFORCED shut

| Boundary | Mechanism | Class |
|---|---|---|
| Member sovereign field → practitioner | Structural unreachability; no denylist; external source-scan verifier (`scripts/verify-practitioner-projection.ts`); protected material has no `relationship_id` column to be reached by | **ENFORCED** |
| Member atom → collective | `CHECK (crossing_allowed = FALSE)` + `s5_refuse_unknown_collective` | **ENFORCED** |
| Sanctuary turn → any durable store | `TurnPosture` nominal class with private constructor; `contentWritable()` refuses; DB trigger refuses `posture_at_creation <> 'normal'` | **ENFORCED** |
| Ask authority → a different Ask | `ask_authorization_acts` bound to `member_id + manuscript_id + thread_id + reading_id + observation_key + expires_at`; consumption `act_id UNIQUE`; the claim is `INSERT…SELECT…WHERE member AND expires_at > NOW() ON CONFLICT DO NOTHING` so a foreign or expired act **produces no row to conflict over** | **ENFORCED** |
| Producer → room it is not registered for | `producersForRoom(room)`; absent room → `EXCLUDED: not_registered_for_room`; `membrane.test.ts` fails if classification and admission drift | **ENFORCED in Writer's Studio · SHADOW-ONLY on C1 · not on the path at all for C2–C7** |

### 8.4 · Finding P-2 — authority enforcement is room-dependent, and the rooms disagree

`lib/writers-studio/canonicalWriterTurn.ts` states its own scope: *"⛔ NOT the organism-wide M3.
One room gets a canonical prompt path; every other room and caller stays on its current seam. A
room that does not declare itself cannot take this branch."* It is response-producing
(`writersStudioCognition.ts:31`, `lib/manuscript/editorialRuntime/turn.ts:38`).

On `sovereign/app/maia/list` the same machinery is explicitly shadow (T-1).

**The organism enforces participation authority where the member is writing a book, and computes-
then-discards it where the member is talking to MAIA.**

---

## 9 · CANDIDATE-MODEL CONTRADICTIONS (A6 / model test)

The provisional ladder under test:

```
EVIDENCE → RETRIEVABLE KNOWLEDGE → INQUIRY → INTERPRETATION / SYNTHESIS
        → MEMBER CONFIRMATION / ADOPTION → MEMBER-STANDING CLAIM
        → PURPOSE-SPECIFIC REPRESENTATION
```

### 9.1 · Contradiction M-1 — the ladder is a single spine; the organism is at least three axes

The organism separates, in `pdc-1`, three things the ladder folds into one order:
`authoredBy` (whose material), `participationClass` (how it arrived), `authority` (what epistemic
weight it may carry). The ruling that produced those axes is explicit that *"a candidate's
provenance is three axes, not one scalar. The scalar epistemic class conflated authorship,
participation mechanism and authority."*

A ladder position such as *RETRIEVABLE KNOWLEDGE* cannot be read off the organism: the registry
carries `retrieved.conversational_recall` as `authoredBy: 'member', participationClass:
'retrieved', authority: 'situate'` and `retrieved.relationship_memory` as `authoredBy: 'system',
participationClass: 'retrieved', authority: 'infer'`. Same rung, opposite authorship, opposite
epistemic weight.

**The ladder compresses axes the organism has already separated by ruling.** Any D9-B model must
either branch here or justify re-collapsing what a prior ruling deliberately split.

### 9.2 · Contradiction M-2 — INQUIRY is not a rung; it is a purpose-scoped single-use authority

The organism's inquiry object (`ask_authorization_acts`) is not a *stage* material passes
through. It is a **capability**: member-bound, manuscript-bound, thread-bound, reading-bound,
observation-bound, expiring, single-use, with claim and completion as separate positive facts and
**no stored `interrupted` state** (derived from absence, because the system may not store a
confident negative it cannot know).

Placing INQUIRY on a linear ladder between knowledge and interpretation loses every one of those
properties.

### 9.3 · Contradiction M-3 — CONFIRMATION and ADOPTION are different acts on different objects

The ladder writes them as one rung. The organism distinguishes them completely:

* **Confirmation** = a verdict on a claim *about* the member
  (`member_response_status`, `confirmed_by_user`, `Standing = keep|dismiss|unresolved`).
  It changes the claim's standing.
* **Adoption** = permission for MAIA's wording to enter the member's Work
  (`manuscript_revision_authorizations`). It changes the Work.

They share no table, no vocabulary, no refusal family and no consumer. Collapsing them would
merge *"yes, that is true of me"* with *"yes, put those words in my book."*

### 9.4 · Contradiction M-4 — MEMBER-STANDING CLAIM already exists and is nothing like a rung

`developmental_observation_standing_events` is an **append-only event log** with a CAS token, a
UNIQUE index guarding simultaneity, and a deliberate refusal to represent UNSET as a value.
`lib/manuscript/standing/contract.ts` also records that `investigate` was **excluded on the
grounds that it is a different axis** — keep-and-investigate, dismiss-and-investigate and
unresolved-and-investigate are all coherent, so admitting it into the union *"would make mutually
compatible states falsely exclusive."*

That is the same objection this census raises against the ladder, already ruled once, in code.

### 9.5 · Contradiction M-5 — PURPOSE-SPECIFIC REPRESENTATION is not a terminus

Where purpose scoping is ENFORCED (§8.3) it is enforced at **the reach**, not at the end of a
pipeline: a column that does not exist, a join that was never written, a CHECK that is always
false, a claim predicate that produces no row. None of these is downstream of anything. A ladder
terminating in representation implies that everything upstream has already been decided; the
organism's strongest boundaries decide at the boundary itself.

### 9.6 · Missing state M-6 — there is no rung for *withdrawal*

`valid_to`, `member_response_status = 'rejected'`, `Standing = 'dismiss'`, `declined_at`,
`withdrawn_by_member` are all real, all ENFORCED where reachable, and the ladder has no position
for any of them. `PreferenceConfirmationStore` states the governing rule explicitly:
*"Correction is not temporary disagreement. New evidence may create a new perception; it may not
resurrect the old assertion."*

A monotonic ladder cannot express a member taking something back.

### 9.7 · Missing state M-7 — there is no rung for *refusal*

`BoundaryOutcome` deliberately **excludes** `minted` from its refusal arm, on the stated
reasoning that a refusal able to carry a mint *"would force every consumer to handle an
impossible case, and the §3a surface would need a fallback with no truthful copy."*
`MintOutcome` distinguishes `existing/attempted` from `existing/crossed` — *a crossing MAY have
occurred and was not confirmed.* `StandingRefusal` has four disjoint families.

Refusal in this organism is a first-class outcome with its own truth conditions. The ladder has
no position for *nothing crossed*, and no position for *something may have crossed and we cannot
prove it did*.

### 9.8 · Where the ladder is *supported*

Supported, evidence-bound, in exactly one room: the Writer's Studio revision path realizes
`EVIDENCE (frozen readState) → RETRIEVABLE (disclosure-licensed reading) → INQUIRY (ask act) →
INTERPRETATION (RevisionOffer) → ADOPTION (authorization) → mutation`. Every arrow is a distinct
object and the transitions are ENFORCED.

It is the organism's only full instance, it is confined to one room, and its final term is a
**mutation**, not a representation.

---

## 10 · DISTINCTIONS ALREADY STRUCTURALLY ENFORCED

| # | Distinction | Where | Mechanism |
|---|---|---|---|
| E1 | authority for one purpose ≠ authority for another (member↔practitioner) | `lib/coachField/practitionerProjection.ts` | structural unreachability + external source-scan verifier; protected material has no column to be reached by |
| E2 | authority for one purpose ≠ authority for another (personal↔collective) | `member_memory_atoms` | `CHECK (crossing_allowed = FALSE)`; `s5_refuse_unknown_collective` |
| E3 | authority for one purpose ≠ authority for another (Ask↔Ask) | `ask_authorization_acts` + consumptions | six-way binding; expiry in the claim predicate; `act_id UNIQUE`; a foreign/expired act yields no row |
| E4 | adoption ≠ authorship, **as acts** | `manuscript_revision_authorizations` | three separate objects; no `replacement_text`/`rationale`/`head`; exhaustive refusal switches with no `default` |
| E5 | interpretation ≠ member standing | `developmental_observation_standing_events` | append-only; CAS token; UNIQUE index; `member_id` in every predicate; UNSET is zero events; owner not derived from the reading's owner |
| E6 | historical validity ≠ present standing (on the confirmation path) | `PreferenceConfirmationStore.record()` | `AND (valid_to IS NULL OR valid_to > NOW())` → `refusedReason = 'withdrawn_by_member'` |
| E7 | posture is per-turn, not per-session; posture cannot be forged | `lib/sanctuary/turnPosture.ts` + DB trigger | nominal class, private constructor, `instanceof` guard, fail-closed; `s5_require_minted_provenance` |
| E8 | retrieval permission is a real, accountable act | `lib/disclosure/*` | `requireConsentState` awaited before any assembly; `ON CONFLICT` single-winner mint; module never calls cognition |
| E9 | knowledge ≠ representation authority, **at admission** | `PRODUCER_REGISTRY` + `adjudicate.ts` | `not_registered_for_room`; `memberAboutAllowed`; `fieldCompositionAllowed`; `inferenceCap` |
| E10 | derived synthesis ≠ member utterance, **at write time** | `TurnsStore.mintTurnProvenance` | `generatedBy: 'member-utterance'` vs `'synthesis'`, DB-enforced |
| E11 | a refusal is not an occasion to disclose | `BoundaryOutcome`, `StandingRefusal` | `minted` excluded from the refusal arm by type; `reading_unknown` does not distinguish "not yours" from "does not exist" |

---

## 11 · DISTINCTIONS MERELY EXPRESSED OR CONVENTIONAL

| # | Distinction | Where | Why it is not ENFORCED |
|---|---|---|---|
| X1 | knowledge ≠ representation authority, **at representation** | `lib/maia/canonical-turn/render.ts` | the renderer emits `p.text` only; the three axes do not reach cognition (T-2) |
| X2 | the whole three-axis classification, on the primary conversational surface | `app/api/sovereign/app/maia/list/route.ts:1274+` | shadow; *"does not touch `meta`, the prompt, the response, or any write"* (T-1) |
| X3 | derived synthesis ≠ member-stated truth, **at retrieval** | `loadPriorCrossSessionExchanges` | the SELECT does not read the `provenance` column; only `role` survives (T-3) |
| X4 | derived synthesis ≠ member-stated truth, **at representation** | `conversationalRecallBlock.ts:139` | speaker label `'Member' \| 'MAIA'` is prose |
| X5 | "do not synthesize across sessions" | `conversationalRecallBlock.ts:121–122` | prompt instruction; **CONVENTION** |
| X6 | "use as background intelligence; do not quote" | `…/maia/list/route.ts:848` | prompt instruction; **CONVENTION** |
| X7 | adoption ≠ authorship, **at the artifact** | `manuscript_draft_sections` | no authorship/origin column; recoverable only by joining the authorization chain (T-9) |
| X8 | retrieval permission recorded on a representation artifact | `manuscript_revision_offers.authority jsonb` | opaque jsonb, not a foreign key; presence enforced, content unbound (T-8) |
| X9 | member confirmation carries weight | atoms loader; Cut-1 scorer | `IS DISTINCT FROM 'rejected'` treats confirmed and never-confirmed identically; confirmation term caps at 0.0225 (T-10) |
| X10 | borrowed first person is refused | `standing-envelope.ts` | ENFORCED, but its only consumer is an unawaited, env-gated, allowlisted shadow producing no member-facing output (F-1) |
| X11 | which authority backed a served MAIA turn | `turnMemoryProvenance.ts` | *"NOT A STORE"* — a structured log line by design; *"A durable provenance table would … require custody review it does not have"* |
| X12 | provenance as a general constitution | `lib/provenance/provenance.ts` | `Provenance.mint` has exactly one call site repository-wide (T-4) |

---

## 12 · ABSENT DISTINCTIONS

| # | Distinction | Evidence of absence |
|---|---|---|
| A-1 | **representation authority as an executable concept** | `grep "representation_authority"` over `lib app database components` → **0 files**. No synonym found. The V2 `authority` axis means epistemic mode (`situate\|compute\|infer`), not permission to represent |
| A-2 | **purpose/consumer scoping of member recall consent** | `conversational_recall_enabled` and `episodic_recall_enabled` are single booleans on `members`; `return_preference`/`surface_preference` are mode axes; no consumer or purpose dimension exists on any recall gate |
| A-3 | **a disclosure boundary on the conversational path** | `establishDisclosureBoundary` has two non-test callers, both Writer's Studio (C-1) |
| A-4 | **provenance on derived claims about the member** | `developmental_memories` rows (incl. `crisis_trigger`, `pattern`) carry no `createdBy`/`generatedBy`; `GeneratedBy` has `inference`/`synthesis`/`derivation` and they are not applied (S-1) |
| A-5 | **authorship marking inside the Work after adoption** | `manuscript_draft_sections` has no authorship column (T-9) |
| A-6 | **a reachable "member confirmed this" transition for atoms** | `confirmed`/`modified` have no runtime writer, per the column's own comment; `PreferenceConfirmation.tsx` has zero mount sites; `stale-preferences` has zero client callers |
| A-7 | **`valid_to` on the vector fallback read** | vector SQL is `WHERE user_id = $2 AND vector_embedding IS NOT NULL`; no validity predicate (T-6) |
| A-8 | **a scrubber for MAIA's first-person claims about the member** | `memoryCanonGuard` covers self-architecture claims only, by its own scope statement |
| A-9 | **a durable binding from a served MAIA turn to its inputs' authority** | `[MAIA/memprov]` is explicitly not a store (X11) |
| A-10 | **a member→collective transition** | `collectiveEligible` has no writer; `crossing_must_be_false` is an unconditional CHECK. *Absent, and absent by design* |
| A-11 | **the D9-A charter itself** | §0.1 |

---

## 13 · UNKNOWNS

| # | Question | Why unresolved at this SHA |
|---|---|---|
| U1 | Is `app/api/maia/vision-studio/interview` reachable by a member? | 0 client references found; could be reached by direct URL, external client, or a route not in this repo |
| U2 | Are `lib/caseload/*` services reachable from any live route? | no static caller chain established; not pursued further, being practitioner-side |
| U3 | Is `recall_count` non-zero in production, i.e. is S-2 operative or latent? | requires a database read; **none performed** |
| U4 | Does the vector fallback (T-6) ever execute in production? | requires a database read and traffic observation; **none performed** |
| U5 | Is `MAIA_RELATIONAL_FIELD_SHADOW` enabled, and for whom? | environment state, not repository state |
| U6 | Is `MAIA_CANONICAL_SHADOW` disabled in production? | environment state |
| U7 | Do dynamic `import()` / string-dispatch sites reach any module this census recorded as having zero static callers? | method limit, §2.3 |
| U8 | Does `manuscript_revision_offers.authority` contain a resolvable receipt identity in practice? | `jsonb` with no schema constraint on its interior; requires a data read |
| U9 | Which of C1–C5 carries production traffic, and in what proportion? | requires production observation |
| U10 | Whether the unrecorded D9-A charter imposed obligations beyond §2.1 | the charter is not in the repository (§0.1) |

---

## 14 · UNRESOLVED QUESTIONS (for adjudication, not for repair)

**Q1.** The organism has six authority vocabularies (§4.2) and none of them is about
representation. Is *representation authority* a seventh vocabulary, a property of the existing
six, or a category the organism has been getting by without because the gap is covered by
CONVENTION (X5, X6) plus room confinement (P-2)?

**Q2.** T-1/T-2 together: the three-axis classification is computed for every live turn on the
primary conversational surface and reaches neither the prompt nor any store. Is that an
incomplete migration (CMT-01 M3 unopened), or is it evidence that *admission* and
*representation* are genuinely different questions and the classification was never the right
carrier for the second?

**Q3.** P-1: the member consented to cross-session recall on the MAIA surface and it is present
in a coaching interview room. Is the defect that consent has no purpose dimension, or that
`roomComposition` bypasses the room-admission machinery that already exists, or both — and are
those one finding or two?

**Q4.** T-9/X7: the organism can prove *that* the member authorized MAIA's wording into their
book and cannot say, from the book, *whose wording it is.* Is authorship-at-the-artifact a thing
the Work should carry, or is the authorization chain the correct and sufficient location, with
the real question being who may read that chain and when?

**Q5.** S-2: the Cut-1 scorer weights system repetition above member confirmation by ≈4.4×.
Is that a coefficient question, a question about whether `recall_count` belongs in a scorer at
all, or a question about what confirmation is *for* — given that confirmation currently changes
nothing about whether atoms surface (T-10)?

**Q6.** P-2: authority is enforced where the member is writing a book and not where the member is
talking to MAIA. Is the conversational path under-governed, or is the Writer's Studio governing a
genuinely different kind of act (a mutation of an artifact) that does not generalize to speech?

**Q7.** M-6/M-7: withdrawal and refusal are first-class, ENFORCED, and have no position in the
candidate ladder. Does the model need positions for them, or is that evidence that the model is
the wrong shape — that what the organism has is not a ladder but a set of gates, each deciding at
its own reach?

**Q8.** T-6: a member who has withdrawn all their developmental memories is precisely the member
for whom the unfiltered vector path runs. This is recorded as a discovered divergence. It is
**not** repaired here and no repair is proposed. It is placed before the adjudicator as-is.

---

## 15 · EVIDENCE-BOUND STANDING

**What this census establishes:**

* The organism has **six** distinct, non-composing authority vocabularies, and
  **zero** representations of representation authority.
* Authority is **ENFORCED** at: posture resolution, turn provenance minting, disclosure
  crossing, Ask authorization, revision authorization, member standing over observations,
  member→practitioner reach, member→collective crossing, and room admission inside the
  Writer's Studio.
* Authority is **computed and discarded** at the representation boundary of the primary
  conversational surface (T-1, T-2).
* Authority **silently travels** from the MAIA conversational surface into at least one, and
  possibly two, coaching-interview rooms, on a global boolean, bypassing the room-admission
  machinery (P-1).
* The candidate ladder is **contradicted in five ways and incomplete in two** (§9); it is
  **supported in exactly one room**, whose terminus is a mutation rather than a representation.

**What this census does NOT establish:**

* ⛔ That any member experienced a representation failure. No production read was performed.
* ⛔ That any ABSENT distinction should be added, in any form.
* ⛔ That T-6 is reached in practice, or that S-2 is operative rather than latent.
* ⛔ That the candidate ladder is wrong as an object of investigation — only that the organism
  does not instantiate it outside one room, and contradicts it in the specific ways listed.
* ⛔ Anything about what D9-B should attempt to break. That is the adjudicator's ruling.

**Standing:**

```
D9-A          ✅ COMPLETE — census delivered, evidence-bound, read-only
D9-B          ⛔ HOLD — adversarial falsification harness NOT constructed
F5            ⛔ HOLD
SPM           ⛔ CLOSED — no implementation, no storage, no design proposed
REPAIR        ⛔ NOT AUTHORIZED — T-6, P-1, X9 and every ABSENT above are recorded, unrepaired
PRODUCTION    ⛔ UNTOUCHED — no database read, no runtime observation, no deploy
SOURCE        ⛔ UNCHANGED — no lib/, app/, database/, components/, prompt, or test modified
CHARTER       ⚠️ NOT IN REPOSITORY — §0.1; scope taken from the instruction's §§A1–A6
```

> *An absence tells us a distinction is not represented there. It does not tell us whether the
> right answer is a field, a capability, a token, a relation, a policy engine, a derived state,
> a consumer contract — or something not yet conceived.*

**STOP. Returned for founder/adjudicator review.**
