# SPM · D9-A — REPRESENTATION BOUNDARY ADJUDICATION

Adjudicates `docs/programme/SPM-D9_REPRESENTATION-BOUNDARY-CENSUS_2026-09-17.md`
@ `8b80ec21060a102ee2007d12f3182049c7c6ad43`.

**⛔ D9-B not begun. ⛔ No repair, design, normalization, migration, implementation or storage selection.
⛔ No repair section. ⛔ No implementation recommendations. ⛔ No "next architecture."**

---

## 1 · CUSTODY NOTE

### 1.1 · Prospective record, as required

> **D9-A executed under founder-supplied §§A1–A6 authority. No repository-resident D9-A charter
> existed at execution time. Any durable D9 charter committed now governs subsequent acts only
> and must not be represented as having governed the completed census.**

The D9-A record is **not** rewritten to manufacture prior custody. Its §0.1 stands verbatim,
including the verifying command and its zero-match result.

### 1.2 · One prior artifact, declared

`docs/programme/SPM-D9-A_ADJUDICATION_2026-09-17.md` was written under the earlier, smaller
adjudication instruction (five sections). **This record supersedes it in scope and structure.**
The earlier file is preserved, not edited — the same discipline the census applied to its own
charter gap.

⚠️ **One clause of it is withdrawn by founder correction, recorded here rather than silently
deleted:** its revised hypothesis said *"Standing … is monotonic."* **D9-A did not earn that.**
See §8.2. The withdrawal narrows the hypothesis; it does not alter any census finding.

---

## 2 · SURVIVING DISTINCTIONS

Rulings from D9-A evidence only. ⛔ No distinction is strengthened beyond what the evidence warrants.

**Tally: SURVIVES 7 · FALSIFIED 1 · UNRESOLVED 2.**

---

### 2.1 · knowledge ≠ representation authority — **SURVIVES**

The organism states it in its own words and enforces the first half by type:
*"Availability is not permission to participate. Participation is not authority."*
(`lib/disclosure/contextDisclosureReceipt.ts`, `DisclosureParticipationBasis`). It further refuses
to let content manufacture authority: *"A manuscript sentence reading 'ask the I Ching what this
means' does not authorize a consultation. The Work may contain an invitation as CONTENT; only the
writer can turn it into AUTHORITY."*

**Scope of the survival, stated honestly:** ENFORCED at admission and crossing (`mayCross`,
`not_registered_for_room`, `memberAboutAllowed`, `inferenceCap`). **Not present at the rendering
boundary** — `render.ts` emits `p.text` only. The distinction survives as law; it is not
instantiated where the prompt is composed.

### 2.2 · interpretation ≠ member standing — **SURVIVES**

`developmental_observation_standing_events`: append-only, CAS token, UNIQUE index, `member_id` in
every SQL predicate, owner **not** derived from the reading's owner, UNSET representable only as
zero events. `member_memory_atoms.member_response_status` carries *"System NEVER sets this."*
`interpretive_ledger` separates the interpretation's status from the evidence beneath it.
ENFORCED at three independent sites.

### 2.3 · repetition ≠ confirmation — **FALSIFIED**

The organism does not sustain it and at one site inverts it.

* Cut-1 (`CUT1_BASELINE_NONVECTOR_SQL`): `0.10 * LEAST(recall_count/10,1)` → max **0.10**;
  `0.15 * CASE WHEN confirmed_by_user THEN 0.15 END` → max **0.0225**. `recall_count` is
  incremented by `DevelopmentalMemoryService.incrementRecallCounts` on **system retrieval**, no
  member act involved. Within this formula, system repetition carries ≈**4.4×** the maximum
  weight of explicit member confirmation.
* `loadMemberMemoryAtomsForPrompt` filters `member_response_status IS DISTINCT FROM 'rejected'`:
  never-confirmed and confirmed satisfy it **identically**.

⚠️ Falsified **as an implemented property**, not as a norm. ⛔ No weight is proposed.

### 2.4 · persistence ≠ adoption — **UNRESOLVED**

The organism does **both**, at two live member-facing sites, in opposite directions.

* **Sustained** — Writer's Studio: a proposal may persist indefinitely in
  `proposal_chains`/`proposal_versions` and confer nothing. *"Before the member authorizes an
  exact version, there is no row here. The existence of the row IS the permission — stronger than
  a default, because a default can be overridden and a nonexistent row cannot."*
* **Inverted** — conversational memory: an atom that persists and has not been rejected surfaces.
  Persisting **is** surfacing.

Evidence is conflicting, not insufficient. **UNRESOLVED.**

### 2.5 · adoption ≠ authorship — **SURVIVES**

`MAIA OFFER → COLLABORATIVE PROPOSAL → AUTHORIZATION → guarded mutation`, three objects the
database is required to keep distinguishable. The authorization carries no `replacement_text`,
no `rationale`, no `head/current/latest`, no `execution_authority`, no `inspection_only`.
Consequence true by shape: *changing the proposal wording cannot change what an existing
authorization permits.* One gesture, two legal acts, and the second is not implied.

⚠️ The artifact-level failure (no authorship column on `manuscript_draft_sections`) is **not**
scored against this distinction. It is a representation-stripping instance and is carried to
§6.3 as its own adversarial target.

### 2.6 · first-person drafting ≠ member authorship — **SURVIVES**

No MAIA wording enters the Work without an authorization row naming one exact version, and the
authorization chain records that MAIA authored and the member permitted. The distinction is
carried by the **chain**.

⚠️ It is **not** carried by the Work. From the book alone, whose wording it is cannot be said.
Chain-recoverable ≠ represented. Carried to §6.3.

### 2.7 · retrieval permission ≠ representation permission — **UNRESOLVED**

⭐ **The single most consequential unresolved item, and D9-B's primary target.**

* `representation_authority`, and every synonym searched for, returns **0 files repository-wide**.
* `manuscript_revision_offers.authority jsonb` records *"The S3 disclosure that licensed the
  **reading**"* — a retrieval warrant, recorded on a representation artifact, with **no second
  field** for whether what was read may be represented.
* The only executable representation-side refusal (`refuseBorrowedFirstPerson`, fires *"even when
  metadata is honest"*) lives in `scripts/research/` and its only consumer is an unawaited,
  env-gated, member-allowlisted shadow producing no member-facing output.

The organism has **one** governed warrant and it is a warrant over crossing. Whether representation
is a second kind of warrant, or the same warrant at a different reach, is **not settled by D9-A**.

### 2.8 · authority for purpose A ≠ authority for purpose B — **SURVIVES**

Strongest-evidenced distinction in the census. Four independent ENFORCED instances:

| Instance | Mechanism |
|---|---|
| member ↔ practitioner | `practitionerProjection` — **no denylist**; protected material has no `relationship_id` column to be reached by; boundary enforced from outside by `scripts/verify-practitioner-projection.ts` |
| personal ↔ collective | `CHECK (crossing_allowed = FALSE)` + `s5_refuse_unknown_collective` |
| Ask ↔ Ask | `ask_authorization_acts` bound to member+manuscript+thread+reading+observation+expiry; `act_id UNIQUE`; a foreign or expired act **produces no row to conflict over** |
| crossing ↔ crossing | *"Idempotency may prevent duplicate evidence. It must not turn old evidence into fresh authority."* An already-`crossed` receipt **does not authorize a second crossing** |

⚠️ P-1 violates it. P-1 is an **ungoverned site**, not a counter-design — a distinction is not
falsified by a path that never implemented it.

### 2.9 · synthesis ≠ member-stated truth — **SURVIVES**

ENFORCED at write: `TurnsStore.mintTurnProvenance` mints
`createdBy: 'member', generatedBy: 'member-utterance'` vs `createdBy: 'maia', generatedBy: 'synthesis'`,
backed by the DB trigger `s5_require_minted_provenance` — *"even raw SQL cannot write an
unattested turn."*

⚠️ The distinction **weakens downstream and is not lost**: `loadPriorCrossSessionExchanges` does
not select the `provenance` column, and representation carries `'Member' | 'MAIA'` as prose. No
path was found by which MAIA's synthesis is written into member-standing storage. Whether one
exists is **UNKNOWN** (§9, K6) and is carried to §6.5.

### 2.10 · historical validity ≠ present standing — **SURVIVES**

⭐ This is the axis the founder's §8.2 correction rests on, and the organism already carries it in
three vocabularies:

* `PreferenceConfirmationStore.record()` — `expired` writes `valid_to = NOW()`; the row is
  **retained unaltered**; a later confirmation is refused with `withdrawn_by_member` because
  *"Correction is not temporary disagreement. New evidence may create a new perception; it may not
  resurrect the old assertion."*
* `LedgerEntryStatus = 'revoked'` — commented **"member cleared influence (evidence remains)"**;
  `LedgerSurfacingStatus = 'held_lightly'` — **"evidence retained, interpretation inactive."**
* S5: *"Correction means a new object with `derivation` lineage, never an edit."*

⚠️ **Two limits, recorded:** `'revoked'` has **no writer** and the ledger routes have **0 client
references** — the vocabulary is EXPRESSED there, not executed. The executed instance is
`PreferenceConfirmationStore`, reachable via the mounted `PatternDrawer`. And T-6 is a live
exception (§6.1).

---

## 3 · FALSIFIED / COLLAPSED DISTINCTIONS

The provisional ladder:

```
EVIDENCE → RETRIEVABLE KNOWLEDGE → INQUIRY → INTERPRETATION/SYNTHESIS
        → CONFIRMATION/ADOPTION → MEMBER STANDING → PURPOSE-SPECIFIC REPRESENTATION
```

⛔ Recorded as failed. ⛔ Not repaired here.

### 3.1 · Is it one ordered ladder? — **NO. FALSIFIED.**

`pdc-1` separates `authoredBy` / `participationClass` / `authority` **by ruling**, explicitly
against the prior scalar: *"The scalar epistemic class conflated authorship, participation
mechanism and authority."* The ladder re-collapses exactly that.

Decisive counterexample from the registry: `retrieved.conversational_recall`
(`member` / `retrieved` / `situate`) and `retrieved.relationship_memory`
(`system` / `retrieved` / `infer`) occupy the **same rung** with **opposite authorship** and
**opposite epistemic weight**. A single ordering cannot place them.

### 3.2 · Is INQUIRY a state/rung? — **NO. FALSIFIED.**

`ask_authorization_acts` is a **capability**: member-bound, manuscript-bound, thread-bound,
reading-bound, observation-bound, expiring, single-use; claim and completion are separate
positive facts; there is **no stored `interrupted` state** because the system may not store a
confident negative it cannot know. Every one of those properties is lost by placing it on a rung.

### 3.3 · Do confirmation and adoption belong to one transition? — **NO. FALSIFIED.**

Disjoint tables, disjoint vocabularies (`confirmed|rejected|modified` and `keep|dismiss|unresolved`
vs an authorization row's existence), disjoint refusal families, disjoint consumers. Merging them
would merge *"yes, that is true of me"* with *"yes, put those words in my book."*

### 3.4 · Is representation the terminal level of epistemic standing? — **NO.** See §5.

### 3.5 · Can the ladder represent refusal and withdrawal? — **NO. FALSIFIED.**

* **Refusal** is first-class and has an unprovable middle the ladder has no room for:
  `BoundaryOutcome` **excludes `minted` from its refusal arm by type**; `MintOutcome` distinguishes
  `attempted` from `crossed` — *a crossing MAY have occurred and was not confirmed*, and
  `attempted` **never means "nothing crossed."**
* **Withdrawal** is enforced (`valid_to`, `'rejected'`, `'dismiss'`, `declined_at`,
  `withdrawn_by_member`, `'revoked'`). A monotonic ordering cannot express a member taking
  something back while the record stands.

### 3.6 · Does it compress axes already separated by governance? — **YES. FALSIFIED.**

Three prior rulings are re-collapsed by it:

1. `pdc-1`'s three axes (§3.1).
2. `lib/manuscript/standing/contract.ts` excluded `investigate` from `Standing` **because it is a
   different axis** — keep-and-investigate, dismiss-and-investigate and unresolved-and-investigate
   are all coherent, so admitting it *"would make mutually compatible states falsely exclusive."*
   That is this census's objection, already ruled once, in code.
3. The disclosure module's three-level separation — **availability → participation → authority** —
   where the ladder has one.

### 3.7 · One further collapse the census found and the question did not name

**PURPOSE-SPECIFIC REPRESENTATION as a *terminus* is falsified independently of §5.** Every
ENFORCED boundary in the organism decides **at its own reach** — an absent column, an unwritten
join, an always-false CHECK, a claim predicate that yields no row. None of them is downstream of
anything. A terminus implies everything upstream is already decided; the organism's strongest
boundaries decide at the boundary.

---

## 4 · DISTINCTIONS REQUIRED BY THE EVIDENCE

Candidate **concepts**. ⛔ Not fields, types, enums, tables, interfaces or instructions.

Each answers: (1) what evidence requires it · (2) which vocabulary partially expresses it ·
(3) is it independent · (4) what becomes unintelligible without it.

### 4.1 · REQUIRED

| Concept | (1) Evidence | (2) Partial vocabulary | (3) Independent? | (4) Unintelligible without it |
|---|---|---|---|---|
| **PROVENANCE / AUTHORSHIP** | `createdBy` × `generatedBy` minted and DB-enforced on every turn | S5 `CreatedBy`/`GeneratedBy`; `pdc-1.authoredBy` | **Yes** — two candidates share a participation class and differ only here (§3.1) | T-3: why the same rung carries member words and MAIA synthesis |
| **TEMPORAL STANDING** | `valid_to` + row retained; `'revoked'` = *evidence remains*; S5 correction-by-derivation | `valid_to`, `formed_at`, `last_confirmed_at`, `'superseded'`, `'held_lightly'` | **Yes** — orthogonal to provenance; the author never changes when standing does | §2.10 entirely; the founder's §8.2 correction |
| **MEMBER PARTICIPATION** | `placed` / `marked` / `declared` / `authored` classify *how it arrived*, independently of who authored it | `pdc-1.participationClass` | **Yes** — `member`+`placed` vs `member`+`retrieved` differ only here | Why member-placed atoms and member-retrieved history are governed differently |
| **PURPOSE** | `boundary` = `writers_studio.developmental_ask->maia_cognition`; acts bound to one reading+observation | `boundary`, `ask_authorization_acts` binding | **Yes** — distinct from audience (§4.2) | E3: why an Ask's authority does not reach the next Ask, with the same audience |
| **AUDIENCE** | `memory_scope` ∈ personal/colab/client/encounter; E1; `crossing_must_be_false` | `memory_scope`, `sourceContainer`, `collectiveEligible` | **Yes** — E1/E2 are audience with purpose held constant | Why a practitioner is refused material MAIA may hold |
| **USE / CROSSING AUTHORITY** | `mayCross`; *"Idempotency … must not turn old evidence into fresh authority"*; a `crossed` receipt does **not** authorize a second crossing | `BoundaryOutcome`, `MintOutcome`, `ask_authorization_acts`, `manuscript_revision_authorizations` | **Yes** — spent while standing is unchanged | Why identical material may cross once and not twice |
| **REFUSAL** | `minted` excluded from the refusal arm *by type*; `attempted` vs `crossed`; `reading_unknown` conflates "not yours" with "does not exist" | `BoundaryOutcome`, `MintOutcome`, `StandingRefusal` | **Yes** — a refusal is an outcome, never a low standing | *Nothing crossed* and *may have crossed, unprovable* collapse into one |
| **WITHDRAWAL** | `withdrawn_by_member` refuses a later confirmation; *"may not resurrect the old assertion"* | `valid_to`, `'rejected'`, `'dismiss'`, `'revoked'`, `declined_at` | **Yes** — refusal precedes a crossing, withdrawal follows a standing | Why a confirmation can be **refused** by a prior member act |

### 4.2 · REQUIRED, BUT THINLY EVIDENCED — carried with their falsifiers

| Concept | Status | Falsifier D9-B should run |
|---|---|---|
| **EPISTEMIC STANDING** (confidence, as distinct from provenance) | **PROVISIONAL.** `significance` is the only carrier and `formMemory` assigns it **from `memory_type` alone** (0.60–0.95, no member input); `confirmed_by_user` adds ≤0.0225 | If `significance` is a pure function of type, it is **provenance-derived and not an independent axis.** Show one case where two candidates share provenance, participation and time and differ in standing by a member-reachable act |
| **SUCCESSION** (a new claim replaces an old one) | **PROVISIONAL.** `'superseded'` exists in `interpretive_ledger` (MAIA's interpretations); member-claim succession lives in `scripts/research/…/claim-standing.ts`, which **requires `authoredBy === 'member'`** and is not in `lib/` | If every observed case is expressible as *withdrawal of A* + *assertion of B*, succession is a **derived relation, not a primitive.** Show one case that is not |

### 4.3 · REJECTED

| Rejected | Why |
|---|---|
| **REPRESENTATION AUTHORITY as a concept separate from USE/CROSSING AUTHORITY** | ⛔ **Not earned by D9-A.** The organism has exactly one governed warrant and it governs crossing. Admitting two here would smuggle in the answer to §2.7 and §5's open half. Carried as **one** concept with an **unresolved split** (§6.3, §9 K1) |
| **INQUIRY as a standing property** | Falsified in §3.2. It is a capability/act |
| **CONFIRMATION/ADOPTION as one concept** | Falsified in §3.3 |
| **A general "epistemic level" scalar** | Falsified in §3.1; re-collapses `pdc-1` |

---

## 5 · REPRESENTATION-AXIS RULING

> *Does D9-A evidence support representation as a terminal level of epistemic authority, or does
> representation require an independent, purpose-bound warrant regardless of how strong the
> underlying epistemic standing becomes?*

### 5.1 · The terminal-ladder reading, run on its strongest ground

Three live sites behave exactly as it predicts, and this is not a strawman — it is how much of the
organism actually behaves: recall consents are single booleans on `members`, so standing once
established flows to every consumer; the atoms loader treats persisted, non-rejected material as
surfaceable; and the Writer's Studio revision path does run as a clean ordered sequence.

### 5.2 · What defeats it

**All three are sites the census found ungoverned or scope-confined.** The booleans are P-1, the
purpose-travel defect. The atoms loader is X9, the finding that confirmation confers nothing.
The one real ladder is confined to one room and terminates in a **mutation**, not a representation.

Against that, the governed evidence, taken in the order the instruction names:

| Consideration | What it shows |
|---|---|
| `representation_authority` **absent repo-wide** | The organism has **no** terminal representation level to point at. Symmetric absence — it refutes the claim that terminal-ladder is *implemented*, and by itself favours neither model |
| Writer's Studio disclosure authority | A warrant: consumed, purpose-named (`boundary`), fail-closed, and **refused derivation from crossed content** — *"only the writer can turn it into AUTHORITY"* |
| **Disclosure receipt ≠ continuing authority** | ⭐ **Decisive, and live.** *"Idempotency may prevent duplicate evidence. It must not turn old evidence into fresh authority."* An already-`crossed` receipt does not authorize a second crossing. **The epistemic standing of the Work is byte-identical across the two crossings. What was spent is the warrant.** A terminal-ladder model has no term that changed |
| `p.text` at representation | Admission metadata does **not** survive to the boundary. If representation were the top of a standing ladder, standing would have to be *present* there. It is absent |
| Cross-purpose recall travel | The only terminal-like behaviour in the organism, at the one site with no governance |
| First-person drafting / adoption | E4: authorization names one exact version; **changed wording voids it.** Conviction is irrelevant to the warrant |
| External-human consumers | E1: the client's own material — maximal standing, member-authored, present, valid — is **structurally unreachable** by a practitioner. If representation were terminal on standing, E1 could not exist |
| Synthesis / derived claims | Provenance is minted and then dropped at retrieval. It governs neither admission nor representation — so representation is not tracking standing in either direction |

### 5.3 · RULING

> ## **INDEPENDENT-WARRANT SUPPORTED**

⛔ Not a hybrid, and not hedged. Representation is **not** the terminal level of epistemic
authority. Every deliberately governed boundary in the organism is a purpose-bound warrant, and the
receipt case shows a warrant being **spent while standing is unchanged** — which no terminal model
can produce.

### 5.4 · What the ruling does NOT settle, stated so it cannot be quietly widened

The organism's one governed warrant governs **crossing into cognition**. Whether *representation*
is a **second, distinct warrant** or **the same warrant at a further reach** is **UNRESOLVED**
(§2.7). The ruling establishes that **warrant is independent of standing**. It does **not**
establish how many warrants there are.

⚠️ Consequently: the sentences *"MAIA can know more without thereby acquiring more rights over what
she knows"* and *"MAIA can become more confident in her own interpretation without that
interpretation becoming more authoritative as a representation of the human"* are **supported by
this ruling and are NOT constitutionalized by it.** D9-B must retain the right to destroy them.

**Status: ADJUDICATED HYPOTHESIS — ⛔ NOT CONSTITUTIONAL LAW.**

---

## 6 · HIGH-RISK CONTRADICTIONS CARRIED INTO D9-B

⛔ Not solved. Bound as adversarial targets.

### 6.1 · T-6 — withdrawal / fallback paradox · **STRUCTURALLY POSSIBLE**

**Mechanism, exactly.** `MemoryBundleService.getSemanticMemories` runs the non-vector baseline
first; *"If non-vector returns nothing, try vector search."* The baseline
(`CUT1_BASELINE_NONVECTOR_SQL`) carries `AND (valid_to IS NULL OR valid_to > NOW())` and
`AND content_text IS NOT NULL`. The vector SQL carries `WHERE user_id = $2 AND vector_embedding IS
NOT NULL` — **no validity predicate, no content predicate.**

The fallback's trigger condition is *the baseline returned zero rows* — the state a member
produces by withdrawing their memories. **A member who has withdrawn everything is the member for
whom the unfiltered path runs.**

**What D9-B must falsify:** that member withdrawal can be defeated by the retrieval path that
withdrawal itself makes reachable — i.e. that `withdrawal` is a warrant-side act whose enforcement
is not uniform across the reads it governs. ⛔ No repair proposed. ⛔ Production not read.

### 6.2 · S-2 — repetition / confirmation inversion · **STRUCTURALLY POSSIBLE** (operative status **UNKNOWN**)

Cut-1 gives system retrieval (`recall_count`, incremented by
`DevelopmentalMemoryService.incrementRecallCounts`, no member act) a maximum contribution of
**0.10** and member confirmation a maximum of **0.0225**.

⚠️ The loop is **partial**: the writer (`DevelopmentalMemoryService.recall`/`retrieveMemories`) and
the reader (`MemoryBundle.getSemanticMemories`) are different retrieval paths. Whether
`recall_count` is non-zero in production is **UNKNOWN** — no database read was performed.

**Authority consequence D9-B must attempt to falsify:** that a claim can gain practical
representational weight through **system repetition alone**, with no member participation act — a
warrant accruing from use. ⛔ No weights proposed.

### 6.3 · Representation stripping · **EVIDENCED**

Two instances, both live:

1. `render.ts` emits `p.text` only. `authoredBy` / `participationClass` / `authority` govern
   admission and are absent at the boundary they would matter at.
2. `manuscript_draft_sections` has no authorship column. After adoption, MAIA's wording is
   indistinguishable from the member's **in the Work**; the distinction survives only in the
   authorization chain.

**Distinction potentially lost:** everything §4.1 calls PROVENANCE, MEMBER PARTICIPATION and
TEMPORAL STANDING. What crosses is text; what governed the crossing does not cross with it.

**What D9-B must falsify:** that a warrant can be discharged without its basis travelling to the
point of use — and, specifically for §2.7, whether the *absence* of provenance at representation
is what makes retrieval-warrant and representation-warrant indistinguishable.

### 6.4 · Purpose travel · **EVIDENCED** (scope partly UNKNOWN)

`lib/maia/roomComposition.ts` composes `loadPriorCrossSessionExchanges` and
`loadMemberMemoryAtomsForPrompt` **directly**, not through `PRODUCER_REGISTRY`, for
`/api/now-what/interview` (5 client refs) and `/api/maia/vision-studio/interview`
(0 client refs — reachability **UNKNOWN**). The gate is `members.conversational_recall_enabled`,
**one boolean on the member row**, carrying no room, consumer or purpose dimension.

**The authority transition occurring, or potentially occurring:** a warrant constituted for one
consumer is **discharged for a different consumer**, and the room-admission machinery that would
have refused it (`not_registered_for_room`) is not on the path at all. This is the organism's
clearest instance of **standing being treated as if it were warrant**.

### 6.5 · Synthesis laundering · **UNKNOWN**

Derived synthesis is minted `generatedBy: 'synthesis'` and DB-enforced at write; the provenance
column is **not selected** at retrieval; representation carries `'Member' | 'MAIA'` as **prose**.
So a derived claim reaching cognition is distinguished from member-stated material **only by text
a model must interpret.**

**No path was found** by which MAIA synthesis becomes a member-standing object
(`member_memory_atoms` writers were not exhaustively censused). **Classified UNKNOWN, not
disproved.**

**What D9-B must establish:** whether any path exists by which derived synthesis acquires
member-standing status **without a member act** — the laundering question proper.

---

## 7 · POSITIVE CAPABILITIES THAT MUST SURVIVE

⭐ D9 must not pass by prohibiting relationship. Positive controls for D9-B: a boundary model that
refuses any of these is **wrong**, not safe.

Status column = what D9-A observed, not what should be built.

| # | Capability | Observed status |
|---|---|---|
| P1 | member directly states something | **LIVE** — minted `member` / `member-utterance`, DB-enforced |
| P2 | MAIA remembers it when lawfully usable | **LIVE** — gated by posture, recall preference, scope, register |
| P3 | MAIA offers an explicitly attributed interpretation | **LIVE** — `PatternChips`/`PatternDrawer`, mounted, with evidence route |
| P4 | member rejects that interpretation | **LIVE** — `feedback` → `expired` → `valid_to = NOW()`; atoms `decline` route |
| P5 | member confirms something | **LIVE for patterns** (`confirmed_by_user`) · **ABSENT for atoms** (`confirmed`/`modified` have no runtime writer) |
| P6 | member asks MAIA to draft first-person language | **LIVE** — Writer's Studio revision offers |
| P7 | member adopts a MAIA-authored draft **without provenance being rewritten** | ⚠️ **PARTIAL** — nothing is rewritten because **nothing is recorded at the artifact**; the chain retains it. *Not-rewritten and not-represented are different, and D9-B must not accept the second as the first* |
| P8 | member corrects a previously adopted/current claim | **LIVE** — `refine` → `updated`; S5 correction-by-derivation |
| P9 | successor becomes current while predecessor remains historical | ⚠️ **PARTIAL** — `'superseded'` and `'held_lightly'` exist in `interpretive_ledger`; member-claim succession is in `scripts/research/`, not `lib/` |
| P10 | member authorizes representation for a specific purpose/audience | **LIVE** — `ask_authorization_acts`, `manuscript_revision_authorizations` |
| P11 | that authorized representation occurs | **LIVE** — `crossed` receipt; `accepted_at` + `resulting_version` |
| P12 | authorization does not silently propagate elsewhere | ⚠️ **LIVE in Writer's Studio · VIOLATED at P-1** |
| P13 | member withdraws authority without historical falsification | **LIVE** — `valid_to` with the row retained; `'revoked'` = *evidence remains*. ⚠️ Exception: §6.1 |

---

## 8 · REVISED FALSIFIABLE BOUNDARY HYPOTHESIS

⛔ No schema, database representation, TypeScript, enums, API contracts, migration, storage or
runtime design. Concepts only.

### 8.1 · The model

The evidence earns the two-part shape, and names the unit as the **crossing**:

```
WHAT MAIA HOLDS  ── a CLAIM / MATERIAL
    provenance            who authored it, and what generated it
    temporal standing     when it happened; whether it is presently current
    member participation  how it arrived (placed · marked · declared · authored · retrieved)
    [epistemic standing]  PROVISIONAL — see §4.2
                │
                │  ⛔ confers nothing. Holding is not permission.
                ▼
WHAT MAIA MAY DO ── an authorized CROSSING
    consumer · purpose · audience
    use authority         granted, bound, spent
```

**The two governing propositions, each falsifiable:**

> **H1.** Holding confers no permission. No quantity or quality of provenance, time, participation
> or confidence produces a warrant.
> *Witness:* an already-`crossed` receipt does not authorize a second crossing, with the material
> unchanged. *Falsified by:* any site where improving a claim's standing widens what may be done
> with it, by design rather than by drift.

> **H2.** A warrant confers no standing. Discharging a warrant does not make the underlying claim
> more true, more current, or more the member's.
> *Witness:* adoption mutates the Work and writes no authorship; the offer's `authority` records
> the reading, not a truth. *Falsified by:* any site where exercising authority alters the claim's
> provenance, currency or attribution.

**Two structural claims, also falsifiable:**

> **H3.** Inquiry is a **capability**, not a standing property — bound, expiring, single-use, with
> claim and completion as separate positive facts.

> **H4.** Confirmation, adoption, refusal, withdrawal, correction and succession are **acts /
> transitions**, not values on one ordering. Refusal has an unprovable middle (*may have crossed,
> unconfirmed*); withdrawal retracts standing while the record stands.

### 8.2 · ⭐ THE FOUNDER'S CORRECTION, APPLIED — *monotonicity is not claimed*

The prior record's *"Standing … is monotonic"* is **withdrawn.** D9-A did not earn it, and the
census evidence cuts against it as a composite claim. The correction resolves into a split the
organism already carries:

| Axis | Behaviour | Evidence |
|---|---|---|
| **PROVENANCE** — *the member really said this* | **Accrues; never revised in place.** Correction creates a new object with derivation lineage | S5: *"Correction means a new object with `derivation` lineage, never an edit"*; `conversation_turns` INSERT-only under the mint gate |
| **PRESENT STANDING** — *what MAIA may presently regard as the member's position* | **NON-MONOTONIC.** It can be withdrawn, superseded, revoked, held lightly, and it does not return by default | `valid_to` with the row retained; `withdrawn_by_member`; `'revoked'` = *"member cleared influence (evidence remains)"*; `'held_lightly'` = *"evidence retained, interpretation inactive"* |

> The member's 2026-01 *"I want X"* remains **an event that occurred** and ceases to be **a
> position they hold.** One axis is additive; the other is revocable. Collapsing them is the same
> error the ladder made one level up.

**Falsifier:** show a member-reachable act that erases the *record* of an utterance rather than its
standing — or one that restores standing without a fresh member act. Either breaks the split.

### 8.3 · What this model deliberately does not assert

* **How many warrants there are.** §5.4. `USE / CROSSING AUTHORITY` is carried as **one** concept
  with an unresolved split, not two.
* **That epistemic standing is independent** of provenance. §4.2, provisional with its falsifier.
* **That succession is primitive.** §4.2, provisional with its falsifier.
* **That any of this is law.** §5.4.

---

## 9 · UNKNOWNS

⛔ Not forced into the hypothesis. An UNKNOWN is a valid D9-A outcome. Each names what **D9-B must
attack**, not what implementation must solve.

| # | Unknown | D9-B attack |
|---|---|---|
| K1 | Is representation a **second** warrant, or the **same** warrant at a further reach? | Construct a **live** case: knowledge already lawfully held and crossed, representation independently refused. If none can be constructed, the two are one |
| K2 | Is `refuseBorrowedFirstPerson` a representation **law** or an enforced rendering **convention**? | Its only consumer is an unawaited, env-gated, allowlisted shadow. Determine which, before §5.2's evidence list relies on it further |
| K3 | Does E4 (mutation of an artifact) generalize to **speech**? | If it does not, the hypothesis is true of Works and unproven of conversation — which is most of MAIA |
| K4 | Are T-6 and S-2 **operative or latent**? | Both are repository facts only; no database read was performed |
| K5 | Is `vision-studio/interview` member-reachable? | Decides whether P-1 is one room or two |
| K6 | Does any path make MAIA synthesis a **member-standing** object without a member act? | `member_memory_atoms` writers were not exhaustively censused (§6.5) |
| K7 | Is `significance` a pure function of `memory_type`? | If yes, EPISTEMIC STANDING is not an independent axis (§4.2) |
| K8 | Is member-claim **succession** expressible as withdrawal + assertion? | If yes, succession is derived, not primitive (§4.2) |
| K9 | Do dynamic `import()` / string-dispatch sites reach modules recorded as having zero static callers? | Census method limit |
| K10 | Did the unrecorded D9-A charter impose obligations beyond §§A1–A6? | §1.1 |

---

## 10 · STANDING

```
D9-A CENSUS                ✅ COMPLETE
D9-A ADJUDICATION          ✅ DELIVERED
  surviving distinctions     SURVIVES 7 · FALSIFIED 1 · UNRESOLVED 2
  ladder                     ❌ FALSIFIED on all six questions put, plus one not put (§3.7)
REPRESENTATION-AXIS RULING ✅ INDEPENDENT-WARRANT SUPPORTED
                           ⛔ ADJUDICATED HYPOTHESIS — NOT CONSTITUTIONAL LAW
MONOTONICITY CLAIM         ⛔ WITHDRAWN by founder correction; split recorded (§8.2)
PRIOR ADJUDICATION FILE    ⚠️ SUPERSEDED IN SCOPE, PRESERVED, NOT REWRITTEN
D9-A FREEZE                ⛔ NOT TAKEN — founder act
D9-B                       ⛔ NOT BEGUN · harness ⛔ NOT BUILT · targets fixed at §6 + §9
F5                         ⛔ HOLD
SPM                        ⛔ CLOSED — unaltered
REPAIR                     ⛔ NOT AUTHORIZED — T-6 · S-2 · purpose travel · representation
                              stripping · every ABSENT: recorded, unrepaired
PRODUCTION                 ⛔ UNTOUCHED — no database read, no runtime observation
SOURCE                     ⛔ UNCHANGED — no lib/ app/ database/ components/ prompt or test
```

> *Adjudication changes the model of the evidence. It does not authorize changing the organism.*
>
> *Provenance accrues. Standing can be taken back. Warrant is granted and is spent.
> The census found an organism that governs the third wherever it was designed,
> and assumes the first two are the same thing wherever it drifted.*

**STOP.**
