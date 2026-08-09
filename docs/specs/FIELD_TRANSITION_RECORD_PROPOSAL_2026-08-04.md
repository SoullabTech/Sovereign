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

---

## 9. Folded-in contributions (2026-08-04, from the memory-observability lane)

Founder-directed consolidation. The memory-observability lane independently re-derived this
proposal's axis and was **superseded rather than developed** —
`docs/specs/SOVEREIGNTY_OWNERSHIP_AXIS_v0.md` is marked superseded; only its non-redundant
findings are folded here. ⛔ Nothing in §9 alters a §7 ruling.

> **The procedural lesson (founder):** *do not create a new room when you discover an existing
> room with the same doorway.* The failure was **treating a discovered pattern as a new primitive
> instead of checking whether the architecture had already named and governed it.** §0's "three
> implementations" finding now has a fourth data point — the reinvention pressure is ongoing and
> structural, not a one-time lapse.

### 9.1 🔴 `alive` carries two referents — and the schema already separates them

The memory lane proposed a member-memory lifecycle `stored → alive → offered → used`. **`alive` is
overloaded**, in exactly the §7.3 fractal pattern:

| Reading | Claim | Evidence | Authority |
|---|---|---|---|
| **Technical alive** | *the system loaded this successfully* | loader ran · query succeeded · object returned | system |
| **Relational alive** | *this is still part of the person's living world* | member confirmation · continued engagement · explicit renewal | ⛔ **member only** |

> **Never let system activity masquerade as human relevance.** This is the same failure class as
> `sem: ok` — a loader-health signal read as a statement about the member.

⭐ **Resolution — the existing substrate already has this right.** Per §2, `member_memory_atoms`
separates curation from verdict, and its curation vocabulary already contains
**`still_alive`** (`active/still_alive/set_aside/protected/archived`) — a **member-authored**
state. Relational alive therefore needs no new vocabulary; it exists, and it is correctly on the
member-curation axis, not the system axis.

**Consequence for the memory lane:** its lifecycle is system-side only —
`stored → loaded → offered → used` — and `alive` must be **reserved for the relational layer**,
sourced from member curation. ⛔ A loader-health field may never be named `alive`.

### 9.2 Ownership is not one object across arenas

The lifecycle standardizes the **shape of the question**, not the answer. Founder formulation:

> *A teaching can be offered. A personal realization can be owned. **Those are not the same object.***

Same five words, different readings — which is why §6.3 forbids retrofit and §7.4 forbids backfill:

| | Knowledge arena | Memory arena |
|---|---|---|
| stored | concepts authored by others | this member's own material |
| offered | selected for this moment | reached the prompt |
| **adopted** | ⚠️ applies to the member's *relationship to* a teaching — never to the teaching itself | the member's lived material, theirs by origin |

Candidate per-arena instantiations (⛔ recorded, not ruled): knowledge
`available → contextualized → offered → understood`; practitioner wisdom
`captured → entrusted → offered → adopted`.

### 9.3 Prior-art map — five ladders, one un-cross-referenced

Beyond §0's three implementations, **five state-ladders** now exist. §0 catches the schema-level
duplication; these are the *document*-level equivalent:

| Ladder | Home | Note |
|---|---|---|
| `exists → reachable → participates → observable → influences` | `ADMIN_DIAGNOSTIC_SURFACE_2026-05-27.md` | **ratified**; capability-level |
| `Built/Reachable/Participating/Observable/Sovereign` | `project_governed_participation_doctrine` | maturity; flagged *do not conflate* |
| `exists → computed → persisted → loaded at start → surfaced to inference` | `docs/canon/INTELLIGENCE_FIELD_ACCESS_MAP.md` | ⭐ **closest to this grammar** — `surfaced to inference` **is** `offered`; its *observation-only by design* status is the same insight as "consent-blocked is healthy" |
| `stored → loaded → offered → used` | memory-observability contract | subordinate (§9.5) |
| `offered → explored · adopted · declined · withdrawn` | **this document** | governing |

⭐ **`member_patterns` is the most mature instance of the grammar** — enforced in the database
today: `CHECK (status IN ('emerging','offered','confirmed','rejected'))` (migration
`20260316000003`), `PatternOfferingService` writing `offered` + `last_offered_at`,
`respondToPattern` gating on member response. **Memory is a late implementation, not the first.**
Any conformance pass should measure against patterns.

### 9.4 ⚠️ Naming — "Wisdom Field" has four referents

Verified at `0cf6696ab`. ⛔ Do not mint it as a top-level architectural term without a ruling:

1. **Knowledge Field** — `docs/canon/MAIA_KNOWLEDGE_FIELD_v1.0.md` + 12-domain map; **ratified canon
   with live code** (`lib/maia/knowledge/knowledgeField.ts`, `lib/maia/prompts/knowledgeFieldBlock.ts`).
2. `lib/maia/wisdomFieldMoves.ts` — 10 conversational *move* types; a small implementation piece.
3. **Practitioner Wisdom Field** — its own constitution (§9.6).
4. Wisdom graph / keepers / submissions substrate + surfaces.

Further, `docs/canon/MEDIA_FIELD_AND_RELATIONAL_FIELD_BOUNDARIES.md` **already draws the
Wisdom/Memory boundary** as *Public Knowledge Field* vs *Relational Memory Field* — two of four
domains that "cannot fully collapse into one substrate."

**Naming hypothesis (⛔ recorded, NOT ruled):** Knowledge Field = what humanity has articulated ·
Wisdom Field = what becomes meaningful through relationship, practice, lived context ·
Memory Field = what the member has entrusted from their own life.

### 9.5 Subordination + the conformance step

- `SOVEREIGNTY_OWNERSHIP_AXIS_v0.md` — ⛔ **SUPERSEDED.** Content folded here.
- `MAIA_MEMORY_FIELD_OBSERVABILITY_CONTRACT.md` — **subordinate / implementation-specific.** It is
  the *memory arena's* instantiation; it may not define lifecycle or ownership semantics. Its
  Panel 5 implements this grammar's authority boundary; it does not author it.
- ⛔ **Before any new schema:** score all three §0 implementations against §5. That test already
  exists and is scored (`pass (5), partial (3), fail (1)(2)(4)`) — ⛔ do not re-derive it.

### 9.6 Record correction — a memory pointer resolves off-branch

The memory index states the practitioner constitution *"LIVES IN
`docs/specs/PRACTITIONER_WISDOM_FIELD_PRODUCT_DEFINITION_v0.md`"*. That path returns **No such
file** on `feature/labtools-redesign` at `0cf6696ab`. It is **not lost** — added by three sibling
commits (`51deb4b2d`, `e028a6334`, `80dfaf8df`) with three companions, all four absent here:
the product definition (576 lines), the architecture assessment (279),
`docs/governance/PRACTITIONER_WISDOM_CAPTURE_PROTOCOL_v1.md` (242), and the Larry custody agenda (19).
Retrieve via `git show 51deb4b2d:<path>`.

> **Generalized principle — absence in the current view ≠ absence in reality.** A pointer must carry
> enough provenance to retrieve its target: *the artifact exists · this branch does not contain it ·
> the historical referent is `<sha>`.* This is §4.1's *record the act, never derive a label* applied
> to the repository itself — and the same overbroad-absence error already recorded once against the
> Larry IP corpus.

### 9.7 ⚠️ Lane convergence — PR #960 is open

**#960 — `feat(memory): Sprint 1 Truth Layer — declared policy, transition records, truthful
telemetry`** (`feature/memory-truth-layer`) is **OPEN, not merged**, and names *transition records*
directly. Three lanes now approach one object: memory truth layer · this proposal · the (superseded)
ownership axis.

⛔ **Do not merge them into a larger abstraction.** Per founder: this grammar governs; each arena
implements it under its own authority boundaries. Read #960 before extending either document.

---

## 10. The conformance pass — proposed next move (founder, 2026-08-04; ⛔ not authorized)

> *"Recognize the organism before adding organs."*

**Not implementation.** The proposed next move is a conformance pass, stated as:

> **For each arena, can we map its existing objects onto the shared transition grammar
> without forcing the arena to become something it is not?**

### 10.1 ⭐ The non-distortion clause — this is NOT a restatement of §5

§5 asks whether an implementation *satisfies* the grammar. §10 adds a second, opposing test that
§5 alone cannot supply:

| Test | Asks | Failure mode it catches |
|---|---|---|
| §5 conformance | does the arena answer the grammar's five questions? | fragmentation — arenas that cannot be compared |
| **§10 non-distortion** | **does conforming deform the arena?** | **flattening — different kinds of human relationship compressed into one generic state machine** |

⛔ **A conformance failure is not automatically an arena failure.** Three conclusions must remain
distinguishable, and the pass must name which one it reached:

1. **the arena is incomplete** — it should conform and does not yet;
2. **the grammar is incomplete** — the arena is sound and the grammar cannot express it;
3. **the mapping is inappropriate** — both are sound; this material does not belong on this axis.

Collapsing these into "non-conformant" turns the pass into a compliance instrument — the opposite
failure from the one §0 diagnosed. **The mechanism built to create coherence is exactly the
mechanism that can erase difference**; the three-way reading is what prevents the grammar from
quietly becoming the new authority source.

**Maturity ordering for the pass** (strongest first — measure against the strongest, do not average):

| Arena | Object | Maturity |
|---|---|---|
| Patterns | `member_patterns` — `offered` → member response, DB-enforced | **strongest** |
| Memory atoms | `status` + `member_response_status` | partial |
| Recognition | `member_idea_recognition_events` | partial |

### 10.2 What the four reinventions actually indicate

Four independent arenas built the same organ (§0's three, plus the superseded ownership axis).
The founder's read, load-bearing:

> **The missing component was never another object. It was a translation layer.**

Each arena is fluent in its own material: memory knows memory language, patterns know pattern
language, recognition knows recognition language, practitioner fields know practitioner language.
None can read the others. **The shared transition grammar is connective tissue — the Corpus
Callosum metaphor in its literal architectural sense**, consistent with R5 (*grammar, not service*).

> ⛔ This is the argument *against* a central table, not for one. Connective tissue translates
> between organs; it does not replace them.

### 10.3 The `alive` boundary, stated as authority

Restating §9.1 as the rule the pass applies:

| Lifecycle | States | Answers | Authority |
|---|---|---|---|
| System | `stored → loaded → offered → used` | *what did the system do?* | system — logs, loaders, runtime |
| Relational | `active · still_alive · set_aside · protected · archived` | *what is the person's current relationship to this?* | **member** |

**A loader cannot determine aliveness.** The system may know *"I retrieved this," "I displayed
this," "this query succeeded."* It may never know *"this still matters," "this still represents
me," "I still want this carried."*

### 10.4 ⭐ Withholding is a constitutional state, not a gap

Generalized from `INTELLIGENCE_FIELD_ACCESS_MAP.md`'s **observation-only by design**, and the
same insight as *consent-blocked is healthy*:

> **A mature system needs the ability to say: *this information exists, but it is not mine to use
> here.***

The dangerous leap is not `exists → loaded`. It is:

```text
available   ──►   allowed to participate
```

**The full progression, with the terminal named honestly:**

```text
exists → computed → stored → available → eligible → offered → member-authorized participation
```

⭐ **A capability can correctly stop at any point on this progression.** Stopping is a *state*, not
a shortfall:

- a pattern may exist and not be offered;
- a memory may exist and not participate in this moment;
- knowledge may exist and not enter relational space.

Only the last step is member-authorized. Everything before it is the system's own conduct, and
none of it is authorization.

⛔ Any dashboard, conformance score, or roadmap that renders a deliberately withheld capability as
*missing* is creating pressure to breach a boundary that is working. Withholding must be
representable as **correct**, everywhere the grammar is displayed.
