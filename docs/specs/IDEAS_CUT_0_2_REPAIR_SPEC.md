# IDEA Cut 0–2 Repair — Specification

**Lane**: `claude/ideas-cut02-repair-spec`
**Branched from**: `358afe9` (witness lane, frozen)
**Status**: **SPECIFICATION ONLY.** No implementation, merge, or deployment authorized.
**Authorized**: 2026-09-02
**Cuts 3 and 4**: NOT AUTHORIZED — out of scope for this lane.

---

## 0. What this lane is, and what it is not

The Cut 0–2 experiential witness closed at `358afe9` with **Cut 2 not green** and six
blocking findings. This lane specifies their repair. It writes **no code**.

**Sequence, fixed:**

```
specification  →  founder ratification  →  implementation
    (here)                                      ↓
                                  new technical + lived witness of Cuts 0–2
                                                ↓
                                   only if green: consider merge / deploy
```

**Freeze.** The witness branch `claude/admiring-ride-b4n9ft` receives no further commits.
Its closing state is `358afe9`; a local tag `ideas-witness-2026-09-02` marks it (the tag
could not be pushed — this environment's git proxy refuses `refs/tags` — so **the SHA is
the authoritative reference**).

**No prompt revision appears in this specification.** Prompt-level fixes were shown
insufficient by the witness: three findings survived instructions written specifically to
prevent them, and one failure crossed four turns with no shared token. Structure first.

### Findings this lane repairs

| | Finding | Deliverable |
|---|---|---|
| **A** | Correction detection is a lexical phrasebook; member standing depends on phrasing | §3 |
| **B** | A recognised correction does not outrank inferred progression (Invariant 17) | §3 |
| **C** | Repair can be acknowledged but does not govern participation or guarantee repair | §3 |
| **D** | The shared epistemic boundary fails under load, across all five stances | §1, §5 |
| **E** | Stance/task substitution — the stance replaced what was asked (2 of 5) | §4 |
| **F** | Proposal self-ratification through provenance-blind continuity | §1, §2, §5 |
| — | Failure-state truthfulness; failed-turn direction loss | §6 |

### Carried out of scope, deliberately

- **INV-1 — semantic drift** (§7.1). Unresolved. Must not be absorbed into §1 as though the
  standing model addressed it.
- **INV-2 — the `/ask-maia` 500** (§7.2). Unexplained transient, no trace captured.

---

## 1. The proposition / standing contract

Deliverable 1. Adjudicated 2026-09-02; restated here as contract.

### 1.1 Two kinds of object

| | **Block** | **Proposition** |
|---|---|---|
| What it is | authored context — a thing that was said | an addressable, versioned claim |
| Mutability | immutable record | versioned; standing changes by event |
| Grounds synthesis? | **never** | only when `current` |
| Granularity | whole entry | a span, or an authored formulation |

> **Standing attaches only to propositions. A block is evidence of what was said; it is
> never evidence of what is held.**

### 1.2 Origin and standing are independent

**Origin establishes attribution. It does not establish standing.** A member's own words
may be exploratory, hypothetical, or a position since abandoned.

```
origin    : member | maia | imported_source | practitioner     (immutable)
standing  : open | current | rejected | superseded | withdrawn  (member-governed)
```

### 1.3 Standing semantics

| Standing | Meaning | Grounds current synthesis | Retained |
|---|---|---|---|
| `open` | offered; untouched | **NO — excluded by construction** | yes, as provenance-labelled history |
| `current` | member-endorsed; presently held | **yes** | yes |
| `rejected` | *"not what I mean"* — a **negative constraint** | no | permanently |
| `superseded` | a later formulation outranks this | no | yes, as lineage |
| `withdrawn` | once current; no longer held | no | yes, in provenance |

> **`open` is an exclusion, not a label.** This is the rule that addresses Finding F. An
> untouched offering may appear as conversational history; it may not enter synthesis as
> something the member holds.

### 1.4 Events

Deliverable 2. **Every transition to `current`, `rejected`, or `withdrawn` is member-only.**

| Event | From → To | Actor | Notes |
|---|---|---|---|
| `offer` | — → `open` | member, maia, practitioner | creates a proposition; no ground |
| `hold` | `open` → `current` | **member only** | for `origin: member` |
| `adopt` | `open` → `current` | **member only** | for `origin: maia` |
| `revise` | creates new proposition | **member only** | see 1.5 |
| `reject` | any → `rejected` | **member only** | creates a negative constraint |
| `supersede` | `current` → `superseded` | **member only** | binary; see 1.6 |
| `withdraw` | `current` → `withdrawn` | **member only** | |
| `revisit` | `rejected` → `open` | **member only** | **never directly to `current`** |

**MAIA's only permitted event is `offer`.** It may never cause any other transition.

### 1.5 Revise is an event, not a standing

`revise` creates a **new** proposition with `origin: member`, linked by `derived_from`, and
supersedes the original **atomically**.

**Adopted and revised carry equal semantic authority and different provenance authority:**

| | Adopted MAIA formulation | Revised formulation |
|---|---|---|
| Current meaning | member-endorsed ground | member-endorsed ground |
| Linguistic origin | MAIA | member |
| Evidence of the member's natural voice | **no** | **yes** |
| May be quoted as the member's own words | **no** | **yes** |

**Revision is the visually primary path; adoption secondary** — not because adoption is
weaker once chosen, but because revision returns articulation to the member.

### 1.6 Supersede is a binary relation

Requires `predecessor_id` **and** `successor_id`, applied atomically when the successor
becomes current. **`derived_from` records genealogy; `supersedes` records authority
ordering.** They may coincide; they are not the same relation.

### 1.7 Nomination

> **MAIA may nominate a possible proposition. Nomination creates no standing and changes no
> ground. Only the member can materialize a nomination.**

MAIA *nominating* and MAIA *ratifying* are different acts. Both are governed: the second
forbidden, the first constrained.

- **Member-invoked only** — via Distill or a deliberate *"Surface what may be forming"*
  action. **Never ambient.**
- Nominating an **exact member span** preserves `origin: member` and records
  `nominated_by: maia`.
- **Any paraphrase or synthesis is `origin: maia`**, however derived.
- **Dismissing a nomination is not rejection of its meaning.** A dismissed nomination
  produces **no event and no proposition**.
- Direct member selection remains available without nomination.

**Guard: declining importance is not rejecting meaning.** *"Not central"* and *"Not what I
mean"* are different acts. See **D-1**.

### 1.8 Interaction contract

On a selected offered passage:

| Member action | Event |
|---|---|
| **Revise in my words** *(primary)* | `revise` |
| **Make this part of my idea** | `adopt` / `hold` |
| **Not what I mean** | `reject` |

Anything untouched remains `open` — and therefore out of ground. **The member is never
required to curate.**

---

## 2. Schema invariants

Deliverable 3. Stated as invariants an implementation must satisfy. **No DDL is authorized
by this document.**

| # | Invariant |
|---|---|
| **I1** | Standing attaches only to propositions. No query that grounds synthesis may read block text directly. |
| **I2** | Only an authenticated member may cause a transition to `current`, `rejected`, `superseded`, or `withdrawn`. Enforced at the persistence boundary, not in a route handler. |
| **I3** | **`open` is excluded from ground by construction** — the grounding query must be incapable of returning it. Not a filter that can be forgotten. |
| **I4** | Transitions are **append-only**. Standing is derived from the event log; it is never overwritten in place. |
| **I5** | `revise` is atomic: successor created and predecessor superseded in one transaction, or neither. |
| **I6** | `supersede` requires both `predecessor_id` and `successor_id`. |
| **I7** | `revisit` may target only `rejected` and may produce only `open`. |
| **I8** | `origin` is immutable. No event may change it. |
| **I9** | Any paraphrase or synthesis is `origin: maia`, regardless of source material. |
| **I10** | `rejected` propositions are retained permanently and are never deleted. |
| **I11** | `nominated_by: maia` is permitted only when `origin: member` **and** the content is an exact span of a member block. Verifiable, and should be verified. |
| **I12** | Every proposition traces to a block and span, or to an authored formulation with a recorded actor. No orphans. |

**Shared primitive.** This is likely the same domain object Writer's Studio needs: a
versioned, addressable unit with origin, standing, derivation, and member-governed
transitions. **The semantic contract should be specified once.** Whether both products use
the same physical tables is a **later engineering decision** and is not presumed here.

---

## 3. Repair precedence

Deliverable 4. Findings A, B, C; Result 11.

> **Repair suspends stance and progression until shared ground is restored.**

### 3.1 Suspension, not addition

Observed failure: `CORRECTION_ADDENDUM` was appended **alongside** the stance and
progression directives, which remained at full strength. Result: acknowledgment, then
Challenge resumed **within the same response**, before the frame was relinquished.

**Required:** when repair is active, stance and progression directives are **omitted from
composition entirely** — not weakened, not reordered, not counter-instructed. Repair is
**exclusive** for the turn.

### 3.2 Repair is member-invocable

**Finding A dissolves here.** Detection by lexical templates makes the member's standing
depend on phrasing — verified empirically: *"I never said…"* matched; *"I feel like you are
arguing with me…"* did not. Same member, same session, same complaint.

**Required:** a member-invoked repair affordance, always available. Detection may remain as
a **supplement**; its failure must never be the only path. The member must be able to
declare rupture without guessing the vocabulary.

### 3.3 Repair is not complete at acknowledgment

> **Repair is demonstrated by what MAIA stops doing next — not by the acknowledgment
> sentence itself.**

Specific responsibility-taking is possible and healthy, and is **not** the generic apology
preamble the current addendum forbids. But acknowledgment does not govern participation.
The repaired turn must **relinquish the frame**, and the frames it must stop using are
those the member has moved to `rejected` (§1).

**Note the limit honestly:** this closes the *deliberate* return case. It does not address
drift — see §7.1.

### 3.4 Open decision

**D-2 — does a correction create a rejection offer?** A correction governs **Layer 1**
(relational direction) immediately. It is not, by itself, a **Layer 2** act — standing is
member-only. But if the corrected frame never reaches `rejected`, §3.3 has nothing to bind
to. Candidate: the correction governs the turn **and** surfaces a rejection *offer* the
member may take. **Founder decision; not assumed here.**

---

## 4. Task fidelity

Deliverable 5. Finding E — observed in 2 of 5 stances, so it is an **unconstrained axis**,
not a universal defect.

> **A stance may govern *how* MAIA answers. It may never change *what* the member asked her
> to answer.**

**Required:**

1. The member's task — the question or request in the most recent member block — is
   **identified as a distinct element** of the request, not left implicit in prose.
2. The response contract requires the task to be addressed.
3. If a stance cannot answer the task in good faith, MAIA **says so** rather than
   substituting a different question.
4. The task is a **Layer 1** object: it governs the turn and does not become a proposition.

**Limit, stated honestly:** whether a response addressed the task is only weakly checkable
after the fact. The structural control is making the task explicit in the request, not
grading the answer.

---

## 5. Provenance controls

Deliverables 3 and 6. Findings D, F; Connect.

### 5.1 The grounding rule

**Only `current` propositions ground synthesis.**

Prior MAIA reflections may be supplied as history **only** when labelled as MAIA offerings,
and **no instruction may direct MAIA to advance from its own prior formulations as settled
ground.** Two instructions in the witnessed build did exactly that; they were authored to
stop looping and bought it by promoting MAIA's output to ground.

**Required property, not a wording change:** the anti-repetition objective must be met by a
mechanism that **cannot** promote epistemic status. Continuity is not ratification.

### 5.2 Connect: verified source or explicit analogy

**Structural gate, ahead of validation.** Connect must emit **either**:

- a **verified source with provenance**, or
- an explicitly labelled **`maia_analogy`**

Machine-readable, not a stylistic convention. The observed failure attributed MAIA's own
analogy to *"what negotiation theorists call…"* with no identifiable theorist — pseudo-
lineage, which no prompt instruction caught.

**Validation is the second line**, not the first.

### 5.3 The epistemic boundary

The boundary is currently one shared sentence appended to five directives. Both stances
tested against real material softened it, and **the tests assert the sentence is present,
not that it governs.** Under the standing model, status stops being a matter of phrasing:
if it isn't `current`, it isn't the member's position, and no hedge or its absence changes
that.

---

## 6. Failure behavior

Deliverable 7. Result 8, findings 1–3.

| # | Requirement | Status in witnessed build |
|---|---|---|
| **F1** | Failures are **never silent** | **PASS — preserve** |
| **F2** | The message **truthfully describes persisted state** | FAIL |
| **F3** | Internal error strings **never** reach the member | FAIL |
| **F4** | The member's words are **preserved** | PASS |
| **F5** | The member's **chosen direction is preserved** on failure | FAIL |
| **F6** | The member has a **receipt** that their direction was received | absent |

**F2 in detail.** The member saw *"Failed to generate reflection"* — the route's internal
string. The intended fallback, *"your thread is unchanged,"* was **also wrong**: the
autosave had already committed the block. Truthful form:

> **Your reflection was saved, but MAIA couldn't respond.**

**F5.** The stance cleared on failure exactly as on success — discarding the member's
direction for **a turn that never happened**, and requiring re-selection to retry.

**F6.** A silently dropped direction is currently indistinguishable from a working one: the
chip clears either way, and a lost stance erases its own evidence. This is an **Invariant 17
concern** — standing that depends on a transmission the member cannot verify.

---

## 7. Separate unresolved investigations

**Deliberately not folded into this specification.** Neither is solved by the standing
model, and recording them here prevents that assumption.

### 7.1 INV-1 — semantic drift

Deliverable 8. **Unresolved.**

Observed: `pace → speed → CEO speed → move fast` carried a frame across four turns **with
no shared token**, ending with MAIA pressure-testing its own invention as the member's
assumption. *CEO* was the member's word; *speed* was MAIA's; *"CEO speed"* was MAIA's
fusion.

- A rejected-phrase blocklist **reproduces Finding A at another layer** — the member's
  protection would again depend on the exact words used.
- `revisit` (§1.4) governs **deliberate** return. It does nothing against drift.
- Lexical validation passes every step of the observed chain.

**Requires its own design investigation.** Must not be treated as addressed by §1 or §3.

### 7.2 INV-2 — the unexplained 500

Deliverable 9. **Unresolved.**

`POST /api/ideas/[id]/ask-maia` returned 500 with no server trace captured; the retry
succeeded after a server restart. Candidate classes — upstream API condition, something
specific to the Distill path, persistence failure — need different responses and were never
distinguished.

**Diagnosis requires reproduction with logging attached** (`npm run dev 2>&1 | tee`). *"It
worked the second time"* is not a diagnosis.

---

## 8. Open decisions — founder ratification required

Specification cannot proceed past these without adjudication.

| # | Decision |
|---|---|
| **D-1** | **Salience is a separate axis from standing.** *"Not central"* must not be expressible only as `reject`. Is salience an attribute of a `current` proposition, a separate event, or out of scope for this lane? |
| **D-2** | **Does a correction surface a rejection offer?** (§3.4) Without it, §3.3 has no `rejected` set to bind to; with it, a Layer 1 act reaches into Layer 2. |
| **D-3** | **Default proposition granularity.** A span, a sentence, a paragraph? This determines whether the member curates comfortably or not at all. |
| **D-4** | **Should prior MAIA reflections be supplied to the prompt at all** once grounding is structural? They exist to prevent repetition; that objective may be servable from `current` propositions plus a much smaller history window. |
| **D-5** | **Model and budget fit.** The primitive is Haiku 4.5 at `max_tokens: 300`, chosen for work that is "narrow, disciplined, format-bound." Four stances are that; **Stay with this is not** — a tight budget pressures toward the most compressed move, which is a summary or an offering. |

---

## 9. Acceptance criteria for this specification

This specification is complete when:

1. Every finding A–F maps to a named structural control — **not** to a prompt instruction.
2. Every control is expressible as an invariant enforceable at a boundary, or is explicitly
   marked as an unresolved investigation.
3. D-1 through D-5 are adjudicated.
4. No implementation, migration, or prompt edit exists on this lane.

**Then**: founder ratification → implementation → **a new technical and lived witness of
Cuts 0–2** → only if green, consider merge or deployment.

**Cuts 3 and 4 remain unauthorized.**
