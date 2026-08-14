# Relationship Room Constitution — Pre-Ratification Authority Reconciliation

**Run:** 2026-08-10 · read-only governance reconciliation · no edits to any source artifact,
no code, no schema, no ratification.
**Question:** may `docs/canon/RELATIONSHIP_ROOM_CONSTITUTION.md` be safely ratified given a
parallel authority discovered after it was written?

> ⛔ This document decides nothing. It is a decision instrument. Per
> `RATIFICATION_BOUNDARY_PRECEDENT_2026-07-26.md`, ratification occurs only through an
> explicit act of the designated authority; nothing here advances any document's status.

**FINAL CLASSIFICATION: `R3` — FOUNDER RULING REQUIRED BEFORE RATIFICATION.**
One narrow scoping decision (§7 D-1, Sanctuary) is required. It is substantive, not
editorial, therefore not `R2`. No article contradicts the parallel audit's findings, so it
is not `R4`; source authority is establishable, so it is not `R5`.

---

## 1. AUTHORITY / PROVENANCE MAP

| | **Relationship Room Constitution** | **Relational Field Functional Sovereignty Audit (FSA)** |
|---|---|---|
| Path | `docs/canon/RELATIONSHIP_ROOM_CONSTITUTION.md` | `docs/architecture/audits/RELATIONAL_FIELD_FUNCTIONAL_SOVEREIGNTY_AUDIT_2026-08-10.md` |
| Size | 254 lines | 283 lines |
| Date | 2026-08-10 | 2026-08-10 (same day) |
| Branch | `feature/labtools-redesign` | `feature/labtools-redesign` |
| Git state | **UNTRACKED (`??`)** — no commit | **UNTRACKED (`??`)** — no commit |
| Reachable from trunk `clean-main-no-secrets` | **NO** | **NO** |
| Governing mandate | Founder ruling **R9** in the Relational Experience Audit: *"THE RELATIONSHIP ROOM CONSTITUTION will be authored separately and settles five things before any UI work."* | `docs/specs/RELATIONAL_FIELD_FUNCTIONAL_SOVEREIGNTY_AUDIT_PROMPT_2026-08-10.md` (142 lines, also untracked) |
| Status claimed | **PROPOSED — awaiting founder ratification** | Completed audit; classification issued |
| Classification | Level 1 constitutional law (proposed) | Level 3 implementation-state finding + Level 2 architectural classification |
| Authorizes | ⛔ nothing — "no code, no schema, no migration, no UI" | ⛔ nothing — "STOP. No implementation performed" (one exception, below) |

**Both artifacts are on the same branch, both untracked, neither cites the other.**
Grep confirms zero cross-references in either direction — the parallelism is real, not
merely unacknowledged.

### 1a. Ratified founder rulings actually present

Verified in `docs/design/reviews/RELATIONSHIP_PAGE_RELATIONAL_EXPERIENCE_AUDIT_2026-08-10.md`
(§ ruling table, lines 72–80). **R1–R9 exist and are marked ratified.** Load-bearing here:

- **R2** — no further visual redesign until the relational substrate is repaired. The
  substrate chain it names ends **"→ observer provenance → MAIA context."**
- **R3** — third-party relational sovereignty leaves that document into its own governed unit.
- **R4** — WORKED/HELD promoted to foundational concept. **R5** — condition of being.
- **R6** — the hearth is the member speaking; MAIA is present at it.
- **R7** — the object is *my relationship with [person]*; the Between is not permission.
- **R9** — the Constitution is authored separately.

The Constitution's header claim that **Articles II–IV, VIII, IX restate or extend R3–R7 is
verified accurate.** Article VI ↔ R5, Article V ↔ R4, Article VIII ↔ R6, Articles I/III ↔ R7,
Article IX ↔ R3. **Source authority is establishable. This is not R5.**

⚠️ One provenance nuance: R9 states the Constitution will be authored *by the founder*. The
recorded document was agent-drafted and correctly marked **PROPOSED**, which is the
compliant posture — but ratification is therefore an authorship act as well as an approval act.

### 1b. FSA contents classified by weight

⛔ Not all FSA prose carries equal authority. Sentence-class breakdown:

| Class | FSA content |
|---|---|
| **A — Empirical findings** (production SELECT, minisforum) | §0b provenance table: 29/43 relationships are the auto-created catch-all; 1139/1157 entries sit inside it; 1139 entries carry `confidence` (⇒ observer-inferred), 18 NULL; last 30 days **129 inferred / 0 declared**. §2: 34 pattern rows, `relationship_field_state` 10 rows. §0: `runtime_events.is_sanctuary` = 5 (all 2026-06-14); `conversation_turns.posture_at_creation` zero sanctuary rows; 6 `relationship_entries` + 4 signals inside the 34-minute sanctuary window. |
| **A — Source-read findings** | Live route imports exactly three relational symbols, all writes. Read path `getMemberActiveRelationalContext` + `buildRelationalContextBlock` has exactly one caller: `app/api/oracle/conversation/route.ts:2402`, a **410 Gone** route. No `superseded_at` / `corrected_by` / provenance / withdrawal column on `relationship_entries`. `posture_at_creation` absent from all three relational tables. |
| **B — Architectural classification** | **Classification D — ARCHIVAL ONLY** (against the mandate's own A–E scale). "Accumulation without retrieval." "Severed read," analogous in shape to the M0 spiral-state severed write. |
| **C — Founder-approved rulings** | ⛔ **NONE.** The FSA contains **no founder ruling.** It repeatedly defers: *"a founder decision and is not resolved here"*; *"Founder decision, not an engineering fix."* |
| **D — Recommendations** | RU-0…RU-4, explicitly *"proposed, NOT executed."* RU-4 carries the strongest prohibitive language in the document — and it is a **recommendation**, not a ruling. |
| **E — Provisional / explicitly unresolved** | Sanctuary-window attribution marked **UNPROVEN** — `runtime_events.member_id_prefix` NULL on all five rows; disposition of pre-fix rows explicitly left open. |

⚠️ **RU-0 is the one place the FSA left read-only posture**: a code fix landed on
`feature/labtools-redesign` (guard + required `RelationalObservationPosture` + regression
test, 7/7; 72/72 suites; typecheck 237 vs 239 baseline), **not deployed**. It changed
containment only; §1–§4 and Classification D stand unchanged.

---

## 2. THE "ARCHIVAL ONLY" RULING — QUOTED, WITH SCOPE ESTABLISHED

Verbatim, the entire classification block (FSA lines 7–13):

> ## CLASSIFICATION: **D — ARCHIVAL ONLY**
>
> Relationship data is stored and displayed. It carries **no correction
> authority, no currentness authority, and no withdrawal authority**, and it
> **does not reach MAIA's prompt at all** on the live conversation route.
>
> Plus one **first-order containment finding** (§0), elevated per instruction.

The scope-bearing sentence is in §4:

> **No `member_relationships` / `relationship_entries` data reaches any prompt.**

And its explicit anti-conflation guard, same section:

> ⚠️ **Do not conflate two different objects.** `loadRelationshipEssence`
> (`MemberLiveContext.ts:394`) *is* live — but it reads `relationship_essences`,
> the **MAIA↔member dyad**, a different table from the member's relationships
> with **other people**.

Plus the mandate's own out-of-scope clause:

> `relationship_spaces` (consent-gated practitioner/client spaces) — a
> different constitutional object; do not conflate with `member_relationships`

### ⭐ SCOPE, STATED PRECISELY

**"Archival only" is a DESCRIPTION of present functional state, not a PROHIBITION.**
It is Classification D on the mandate's A–E scale, applied to the **member-to-other-person
relational corpus** — `member_relationships`, `relationship_entries`,
`relationship_entry_patterns`, `relationship_field_state`, `member_relational_signals` —
observed on the live conversation route as of 2026-08-10.

It **excludes**: `relationship_essences` (MAIA↔member dyad, live), `relationship_spaces`
(a different constitutional object), and every non-relational memory lane.

It **does not** modify a table, a service, a route, "all `member_relationships` memory," or
relational memory as a product concept. It reports that MAIA today **writes** relational
material and **reads back none of it**, because the sole consumer of the read path is a
410-retired route.

⛔ **The only prohibitive sentence in the whole document is RU-4**, and it is a
recommendation, quoted here so its weight is not inflated:

> **RU-4 — Read seam.** Decide whether relational context should reach the live
> prompt at all. ⛔ **Not a reconnection task.** Re-attaching a severed read of a
> 98%-inferred, provenance-blind, non-withdrawable corpus would ship the wrong
> thing quickly. RU-1/2/3 gate this. **Founder decision, not an engineering fix.**

So the strongest available reading is: *reconnection is gated pending founder decision* —
**not** *relational memory is permanently barred from MAIA*.

---

## 3. OVERLAP WITH ALL TWELVE ARTICLES

| Art. | Subject | Contact with FSA | Class |
|---|---|---|---|
| **I** | The Object | None directly; FSA §0b's "member-*triggered*, system-*authored*" corroborates I's fear that the member disappears from the grammar. | **A** (corroborating) |
| **II** | Relational Authorship | **Strong.** II names as "a constitutional fault" that MAIA has a *rupture* write path no member surface offers; FSA §0b quantifies it (98% inferred, 129/0 last 30 days) and §1 shows the member can edit the label but not the 1139 entries. II demands correct-or-withdraw; FSA §1 = partial, §3 = **wholly absent**. | **A** (Level 1 vs 3) |
| **III** | The Between | None empirical. III's *"In my experience, …"* prefix test is a rendering rule; FSA touches no rendering. | **A** |
| **IV** | Memory | **Primary contact — see §4.** | **B + D** |
| **V** | Worked / Held | Contact via V's "machinery … should be incapable of firing rather than merely quiet." FSA §2 shows the one TTL mechanism is **advisory, enforced nowhere**. Corroborates V's "incapable, not quiet" requirement. | **A** (corroborating) |
| **VI** | Condition of Being | "Conditions may not be derived by the system." FSA §0b shows `confidence`-bearing inference is the dominant corpus; VI would forbid deriving a *condition* from it. No present derivation of `bond_type` by model is reported. | **A** |
| **VII** | Change, Ending, Death | "Deletion may not be the only available form of completion." FSA §1: **`DELETE` → `archived_at`, whole relationship, all-or-nothing** — the only remedy is archiving everything. **VII is presently violated by the implementation.** Level 1 vs 3, so not a conflict, but the Constitution is right and the code is wrong. | **A** (corroborating) |
| **VIII** | MAIA | **Second-strongest contact — see §5 Q3/Q4.** VIII grants MAIA leave to *"witness · remember · reflect … surface the member's own history back to them."* FSA §4: MAIA reads none of it. | **B** |
| **IX** | Third-Party Sovereignty | Restates R3. FSA §0b's correction (member's own speech + machine detection, not characterization) narrows IX exactly as IX itself states. | **A** (mutually reinforcing) |
| **X** | System Containers | **Direct numeric contact.** X: catch-all renders "for 29 of 44 rows." FSA §0b: "**29 of 43**." Same 29; denominators differ. | **B** (factual reconciliation) |
| **XI** | Time | "No silent truncation… a record that quietly stops is worse than one that says where it stops." FSA §2: `expires_at` is set but never enforced — a record that quietly stops mattering without saying so. | **A** (corroborating) |
| **XII** | Soul Test | Method article. No FSA contact. | **A** |
| **—** | **Sanctuary** | ⚠️ **NO ARTICLE EXISTS.** Constitution mentions Sanctuary **0 times**; the synthesis it was built on mentions it **20 times**; FSA §0 reports a **first-order containment breach** in exactly this substrate. **See §7 D-1.** | **D** |

---

## 4. ARTICLE IV — DEEP COMPARISON

Article IV, principle sentence:

> Where explicit relationship identity exists, material generated in that room belongs to
> that relationship unless the member explicitly places it elsewhere. Relational memory
> preserves: relationship identity · source · authorship · provenance · epistemic status · time.

**Four independent observations.**

**(a) Levels differ, so the headline reading is NO CONFLICT.** Article IV is Level 1 —
what the system *ought* to preserve. Classification D is Level 3 — what the code *does*
today. *"This store is archival-only today"* and *"relationship memory belongs to its
relationship"* are not competing claims. Applied symmetrically: neither does IV's
aspiration override anything, because there is no prior prohibition for it to override —
RU-4 is a recommendation, not a ruling.

**(b) IV's preservation list is presently counter-factual, and IV does not say so.**
IV requires memory to preserve **source · authorship · provenance · epistemic status**.
FSA §1 establishes the schema cannot: `relationship_entries` is
`(id, relationship_id, member_id, kind, felt_signals, free_text, maia_reflection,
pattern_hint, field_tone_snapshot, suggested_movement, content, confidence, created_at)` —
**no provenance column at all**, with `confidence IS NOT NULL` the only inference tell,
"incidental, not a provenance contract." IV states the requirement in the present
indicative (*"preserves"*), which reads as a description of a live property. It is an
obligation not yet met. This is a **B — WORDING TENSION** and the cleanest available redline.

**(c) IV's own numbers are FSA-consistent.** IV cites 1,139 historical observer rows;
FSA §0b independently reports 1139 inference-bearing entries. **Mutually corroborating —
strong evidence both artifacts read the same production reality.**

**(d) IV is silent on disclosure.** "Belongs to" is a **custody/placement** claim. It says
where material lives and who it is filed under. It contains no verb of surfacing,
retrieval, or prompt assembly. Standing alone, **IV does not imply prompt injection.**
The availability language lives in **Article VIII**, not IV.

---

## 5. THE SIX QUESTIONS, ANSWERED

**Q1 — Does "archival only" prohibit Relationship Room memory from EVER reaching MAIA?**
**No.** It is a descriptive classification of present state, issued against the mandate's
own A–E scale. The nearest thing to a prohibition is **RU-4**, which is an
agent recommendation that explicitly routes the question to the founder and gates it on
RU-1/2/3 (provenance → correction → withdrawal). Nothing in the FSA forecloses future
conversational availability.

**Q2 — Or does it prohibit use of a specific legacy implementation/path?**
**Closer, but still not a prohibition — it is a report of severance.** The specific path is
`getMemberActiveRelationalContext` + `buildRelationalContextBlock`, whose sole caller is
`app/api/oracle/conversation/route.ts:2402`, a route returning **410 Gone** (*"Legacy route
retired pending Sanctuary-governed persistence (S2, 2026-07-17)"*). That path is dead by
prior retirement, not by this audit. **The most accurate framing: reconnecting that
specific severed read is gated; relational availability in general is undecided.**

**Q3 — Does Article IV accidentally imply that every relationship store should be injected
into MAIA prompts?**
**No — not IV.** Per §4(d), IV is a custody rule with no disclosure verb. **But Article
VIII does carry an availability grant**: MAIA *"may: witness · remember · reflect … surface
the member's own history back to them."* Read together by a designer resuming work,
IV ("it belongs here") + VIII ("MAIA may remember and surface it") is a plausible reading
of pre-authorization for the very read seam RU-4 gates. That is the actual exposure, and
it sits at **VIII**, not IV.

**Q4 — Does the Constitution need to distinguish BELONGING from being automatically
SURFACED to MAIA?**
**Yes.** The distinction is currently implicit and load-bearing. Without it, the
Constitution is ratified law that can be read as settling a question the FSA expressly
reserved to the founder (RU-4).

**Q5 — Are there sovereignty reasons persistence authority and conversational availability
must remain separate?**
**Yes — three, each independently sufficient.**

1. **Sanctuary is absolute and is enforced at a different layer than belonging.**
   CLAUDE.md Sanctuary Invariant 6: *"Nothing from a Sanctuary session can be saved,
   extracted, inferred, or converted into long-term memory, under any circumstances,
   including by user request during the session."* FSA §0 establishes that
   `posture_at_creation` exists on `conversation_turns`, `member_memory_atoms`,
   `episodic_memories`, `member_theme_signals`, `agent_runs`, `integration_passes` — and
   **does not exist on `member_relationships`, `relationship_entries`, or
   `relationship_field_state`.** There is therefore *no column in which a sanctuary-origin
   relational row could even be recorded, and no way to find or purge one after the fact.*
   If belonging implied availability, a containment failure at write time would
   automatically become a disclosure failure at read time, with no interception point.
   **Separation is the only place a retrieval-time Sanctuary guard could live.**
2. **Article II's correctability requirement cannot presently be honored.** II gives the
   member authority to *"correct or withdraw what the system wrote about their
   relationship."* FSA §1: entry-level correction has no route and no column. FSA §3:
   withdrawal is *"wholly absent"* — "not a wiring gap," "no column in which withdrawal
   could be recorded." Surfacing a 98%-inferred, provenance-blind, non-withdrawable corpus
   into MAIA's voice would let system-authored inference speak as relational fact with the
   member holding no instrument to stop it. That inverts Article II inside Article VIII.
3. **The growth-obligation rule in CLAUDE.md.** *"Every increase in capability must produce
   a matching increase in provenance, restraint, and transparency."* Conversational
   availability is a capability increase; the matching provenance (RU-1) does not exist.
   The rule is structurally identical to RU-4's gating, arrived at from canon rather than
   from the audit.

**Q6 — HYPOTHESIS TEST: does the Constitution need language such as *"Belonging does not
imply automatic disclosure or prompt inclusion"*?**

⚠️ Tested as a hypothesis, not confirmed as a conclusion. **VERDICT: SUPPORTED — with one
material correction to its placement.**

*Supporting:* Q5's three grounds hold independently of the FSA's authority weight. Even if
the FSA were discarded entirely, Sanctuary containment and Article II correctability would
still require the separation. The Constitution's own §"three things this document keeps
apart" already separates member experience / machine classification / third-party
characterization — the belonging-vs-disclosure axis is the same discipline applied to a
different dimension, and its absence is an inconsistency within the document.

*Correcting the founder's framing:* the inference locates the risk in Article IV. **The
evidence puts it in Article VIII.** Article IV is a custody rule with no disclosure verb
(§4(d)); Article VIII is where MAIA is granted leave to *remember* and *surface*. A
clarifying sentence placed only at IV would leave the actual exposure untouched. If placed
at all, it belongs at **both** — declaratively at IV, operatively at VIII.

*Not supporting an over-broad version:* the sentence must **not** be written so as to
prohibit disclosure. That would silently resolve RU-4 in the negative and freeze into canon
a Level-3 severance the FSA explicitly refused to resolve. The correct form separates the
two authorities; it does not decide the second.

---

## 6. PROPOSED REDLINES — ⛔ NOT APPLIED

⛔ These are proposals only. No edit was made to `RELATIONSHIP_ROOM_CONSTITUTION.md`.

**PR-1 (Article IV, append to BOUNDARY) — separates the authorities.**
> Belonging is custody, not disclosure. That material belongs to a relationship establishes
> where it is held and under whose authorship — it does not by itself authorize its
> retrieval into any conversation, prompt, or model input. Persistence authority and
> conversational availability are separate authorities and are granted separately.

**PR-2 (Article IV, IMPLICATION) — removes the counter-factual present indicative.**
Change *"Relational memory preserves: …"* to *"Relational memory **must** preserve: …"*, and
append: *"The present schema does not; that is an unmet obligation of this article, not a
description of the system."*

**PR-3 (Article VIII, append to BOUNDARY) — closes the actual exposure.**
> MAIA's leave to remember and to surface the member's own history is a permission in
> principle, not a standing authorization for any particular store. What relational material
> may reach MAIA, from which store, under what provenance and withdrawal guarantees, is
> decided separately and is not settled by this article.

**PR-4 (new Article, Sanctuary) — ⚠️ substantive; requires the §7 D-1 ruling first.**
> Sanctuary is prior to belonging. Material originating in a Sanctuary session does not
> belong to a relationship, is not held, and does not exist to be surfaced. Where a store
> cannot record the posture under which a row was created, it cannot demonstrate compliance
> with this article.

**PR-5 (Article X) — factual.** Reconcile "29 of 44 rows" against the FSA's independently
measured "29 of 43", or state the as-of basis for each.

---

## 7. FOUNDER DECISIONS REQUIRED

### ⭐ D-1 — AUTHORITY AMBIGUITY (the R3 trigger). Article IV's scope vs Sanctuary.

Article IV: *"material generated in that room belongs to that relationship."* **"That room"
is undefined.** Two readings, and the Constitution does not say which governs:

- **Narrow** — only material the member authors inside a Relationship Room surface. Then
  Article IV never touches Sanctuary, and no conflict exists. Under this reading the
  1,139 observer rows are **outside** Article IV entirely, which sits oddly with IV's own
  BOUNDARY, which discusses exactly those rows.
- **Broad** — includes observer-generated relational material from MAIA conversation, which
  is **98% of the actual corpus** and the only reading under which IV's BOUNDARY is
  coherent. Under this reading Article IV asserts belonging over material that, when
  Sanctuary-originated, Sanctuary Invariant 6 says must never have been retained at all —
  and FSA §0 establishes there is **no column in which such origin could be recorded**, so
  compliance is not merely unmet but **unprovable**.

⛔ **I do not pick a winner.** Evidence on both sides is above. The founder must scope
"that room," and decide whether a Sanctuary article (PR-4) enters the Constitution before
ratification. **This is why the classification is R3 and not R2.** Note that ratifying a
twelve-article relational constitution that never names Sanctuary would freeze that silence
into canon, against a synthesis that discusses Sanctuary twenty times.

### D-2 — B / WORDING TENSION. Does ratification of Article VIII pre-authorize RU-4?

VIII grants MAIA leave to *remember* and *surface*; RU-4 reserves the read seam to the
founder. Neither presently binds (VIII is proposed; RU-4 is advisory), so this is **not** a
C-class conflict. But ratifying VIII unamended may be read downstream as having answered
RU-4 in the affirmative. PR-3 resolves it without deciding RU-4 either way.

### D-3 — Carried forward, unresolved by design (FSA §0, RU-0)

Disposition of relational rows written before the RU-0 fix — including the 6 entries and 4
signals in the 2026-06-14 sanctuary window, attribution **UNPROVEN** — remains a founder
call. The FSA neither purged nor recommended purging. **Recorded here; not reopened.**
Related: the RU-0 fix is on `feature/labtools-redesign` and **not deployed**; production
still runs the unguarded call site.

---

## 8. IS RATIFICATION SAFE?

**Not yet — and the obstruction is narrow.**

*What is safe.* Articles I, III, V, VI, VII, IX, XI, XII show **no conflict** with the FSA;
several are **corroborated** by it (V ↔ §2 unenforced TTL, VII ↔ §1 all-or-nothing archive,
XI ↔ §2, IX ↔ §0b's narrowing correction). Article IV's 1,139-row figure independently
matches FSA §0b, which is strong evidence both artifacts read the same production reality.
Article II names as a constitutional fault exactly what FSA §0b quantifies. **The
Constitution is not contradicted by the parallel authority — it is largely confirmed by it.**

*What obstructs.* One scoping ambiguity (**D-1**) that intersects an absolute ratified
boundary the Constitution never mentions. That is substantive.

*What does not obstruct.* Classification D. It operates at a different level, decides
nothing the Constitution asserts, and contains no founder ruling. **Any claim that the
Constitution conflicts with the Functional Sovereignty Audit is not supported by the text.**

### Recommended sequence

1. Founder scopes **D-1**; decide whether PR-4 (Sanctuary article) enters.
2. Apply **PR-1, PR-2, PR-3, PR-5** — clarifications, no substantive change.
3. Ratify by explicit act per `RATIFICATION_BOUNDARY_PRECEDENT_2026-07-26.md`.
4. **RU-4 stays open** and is not resolved by ratification. **R2** remains in force: no
   further visual redesign until the substrate is repaired.

---

## 9. BUILDER OS / GOVERNANCE TOOLING — RECORDED SEPARATELY

**Verified.** `scripts/builder` is present only on `feature/labtools-redesign`; it returns
**0 files** on trunk `clean-main-no-secrets` and **0 files** at production SHA `b00340cfc`.
⚠️ Minor: `ls scripts/builder` on the worktree shows **7 top-level entries**, not the 17
stated in the mandate — likely a recursive-vs-top-level counting difference. The
substantive fact (0 on trunk, 0 in production) is confirmed.

**CLASSIFICATION: `governance infrastructure drift` + `documentation provenance issue` —
NO BEARING on the substantive relational ruling.**

*Why no bearing.* Every load-bearing claim in both artifacts rests on evidence reproducible
without `scripts/builder`: production `SELECT` against `maia-postgres`, and source reads of
files in the main tree. Neither cites a builder script as evidence for any finding. The
FSA's own standing evidence rules require production data or named source seams per claim.
**Authority and reproducibility of the relational ruling are intact.**

*The sharper adjacent risk.* ⚠️ **All four relational governance artifacts are UNTRACKED
(`??`) and absent from trunk** — the Constitution, the FSA, the FSA mandate, and the entire
`docs/design/reviews/` tree containing the ratified R1–R9 synthesis. A ratified Relationship
Room Constitution whose ratified evidentiary basis exists only as uncommitted files on one
feature branch is a genuine continuity exposure, and it is a larger exposure than the
`scripts/builder` gap that surfaced it. The founder's framing — *"trunk cannot reconstruct
its own governance process"* — is accurate and applies to the **documents** at least as much
as to the tooling.

⛔ **Not fixed here.** Named as a separate future unit:

> **UNIT (proposed) — Governance artifact custody.** Establish where governance records
> (canon, audits, mandates, reviews) and governance tooling (`scripts/builder`) must live to
> be reachable from trunk, and land the four untracked relational artifacts under that rule.
> Prerequisite consideration: it is a **precondition of ratification** that the ratified
> document be durably reachable — an unratified draft may live on a branch; ratified canon
> arguably may not.

---

**END. No source artifact was modified. No document changed status. No code was touched.**
