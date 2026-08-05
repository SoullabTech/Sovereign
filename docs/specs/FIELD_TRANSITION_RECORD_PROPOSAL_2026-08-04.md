# Field Transition Record — Proposal v0

**Date:** 2026-08-04 · **Status:** ⛔ **PROPOSAL — sequence and §3 resolution FOUNDER-CONFIRMED
2026-08-04 (see §7). Grammar itself not yet ratified. Authorizes no migration.**
**Governed by:** `CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` (Invariant 16) · **R1–R5**, `docs/architecture/CORPUS_CALLOSUM_ARCHITECTURE_MAP_2026-08-04.md`
**Answers:** the §B gap — *`offered` is not a system-wide fact.*

---

## 0. The finding that determines the shape

`Field Transition Record` does not exist in the repo. **But the thing it names has been
independently implemented three times, in three shapes, with three vocabularies.**

| Implementation | Date | Shape | Lifecycle vocabulary | Scope |
|---|---|---|---|---|
| `member_idea_recognition_events` | 2026-04-22 | **append-only event log** | `naming_fired · invitation_offered · invitation_accepted · invitation_declined · invitation_ignored` | Decision/Change ideas |
| `pattern_ledger.status` | 2026-02-04 | **mutable state row** | `emerging · offered · confirmed · partial · rejected · retired` | MAIA-noticed patterns |
| `member_memory_atoms.member_response_status` | 2026-07-02 | **nullable verdict column** | `confirmed · rejected · modified` (NULL default) | practitioner observations |

Three teams, three times, reached for the same object: *MAIA offered something; the member responded.*
None can see the others. This is the `source_type` finding and the Corpus Callosum finding again —
**one function, several names, no shared grammar.**

> ⭐ This matters procedurally. This project's rule is *never promote an abstraction on an imagined
> second use — only an observed one.* There are **three observed uses.** The warrant for
> generalizing is as strong as this project's own discipline allows.

---

## 1. What this proposal is — and what it is not

**R5 ruled: grammar, not service. ⛔ No new Corpus Callosum database layer.** This proposal respects
that boundary and states it explicitly:

- ✅ **v0 is a grammar** — a conformance contract the three existing implementations are measured
  against. No migration. No new table. Nothing moves.
- ⛔ **v0 is NOT a central `field_transitions` table.** Whether one central record should exist is a
  **separate, later, founder-ruled question.** Building it now would violate R5 and would require
  migrating live substrate to answer a question that is not yet ruled.

The unit of work is: **make the three existing implementations answer the same four questions.**

---

## 2. The four axes (founder decomposition, 2026-08-04)

One overloaded `source_type` cannot carry four dimensions. Separate them:

| Axis | Question | Values |
|---|---|---|
| **Origin** | Where did it come from? | `member · practitioner · community · tradition · system · external` |
| **Material type** | What kind of thing is it? | `experience · reflection · knowledge · symbol · instruction · artifact` |
| **Authority class** | What relationship does it have? | `member-owned · offered · contextual · system-generated` |
| **Lifecycle** | What happened to it? | see §3 |

### ⭐ Prior art: this decomposition is already ratified by implementation

`member_memory_atoms` **already** separates two of these axes deliberately, with the reason recorded
in the migration:

> `status` = how the member **curates** an atom they placed (`active/still_alive/set_aside/protected/archived`)
> `member_response_status` = the member's **verdict** on an observation made about them
> *"A member declining a practitioner's claim is not a curation gesture — it is an authorship
> refusal, so it gets its own axis rather than overloading `status`."*

The four-axis model is the generalization of a separation this codebase already made and justified.

---

## 3. Lifecycle — and the two states that must never merge

```
              ┌─ suppressed ─┐
              │  filtered    │   system-side, no authority
   stored ─── ┤  withheld    │   (records what MAIA DID)
              └─ presented ──┘
                     │
                  offered
                     │
              ┌──────┴──────┬───────────┬──────────┐
           explored      adopted     declined   withdrawn
        (observable)   └──── member-authored only ────┘
                     │
                  unknown  ◄── terminal, first-class, permanent
```

**System may write:** `stored · retrieved · eligible · suppressed · filtered · withheld · presented ·
offered · explored`.
**Only the member may write:** `adopted · declined · withdrawn`. *(R4)*

### 🔴 Live conflict with R4 — must be ruled

`member_idea_recognition_events` defines:

```sql
'invitation_ignored'  -- N turns passed with no engagement; treated as decline
```

**That is a system-inferred decline**, which R4 forbids. Non-response is an *absence of evidence*, not
a verdict.

> **Proposed resolution:** keep `ignored` as a real, useful, system-writable observation — and
> **⛔ never collapse it into `declined`.** Under the impact-awareness constraint, `ignored` resolves
> to **`unknown`**, not to a member verdict. The cooldown/quiet-zone logic that consumes it is
> legitimate and unaffected; only the *naming* changes.

This is not a defect report against that table's authors — the table predates R4. It is the first
thing the grammar catches, which is evidence the grammar is doing work.

---

## 4. Two design rules inherited from existing substrate

1. **Record the act, never derive a label.** From `member_lens_passes`: *"The lens is an ACTION, not
   a LABEL. The member is NEVER stored as a lens-type."* A transition record says *what happened*; it
   may never accumulate into a characterization of the member.
2. **Structural metadata only, never content.** From `member_idea_recognition_events`: member words
   appear only as short member-authored snippets. A transition record carries ids, timestamps,
   and states — never transcript.

---

## 5. Conformance test (the actual deliverable)

For any object MAIA may surface, the grammar asks:

1. Can it name its **Origin**, **Material type**, and **Authority class** without overloading one field?
2. Is there a durable record that it was **presented** or **offered** — distinct from *eligible*?
3. Is `adopted/declined/withdrawn` **writable only by an authenticated member act**?
4. Is `unknown` reachable and **terminal** — never auto-resolved by elapsed time or engagement?
5. Does the record hold **structure only**, never content?

Scored today: the three implementations pass (5) fully, pass (3) partially, and **fail (1), (2), and
(4)** in different ways.

---

## 6. Sequence

1. ⏳ Rule the `ignored ≠ declined` conflict (§3) — smallest, and it is a live R4 violation.
2. ⏳ Rule the four axes (§2) as the vocabulary the three implementations converge on.
3. ⏳ Retrofit **no data** — apply the grammar to *new* surfaces first; ⛔ no backfill of unknown
   historical material (Field Object promotion ruling).
4. ⏳ Only then: whether a central record exists at all.

> ⛔ **Do not begin with a table.** Three tables already exist. The problem was never storage.

---

## 7. Founder confirmation — 2026-08-04

The founder confirmed the reframe (*"the missing thing is not a table — it is a shared grammar"*),
the four-step sequence in §6, and the §3 resolution, with these refinements now binding on the
proposal:

### 7.1 `no response` is its own lifecycle branch

```
offered ─┬─ accepted/adopted
         ├─ declined
         ├─ withdrawn
         └─ no response  →  unknown   (never → decline)
```

Silence has many possible meanings — *did not notice · deferred · busy · uncertain · disagreed ·
forgot · changed context* — and the system may not collapse them into a member judgment.
**The absence of evidence is not evidence of refusal.**

Restraint logic survives intact, reformulated on the honest observation:
- ✅ *"This invitation did not receive a recorded response"* → system may withhold re-invitation.
- ⛔ *"The member rejected this"* → may never be derived from silence.

### 7.2 The exact code locus of the violation

`lib/maia/decisionChangeRecognition.ts:418-422` (`checkRestraint`):

```ts
const kindDeclined = recentEvents.some(
  (e) =>
    (e.event_type === 'invitation_declined' || e.event_type === 'invitation_ignored') &&
    e.signal_kind === signal.kind
);
```

…emitting `reason: 'kind_previously_declined'`.

**The behavior is legitimate restraint. The claim is false.** Both event types feed a variable named
`kindDeclined` and a reason string asserting the member *declined* — even when the only evidence is
silence. The fix is semantic, not behavioral: distinguish the two evidence classes in the variable
and reason vocabulary (e.g. `kind_previously_declined` vs `kind_previously_unanswered`), leaving the
restraint decision unchanged. The migration comment (`'invitation_ignored' — treated as decline`)
is historical record and stays; new code must not repeat its equation.

### 7.3 The fractal finding, named

The same failure recurs at three scales — **one word asked to carry several realities**:

| Scale | Instance | Realities collapsed |
|---|---|---|
| Vocabulary | `source` | origin · actor · file type · provenance |
| Schema | `status` | lifecycle · response · availability · authority |
| Architecture | *"Field Transition Record"* | new object · existing pattern · shared grammar |

> **The Corpus Callosum problem is not only connectivity. It is semantic differentiation.**

### 7.4 Centralization criterion (restates §6.4 with the test)

A central record may be revisited **only after the grammar demonstrably unifies the three existing
implementations** — emerging from demonstrated need, not architectural enthusiasm. No backfill in
any case: historical records were created under older semantics; retroactive translation
manufactures certainty.

---

## 8. Open grammar question — the encounter origin (founder, 2026-08-04, later same day)

The founder's relational-consciousness reflection names an origin the §2 axis cannot represent:

> *"What arose in the encounter itself?"* — relationship creates something that belongs to neither
> side alone.

The current Origin vocabulary (`member · practitioner · community · tradition · system · external`)
partitions everything into a single author. Emergent relational material — what neither party
brought, which appeared *between* them — has no value. **This is a real gap, recorded as OPEN, and
deliberately NOT resolved by adding a category**, because the category carries a hazard that must be
ruled first:

> 🔴 **The laundering hazard.** An `emergent`/`between` origin could become the channel by which
> system-authored synthesis escapes the authority rules — MAIA's own construction relabeled as
> *"what arose between us,"* softening its provenance and evading Invariant 16. The founder's own
> warning is the test: the member saying *"something meaningful happened between us"* may never be
> translated by the system into *"I created your transformation"* — and its mirror: the system may
> never translate *"I constructed this"* into *"we made this together."*
>
> Any encounter-origin category therefore needs the same discipline as `adopted`: **the member names
> the between; the system may not.** Until ruled, system-side synthesis stays labeled `system`.

**Empirical note:** the platform already has a surface named for exactly this — the BETWEEN route
(`/api/between/chat`, processing profile `BETWEEN`). Per the Cat 6 record, it has **zero
`agent_runs` rows despite the routing invariant being set at its boundary.** The surface named for
the relational field is currently the least observed surface in the system. Whatever the encounter
origin becomes, that unknown is prior work.

**Held direction (Cat 1, preserved not authorized):** *relational memory* — the Corpus Callosum
read not as module integration but as the record of *"what happened between beings in this
encounter"*: provenance, trust, mutual influence, boundaries, uncertainty, transformation. This
proposal's grammar is one piece. ⛔ Nothing here authorizes building it.
