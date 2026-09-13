# JARVIS-ORCHESTRATION-CORE-01 — WRITER'S STUDIO CENSUS

**Date**: 2026-09-13 · **Read against**: `JARVIS-ORCHESTRATION-CORE-01_SPEC_v0.1_2026-09-13.md`
**Kind**: read-only census. ⛔ No design, no repair, no schema, no renaming, no orchestrator.
**Founder rulings applied**: J9 remains outside J1–J8 **and is a blocking acceptance condition
for OPEN-1** — no claim-identity proposal closes OPEN-1 unless it demonstrates when identity is
preserved, when uncertain, and when lost; *"best match" is not identity.* The member-owned CORPUS
rung is **not designed here**; the collision is recorded, not resolved.

**Method and its limits.** Static reading of the repository at `f73b3e0c`. No production reads, no
execution, no test runs. Two consequences stated up front: (a) a table's existence is not evidence
of its use, and (b) **one classification in this census was produced by a grep whose helper list was
incomplete** — see §5.4, corrected in place rather than deleted.

---

## 1. Executive finding

**The census overturns the spec's central assumption.** Spec v0.1 was written as though the Jarvis
execution boundary did not exist. It does — for one crossing, and it is better built than the spec
proposed.

`app/api/writers-studio/focus/route.ts` is a working execution gate: identity is minted at the
boundary from a verified session and never from a body field or header; the client **names a scope
and may not supply Work text** (a `focusText` string in the body is a 400); the route reads no Work,
calls no model, and delegates to one constituted crossing; the surface is founder-gated and **404s
rather than 403s**. Every crossing writes a `context_disclosure_receipts` row.

So the finding is not "the boundary is missing." It is:

> **The boundary exists, is strong, and is one route wide. Everything beneath it addresses the Work
> by plain string.**

`memberId` and `manuscriptId` travel through `lib/manuscript/**` as `string` parameters. The
discipline holding the system correct is that **every caller passes the right string** — and that
discipline is, today, nearly perfect: 30 of 34 exported work-scoped functions carry `memberId`, and
ownership is written into the SQL predicate rather than checked beside it (`readDraft`: *"Ownership
is in the predicate. A draft that is someone else's is indistinguishable here from one that does not
exist."*).

Nearly perfect discipline is the finding. The architecture is **sound and unenforced**: correct by
consistent authorship, not by construction. A new capability, written next week by someone who has
not read this census, gets no structural resistance whatsoever.

Second finding, equal weight: **the derived-state and invalidation layers are far more built than
the spec assumed.** `developmental_readings` is an immutable, revision-bound, provenanced derived
store with the outcome/observations correspondence enforced by CHECK constraint.
`locateCurrent()` implements **scoped supersession with a named blast radius** and a three-state
result whose third state is `unmeasured`. That is dependency invalidation and epistemic honesty,
already shipped — at evidence-ref granularity.

Third: **the flow layer is genuinely absent.** No flow registry, no declared model class per flow,
no budgets, no job lifecycle, no `WorkChanged` event, and **no embedding or index over member Work
at all**.

---

## 2. Existing primitives worth preserving

| # | Primitive | Location | What it already proves |
|---|---|---|---|
| **A** | **The focus crossing** | `app/api/writers-studio/focus/route.ts`, `lib/writers-studio/focusCrossing.ts` | One authorized boundary; identity minted at the boundary; scope named by client, content read by server; delegation to a single constituted path so a second route cannot acquire the guarantees by copying half of this one |
| **B** | **Unforgeable minted value** | `lib/manuscript/development/bind.ts` — `Bound` class, private `minted`, unexported constructor | A capability can be handed authority it cannot fabricate. ⚠️ Scoped to *evidence integrity*, **not to member/Work** — see §5.1 |
| **C** | **Closed participation registry** | `lib/maia/canonical-turn/producerRegistry.ts` (`as const satisfies Record<string, ProducerSpec>`), `adjudicate.ts` | Closed union: unregistered id is a compile error where the compiler sees it and a runtime refusal where it does not. Three separate axes — `authoredBy` · `participationClass` · `authority` — never one scalar. **This is the Flow Registry contract, already working one layer up** |
| **D** | **Import-graph isolation, enforced by test** | `lib/manuscript/developmentalReader/__tests__/readerCannotBypass.test.ts`; reverse gate `development/__tests__/evidenceCannotAct.test.ts` | Allowlist + forbidden-substring gate over the actual module graph. Two one-way gates make one seam. **This is I1/F2 in a working form** |
| **E** | **Scoped supersession** | `lib/manuscript/development/resolve.ts` — `locateCurrent`, `Moved`, INV-21 | *"A changed section supersedes refs into it, and ONLY those."* Blast radius is computed and **named** (`section-text` · `section-absent` · `section-order` · `structure-unit` · `structure-unit-absent` · `structure-topology`) |
| **F** | **`unmeasured` as a first-class state** | same file, `CurrentLocation` | The system can say *I do not know* rather than guessing. ⛔ No fuzzy matching, ever |
| **G** | **Immutable provenanced derived store** | `developmental_readings` (`20260904000001`) | `manuscript_id` · `member_id` · `draft_id` · `revision_number` · `input_fingerprint` · `reader_provenance` · `classifier_provenance`; CHECK ties outcome to observations both directions |
| **H** | **Non-bypassable model seam** | `lib/ai/structured/router.ts` | *"One argument: what to ask. Policy is not the caller's."* The test-only second entry point was **removed rather than discouraged** — "the boundary is a property of the program" |
| **I** | **Ownership in the predicate** | `capture.ts` `readDraft`, and the `lib/manuscript` convention generally | Fails closed and discloses nothing: someone else's draft is indistinguishable from a nonexistent one |
| **J** | **Membrane classification tied to admission** | `lib/writers-studio/membrane.ts` | ambient · invited · cognitive, with `membrane.test.ts` failing if classification and registry admission drift |
| **K** | **Per-crossing disclosure ledger** | `context_disclosure_receipts` | `boundary` · `source_class` · `scope_kind` · `authorized_by` · `gesture` · `policy_version`, `request_ref` FK into consent state |

---

## 3. Contract-by-contract matrix

### §1 Hierarchy

| ID | Verdict | Evidence |
|---|---|---|
| H1 one corpus / at most one work | **PARTIAL** | `manuscript_sections.manuscript_id → member_manuscripts` gives WORK↔MATERIAL. No CORPUS exists, so the first half is unrepresentable |
| H2 corpus intrinsic / work authored | **ABSENT** | No corpus rung |
| H3 corpus material ≠ work material | **ABSENT (vacuously satisfied)** | Nothing can violate it because the relation does not exist. ⚠️ Not a guarantee — an absence |
| H4 reference without absorption | **ABSENT** | `manuscript_source_arrivals` + `claimArrival` is the nearest seam; it moves material *in*, not by reference |
| H5 no cross-member rung | **PRESENT** | No table in the Work domain admits a second member. `developmental_observation_standing_events` carries `member_id` *physically although redundant today*, explicitly so that a future sharing model cannot make one member's dismissal read as another's |

### §2 `JarvisExecutionContext`

| ID | Verdict | Evidence |
|---|---|---|
| X1 `run(context, request)` | **ABSENT** — one exception | Every `lib/manuscript` entry point is `(manuscriptId: string, memberId: string, …)`. The exception is the focus crossing, which carries a structured `FocusCrossingRequest` with `identity`, `posture`, `requestId`, `disclosureId` |
| X2 context not advisory | **ABSENT** | A plain string is advisory by nature. Nothing prevents a caller passing a `memberId` it did not authenticate |
| X3 context minted only at the gate | **PARTIAL** | Exemplary at focus (*"authenticating for the route and then passing a raw string downstream would be two identities pretending to be one"*). Elsewhere the route authenticates and then does exactly that |
| X4 actor ≠ member | **ABSENT** | No surface distinguishes them. Today they are always equal, which is precisely why the distinction has never been forced |

### §3 Capability isolation

| ID | Verdict | Evidence |
|---|---|---|
| I1 scope cannot be widened | **PARTIAL** | True inside `developmentalReader` by gate **D**. Everywhere else a capability may import `lib/db/postgres` directly |
| I2 cannot read another member's Work | **PARTIAL** | Holds in practice via predicate ownership (**I**); not structural. See BP-1, BP-2, BP-3 |
| I3 closed, versioned capability identity | **PARTIAL** | Closed for *producers* (**C**) and for reader provenance (`readerVersion`). No capability registry for Work operations |
| I4 infrastructure not policy | **PARTIAL** | Genuinely infrastructural at B, C, D, H. Elsewhere the enforcement is a well-written comment |

### §4 Flow Registry

| ID | Verdict | Evidence |
|---|---|---|
| F1 unregistered flow does not execute | **PARTIAL** | Enforced for producers entering canonical cognition; **no flow concept exists for Work operations** |
| F2 may not access what it did not declare | **PARTIAL** | Gate **D** for one directory, hand-maintained, not derived from a declaration |
| F3 whole-work must be declared | **PARTIAL** | `scopeKind ∈ {whole_work, section, passage}` is validated at the focus route and recorded on the receipt — a *request* declaration, not a *flow* declaration |
| F4 no undeclared model class | **ABSENT** | `runStructured(req)` takes no flow identity and no model class. Platform policy is central (**H**); per-flow declaration does not exist |
| F5 registry is a named set | **PRESENT (by precedent)** | `producerRegistry` requires reason, date and lane per entry: *"Adding an entry to silence a failure is the wrong action"* |

### §5 Work state and change

| ID | Verdict | Evidence |
|---|---|---|
| W1 understanding outside the model | **PRESENT** | `developmental_readings` (**G**), `manuscript_structure_units`, `working_draft_revisions` |
| W2 derived labelled + provenanced | **PRESENT** | `reader_provenance` NOT NULL; `classifier_provenance` required exactly when observations exist |
| W3 derived never authored | **PRESENT** | Separate tables; readings refuse UPDATE; `assertNoProse` / `assertNoProseKeys` keep prose out of structure proposals |
| D1 invalidation from declared dependencies | **PARTIAL** | **E** — computed from the frozen readState against current rows. Declared *in the ref vocabulary*, not in a dependency graph |
| D2 no whole-manuscript recompute | **PARTIAL** | Supersession is per-ref and scoped. ⚠️ Nothing recomputes at all, so the obligation is untested rather than met |
| D3 stale never presents as current | **PARTIAL** | Structurally possible (`revision_number` + `locateCurrent`); ⚠️ **not established as enforced at every read path** — UNKNOWN without a runtime trace |
| D4 knows what it still knows | **PARTIAL** | `unmeasured` (**F**) is exactly this, at ref granularity only |

### §6 Execution classes

| ID | Verdict | Evidence |
|---|---|---|
| E1 no implicit expensive work | **UNKNOWN** | No budget or class exists to violate or satisfy; unmeasured at runtime |
| E2 compound job visible/cancellable | **ABSENT** | Job tables exist (`embedding_jobs`, `focus_tasks`, `media_jobs`, `supervision_jobs`, `vault_erasure_queue`) — **none in the Work-cognition path** |
| E3 write-authority is the governing axis | **PARTIAL** | `producerRegistry` already carries an `authority` axis separate from `participationClass` — the same move, one layer up |
| E4 both axes declared | **ABSENT** | No flow declarations |

### §7 Provenance

| ID | Verdict | Evidence |
|---|---|---|
| P1 no persisted result without provenance | **PRESENT for readings** | Enforced by NOT NULL + CHECK, not convention |
| P2 MAIA can say why | **PRESENT for readings** | `ReaderProvenance` = provider · **resolved model actually sent** · `promptHash` over system prompt + tool contract · `readerVersion` · `frozenAt` |
| P3 author override first-class | **PRESENT** | `developmental_observation_standing_events`: append-only `keep` / `dismiss` / `unresolved`, monotonic index allocated inside the INSERT, UNIQUE refusing the loser of a race. `investigate` deliberately excluded as *a different axis* |
| P4 provenance never leverage | **UNKNOWN** | A presentation question; not decidable from schema |

### §8 MAIA / Jarvis boundary

| ID | Verdict | Evidence |
|---|---|---|
| B1 structured results, not voice | **PRESENT** | Focus enters as a **context producer** into the canonical `writers_studio` participation path |
| B2 no second personality | **PRESENT** | *"Hold the room constant. Change the mind."* |
| B3 coordinates, does not accumulate | **PRESENT** | No orchestrator exists to accumulate |
| B4 MAIA holds the relationship | **PRESENT** | Membrane (**J**) governs what may become operative |

### §9 Budgets

| ID | Verdict | Evidence |
|---|---|---|
| R1–R4 | **ABSENT** | `maxTokens` appears only as a vendor adapter parameter. No cost, tool-call, wall-time, source-count or escalation budget anywhere in the Work path |

---

## 4. J1–J8 matrix

| ID | Verdict | Evidence and residue |
|---|---|---|
| **J1** tenant isolation | **PARTIAL** | Strong at the route (`getMemberIdFromRequest`: session-verified; a mismatched `x-member-id` is **rejected as impersonation**, not preferred) and strong in SQL (ownership in the predicate). ⛔ Not structural below the route: BP-1, BP-2, BP-3 |
| **J2** context economy | **PARTIAL** | `scopeKind` validated and receipted; `withStructure` opt-in on capture. ⛔ No flow declares `whole_work`, so nothing can be checked against a declaration |
| **J3** provenance | **PARTIAL** | Enforced for `developmental_readings` by constraint. ⛔ Not a system-wide property: no other derived writer is bound |
| **J4** model routing | **PARTIAL** | Central non-bypassable policy (**H**), sovereign mode refuses rather than silently downgrading. ⛔ Per-flow model class absent |
| **J5** revision awareness | **PARTIAL** | Readings are revision-bound; `locateCurrent` can supersede. ⛔ Whether every display path calls it is **UNKNOWN** from static reading |
| **J6** incrementality | **PRESENT in miniature** | INV-21 scoped supersession, blast radius named. ⛔ Applies to evidence refs, not claims; pull-based, no event |
| **J7** corpus boundary | **PRESENT by absence** | `corpora` has **exactly one consumer in the entire repository**: `scripts/ingest/commons-corpus.ts`, which ingests files from disk. **No Writer's Studio path places member-private material into it.** ⛔ This is an absence, not a guard |
| **J8** MAIA/Jarvis separation | **PRESENT** | The strongest contract in the census. Focus is a producer inside the room, never a second prompt |

⛔ **No J is fully PRESENT except J8.** Under FR-14, PARTIAL never discharges.

**J9 (PROPOSED, and per founder ruling a blocking acceptance condition for OPEN-1)** — evidence
relevant: **F** shows the three-state discipline already exists and `resolve.ts` states *"NO FUZZY
MATCHING, EVER — a passage whose section has changed is superseded"*, with a test asserting
supersession **even when the words survive**. The organism already refuses best-match at the
evidence layer. J9 asks the claim layer to inherit that refusal.

---

## 5. Bypass-path inventory

Ordered by what a developer can reach around **today**, without modifying any existing file.

### BP-1 · `loadRevisionContent(draftId, revisionNumber)` — **unscoped full-prose read** 🔴
`lib/manuscript/development/capture.ts:164`. Exported. Executes
`SELECT content FROM working_draft_revisions WHERE draft_id = $1 AND revision_number = $2` with
**no member predicate and no ownership check**. Any module holding a `draftId` obtains the complete
revision text of any member's Work.
*Current callers are safe* — the route caller (`manuscripts/[id]/ask`) authenticates first, and
`commission.ts` passes `evidence.readState.draftId` derived from an already-scoped capture. **The
defect is the availability, not a live leak.**

### BP-2 · `readStructureRows(tx, manuscriptId)` — **unscoped structure read** 🔴
`capture.ts:111`. Exported, member-free. Inside `captureEvidence` it is preceded by an ownership-
bearing `readDraft`; **the ownership check and the use are two separate statements.** This is the
same shape the founder rejected in the I0.5 `093379e8d` candidate — prechecked, not authoritative at
the boundary — here on a read path rather than a write path.

### BP-3 · **`memberId` is a `string` everywhere below the route** 🔴 *(the structural one)*
30 of 34 exported work-scoped functions take it and enforce it. Nothing makes a *wrong* string
unrepresentable. Primitive **B** proves the repo can mint unforgeable values; that technique has
been applied to evidence integrity and **not to tenant scope**. This is the single finding that most
directly motivates `JarvisExecutionContext`.

### BP-4 · `runStructured(req)` — **cognition reachable without a gate** 🔴
Named in-repo as the principal bypass (`readerCannotBypass.test.ts`: *"unrestricted
`runStructured(messages)` as the principal bypass: any module can hand the seam any prose"*). The
answer built was an import-graph gate over **one directory**. Every other module in the repository
may import the seam and send any prose it can reach, with no flow, no member, no budget, no
provenance and no receipt.

### BP-5 · Derived state may be written outside the provenanced path — **UNKNOWN, scoped** 🟡
`developmental_readings` is constraint-bound. Whether any other Work-derived writer exists without
provenance is not established by this census; the table inventory shows no second Work-derived
store, but absence in a table list is not proof.

### BP-6 · `POST /api/book-studio/import-docx` — **unauthenticated compute** 🟡
Self-documented: *"No auth check here"*, gated only by the founder-only page layout that calls it.
Accepts ≤25 MB and shells out to `pandoc` via `execFileSync`. ⛔ **Not a tenant-isolation bypass** —
it reads and writes **no database table and no member data**; it is a stateless converter. Recorded
as an unauthenticated resource-consumption surface, which is a different and lesser finding.

### 5.4 ⚠️ Correction to an intermediate result
An earlier pass in this census listed six `book-studio` routes as having **no authorization**. That
was an artifact of a grep whose helper list omitted `requireArranger` and `requireAccess`;
`workbench/shelf` authorizes on line 38 and role-scopes its sources. **The code was right and the
instrument was wrong.** Corrected here rather than deleted: an audit that hides its own false
positives teaches nothing about how it fails. (Same failure mode as the I0.5 **C21** false positive,
and the same repair — fix the instrument, do not weaken the finding.)

### What is NOT a bypass — worth stating
- Header impersonation: **closed**. A `x-member-id` that disagrees with the verified session is
  rejected outright.
- Client-supplied Work text at the focus boundary: **closed** by explicit 400.
- A second structured-inference entry point: **removed**, not deprecated.
- Member material reaching `corpora`: **no path exists**.

---

## 6. Revision / identity findings

| Entity | Identity | Survives revision? |
|---|---|---|
| `member_manuscripts.id` | uuid | ✅ stable |
| `manuscript_working_drafts.id` | uuid | ✅ stable |
| `manuscript_draft_sections.id` | uuid | ✅ stable across text edits — **the load-bearing durable id** |
| `manuscript_structure_units.id` | uuid, member-authored | ✅ stable; **supersedes on rename, move, or placement change** (`sameUnit` compares parent · position · kind · title · origin · adopted_from · placement set) |
| `working_draft_revisions.revision_number` | monotonic int | ✅ append-only, immutable |
| `EvidenceRef` | typed pointer, **carries no version** (INV-6) | ⛔ currency is the *reading's*, never the ref's |
| `PassageRef.range` | code points **relative to the section as read** | ⛔ revision-bound; valid only through the frozen `SectionState` |
| `input_fingerprint` | SHA-256 over the reading's inputs | ✅ detects any change to what was read |
| observation `key` | text inside the reading's jsonb | ⚠️ **cannot be foreign-keyed**; the write boundary, not a constraint, establishes it resolves |
| **claim / concept / entity / theme** | — | ⛔ **do not exist.** No table, no type, no id |

**Fuzzy or semantic relocation: none.** Explicitly forbidden and tested — a passage is superseded
even when its words survive.

**Where identity is silently inferred: nowhere in the Work path.** This is unusually clean and is
the strongest asset OPEN-1 inherits.

**Sharpened subquestions for OPEN-1** (⛔ not answers; OPEN-1 remains open):
- **OPEN-1a** — Does a claim have identity independent of the section that carries it, or is it
  `(sectionId, revision, span)` plus a label? The former needs a new durable id; the latter makes
  every text edit a supersession and J6 unreachable for claims.
- **OPEN-1b** — `sameUnit` supersedes on *any* field difference, including a pure rename. Is a
  claim's identity likewise all-or-nothing, or does it need a preserved/uncertain/lost gradient?
  **J9 forces this question to be answered rather than defaulted.**
- **OPEN-1c** — Observation keys already live in jsonb and cannot be foreign-keyed. Do claims
  inherit that shape, or do they require a row of their own? This is the first place the answer
  would imply schema — ⛔ and therefore the first place BRANCH GATE binds.
- **OPEN-1d** — `unmeasured` exists as a state. Is a claim whose section was never read at body
  depth `unmeasured`, or is it absent? The coverage model (`position` | `body`) already forces this
  distinction for evidence.

---

## 7. Incremental-computation findings

**Present, and it is dependency semantics, not caching.** `locateCurrent` recomputes nothing and
caches nothing: it compares a frozen reading against current rows and reports, per reference,
whether the thing that reference depends on moved — naming which thing. The distinguishing evidence
is the negative test: *"s7 was never supplied, so editing it cannot make this reading stale."*
Selectivity is asserted, not incidental.

**Absent:** any `WorkChanged` event; any persisted stale marking (supersession is computed on
demand, never stored — consistent with `superseded_by` being derived, never stored, in the temporal
memory direction note); any recomputation of anything; any dependency graph spanning objects rather
than references.

**Adjacent but not this:** `draftConcurrency.ts` and `draftStateDigest` are optimistic-concurrency
digests — they detect that a write raced, not what a change invalidated. `embedding_jobs` is a real
queue **with no Work-domain producer**.

---

## 8. Authority classification of current Writer's Studio operations

| Operation | Class | Basis |
|---|---|---|
| `captureEvidence`, `loadLiveWork`, `loadFrozenReading`, `loadSectionHeads`, `loadStructure`, `listProposals`, `resolveDevelopPreparation`, `readingIsAddressable` | **READ** | No write |
| `renderRequest`, `gatherEvidence`, `deriveImportedStructure`, `locateCurrent`, `unreadSpan`, `sectionTopologyHash` | **READ (pure)** | No DB access at all |
| `freezeAndStore` (developmental readings) | **DERIVED** | Machine-derived observations; immutable; provenance required by constraint |
| `createProposal` (structure proposals from MAIA reading) | **DERIVED** | Proposal, not structure. `assertNoProse` keeps prose out |
| `performFocusCrossing` → receipt | **DERIVED** | Writes a disclosure record about the act, never Work content |
| `saveSection`, `convertDraftToSections`, `claimArrival`, `authorStructureFromProposal`, `createUnit`/`renameUnit`/`moveUnit`/`deleteUnit`/`placeSections`, `eraseManuscript` | **AUTHORED** | Member acts through authenticated routes |
| standing events (`keep`/`dismiss`/`unresolved`) | **AUTHORED** | The member's judgment over derived output — P3 |

⭐ **AUTHORED is empty of machine actors.** Every AUTHORED operation is reached only through a
member-authenticated route; no reader, classifier or model path writes Work material. The gate
`developSurfaceCannotAct.test.ts` asserts one direction of this structurally.
⚠️ This holds **by current construction, not by a declared prohibition** — nothing would refuse a
new capability that wrote to `manuscript_draft_sections`.

---

## 9. Unresolved questions

- **CA-J1** CORPUS singular or plural per member. *(unchanged — not addressed here by ruling)*
- **CA-J2** Naming: `corpora` is system-scoped retrieval infrastructure with one filesystem
  ingester; the member-owned conceptual rung is unresolved. ⛔ **Not aliased. Not designed here.**
- **CA-J3 / OPEN-1** Claim identity under revision — now carrying subquestions 1a–1d, and J9 as a
  **blocking acceptance condition**.
- **CA-J4** Do J9/J10 enter the named set? *(J9's status as OPEN-1 acceptance condition is now
  ruled; its membership in J1–J8 is not.)*
- **CA-J5** Flow Registry vs `PRODUCER_REGISTRY` — the census strengthens the case that they are one
  mechanism at two layers. Still a decision, not an inference.
- **CA-J6 (new)** Is the import-graph gate (**D**) the general enforcement mechanism for F2, or a
  stopgap until declarations exist? It is hand-maintained per directory and does not scale to a
  registry — but it is the only working enforcement the repo has.
- **CA-J7 (new)** `developmental_readings` is provenanced by table constraint. Should provenance be
  a property of the *store* (repeat the constraint per table) or of the *write path* (one
  provenanced writer)? The census cannot choose; the answer determines whether J3 is a schema
  obligation or an orchestration obligation.
- **UNKNOWN-1** Whether every read path that surfaces a reading calls `locateCurrent`. Static
  reading cannot establish it; it needs a runtime or call-graph witness. **This is the residue on
  J5.**

---

## 10. Implications for the next spec act

1. **`JarvisExecutionContext` is narrower than drafted.** The context does not need to invent
   identity resolution, model policy, or disclosure receipting — A, H and K already exist. What it
   must add is **BP-3**: making a wrong `memberId` unrepresentable, by applying technique **B** to
   tenant scope. That is the minimum viable context, and it is a small type.
2. **The Flow Registry should be read as an extension of `PRODUCER_REGISTRY`, not a new artifact.**
   Its three-axis discipline (`authoredBy` · `participationClass` · `authority`) already anticipates
   §6's two axes. CA-J5 becomes the first design question, not a footnote.
3. **OPEN-1 must be designed against `resolve.ts`, not against a clean slate.** `Moved`,
   `unmeasured`, and the no-fuzzy-matching law are the constraints a claim-identity model inherits.
   A proposal that cannot express its verdicts in that vocabulary is proposing a second, weaker
   theory of change beside a working one.
4. **J4 and R1–R4 have no substrate at all.** They cannot be specified against existing code because
   there is no flow to carry a declaration. They are downstream of the registry decision.
5. **The absence of any Work embedding is a strategic fact, not a gap to fill reflexively.** The
   retrieval flow the spec assumes has no index. That the organism reached this level of
   developmental intelligence **without** a vector store over member prose is itself a finding, and
   the decision to add one should be its own act with its own consent question — not a side effect
   of building orchestration.
6. **BRANCH GATE binds at OPEN-1c**, the first subquestion whose answer implies a table.

---

## 11. Recommendation — the smallest next non-building act

> **Write the `JarvisExecutionContext` type and nothing else — as a specification amendment, not a
> module — narrowed to what BP-3 requires: an unforgeable Work scope, minted only at an
> authenticated boundary, that makes a wrong `memberId` unrepresentable below the route.**

Why this is the smallest act that moves the most:

- It is **one type**, and the repository already contains the exact technique (**B**).
- It answers the census's central finding (BP-3) rather than its most interesting one.
- It requires **no schema**, so BRANCH GATE does not bind.
- It does **not** require CA-J1, CA-J2, or OPEN-1 to be answered first — scope binding is orthogonal
  to claim identity, and doing it first means OPEN-1 is later designed inside a bound context rather
  than beside one.
- It is falsifiable immediately by extending gate **D**'s technique: a test asserting that no module
  under `lib/manuscript/**` accepts a bare `memberId: string` on a Work-scoped export.

⛔ **This act is NOT begun here.** It requires a founder act, and the amendment it produces would
supersede §2 of the spec rather than extend it.

---

## 12. Standing

**CENSUS COMPLETE · READ-ONLY · NOTHING RATIFIED · OPEN-1 OPEN (sharpened, not closed) ·
CORPUS COLLISION PRESERVED AND UNRESOLVED · NO SCHEMA · NO MIGRATION · NO DEPLOY · NO REPAIR ·
NO RENAMING · NO ORCHESTRATOR · BRANCH GATE STILL PREREQUISITE TO ANY SCHEMA FROM THIS LANE.**

> *The boundary exists, is strong, and is one route wide.*
