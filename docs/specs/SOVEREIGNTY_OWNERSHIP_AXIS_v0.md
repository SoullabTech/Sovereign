# Sovereignty Ownership Axis — v0

> ⛔⛔ **SUPERSEDED 2026-08-04 (founder-directed). DO NOT DEVELOP OR CITE.**
>
> All non-redundant content has been **folded into
> `docs/specs/FIELD_TRANSITION_RECORD_PROPOSAL_2026-08-04.md` §9** — which is the canonical
> home. Read §9 there, not this file. Retained only as the provenance record of a
> superseded lane.
>
> ---
>
> 🔴🔴 **Original banner (why it was superseded):**
>
> **`docs/specs/FIELD_TRANSITION_RECORD_PROPOSAL_2026-08-04.md` (same day, sequence and
> §3 resolution FOUNDER-CONFIRMED) already defines this axis.** It states the gap as
> *"`offered` is not a system-wide fact"*, documents **three independent existing
> implementations** of the object, and rules the authority boundary:
>
> - lifecycle: `offered → explored · adopted · declined · withdrawn`
> - **R4: only the member may write `adopted · declined · withdrawn`**
> - **R5: grammar, not service** — no new table, no migration
>
> R4 *is* the rule this document states as *"the system can observe transitions; it
> cannot perform the transition into meaning."* Same rule, already ruled.
>
> ⛔ **This document is therefore a FOURTH independent reinvention of the same object** —
> precisely the failure the proposal itself documents (three teams, three vocabularies,
> none able to see the others). **Do not develop it as a parallel artifact.** Its only
> non-redundant content is §3 (ownership is not one object across arenas), §4–§6
> (naming collisions, prior art, record correction) and §8 (the `alive` divergence).
> Those should be folded into the proposal; the rest should be dropped.

**Status:** ⛔ SUPERSEDED IN PART — see banner. Not ratified. Governs no code.
**Origin:** 2026-08-04, D3 item 3 of
`docs/specs/MAIA_MEMORY_FIELD_OBSERVABILITY_CONTRACT.md`. Founder ruling: **option 3b** —
OWNED does not belong inside the Memory Arena. It is a **cross-arena axis**, with memory
as its first concrete implementation.
**Measured against:** `0cf6696ab`.

---

## §1 — Why this is not a memory concern

Every MAIA arena faces the same boundary:

> **Can the system offer meaning without becoming the authority that defines the person?**

That question is not answered by any arena's own capability grammar. It recurs
identically in:

- the Knowledge Field (12 domains — see §4 on naming)
- archetypal agents
- Corpus Callosum routing
- frameworks and teaching systems
- symbolic interpretation
- practitioner tools
- member memory

If ownership observability lives inside the Memory Arena, every other arena must
rediscover the problem independently, and **nothing structurally compels any of them
to.** Lifting it to a shared axis makes it unavoidable.

**The general principle memory is the first instance of:**

> Every MAIA capability needs a visible path from
> **system capability → human encounter → human ownership.**

---

## §2 — The universal ownership states

```text
Observed
   ↓
Offered
   ↓
Engaged
   ↓
Integrated
   ↓
Owned
   ↓
Withdrawn / released
```

**The governing rule:**

> **The system can observe transitions. It cannot perform the transition into meaning.**

This is what separates a wisdom environment from an authority engine. The system may
record that a member engaged, integrated, or withdrew. It may never *effect* the move
into `Owned`, nor infer it from proximity, repetition, or silence.

`Withdrawn / released` is a first-class terminal state, not a failure. A member
releasing something is the axis working, not breaking.

⚠️ **Open — state semantics are not yet defined.** Each state needs a strict definition
and a falsification test before this axis can be implemented, in the manner of
`MAIA_MEMORY_FIELD_OBSERVABILITY_CONTRACT.md` §I. In particular `Engaged` and
`Integrated` are the two most likely to smuggle in inference. Not resolvable by
implementation.

---

## §3 — Ownership is not one object across arenas

⛔ **Do not assume the axis means the same thing everywhere.** Founder observation,
load-bearing:

> A teaching can be offered. A personal realization can be owned.
> **Those are not the same object.**

Illustration — the same five words, two very different readings:

| | Knowledge / Wisdom arena | Memory arena |
|---|---|---|
| stored | millions of concepts, authored by others | this member's own material |
| alive | available to the runtime | loader ran this turn |
| offered | selected for this moment | reached the prompt |
| used | included in reasoning | contributed measurably |
| **owned** | **?** — a teaching is never "owned" by the member in the memory sense | the member's lived material, theirs by origin |

The axis therefore standardizes the **shape of the question**, not the answer. Each
arena must define what `Owned` means *for the kind of object it holds* — and the
Knowledge arena's answer may be that ownership applies to the member's *relationship
to* a teaching, never to the teaching itself.

---

## §4 — The field distinction this resolves

The founder's framing:

```text
Wisdom Field  → offers possibilities
Memory Field  → offers personal continuity
MAIA          → holds the encounter
Member        → determines meaning
```

- The Wisdom Field may say: *"This pattern resembles archetype X."*
- The Memory Field may say: *"You have returned to these themes across your experiences."*
- Only the member may say: *"Yes, that is meaningful for me."*

**That final movement is `Owned`.** MAIA's intelligence comes from the relationship
between the two fields — never from letting one impersonate the other.

### ⚠️ Naming — this distinction already exists in canon under other names

Verified at `0cf6696ab`. Before adopting "Wisdom Field" as the top-level term, note
that the repo already contains **at least four distinct referents** for that phrase:

| Referent | Where | What it is |
|---|---|---|
| **Knowledge Field** | `docs/canon/MAIA_KNOWLEDGE_FIELD_v1.0.md` + `..._12_DOMAIN_MAP.md`; **wired** in `lib/maia/knowledge/knowledgeField.ts`, `lib/maia/prompts/knowledgeFieldBlock.ts` | The 12-domain consciousness registry. **This is the founder's "larger architecture" branch — it is already canon, already named, and already reaching the prompt.** |
| `wisdomFieldMoves.ts` | `lib/maia/wisdomFieldMoves.ts` | Narrow: 10 conversational *move* types (jungian-archetype, mcgilchrist-attention, …). Explicitly "not about teaching Jung." Correctly identified as a small implementation piece. |
| **Practitioner Wisdom Field** | `docs/specs/PRACTITIONER_WISDOM_FIELD_PRODUCT_DEFINITION_v0.md` (576 lines) | A governed product with its own constitution. **See §5 — not on this branch.** |
| Wisdom graph / keepers / submissions | `database/migrations/2026021410*`, `2026020400*`, `2026040100*`; `app/wisdom-keepers`, `app/labtools/wisdom` | Separate substrate and surfaces. |

Further: `docs/canon/MEDIA_FIELD_AND_RELATIONAL_FIELD_BOUNDARIES.md` **already draws
the Wisdom/Memory boundary**, under the names **"Public Knowledge Field"** vs
**"Relational Memory Field"**, as two of four domains that "cannot fully collapse into
one substrate."

⛔ **Therefore: do not mint "Wisdom Field" as a new top-level architectural term without
a naming ruling.** The distinction is right; the name is contested four ways, and one
of the four is ratified canon with live code behind it.

---

## §5 — Related prior art (verified, not assumed)

**`docs/canon/INTELLIGENCE_FIELD_ACCESS_MAP.md`** is the closest existing instrument
to the memory contract's stages, and it was not accounted for in D3. It asks:

> *"Can MAIA actually reach this field while she is speaking?"*

and grades every intelligence field on a five-column ladder:

```text
exists → computed → persisted → loaded at start → surfaced to inference
```

`surfaced to inference` is **OFFERED** under another name. Its status legend also
already contains the *"correct by design, do not fix"* concept — **observation-only by
design** — structurally the same insight as *consent-blocked is healthy*.

This makes **five** ladders now in play (capability grammar, governed-participation
maturity ladder, intelligence-field access map, memory lifecycle, this ownership axis).
⚠️ A consolidation pass is owed before any of them is built against.

---

## §6 — Record correction: a memory hook points off-branch

The memory index states the practitioner constitution *"LIVES IN
`docs/specs/PRACTITIONER_WISDOM_FIELD_PRODUCT_DEFINITION_v0.md`* — read it, never
reconstruct the rules from memory."

**Verified:** that path returns *No such file* on `feature/labtools-redesign` at
`0cf6696ab`. It is **not** lost — it exists in history, added by three sibling commits
(`51deb4b2d`, `e028a6334`, `80dfaf8df`, *"docs(practice-field): commit the constitution
that governs the gate"*) alongside three companions, all four absent from this checkout:

- `docs/specs/PRACTITIONER_WISDOM_FIELD_PRODUCT_DEFINITION_v0.md` (576 lines)
- `docs/specs/PRACTITIONER_WISDOM_FIELD_ARCHITECTURE_ASSESSMENT_v0.md` (279)
- `docs/governance/PRACTITIONER_WISDOM_CAPTURE_PROTOCOL_v1.md` (242)
- `docs/governance/LARRY_SOURCE_AND_CUSTODY_SITTING_AGENDA_v1.md` (19)

Retrieve with `git show 51deb4b2d:<path>`.

⛔ **The trap:** anyone following that hook from this branch sees "No such file" and may
conclude the constitution was never written — the same overbroad-absence error already
recorded once against the Larry IP corpus. **Absent from a checkout ≠ absent from the
repo.** The hook needs a branch qualifier, not a rewrite.

---

## §7 — What is decided, and what is not

**Decided (founder, 2026-08-04):**
- OWNED lifts out of the Memory Arena to a cross-arena sovereignty axis.
- Memory is its first concrete implementation.
- The system observes transitions; it never performs the transition into meaning.

---

## §8 — `alive` carries two referents (new collision, unresolved)

The four-stage memory arena reads `stored → alive → offered → used`. **`alive` is now
being used two incompatible ways:**

| Reading | Meaning | Who can answer |
|---|---|---|
| **Technical** (as written in the memory contract §I) | the loader ran this turn without error | the system, alone |
| **Relational** (founder, 2026-08-04) | *"is this still active in the person's world?"* — does it have a living relationship to the present | ⛔ **not inferable by the system alone** |

These are not refinements of each other. The relational reading is the more valuable
one — *simple retrieval systems fail exactly by confusing persistence with relevance* —
but it **cannot be the same field as loader health**, and it cannot be system-determined
without violating R4/§0.

⚠️ Consequence: the memory arena may need **five** stages, not four
(`stored → loaded → alive → offered → used`), or `alive` must be renamed. Left open —
this is the same collision class as `exists`, caught before implementation.

---

## §9 — The axis already has a working reference implementation

⭐ Verified at `0cf6696ab`: **`member_patterns` enforces the axis in the database today** —
`CHECK (status IN ('emerging','offered','confirmed','rejected'))` (migration
`20260316000003`), with `PatternOfferingService` writing `offered` + `last_offered_at`,
and `respondToPattern` gating member response on `status = 'offered'`.

Member patterns — not memory — is the axis's most mature instance. Memory is not the
first implementation; it is a **later** one arriving after the grammar was already
proven elsewhere. Any consolidation should measure itself against `member_patterns`,
`member_idea_recognition_events`, and `member_memory_atoms.member_response_status` —
the three the proposal already names.

---

## §10 — Open PR overlap: #960

**`#960 — feat(memory): Sprint 1 Truth Layer — declared policy, transition records,
truthful telemetry`** (`feature/memory-truth-layer`) is **OPEN, not merged**. It names
*transition records* and *truthful telemetry* — the same two objects as this document
and the memory observability contract.

⚠️ Coordination risk, not a finding: three lanes are converging on one object. Read #960
before extending either doc.

---

## §11 — Naming hypothesis (recorded, NOT a ruling)

- **Knowledge Field** — what humanity has articulated
- **Wisdom Field** — what becomes meaningful through relationship, practice, lived context
- **Memory Field** — what the member has entrusted from their own life

⛔ Hypothesis only. §4's four-way collision is unresolved, and `Knowledge Field` is
already ratified canon with live code, which constrains any renaming.

---

## §12 — Repository provenance principle (generalized from §6)

> **Absence in the current view ≠ absence in reality.**

A pointer to an artifact must carry enough provenance to retrieve it: *the artifact
exists · this branch does not contain it · the historical referent is `<sha>` · retrieval
requires that referent.* This is the memory-integrity principle applied to the repo
itself — the same discipline the observability contract applies to member material.

---

**Not decided — ⛔ do not resolve by implementation:**
1. Strict definitions + falsification tests for the six states (§2).
2. What `Owned` means in each non-memory arena (§3).
3. The naming ruling for the top-level knowledge/wisdom term (§4).
4. Whether the five competing ladders consolidate, and under which parent (§5).
5. Whether this axis amends `docs/specs/ADMIN_DIAGNOSTIC_SURFACE_2026-05-27.md`
   (ratified) — lifting OWNED to parent level implies it does.
