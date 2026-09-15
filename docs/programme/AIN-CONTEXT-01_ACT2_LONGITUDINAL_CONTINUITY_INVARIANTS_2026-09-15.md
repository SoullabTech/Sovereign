# AIN-CONTEXT-01 · ACT 2 — LONGITUDINAL CONTINUITY INVARIANTS

**Lane**: `AIN-CONTEXT-01` — Context Assembly / Longitudinal Continuity
**Act**: 2 of 9. **LAW AND REQUIREMENTS. ⛔ NOT REPAIR, NOT DESIGN, NOT IMPLEMENTATION.**
**Opened by**: founder ruling, 2026-09-15 — *"ACT 1 sufficient. Do not repair C4 yet. Do not
activate `writeSummary`. Open ACT 2 to establish the continuity invariants and epistemic hierarchy
first."*
**Date**: 2026-09-15 · **Branch**: `claude/sweet-mayer-on4m5x` · **Predecessor**: ACT 1 census
`AIN-CONTEXT-01_ACT1_LONGITUDINAL_CONTINUITY_FAILURE_CENSUS_2026-09-15.md`

**Authority marking, used throughout**: **[F]** founder-authored — carried verbatim or in the
founder's own terms, not paraphrased into something else. **[J]** Jarvis-proposed — a candidate
for adjudication. ⛔ **Nothing in this document is ratified by being written here.** Kelly governs
what Soullab claims; this act proposes what the architecture must be held to.

---

## 0. WHAT THIS ACT IS FOR

ACT 1 established that MAIA's durable transcript and MAIA's accessible continuity are different
things with no connection between them on the canonical path. The obvious next move — populate the
empty summary slot — is the wrong one, and the founder's ruling names why:

> **[F]** *"Doing that now would turn a recoverability defect into an information-compression
> system before we have defined what must never be compressed away."*

⭐ ACT 1's most valuable finding was **C3: no summary layer is live.** That is a one-time
condition. Once a summarizer ships it becomes load-bearing, and every law written afterwards is
written against an incumbent. **ACT 2 exists to spend that window on law rather than on code.**

---

## 1. THE GOVERNING PRINCIPLE — LAYER 0

> ⚠️ **AMENDED IN PLACE by Amendment 1 (§A1–§A2), same day.** The principle below is correct and insufficient; the amendment widens it from *meaning through time* to *the living processes through which meaning changes*, and places the OS definition above it. ⛔ Kept verbatim as authored, never edited to read as if it had always said the wider thing.

**[F]** Carried as authored:

> **Relational continuity is not the persistence of information. It is the persistence of meaning
> through time.**
>
> MAIA must preserve enough of the history of an encounter to know not merely what has been said,
> but what became significant, what changed, what was corrected, what was relinquished, and what
> remains alive.

And the two constitutional statements beneath it:

> **A person must never be reduced to MAIA's accumulated representations of them. Every
> representation remains subordinate to the living person and to the history through which
> understanding arose.**
>
> **The purpose of longitudinal memory is not to make MAIA certain about the member. It is to make
> MAIA increasingly capable of recognizing them without imprisoning them in who they have
> previously been.**

And the governing test for every future memory mechanism:

> **Does this mechanism increase recognition, or merely increase retention?**

⭐ This principle is **upstream of all nine invariants below**. Where an invariant and the
principle conflict, the invariant is wrong. That direction is stated now, before any invariant is
inconvenient, because this lane's history is of convenience arriving later and asking for relief.

---

## 2. THE RECOGNITION TEST NEEDS A DISCRIMINATOR

**[J]** A concern, stated plainly because the test is too important to leave soft:
**every mechanism's author will answer "recognition."** A summarizer increases recognition. A
personal model increases recognition. A hypothesis engine increases recognition. Asked as a
question of intent, the test admits everything and refuses nothing.

Following the discipline `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` already applies to outward
claims — a claim earns its state by a **failure test**, not by its author's sincerity — I propose
two operational discriminators. A mechanism claiming to increase recognition must pass **both**:

### 2.1 The Correction Test
> **Does this mechanism's output change when the member contradicts it?**

If a member can say *"no, that isn't me"* and the mechanism's next output is materially unchanged,
the mechanism is **retention**. It accumulates about the person without participating in the
history through which understanding arose. ⭐ This is the operational form of *"a person must never
be reduced to MAIA's accumulated representations of them"* — a representation that cannot be
corrected **is** a reduction, whatever its author intended.

### 2.2 The Descent Test
> **Can this mechanism point back to the encounter that grounded it?**

If a derived claim cannot name the turns it came from, it cannot be checked, corrected, or
relinquished — and it will outlive the encounter that justified it. That is *fact without
encounter* in its exact form. A mechanism that cannot descend is **retention**.

⚠️ Both are necessary and neither is sufficient. A mechanism can descend to source and still
imprison (it remembers accurately who you were and holds you there); a mechanism can accept
correction and still be groundless (it updates on request but was never tied to anything). ⛔ **The
pair is proposed as a floor, not as a proof of soulfulness** — nothing here claims that passing two
tests makes a mechanism relationally good.

---

## 3. THE FIVE CONTINUITIES

**[F]** The forms of continuity that must be preserved, with **[J]** the current substrate answer
from ACT 1 and this act's checks:

| # | Continuity | Preserves | Substrate today |
|---|---|---|---|
| **K1** | **Historical** | what actually happened | ✅ `conversation_turns` — sound, whole, durable (ACT 1 §2) |
| **K2** | **Epistemic** | what presently has standing — affirmed, corrected, contested, superseded | ⛔ **none reaching cognition** (ACT 1 C6) |
| **K3** | **Affective / significance** | what mattered, not merely what occurred | ⚠️ partial — member-marked episodes only, capped at 5, ordered by recency (ACT 1 C5) |
| **K4** | **Developmental** | transformation — that the person speaking now is neither reducible to nor disconnected from who spoke six months ago | ⚠️ ratified in direction, unbuilt — bitemporal model in `docs/architecture/TEMPORAL_MEMORY_DIRECTION_2026-09-06.md`, no assertion layer exists |
| **K5** | **Relational — the *between*** | misunderstanding, discovery, trust, rupture, repair, promises, thresholds, names given to things together | ⛔ **none** — see §3.1 |

### 3.1 ⭐⭐ THE BETWEEN HAS ONE SUBSTRATE AND IT IS A SINGLE OVERWRITTEN ROW

**[J]** Checked in this act. `relationship_essences`
(`database/migrations/20251223_create_holoflower_tables.sql:100`) is the only store representing
the MAIA-member relationship. Its shape:

```
soul_signature TEXT UNIQUE     presence_quality TEXT        archetypal_resonances JSONB
spiral_position JSONB          relationship_field JSONB     encounter_count INTEGER
first_encounter TIMESTAMPTZ    last_encounter TIMESTAMPTZ
```

One row per member, **upserted** — written fire-and-forget after every turn
(`app/api/sovereign/app/maia/list/route.ts:1660`, `saveRelationshipEssence`).

> **The relationship is stored as a current state, not as a history.** There is no rupture, no
> repair, no misunderstanding, no threshold, no promise, no thing-named-together. `encounter_count`
> increments, so MAIA knows **how many times** you have met and nothing whatever about **what
> passed between you.**

⭐ This is the founder's *fact without encounter* and *conclusion without becoming* rendered in
schema, and it is the strongest single confirmation that the eerie phenomenon is architectural
rather than a tuning problem. ⛔ Recorded, ⛔ not repaired, ⛔ no lane opened.

⚠️ Held precisely: the *phenomenology* of the eerie failure is **[F]** founder testimony and this
act does not convert testimony into measurement. What is established here is narrower and
sufficient — **the architecture has the shape that would produce it.**

---

## 4. THE SIX FAILURE FORMS ARE THIS LANE'S FALSIFIERS

**[F]** The six recognizable forms. **[J]** Each mapped to the ACT 1 finding that is its current
structural cause. ⭐ **Five of six have a named cause already in evidence** — they are not
hypothetical risks to guard against, they are descriptions of the present architecture.

| Failure form **[F]** | Current structural cause **[J]** | ACT 1 |
|---|---|---|
| **Fact without encounter** — remembers your sister is ill, not the world in which you spoke of her | Derived stores (`atoms`, `memberWeb`, `relationship_essences`) persist and are prompt-reachable; the turns that produced them fall out of the window with **no read path back** | C1 · C2 · §3.1 |
| **Interpretation without correction** — remembers what it thought, loses *"no, that isn't me"* | No correction-standing primitive reaches cognition; the interpretation is written durably as it forms while the correction is only a conversational turn | **C6** |
| **Conclusion without becoming** — the destination, not the arrival | Same asymmetry: conclusions are derived and durable, the path is verbatim and displaced | C1 · §3.1 |
| **Theme without particularity** — knows *grief*, forgets the sentence carrying it | Protected verbatim is capped at five member-marked rows, recency-ordered; themes are unbounded and derived | **C5** |
| **Continuity without temporality** — an old self-understanding silently overwrites a newer one | ⭐ Literally produced by an `ORDER BY`: session restore returns the **oldest** 100 turns (`created_at ASC`) while the sibling branch is `DESC` | **C4** |
| **Familiarity without recognition** — sounds as though it knows you, fails to recognize you | See §4.1 — the one that needs care | C7 |

### 4.1 ⚠️ THE SIXTH FORM AND THE MEMORY CANON GUARD — STATED FAIRLY

**[J]** `MEMORY_CANON_GUARD_PROMPT` (`lib/maia/prompts/memoryCanonGuard.ts`) has two halves and
they pull in opposite directions under the conditions ACT 1 found:

- **§V forbids** the *"I don't have memory between conversations"* family — correctly, because
  framing an operational gap as an identity limitation is false and ruptures trust.
- **§VI prescribes** naming the specific gap and inviting the member back — *"My continuity is
  partial right now. Remind me what you told me."*

⭐ **§VI is the antidote to the sixth failure form and it is well-built.** It is the difference
between sounding continuous and being honest about discontinuity.

⚠️ **And §V, alone, is the risk.** A prompt that forbids denying memory, running on an architecture
that ACT 1 established often cannot recover it, is a prompt that makes MAIA *sound* continuous
while the path back is absent. The two halves are held together **only by the model's judgment at
runtime** — there is no architectural signal telling MAIA that this turn's window is truncated,
that a referenced turn is beyond it, or that a derived claim's source is no longer loaded.

⛔ **This is not a defect in the guard and it is not a proposal to weaken §V.** The guard is
correct and should survive. The finding is that **the guard is currently carrying a load that
belongs to the architecture**, and that an honest continuity layer must *give MAIA the facts §VI
needs* rather than leaving her to infer her own gaps. This becomes **LC-9** and **LC-13** below.

---

## 5. THE INVARIANT SET — CANDIDATE, FOR ADJUDICATION

**[F]** nine, in the founder's order and words. **[J]** for each: the observable violation (so the
invariant is falsifiable rather than aspirational), existing precedent in this repository, and the
cost or tension it carries. ⛔ **No invariant below is ratified.**

---

### LC-1 · Transcript sovereignty **[F]**
> *The verbatim turn remains the source record. A summary never replaces it.*

**Violated observably when [J]**: a derived representation is the only remaining route to material
a member referred to — i.e. the summary is consulted and the turns it came from are unreachable
even in principle.
**Precedent**: `ask_threads` append-only (`20260901000001:108`), `editorial_ontology` immutability
(`20260914000005:244`) — ⭐ the law already exists in two rooms.
**⚠️ Tension**: "never replaces" must **not** be read as "never deleted." Member-directed erasure
(`vault_erasure_queue`, WS-DELETE-01) and Sanctuary both remove source lawfully. ⭐ The precise
statement is that **a summary never acquires the authority of the turn** — not that the turn is
permanent. See **LC-11**.

---

### LC-2 · Server-side continuity **[F]**
> *The browser may cache conversation state, but it cannot be the authority determining what MAIA
> remembers.*

**Violated observably when [J]**: the same member, same session, on two devices, receives
materially different continuity — which is the present condition (ACT 1 C1).
**Precedent**: `between/chat` already does this correctly —
`getConversationHistory(sessionId, 20)` is a real server read.
**⚠️ Cost**: `/list` currently has **no** in-session server read. Satisfying LC-2 is not a
refactor; it is a new read path, and it is the single largest piece of work the invariant set
implies. ⚠️ It also interacts with Capacitor/iOS, where the client cache exists partly because
cookies do not cross the WebView boundary (`lib/http/apiBase.ts`). **Cache: yes. Authority: no.**

---

### LC-3 · Recoverability before compression **[F]**
> *Displaced current-session turns must have a read path back into cognition.*

**⭐⭐ [J] THE PRECISION THIS ONE NEEDS, NOW, BEFORE IT IS INCONVENIENT.**
LC-3 says **the path exists**. It does **not** say the path is always taken. Budget is finite;
something must choose, and the choosing is the whole of context engineering. ⛔ If LC-3 is read as
*"everything comes back"* it is unimplementable, and an unimplementable invariant is not held — it
is quietly reinterpreted under delivery pressure, which is the exact failure mode this lane's
freeze discipline exists to prevent.

> **Stated to survive implementation: for any displaced turn, a query exists that returns it to
> cognition. Whether it is selected on a given turn is a policy question. Whether it *can be* is
> constitutional.**

**Violated observably when**: no query exists — the present condition for in-session displaced
turns (ACT 1 C2: the only `/list` transcript reader excludes the current session by predicate).

---

### LC-4 · Source-bearing derivation **[F]**
> *Every summary, interpretation, synthesis, or remembered claim capable of influencing MAIA must
> retain provenance to its underlying turns.*

**Violated observably when [J]**: a prompt-reaching claim cannot name its source turns.
⚠️ **Present violations, named**: `relationship_essences` (§3.1) carries no turn provenance;
`memberWebAddendum` and `atomsAddendum` were not audited for it in ACT 1 and are **presumed
non-compliant until ACT 3 establishes otherwise** ⛔ — not asserted non-compliant.
**⭐ Precedent, and it is the right one**: `episodic_memories.source_turn_id` +
`source_session_id` + `verbatim_text` (ACT 1 C5). The primitive already exists at small scale.
**Cost**: this is the most invasive invariant. It binds every existing derived store, not future
ones. ⚠️ Retrofit scope is unknown and ACT 3 must size it before LC-4 is ratified as binding on
existing material rather than on new material.

---

### LC-5 · Correction standing **[F]**
> *A member correction is a new historical act, not an edit, but subsequent cognition must know
> that it supersedes or contests the earlier interpretation.*

**⭐ [J] THIS INVARIANT IS ALREADY LAW IN THIS REPOSITORY. IT HAS NEVER REACHED MEMBER MEMORY.**

`20260914000001_proposal_succession.sql` ratifies the exact shape, with its reasoning intact:
> *"SUCCESSION IS CARRIED BY THE SUCCESSOR. ⛔ There is no `superseded_by` column and there must
> never be one: it is derived. ⛔ And no `is_head`/`current` flag: the head is FOUND — the version
> nobody supersedes — so there is no second fact to fall out of step with the first."*

`TEMPORAL_MEMORY_DIRECTION_2026-09-06.md` ratifies the same for memory, plus the authorship rule:
> *"**detect → ask → record**, where only the member's answer creates or closes temporal validity.
> The system may detect temporal uncertainty. It may not manufacture the correction."*

**⭐⭐ That answers the hardest sub-question — *who decides that turn 27 corrects turn 23?* — and
the answer is already ruled: MAIA may notice; only the member may establish.** ⛔ Reuse the **law**,
never the **object** (S3 Ruling 7): do not clone `proposal_versions`, do not widen its chain.
**Violated observably when**: an interpretation is retrievable in a form that does not carry its
contest — the founder's turn-23/turn-27 case.
⚠️ **Coverage hazard, unresolved**: detect→ask→record has a cost — MAIA asking. Unasked corrections
leave the interpretation standing. ⛔ Not resolved here; flagged for ACT 3.

---

### LC-6 · Protected significance **[F]**
> *Member-marked material, commitments, corrections, explicit decisions, names/relationships, and
> other constitutionally defined high-significance events cannot disappear merely because they are
> old.*

**⚠️ [J] THE SPLIT THIS INVARIANT REQUIRES, OR IT BECOMES A LICENCE.** *"Constitutionally defined
high-significance"* is the whole question: if MAIA decides what is significant, MAIA is authoring
the member's memory hierarchy — the exact move FR-06 barred absolutely in the Circles lane
(system-created interest declarations, `living_field_affinities`, barred even though the inference
was good).

Proposed as **two disjoint classes that must never merge**:

| | **Member-constituted significance** | **System-noticed salience** |
|---|---|---|
| Source | a member act — marking, correcting, deciding, stating a boundary, naming | a model's judgment |
| May confer | **protection** — survives compression preferentially | **ordering only** — may raise something in retrieval |
| May **never** confer | — | protection, standing, or durability |

> ⛔ **Salience may change what is looked at first. It may never change what survives.** Promotion
> from salience to protection requires a member act, always.

⭐ This is the founder's own three-function split applied: protection is a **memory**-layer act;
salience is a **context**-layer heuristic; the boundary between them is **epistemology**.
**Violated observably when**: material acquires durable protection without a member act.

---

### LC-7 · No summary-of-summary authority **[F]**
> *Recursive summaries can aid navigation, but MAIA must be able to descend from any derived
> representation back toward primary evidence.*

**Violated observably when [J]**: a derived representation exists whose descent terminates in
another derived representation with no path to turns. ⭐ **This is LC-4 made recursive**, and it is
the specific defence against the compounding loss C3 shows is still avoidable.
⚠️ Note the founder's *"toward"* — descent need not be one hop. It must **terminate in primary
evidence**, or in an honest statement that the evidence is no longer held (**LC-11**).

---

### LC-8 · Token-aware working set **[F]**
> *Context assembly should be governed by actual cognitive budget, not arbitrary message count.*

**Violated observably when [J]**: the present condition — `MAX_API_HISTORY = 100` is a message
count, so the same 100 messages may be 4k or 60k tokens (ACT 1 C9). No counter exists in the path.
⚠️ **Cost, stated so it is not discovered later**: a token-governed set is **content-dependent**,
so the assembled prefix varies with what is included. ACT 1 §12 found the constitutional core is
already first — the cache-stable position. **A budget-driven assembler must not lose that
ordering**, and the two goals are in mild tension. ⛔ Not resolved here.

---

### LC-9 · Graceful uncertainty **[F]**
> *When retrieval cannot establish continuity, the existing honesty rule survives. MAIA may ask the
> member rather than inventing continuity.*

**⭐ [J] THE HAZARD THIS INVARIANT GUARDS IS CREATED BY THIS LANE'S OWN WORK.** Adding retrieval
tends to **suppress** the honest *"I don't have that"*, because after retrieval something almost
always comes back. A system that always returns *something* will stop saying it is missing
anything — and low-confidence retrieval presented without its confidence is worse than no
retrieval, because it is confident and wrong rather than absent and honest.

**Violated observably when**: the rate at which MAIA names a gap falls as retrieval improves, or a
retrieved item reaches the prompt without a standing marker.
⭐ Its positive form is **LC-13**: §VI cannot ask well about a gap the architecture never tells it
about.

---

## 6. FIVE FURTHER INVARIANTS PROPOSED **[J]**

Offered because the nine, taken alone, all push toward *more durable recoverability* — and several
existing constitutional commitments push the other way. An invariant set that does not name them
will erode them by omission.

### LC-10 · Sanctuary supremacy — ⭐⭐ ABSOLUTE, OVERRIDES ALL OTHERS
> **No invariant in this set creates any obligation to retain, recover, derive from, or reconstruct
> a Sanctuary turn. Where continuity and Sanctuary conflict, Sanctuary wins, without exception,
> including at the member's in-session request.**

⛔ **None of LC-1…LC-9 names Sanctuary, and every one of them argues for more durable
recoverability.** That is how an absolute boundary erodes — not by being overruled, but by being
absent from the document that governs everything around it.
**Precedent, and it is strong**: `lib/sanctuary/turnPosture.ts` — posture resolved **once per
request at the serving boundary**, private constructor so it cannot be forged downstream,
`contentWritable` fails closed on a missing or forged posture, and *"exiting Sanctuary mid-session
does not retroactively change prior turns."* Constituted after incident SANC-20260614-01, where a
session recorded as `standard` had persisted five sanctuary exchanges. ⭐ **The per-turn posture
model is exactly right for a continuity layer** and must be carried into it, not re-derived.

### LC-11 · Erasure propagates, and dangling derivation reads honestly
> **Member-directed erasure is always available and is never subordinated to continuity. A derived
> representation whose source turns have been erased must read as `DERIVED · SOURCE NO LONGER
> HELD`, never silently as still-grounded.**

⭐ **Precedent, exact**: S3's `completion_ref` is deliberately **not** a foreign key — SET NULL
would let deleting the outcome erase the completion, RESTRICT would defeat author sovereignty, so
the pointer **may dangle** and the durable fact reads *COMPLETED · OUTCOME NO LONGER HELD*. The
same three-way reasoning applies here unchanged.
⛔ Without LC-11, LC-4's provenance requirement becomes an argument for **refusing** erasure to
protect provenance — which inverts sovereignty. `TEMPORAL_MEMORY_DIRECTION` already ruled it:
*"'Historical integrity' is never a justification for perpetual possession."*

### LC-12 · No authority by retrieval
> **Retrieval may make something available. Availability never promotes it to truth, to member
> standing, or to protection. Compression may reduce a representation's size; it may never increase
> its standing.**

**[F]** in substance — the founder stated both halves in opening the lane. Recorded as an invariant
because it is the one most easily lost in implementation: a retrieved item and a member-authored
item arrive at the prompt as the same kind of string, and nothing downstream distinguishes them
unless something upstream marks them.

### LC-13 · Recovery is observable
> **Whether material reached cognition by the verbatim window, by retrieval, or by derivation must
> be distinguishable — to MAIA at runtime and to the lane in measurement.**

Two reasons, and both are load-bearing. **Runtime**: LC-9/§4.1 — §VI cannot name a specific gap the
architecture never told MAIA about. **Measurement**: ACT 4's four-state grading
(*source survived · retrieved · assembled · used · used with correct standing*) is unmeasurable
unless the states are distinguishable.
⭐ **Precedent with the right constitution already built**:
`lib/memory/provenance/turnMemoryProvenance.ts` — observational only, never writes back into member
memory, never becomes a retrieval source, never read as proof that retrieved material is true;
identifiers, counts, booleans and digests only, ⛔ no member content. ⚠️ It is explicitly **not a
store**; whether it may become durable is a custody question this act does not answer.

### LC-14 · Scope is declared, never assumed
> **The set names which surfaces it binds. A surface not named is not covered, and that must be
> visible rather than discovered.**

CMT-01 D3 established that `/list` and `between/chat` assemble ~21 disjoint fields for the same
member. ⛔ Invariants ratified against `/list` alone silently create a two-tier memory in which a
member's continuity depends on which room they are in. **[J] Recommended initial scope**: `/list`
and `between/chat`, with voice inherited via the client convergence gate. ⛔ Recommended, not taken.

### LC-15 · The *between* is memory, and is subject to the same law
> **The history of the relationship — misunderstanding, repair, promise, threshold, naming — is
> member-relevant material. Where it is held at all, it is held as history subject to LC-1, LC-4,
> LC-5 and LC-11, never as an overwritten current-state row.**

Proposed because **[F]** named relational continuity as the fifth form and §3.1 found its only
substrate is a single upserted row with no history. ⛔ **LC-15 does not authorize building a
relational-history store** — it says that *if* one exists or is built, it is memory and not
telemetry, and the same law governs it.

---

## 7. TENSIONS TO BE ADJUDICATED, NOT HARMONIZED

Named rather than smoothed, because a set that reads as internally frictionless is usually one
whose conflicts were resolved silently in favour of whatever was easiest.

| # | Tension | Why it cannot be resolved by drafting |
|---|---|---|
| **T1** | **LC-3 recoverability ⇄ LC-10 Sanctuary / LC-11 erasure** | Both are correct and they point opposite ways. ⭐ Resolution proposed: LC-10 and LC-11 are **absolute**; LC-3 binds only material that lawfully persists. Requires a founder ruling to be safe. |
| **T2** | **LC-4 provenance ⇄ LC-11 erasure** | Full provenance argues for keeping sources; erasure removes them. LC-11's honest-dangling shape is the proposed answer and needs ratification, not assumption. |
| **T3** | **LC-6 protection ⇄ FR-06-class prohibition on system-authored member facts** | The §6 two-class split is proposed. ⚠️ If it is wrong, LC-6 is either unimplementable (member-marking only, near-zero coverage) or dangerous (MAIA authors the hierarchy). |
| **T4** | **LC-8 token budget ⇄ stable cacheable prefix** | Content-dependent assembly varies the prefix. Mild, real, and better decided than discovered. |
| **T5** | **LC-9 honest uncertainty ⇄ every retrieval improvement** | Structural, permanent, and worsens as the lane succeeds. Needs a measured gap-naming rate, not a promise. |
| **T6** | **LC-2 server authority ⇄ offline / iOS restore** | The client cache exists for real reasons. *Cache yes, authority no* is proposed as the line. |

---

## 8. WHAT ACT 2 DOES NOT DO

1. ⛔ **Ratifies nothing.** Every invariant is a candidate. Kelly adjudicates.
2. ⛔ **Authorizes no implementation** — no assembler, no summarizer, no retrieval layer, no schema.
3. ⛔ **Does not repair C4**, per the ruling. The `ORDER BY` stands.
4. ⛔ **Does not activate `writeSummary`**, per the ruling.
5. ⛔ **Measures nothing.** No database, no traffic, no tokens, no model call — same limits as ACT 1.
6. ⛔ **Does not audit `memberWeb` / atoms for LC-4 compliance.** Presumed non-compliant **pending
   ACT 3**, ⛔ not asserted non-compliant.
7. ⛔ **Does not convert founder testimony into measurement.** §3.1 establishes that the
   architecture has the shape that would produce the eerie phenomenon — not that it did.
8. ⛔ **Proposes no substrate for K5.** LC-15 governs the *between* if it is held; it does not
   authorize holding it.

---

## 9. WHAT ACT 3 INHERITS

Per the founder's sequencing — *ACT 3 censuses existing substrates against these invariants; ACT 4
begins with the C4 falsifier before any repair is admitted.*

- **A compliance matrix, not a discovery pass.** ACT 3's question is fixed: for each existing
  substrate (`conversation_turns`, `episodic_memories`, `atoms`, `memberWeb`,
  `relationship_essences`, `developmental_memories`, `accumulating_hypotheses`, Spiralogic state),
  which of LC-1…LC-15 does it satisfy, violate, or not engage?
- **Three retrofit sizings are owed before LC-4 can bind existing material**: how many
  prompt-reaching derived stores carry turn provenance today; what it would cost to add; and which
  cannot have it retroactively because the source is already gone.
- **T3 needs evidence**: what proportion of significance would be captured by member-constituted
  marking alone? If it is near zero, the two-class split is honest but useless and LC-6 needs a
  different answer.
- **C4 stays unrepaired until ACT 4 falsifies it** — in either direction. It remains the cheapest
  high-value measurement available.
- ⭐ **The empty summary slot (C3) stays empty.** It is the lane's remaining freedom, and it is
  spent the moment anything is written into it.

---

*Memory asks what MAIA knows about a person. Recognition asks who they are becoming, what has
passed between them, and what this moment means in light of that history. ACT 1 found the field of
recoverability intact and the path to it missing. ACT 2 proposes the law that path must obey before
anyone is permitted to build it.*

---
---

# ACT 2 · AMENDMENT 1 — PROCESS AS THE UNIT OF CONTINUITY

**Opened by**: two founder acts, 2026-09-15, same day as the base act. **Method**: unchanged —
source and schema reading only. ⛔ No database, no traffic, no measurement, no repair.

**What this amendment changes**: §1's governing principle is **widened** (§A2); a constitutional
center is placed **above** it (§A1); four new invariants are proposed (**LC-16…LC-19**); and one
existing substrate is found to carry the shape LC-16 prohibits (§A6). ⛔ §1 is amended in place and
kept verbatim — superseded, never deleted.

---

## A1. THE CONSTITUTIONAL CENTER **[F]**

> **MAIA is a relational, developmental, process-centered operating system for human
> consciousness.**
>
> - **Relational** — meaning emerges *between* person, world, others, and MAIA. The system does not
>   treat the member as an isolated data object.
> - **Developmental** — it tracks change through time: stages, phases, thresholds, regressions,
>   integrations, new capacities.
> - **Process-centered** — it privileges living movement over static identity. The fundamental
>   question is not *"What is this person?"* but *"What is unfolding here?"*
> - **Operating system** — Spiralogic, Elemental Alchemy, memory, symbolic intelligence, relational
>   intelligence, communication, reflection and model orchestration are not separate features. They
>   are coordinated ways of sensing and supporting the member's lived processes.

And the design boundary that protects it:

> **The person is not the object being modeled. The living processes in which the person is
> participating are what MAIA attempts to perceive.**
>
> **MAIA organizes around processes, not profiles; becoming, not identity; relationship, not
> observation; and participation, not prediction.**

⭐ **[J] This sits above Layer 0 and above every invariant.** §1 said the principle governs the
invariants; §A1 governs the principle. The operative consequence for this lane is narrow and
sharp: **a continuity mechanism that improves MAIA's model of *the person* while leaving her no
better at perceiving *what is unfolding* has not served this architecture, however accurate it is.**

---

## A2. THE PRINCIPLE, WIDENED **[F]**

> **Relational continuity is not merely the persistence of meaning through time. It is the capacity
> to recognize the living processes through which meaning itself is changing.**

And for Spiralogic specifically:

> **MAIA should help the member perceive the spirals of becoming that are difficult to see from
> inside the immediacy of lived experience** — not by telling someone what their process means, but
> by holding enough history that she can say: **"We've been here before — but not quite like this."**

⭐ **[J] That sentence is the lane's acceptance criterion**, and it is unusually well-formed as one,
because it cannot be satisfied by accumulation. It requires **recurrence** (this is the same
process) **and difference** (it has moved) **held together**. A system that has one without the
other cannot produce it: recurrence alone yields *"you mentioned this before"*; difference alone
yields *"something is different"*. Neither is recognition. See **§A8**.

---

## A3. FOUR THINGS THAT MUST NEVER COLLAPSE **[F]**

| | Question it answers | Grain |
|---|---|---|
| **State** | What is happening *now*? | immediate — fiery and mobilized, watery and grieving, airy and trying to understand, earthy and needing consolidation |
| **Phase** | What kind of movement is occurring *across a period*? | sustained passage — confrontation → differentiation → mourning → reorientation → recommitment |
| **Stage** | What has become *possible now* that was not possible earlier? | developmental position — finally able to set the boundary, perceive the pattern, tolerate ambiguity, grieve the fantasy, act on what is already known |
| **Spiral** | *Which living process is this?* | the process itself, whose states and phases accumulate into transformation |

**[F]** Spirals are not folders. They move, recur, intersect, go dormant and return, **can
apparently regress while actually deepening**, and can resolve at one level and reopen at another.
A member is inside many at once — marriage, vocation, grief, a creative project, parenting,
relationship-to-body, money, one particular conflict, a decision months in the making, an old wound
being met differently, a new identity beginning to emerge.

⚠️ **[J] The collapse hazard is not theoretical.** Three of these four answer with the same
vocabulary — Fire, Water, Earth, Air — so a single stored `element` is ambiguous across all of
them, and the S3 lane's rule applies directly: **⛔ no implementation may proceed while two
different objects are both called the same thing.** A state-Fire and a stage-Fire are not the same
claim and must not become the same row.

---

## A4. SIX MEMORY LAYERS, RECONCILED WITH THE FIVE CONTINUITIES

**[F]** the six layers. **[J]** the reconciliation, done explicitly so the lane does not end up
with two taxonomies quietly in use.

| Layer **[F]** | Holds | Maps to | Substrate today |
|---|---|---|---|
| **1 · Event** | what actually happened or was said | K1 Historical | ✅ `conversation_turns` |
| **2 · Meaning** | what the member understood it to mean *at that time* | K2 Epistemic | ⛔ none reaching cognition |
| **3 · Spiral** | which ongoing process an event may belong to | ⭐ **new — no K equivalent** | ⛔ none |
| **4 · State / phase** | where that process appeared to be at particular moments | ⭐ **new** (partly K4) | ⚠️ `member_spiral_state` — see §A6 |
| **5 · Transformation** | what changed across the sequence | K4 Developmental | ⛔ none |
| **6 · Relational** | what happened *between* MAIA and the member while understanding it | K5 Relational | ⛔ one overwritten row (§3.1) |

⭐⭐ **[J] LAYER 3 IS NOT ANOTHER KIND OF CONTENT. IT IS THE RELATION THAT MAKES THE OTHERS
LEGIBLE.** Without spiral membership, March 3 and June 20 are two dated events. With it, they are
one process that moved. **Every longitudinal statement the founder's worked example produces
depends on layer 3 existing, and layer 3 has no substrate at all.** That is the single largest
architectural gap this lane has found — larger than the 100-message cap, because the cap withholds
material while this withholds the *form* in which material becomes understanding.

⛔ Naming it is not authorization to build it.

---

## A5 · LC-16 — THE ANTI-TYPING LAW, AS A PROHIBITED DURABLE SHAPE **[J]**

**[F]** states the law: *"otherwise MAIA could accidentally turn Elemental Alchemy into personality
typing: 'Kelly is in Water.' No."* The faithful form attaches the element to a process, in a
window, with movement:

> *"When you speak about this particular relationship, Water has been recurring for several weeks —
> first as grief, then as receptivity, and now increasingly as the capacity to let the old form
> dissolve. At the same time, Fire has begun appearing around what you want to do next."*

**[J] Proposed as an enforceable shape rather than a stylistic preference**, because a prose rule
about how MAIA should phrase things does not survive contact with a schema that makes the wrong
phrasing the easy one:

> **LC-16 · No elemental or phase predicate may be durably attached to a member.**
> An elemental predicate attaches to a **(spiral, time-window)** pair and must carry **movement**.
> The durable shape `{member_id, element}` — atemporal, spiral-less, one row per person — is
> **prohibited**, exactly as `{pendingAskRef, sectionId, authorized:true}` is prohibited in S3
> §10.6: not because it is inaccurate, but because nothing structural prevents it from being read
> as a fact about the person.

⭐ Stated this way the law is **checkable**: the absence of a member-level element column is a
static guard, in the family this repository already runs (`askRuntimeCannotWrite`, the S3 substrate
guards). A prose rule is not.

---

## A6 · ⚠️ THE PROHIBITED SHAPE EXISTS TODAY — AND IS NOT YET IN COGNITION

**[J]** Checked in this amendment. `database/migrations/20260213200001_member_spiral_state.sql`:

```sql
CREATE TABLE IF NOT EXISTS member_spiral_state (
  member_id        UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
  -- Elemental Identity
  dominant_element TEXT NOT NULL CHECK (dominant_element IN ('fire','water','earth','air','aether')),
  phase            INTEGER NOT NULL CHECK (phase BETWEEN 1 AND 12),
  motion           TEXT CHECK (motion IS NULL OR motion IN ('ascending','stuck','breakthrough')),
  ...
CREATE INDEX idx_member_spiral_element ON member_spiral_state (dominant_element, phase);
```

Three observations, each held to what it actually shows:

1. **The shape is `{member_id, element}`** — `member_id` is the PRIMARY KEY, so one row per person;
   `dominant_element` is `NOT NULL`; there is no spiral, no window, no movement. ⚠️ The column
   group's own comment reads **`-- Elemental Identity`** — the precise word LC-16 exists to refuse.
2. **`motion IN ('ascending','stuck','breakthrough')` scores developmental direction.** ⭐ *"Spirals
   can apparently regress while actually deepening"* **[F]** — a three-value enum containing
   `stuck` cannot represent that distinction, and will read an apparent regression as a failure to
   progress. See **LC-18**.
3. **`idx_member_spiral_element (dominant_element, phase)`** supports population-level distribution,
   and `app/api/admin/activity-feed/route.ts:140` runs exactly that:
   `SELECT dominant_element, COUNT(*) GROUP BY 1`.

**⭐ AND THE FAIRNESS THAT MATTERS MOST: IT DOES NOT REACH THE CANONICAL PROMPT.** No reference to
`member_spiral_state`, `spiralState` or `dominant_element` was found in
`app/api/sovereign/app/maia/list/route.ts`. Its readers are the admin command-center, the admin
activity feed, and the Bridge D conductor seed on `app/api/oracle/conversation/route.ts` — the route
CMT-01 classified as receiving ~zero live traffic. Its own table comment is candid about its
purpose: *"Anti-regression state: structural spiral position per member. NOT conversation content."*
and CLAUDE.md is explicit — *"NOT personalization. NOT psychometrics. Just continuity."*

> **The finding is therefore a latent violation, not a live one, and the distinction is the whole
> value of finding it now.** Bridge D was built for a good and narrow purpose: stop the conductor's
> element resetting on server restart so returning members are not met as strangers. ⛔ Nothing here
> says Bridge D is wrong. What LC-16 says is that **the shape it uses is the shape that becomes
> typing the moment it is read into cognition as a fact about the person** — and that no gate
> currently prevents that reading.

⭐ This is structurally the same gift as **C3**: the wrong thing exists, is not yet load-bearing,
and can therefore be ruled on before it becomes expensive. ⛔ Not repaired. ⛔ No lane opened.
⛔ Do not migrate this table opportunistically — it serves a live conductor seam and its repair is
its own governed act.

---

## A7 · LC-17 — SPIRAL MEMBERSHIP IS PROPOSED, NEVER ASSERTED **[J]**

The founder's worked example carries the hazard in its own margin: *"↓ **possible** vocational
spiral."* Who decides that March 3 and March 17 belong to the same process?

> **LC-17 · A spiral, its membership, and any cross-spiral connection are SYSTEM-NOTICED SALIENCE
> until the member ratifies them.** As salience they may reorder retrieval and may be **offered**.
> They may never confer protection, standing, or durability, and MAIA may never narrate an
> unratified spiral as established.

⭐ This is **LC-6's two-class split** and **LC-5's `detect → ask → record`** applied to the new
layer — ⛔ not a new principle, which is the point: if spiral inference needed a *different* rule
from every other system inference, the rule would be a special exemption. **[F]** already supplies
the form: *"I may be seeing a connection. Does that fit your experience?"* and *"The member remains
the authority over meaning."*

⚠️ **The coverage cost is real and is not hidden**: unratified spirals do nothing. A system that
must ask before it may see will see less. That is the correct trade and ACT 3 must size it, because
if ratified coverage is near zero the layer is honest and inert.

⭐ The founder's cross-spiral example — *"in your work you are moving from accommodation into
authorship, and in this relationship from accommodation into boundary; they may be expressions of
the same developmental movement"* — is the highest-value and highest-risk output of this whole
architecture. It is the thing no other system can offer, and it is **an interpretation of the
member's life offered by a machine.** LC-17 is what keeps it an offer.

---

## A8 · THE RECURRENCE TEST — THIRD DISCRIMINATOR **[J]**

Joining the Correction Test and the Descent Test (§2):

> **Can this mechanism distinguish *return* from *repetition*?**

A mechanism that reports *"you mentioned grief in March and you are mentioning grief now"* is
**retention** — it matched a token across two dates. A mechanism that can say *"this is the same
process, and it has moved"* is **recognition**.

⭐ **A spiral is return without simple repetition** **[F]** — the place looks familiar and
consciousness has changed. The test therefore falsifies the single most likely wrong
implementation of this entire lane: **semantic similarity search over past turns**, which is
excellent at finding *repetition* and structurally blind to *return*, because similarity is highest
exactly where least has changed. ⚠️ A retrieval layer optimized on similarity will systematically
surface the member's least-developed material.

---

## A9 · LC-18 AND LC-19 **[J]**

> **LC-18 · MAIA does not score developmental direction.** Movement may be described; progress may
> not be adjudicated. ⛔ No stored field may assert that a member is ahead, behind, stuck,
> regressing, or ascending. *"Apparent regression may be deepening"* **[F]** is not an edge case to
> handle — it is the reason the judgment is not MAIA's to make.
> **Violated observably when**: a durable field or a prompt-reaching claim ranks a member's
> developmental position. ⚠️ Present latent instance: `motion IN ('ascending','stuck','breakthrough')`
> (§A6).
> ⭐ Consistent with the standing sovereignty check *"does this reduce the system's psychological
> centrality over time?"* — a system that grades becoming has made itself the examiner of it.

> **LC-19 · The six layers do not collapse.** Event, meaning, spiral, state/phase, transformation
> and relational are distinct objects with distinct standing. ⛔ An implementation may not store a
> state-element and a stage-element in one field, nor a meaning as if it were an event, nor a
> system-proposed spiral as if it were a member-ratified one.
> **Violated observably when**: one column answers two of §A3's four questions, or one row is read
> as both what happened and what it meant.

---

## A10 · WHAT THIS AMENDMENT DOES NOT DO

1. ⛔ **Ratifies nothing.** LC-16…LC-19 are candidates, like LC-1…LC-15.
2. ⛔ **Does not authorize a spiral substrate.** §A4 names layer 3 as the largest gap; naming is
   not building.
3. ⛔ **Does not repair `member_spiral_state`**, migrate it, or touch Bridge D. §A6 is a finding.
4. ⛔ **Does not open the Personal Model question.** The process-not-profile boundary is recorded
   as constitutional; what follows for any existing personal-model work is out of this lane.
5. ⛔ **Does not census Spiralogic runtime.** `lib/voice/conductor.ts`, `SpiralogicOrchestrator`,
   the elemental agents and `FieldCoherenceEngine` were **not read**. §A6 covers one table and its
   grep-visible readers. ⚠️ Whether elemental state reaches cognition by some other path is
   **unestablished** — ⛔ and absence of a grep hit is not proof of absence, the ceiling CMT-01 §1.1
   already named.
6. ⛔ **Still does not measure anything.** No database, no traffic, no tokens, no model call.

---

## A11 · WHAT ACT 3 INHERITS, REVISED

Additions to §9:

- **The compliance matrix gains LC-16…LC-19**, and gains `member_spiral_state`,
  `lib/voice/conductor.ts` hysteresis, and the Spiralogic orchestration surfaces as subjects.
- **⭐ The Spiralogic runtime census is now owed and was explicitly not done here** (§A10.5). Its
  question: does any elemental or phase predicate reach cognition today, by any path, attached to a
  member rather than to a process?
- **T3's sizing question widens**: not only *what proportion of significance would member marking
  capture*, but *what proportion of spiral membership would member ratification capture* (LC-17).
  Both are the same question about the cost of asking, and both decide whether the honest design is
  also a usable one.
- **A fourth discriminator may be owed.** Correction, Descent and Recurrence test a mechanism.
  None tests whether a mechanism *frees* — whether it can let a member stop being who they were.
  ⚠️ Flagged, ⛔ not authored: *"without imprisoning them in who they have previously been"* **[F]**
  may need its own falsifier, and this amendment does not have one.

---

*Without continuity, MAIA can say "this sounds like Fire." With continuity, she can say "Fire has
appeared repeatedly around this issue, but its quality has changed." Longitudinal continuity is not
a memory feature that Spiralogic happens to use. It is the condition under which Spiralogic becomes
developmental intelligence rather than momentary classification.*
