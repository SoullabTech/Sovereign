# IDEA Cut 0–2 Repair — Specification

**Lane**: `claude/ideas-cut02-repair-spec`
**Branched from**: `358afe9` (witness lane, frozen)
**Status**: **SPECIFICATION ONLY.** No implementation, merge, or deployment authorized.
**Authorized**: 2026-09-02
**Cuts 3 and 4**: NOT AUTHORIZED — out of scope for this lane.

**Amendment pass 1 — 2026-09-02.** Architecture approved in principle; nine corrections
applied and D-1–D-5 adjudicated. Documentation only.

### D-1 – D-5, adjudicated

| | Decision |
|---|---|
| **D-1 · Salience** | **Out of scope for Cuts 0–2.** Dismissing a nomination creates no proposition and no standing event. **No salience field is added** — that belongs with the later Living Idea architecture and must not smuggle in Cut 3. |
| **D-2 · Correction / rejection** | A correction opens a **Layer-1 repair episode**; it **never** changes Layer-2 standing automatically. If the member explicitly selects a MAIA span and chooses **Not what I mean**, that act itself creates `reject`. A general relational correction **may offer** the member a rejection selection; it **cannot infer one**. |
| **D-3 · Granularity** | Default to an **exact member-selected contiguous span**. Sentence expansion may be a UI convenience; the **stored object retains the exact snapshot, block ID, offsets, and version**. Any synthesis across passages is a **new MAIA-origin offering**. |
| **D-4 · Prior MAIA text** | **Do not automatically send the last three MAIA reflections.** A prior MAIA block may return **only** when the member explicitly references it or invokes repair upon it, and it remains **non-ground**. Anti-repetition needs a **separate move ledger or post-generation comparison**. |
| **D-5 · Model / budget** | Resolve as a **per-stance evaluation gate**, not one global constant. **Haiku 4.5 is a baseline candidate, not a constitutional choice.** Compare against a stronger supported model for nuanced dwelling. **Connect's verified-source branch requires retrieval** — the stance itself does not; it may always emit a typed `maia_analogy`. **`300` must not remain a universal output ceiling.** |

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

> **Block text never enters `current_idea_ground`.** The **current member turn**,
> **explicitly referenced offerings**, and **repair targets** remain readable through
> **separate provenance-preserving input channels**.

A block is evidence of what was **said**; it is never evidence of what is **held**. The
distinction is between *ground* and *readable turn context* — **not** between readable and
unreadable. The member's newest reflection must always be readable.

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
| `reject` | `open` → `rejected` | **member only** | creates a negative constraint |
| `supersede` | `current` → `superseded` | **member only** | binary; see 1.6 |
| `withdraw` | `current` → `withdrawn` | **member only** | |
| `revisit` | `rejected` → `open` | **member only** | **never directly to `current`** |

**MAIA's only permitted event is `offer`.** It may never cause any other transition.

**Exit paths from `current`.** A once-`current` proposition leaves **only** through
`withdraw` or `supersede`. `reject` applies to `open` material — *"not what I mean"* is a
judgement on something offered, not a retraction of something held. Retraction of a held
position is `withdraw`.

### 1.5 Revise is an event, not a standing

`revise` creates a **new** proposition with `origin: member`, linked by `derived_from`.
What happens to the original **depends on its standing**:

| Original standing | Result |
|---|---|
| `open` | new member-origin proposition becomes `current`. The original **stays `open`** — nothing is superseded, because nothing was ever current. |
| `current` | new member-origin proposition becomes `current` and **atomically supersedes** the original. |

Superseding an `open` offering would assert that it once held authority. It never did.

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
  `nominated_by: maia`. **Default granularity is an exact member-selected contiguous span**
  (D-3): sentence expansion may be a UI convenience, but the **stored object retains the
  exact snapshot, block ID, span offsets, and block version**. **Any synthesis across
  passages is a new MAIA-origin offering**, never a nomination.
- **Any wording generated by MAIA is `origin: maia`**, however derived. A member's own
  revision remains `origin: member` even when it began from a MAIA offering.
- **Dismissing a nomination is not rejection of its meaning.** A dismissed nomination
  produces **no event and no proposition**.
- Direct member selection remains available without nomination.

**Guard: declining importance is not rejecting meaning.** *"Not central"* and *"Not what I
mean"* are different acts and must never collapse into one.

**D-1 adjudicated: salience is out of scope for Cuts 0–2.** No salience field is added.
Dismissing a nomination creates **no proposition and no standing event** — which is what
keeps the guard honest without inventing a field. A member declining importance on a
`current` proposition belongs to the later Living Idea architecture; **adding it here would
smuggle in Cut 3.**

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
| **I1** | **Block text never enters `current_idea_ground`.** Ground is composed only of `current` propositions. The current member turn, explicitly referenced offerings, and repair targets are supplied through **separate provenance-preserving input channels** and are **never merged into ground**. |
| **I2** | **Every standing-changing event except the initial `offer` is member-only** — `hold`, `adopt`, `revise`, `reject`, `supersede`, `withdraw`, **and `revisit`**. Only an authenticated member may cause any of them. Enforced at the **persistence boundary**, not in a route handler. |
| **I3** | **`open` is excluded from ground by construction** — the grounding query must be incapable of returning it. Not a filter that can be forgotten. |
| **I4** | Transitions are **append-only** **while the Idea exists**. Standing is derived from the event log, never overwritten in place. **This does not prohibit member-authorized deletion, account erasure, or applicable retention rules** — see I13. |
| **I5a** | `revise(open)`: atomically create a new member-origin `current` proposition with `derived_from`. **The source remains `open`** — nothing is superseded. |
| **I5b** | `revise(current)`: atomically create the successor **and** supersede the predecessor. |
| **I6** | `supersede` requires both `predecessor_id` and `successor_id`. |
| **I7** | `revisit` may target only `rejected` and may produce only `open`. |
| **I8** | `origin` is immutable. No event may change it. |
| **I9** | **Any wording generated by MAIA is `origin: maia`**, regardless of source material. A member's own revision is `origin: member` even when it began from a MAIA offering. |
| **I10** | `rejected` propositions are retained **for the life of the Idea** and are not deleted by ordinary operation — they are the negative-constraint set. **Subject to I13.** |
| **I11** | `nominated_by: maia` is permitted only when `origin: member` **and** the content is an exact span of a member block. **This must be verified at the persistence boundary** — not asserted by the caller. |
| **I12** | Every proposition traces to a **block ID, span offsets, and block version**, or to an authored formulation with a recorded actor. No orphans. |
| **I13** | **Permanence is scoped to sovereignty, not above it.** I4 and I10 hold while the Idea exists and **cannot override member-authorized deletion, account erasure, or applicable retention rules.** A member may always delete their own material. |
| **I14** | `imported_source` and `practitioner` are **reserved origin values only**. Their workflows are **out of scope for this lane** and **their reservation does not authorize Cut 4.** |

**Shared primitive.** This is likely the same domain object Writer's Studio needs: a
versioned, addressable unit with origin, standing, derivation, and member-governed
transitions. **The semantic contract should be specified once.** Whether both products use
the same physical tables is a **later engineering decision** and is not presumed here.

---

## 3. Repair precedence

Deliverable 4. Findings A, B, C; Result 11.

> **Repair suspends stance and progression for the duration of a repair episode.**

**A repair episode is a lifecycle, not a response.** *"Until shared ground is restored"*
cannot mean one turn. An episode:

- **opens only on a member act** — the member invokes repair, or accepts a surfaced repair
  candidate. **Detection may surface a visible candidate; it must never open an episode or
  suspend a member-selected stance on its own.** Otherwise the phrasebook regains Layer-1
  authority, which is Finding A returning through the repair mechanism.
- **carries `repair_episode.target_refs`** — selected MAIA spans, propositions, or turns
  **temporarily excluded as positive premises** while repair is active;
- **stays open** across turns — stance and progression remain suspended throughout;
- **closes only** when the member explicitly closes it or chooses to resume ordinary
  participation.

**`target_refs` is what §3.3 binds to. It is Layer 1 and changes no standing.**

| | |
|---|---|
| **Closing repair without rejection** | ends the temporary exclusion. Nothing was rejected; nothing persists. |
| **Choosing *Not what I mean*** | creates the durable **Layer-2 `rejected`** constraint, independent of the episode. |

This preserves the three-layer model **without making rejection a prerequisite for immediate
repair** — which is what would otherwise leave Finding C open. Semantic drift remains
separately unresolved (§7.1).

**A prior stance may be preserved as a visible pending direction, but must never resume
automatically.** Resumption is a member act. This is also what makes §6/F5 coherent: the
member's direction is held rather than discarded, and its return is theirs to choose.

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
The repaired turn must **relinquish the frame**. **What it must stop using is the set of
contested targets on the open repair episode (§3), plus anything the member has moved to
`rejected` standing (§1).** The first governs immediately; the second persists beyond the
episode.

**Note the limit honestly:** this closes the *deliberate* return case. It does not address
drift — see §7.1.

### 3.4 Correction and rejection — D-2, adjudicated

**A correction opens a Layer-1 repair episode. It never changes Layer-2 standing
automatically.**

- If the member **explicitly selects a MAIA span** and chooses **Not what I mean**, that
  act itself creates `reject`.
- A **general relational correction** — *"I never said his issue was speed"* — **may offer**
  the member a rejection selection. **It may not infer one.**

**What the episode does carry is its explicit contested targets** (§3), and those govern
what MAIA must stop using for the duration. So a correction the member never converts into
a `reject` still binds MAIA within the episode — it simply does not create a **persistent**
negative constraint. Persistence requires the Layer-2 act.

Two distinct durations, deliberately:

| | Object | Layer | Duration |
|---|---|---|---|
| contested target | on the repair episode | 1 | while the episode is open |
| `rejected` proposition | in the standing store | 2 | for the life of the Idea |

---

## 4. Task fidelity

Deliverable 5. Finding E — observed in 2 of 5 stances, so it is an **unconstrained axis**,
not a universal defect.

> **A stance may govern *how* MAIA answers. It may never change *what* the member asked her
> to answer.**

**Task extraction must not become another hidden interpretation.**

1. **The canonical task is the member's exact block or selected span — never MAIA's
   paraphrase of it.** A paraphrase is a MAIA-origin artifact (I9) and cannot stand in for
   what was asked.
2. **Any inferred task is a candidate only.** It may be shown for confirmation; it never
   silently replaces the canonical task.
3. The task carries a **`source_task_id`** referencing that block or span, and **both the
   request and the persisted response carry it**, so a stance cannot silently replace what
   was asked and the substitution is detectable after the fact.
4. The response contract requires the canonical task to be addressed.
5. If a stance cannot answer the task in good faith, MAIA **says so** rather than
   substituting a different question.
6. The task is a **Layer 1** object: it governs the turn and never becomes a proposition.

**Limit, stated honestly:** whether a response *addressed* the task is only weakly
checkable after the fact. The structural controls are the exact-span canonical task and the
`source_task_id` on both sides of the exchange — not grading the answer.

---

## 5. Provenance controls

Deliverables 3 and 6. Findings D, F; Connect.

### 5.1 The grounding rule

**Only `current` propositions ground synthesis.**

**Prior MAIA reflections are NOT automatically supplied** (D-4). The witnessed build sent
the last three on every turn. A prior MAIA block may return **only** when the member
**explicitly references it** or **invokes repair upon it**, and it remains **non-ground**
when it does.

**Anti-repetition needs a different mechanism.** It must be met by a **separate
move / deduplication ledger or post-generation comparison** — something that records *what
move was already made* without making the prior wording into ground. **The ledger must be
incapable of becoming a positive premise**: it may say *this move has been made*, never
*this is established*. When MAIA text does return, it returns through a
**provenance-labelled, non-ground channel** (§1.1). Two instructions in the witnessed build did
the opposite: authored to stop looping, they bought it by promoting MAIA's output to
settled structure.

**Required property, not a wording change:** the anti-repetition objective must be met by a
mechanism that **cannot** promote epistemic status. **Continuity is not ratification.**

### 5.2 Connect: verified source or explicit analogy

**Structural gate, ahead of validation. Verification must be external to MAIA.**

> **A source is "verified" only when accompanied by a retrieval or member-source receipt
> with identifiable provenance. MAIA cannot certify its own attribution.**

Connect must emit **either**:

- a source **with an external receipt** — a **retrieval receipt** or an **identified
  member-provided source**, carrying identifiable provenance; **or**
- output **machine-typed `maia_analogy`**.

**There is no third type.** Without evidence, the output **must** be typed `maia_analogy` —
saying *"no verified source is available"* is prose that may appear **within** that type,
never a type of its own. A free-text disclaimer is exactly the kind of control that passes
review and fails under load. The observed failure attributed MAIA's own
analogy to *"what negotiation theorists call…"* with no identifiable theorist. **A
self-certifying gate would have passed it** — the model was confident. Only an external
receipt distinguishes the cases.

**Scope of the retrieval requirement — narrower than "Connect requires retrieval".** Only
the **verified-source branch** requires retrieval or a valid member-source receipt. Connect
itself may always emit a typed **`maia_analogy`**, or state within that type that no
verified source is available. **Retrieval is a prerequisite for citing a source, not for
using the stance.** An earlier version of this document overstated it.

**Validation is the second line**, not the first.

### 5.3 Immediate appropriation — the control Finding D still needs

**The standing model does not close Finding D on its own.** It prevents unratified language
from becoming *future* ground. It does **nothing** to stop MAIA from saying, in the
**current response**, *"you're building…"* or *"what you believe is…"*.

**Required response contract:**

1. **Any claim about a member-held position must reference `current` proposition IDs.**
   Unreferenced member-attribution is not permitted.
2. **Exact member wording remains attributable to the member.** Quoting or reusing the
   member's own words carries their attribution intact — MAIA restating a member's phrase
   does not convert it into MAIA's formulation, and must not be re-emitted as a MAIA
   offering.
3. **Every new model-generated proposition about the idea or a member-held position must
   be emitted and persisted as an `open` MAIA offering** — addressable, with standing, and
   therefore available for `adopt` / `revise` / `reject`. **Ordinary connective language and
   questions are not propositions** and must not accidentally acquire standing.
4. **Unsupported member-attribution fails before persistence.** The response does not reach
   the thread.

> ⚠️ **If (4) cannot yet be enforced structurally, Finding D remains explicitly
> UNRESOLVED.** It must **not** be declared repaired by the standing model. The standing
> model governs ground; this contract governs assertion, and they fail independently — as
> the witness showed, in the same thread.

### 5.4 The epistemic boundary

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

### 6.1 The ask attempt — what makes F2–F6 structurally possible

**Before generation**, durably establish an **attempt** carrying:

- the **member block**
- the **canonical task** (`source_task_id`, §4)
- the **stance**
- the **repair-episode state** (§3)

The attempt carries an **attempt status**, completed as **`succeeded`** or **`failed`**.

This single object is what makes the rest possible rather than aspirational:

| Enables | How |
|---|---|
| **F5 — preserve direction** | the stance lives on the attempt, not only in component state that clears in a `finally` block |
| **F6 — receipt** | the attempt **backs** the receipt — see the rendering requirement below |
| **faithful retry** | retry re-runs *the recorded attempt*, not a reconstruction |
| **INV-2 — diagnosis** | a failed attempt is a durable record with its inputs, which is exactly what the unexplained 500 lacked |

**A stored attempt is not yet a member receipt.** Acceptance of the attempt **must be
visibly rendered to the member**, and **must remain visible on failure**. Otherwise the
database has a receipt and the member does not — which is the witnessed condition exactly:
the row would have existed, the chip still cleared, and the member still could not tell
whether their direction was received.

Without the attempt, the witnessed failure repeats: the member's direction vanished, no
receipt existed, the retry required re-selection, and nothing was left to diagnose.

### 6.2 Truncated model output must not be persisted as a complete reflection

The witnessed primitive sets `max_tokens: 300` and **never inspects `stop_reason`**. In the
Messages API, `stop_reason: "max_tokens"` means the response **was truncated at the ceiling**
— the documented responses are to raise the ceiling or continue the response, not to treat
the fragment as finished.

**Required:**

1. `stop_reason` is inspected on every response.
2. `stop_reason == "max_tokens"` **fails the attempt** (§6.1) or triggers continuation. It
   is **never** persisted as a complete reflection.
3. `stop_reason == "refusal"` is handled distinctly from a generation failure.
4. **`300` must not remain a universal output ceiling** (D-5). Ceilings are per-stance.

⚠️ **Correction — an earlier version of this section claimed the pinned model ID was
wrong. It is not.** `claude-haiku-4-5-20251001` is a **published pinned snapshot ID**;
`claude-haiku-4-5` is a **convenience alias resolving to that snapshot**. Pinning a snapshot
is legitimate and is often the safer choice for a primitive whose behaviour has been
witnessed. **No code change is required merely because the implementation uses the dated
ID.** The **model-evaluation requirement (D-5) stands on its own** and is unaffected.

**Related compatibility requirement for the evaluation.** When stronger models are
evaluated, **response parsing must select text blocks by `type`** — never assume
`response.content[0]` is text. Newer models can return thinking blocks first, so an
index-based read silently breaks. The witnessed primitive reads `response.content[0]` and
throws on a non-text block; that is adequate for the current pinned model and **is not
adequate for the evaluation**.

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

## 8. Decisions — adjudicated 2026-09-02

All five are decided; see the table at the head of this document. Where each landed:

| # | Adjudication | Where applied |
|---|---|---|
| **D-1** | Salience out of scope; no field added | §1.7 |
| **D-2** | Correction opens a Layer-1 episode; explicit span selection creates `reject`; a general correction may offer, never infer | §3.4 |
| **D-3** | Exact member-selected contiguous span; snapshot + block ID + offsets + version stored | §1.7 |
| **D-4** | No automatic prior-reflection window; return only on explicit member reference or repair, non-ground; anti-repetition via move ledger or post-generation comparison | §5.1 |
| **D-5** | Per-stance evaluation gate; Haiku 4.5 a baseline candidate only; **Connect's verified-source branch** requires retrieval (not the stance itself); `300` is not a universal ceiling; block-type parsing required for the evaluation | §5.2, §6.2 |

### Carried forward as design work, not blocking decisions

- **D-5 evaluation** must be run per stance against real threads before any model is
  ratified. *Stay with this* is the case where the format-bound assumption is least safe.
- **§5.3(4)** — enforcement of unsupported member-attribution rejection. If it cannot be
  built, that part of Finding D stays **explicitly unresolved**.

---

## 9. Acceptance criteria for this specification

This specification is complete when:

1. Every finding A–F maps to a named structural control — **not** to a prompt instruction.
2. Every control is expressible as an invariant enforceable at a boundary, or is explicitly
   marked as an unresolved investigation.
3. ~~D-1 through D-5 are adjudicated.~~ **Done 2026-09-02** (§8).
4. No implementation, migration, or prompt edit exists on this lane.
5. Any control that **cannot** be enforced is marked unresolved rather than described as
   repaired — currently **§5.3(4)**, **§7.1** and **§7.2**.

**Then**: founder ratification → implementation → **a new technical and lived witness of
Cuts 0–2** → only if green, consider merge or deployment.

**Cuts 3 and 4 remain unauthorized.**
