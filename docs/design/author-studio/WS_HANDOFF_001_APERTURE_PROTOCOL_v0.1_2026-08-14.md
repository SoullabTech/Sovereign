# WS-HANDOFF-001 — Governed Aperture & Epistemic Persistence Protocol v0.1

```text
STATUS ......................... SPECIFICATION + DESIGN FINDING.
                                 Founder rulings R1–R5 incorporated 2026-08-14.
IMPLEMENTATION ................. ⛔ CLOSED
STUDIO HOME .................... existing acceptance/failure sequence remains PRIMARY
                                 (the live member-facing problem is ARRIVAL, not memory)
NEW SUBSTRATE .................. ⛔ NOT AUTHORIZED — R4 states a preferred DIRECTION only
CANONICAL REF .................. 8ca322891801960ff0b4bfd4c499d16436fd3b73
                                 (origin/clean-main-no-secrets, observed 2026-08-14)
DRAFTED FROM ................... worktree feature/labtools-redesign @ d41b8b355
                                 ⚠️ 547 behind / 55 ahead · 500 dirty paths
                                 → custody taken separately off canonical; ⛔ not committed
                                   from that worktree
```

> **The aperture is not a room.**
> **The hypothesis is not a fact.**
> **Recognition is not a decision.**
> **Assessment is not authority.**
> **Refinement is lineage, not revision of history.**

> **The Studio contains governed changes of aperture around a Work; aperture names must not
> manufacture new product rooms.** *(R1)*
>
> **Provenance persists. Attention must be reauthorized. Posture is recomputed. MAIA's
> assessment is recomputed.** *(R2)*
>
> **Intellectual development creates lineage; it does not rewrite provenance.** *(R3)*
>
> **Memory may preserve a hypothesis, but memory itself may never serve as evidence for that
> hypothesis.**

⛔ **Vocabulary boundary.** *Aperture · distance · posture · crossing · claim* are **internal
design vocabulary and must never become member-facing** — the same rule that holds
*Hearth · Place · Gesture* internal (`INTEGRATE_PRACTICE`; and the 2026-08-04 Writer's
Studio · Canvas · WriterField ruling).

---

## 0. What already existed (recovery before design)

Nothing below is proposed as new. Each was recovered and read at the SHA named.

| Instrument | Where | What it already settles |
|---|---|---|
| `docs/canon/WRITER_STUDIO_AUTHOR_STUDIO_DISTINCTION_2026-08-04.md` | canonical `8ca3228918` | **RULED.** Work → {Materials · Development · Expressions}. *"A form is an expression of a Work, not the identity of the Work."* ⛔ *"the instrument changes, the room does not."* |
| `docs/design/author-studio/WRITER_CANVAS_ROOM_MAP_2026-08-05.md` | canonical | The three-zone room: **Worktable** (instruments: Writing · Development · Renewal) · **Study Wall** (drawers: Work · Materials · Structure · History) · **Window** (MAIA; closed by default, opens only on member gesture). |
| `lib/livingWork/domain.ts` + `20260801000001_living_works.sql` | canonical | `refuseDeclaration` / `refuseBelonging` (Guard 1 + ownership) · `NEVER_AUTHORED_BY_THE_SYSTEM` (Guard 2) · Guard 3 *observations ≠ interpretations* · `CREATION_REQUIRES_A_MEMBER_ACT`. **The Work-belonging crossing is already specified in code.** |
| `app/writers-studio/studioMap.ts` | canonical | `gatherings · shape · release` exist as **Author Studio phases at `availability: 'later'`** — not Writer's Studio zones. |
| `WRITERS_FIELD_GOVERNING_CONSTRAINTS_2026-08-05.md` | ⚠️ **on disk only — absent from canonical** | MAIA's position is *defined entirely by refusal*: **never writes for you · never edits behind you · never brings anything in unasked.** The admired property is *"It has no inference engine."* |
| `docs/architecture/WRITERS_STUDIO_OPEN_ARCHITECTURAL_QUESTIONS.md` | ⚠️ **on disk only** | **A1** (what member act establishes a relationship — unresolved) · **A2** (may a Reference accumulate counters — *"must not accumulate interpretive judgments"*) · **B2** (`studio_projects`, unruled) · **G1–G3**. |
| `docs/governance/JARVIS_STEWARDSHIP_CONSTITUTION_2026-08-12.md` | ⚠️ **on disk only** | §5 *name a broken crossing, not a missing feature.* North star: *are writers increasingly able to forget the Studio and remain with the work?* |

⚠️ **Custody finding (reported, not repaired).** Three documents this protocol reasons
against — including the constitution governing the steward skill — **exist on local disk but
not at canonical `8ca3228918`**. Their standing here is *recovered design*, not trunk custody.

🔴 **The finding that governs all others:** **nothing in the member-experience design corpus
governs.** Every document there declares itself CANDIDATE / *"authorizes no implementation."*
**Recovering a design does not confer authority to build to it** — and that applies to this
document first.

---

## 1. R1 — Grammar: aperture, not rooms

**Ruled 2026-08-14.** ⛔ `Work → Writing → Materials → Shape → Expression` is **not canonized
as five peer zones.** `Work` remains the center; existing nouns keep existing meanings.
⛔ **Expression does not become a room. Shape is not promoted out of its already-ruled Studio
meaning.** The discovery is preserved as an **aperture model**, expressed in **neutral
relational vocabulary rather than product nouns** — descriptions of distance, never
destinations in the UI:

```text
aperture.distance   close | gathered | structural | outward
aperture.focus      <focal object>  |  none
aperture.scope      local | work | selected-materials | whole-work
aperture.purpose    writer-declared  |  null      ⛔ never system-authored
```

Why this was the conflict: measured against canon, the mandate's five names were four
different *kinds* of thing — *Writing* an **instrument**, *Materials* a **drawer**, *Shape* an
**Author Studio phase** (`availability: 'later'`), *Expression* **ruled explicitly not a
room** (*"if each form becomes a mode, the product fractures"*). The distance intuition —
*different distances from the Work afford different kinds of knowing* — was the real
contribution, and it survives intact without minting rooms.

**Non-binding orientation only** (⛔ not a mapping to build to): *close* is the writer's
immediate text; *gathered* is material within reach but not thereby belonging; *structural*
is pattern and relation across the whole; *outward* is the Work in relation to form,
audience, medium.

---

## 2. Deliverable 1 — Handoff Protocol v0.1

### 2.1 The grammar (the settled part)

```text
SYSTEM   carries.
MAIA     proposes.
WRITER   authorizes.
THE RECORD states what, if anything, became authoritative.
```

### 2.2 The distinctions, as mechanical obligations

Each left term must be representable **without** implying the right:

```text
available       ≠ relevant            → carriage is by named rule; salience is never stored
relevant        ≠ belongs             → belonging requires refuseBelonging() to pass
visible         ≠ selected            → aperture.focus is exactly one, or none
navigation      ≠ intention           → aperture.purpose is writer-declared or null
attention       ≠ agreement           → entering an aperture writes nothing to recognition
proposal        ≠ truth               → origin is immutable; evidence never edits origin
inspection      ≠ recognition         → inspection is an aperture act; recognition is a writer act
recognition     ≠ declaration         → declaration additionally requires refuseDeclaration()
recognition     ≠ decision            → orthogonal dimensions, never a lifecycle  (R5)
assessment      ≠ authority           → MAIA's assessment is never the claim's status  (R2)
system mutation ≠ writer act          → declared_by is NOT NULL and never a system actor
consent to look ≠ consent to believe  → an aperture act creates no semantic authority
remembered      ≠ corroborated        → memory is inadmissible as evidence
retrieved       ≠ relevant            → retrieval does not activate an inquiry
familiar        ≠ established         → no dimension has a term for age
repeated        ≠ recognized          → repetition is not counted (A2 constrains counters)
refined         ≠ revised             → refinement mints a new claim  (R3)
```

### 2.3 The five obligations of any crossing

1. **Carriage is by rule, never by judgement.** MAIA does not choose the payload.
2. **Provenance crosses with the content, or the content does not cross.** (N7)
3. **A crossing creates no semantic authority** unless a writer act occurs inside it.
4. **A crossing writes nothing to recognition, decision, or evidence.**
5. **Posture is derived at arrival, never carried; MAIA's assessment is recomputed, never
   restored.**

---

## 3. Deliverable 4 — Record schema, field by field

### 3.1 The original field list, audited

| Proposed field | Verdict | Reasoning |
|---|---|---|
| `work` · `from` · `to` · `focal_object` | ✅ keep — as `aperture.*` (R1) | independent; `focus` is what makes *visible ≠ selected* checkable |
| `trigger.type` | ✅ keep | `navigation · restoration · invitation · reactivation` |
| `trigger.source` | ✅ keep | *who caused motion* ≠ *who proposed it* |
| `proposed_by` / `authorized_by` | ✅ keep — **the core pair** | `{proposed_by: maia, authorized_by: writer, authority: none}` must be representable, and is |
| `reason` | 🔴 **rejected as one field** | collapses *why the system carried this* with *what the writer intended* (`navigation ≠ intention`), and a system-written reason violates Guard 2 (`'purpose'` ∈ `NEVER_AUTHORED_BY_THE_SYSTEM`). **Split:** `carry_rule` (system fact, enumerated) + `aperture.purpose` (writer-declared or null) |
| `carried` | ✅ keep | each item carries its own provenance ref |
| `left_out` vs `available_but_not_carried` | ⚠️ **not independent** | you cannot leave out what was not available, and enumerating "available" is enumerating the corpus. **Replace with** `not_carried_rule` |
| `originating_hypothesis` · `hypothesis_status` | 🔴 **rejected (denormalization)** | a status copied into a crossing record ages into a second, contradicting authority. **Replace with** `claim_ref`; ⛔ never mirror state |
| `authority_before` · `authority_created` | ✅ keep | independent |
| `authority_after` | ⚠️ **derivable** | `before ⊕ created`; storing it permits a record that disagrees with the ledger. **Derive** |
| `maia_posture` | 🔴 **rejected as stored fact** | storing posture is the mechanism by which an old posture stays permanently on. Store the **inputs**; derive at arrival |
| `timestamp` / provenance | ✅ keep | |

### 3.2 R2 — What persists, and what does not

**Ruled 2026-08-14.** ⛔ **There is no canonical MAIA-authored `evidence_status` in v0.1.**
That would create precisely the second authority this protocol exists to prevent. MAIA may
produce an assessment **during an active inquiry**; it remains an assessment and ⛔ never
becomes the durable status of the claim.

```text
PERSISTS
  claim provenance          content, origin, proposed_by, created_at   ⛔ IMMUTABLE
  evidence references       what was looked at, and under whose aperture
  writer acts               authorized-for-inquiry, inspected, parked, reopened
  writer recognition        none | explicit                            ⛔ WRITER ONLY
  writer declaration        via refuseDeclaration() / refuseBelonging()
  historical MAIA proposal  retained verbatim, never edited            (R3)
  lineage                   refines_from / refines_into, declared      (R3)

⛔ DOES NOT PERSIST
  claim.evidence_status = supported        ← the system does not own this fact
  maia_confidence                          ← aggregate interpretive judgment
  maia_posture                             ← derived at arrival
  authority_after                          ← derived
  salience / relevance / counts of any kind
```

⚠️ **Named future object, ⛔ not authorized:** if longitudinal machine assessment is ever
genuinely needed, it requires **its own ruled object — an explicitly non-authoritative
assessment event — never the claim's authority state.**

### 3.3 The four kinds that must never collapse

```text
OBSERVATION   what evidence directly establishes
HYPOTHESIS    a possible meaning or interpretation
RECOGNITION   what the writer explicitly recognizes
DECISION      what the writer chooses to do
```

⛔ None may silently promote the next.

### 3.4 R5 — Recognition and decision are orthogonal

**Ruled 2026-08-14.** ⛔ **Never model `recognized → adopted` as a lifecycle.** They are
independent dimensions:

```text
epistemic recognition   ⊥   creative decision
```

All four quadrants are legitimate and must be representable:

| | decision: none | decision: adopted |
|---|---|---|
| **recognition: none** | inspected, nothing followed | ✅ adopted an edit without believing the interpretation that produced it |
| **recognition: explicit** | ✅ recognized a pattern and did nothing | recognized and acted |

…and: **rejected MAIA's hypothesis while keeping a structural change discovered by testing
it.** A model with a single lifecycle cannot express that, and it is the ordinary case.

---

## 4. Deliverable 2 — Distance × MAIA posture

Baseline in every aperture is the recovered refusal set: **never writes for you · never
edits behind you · never brings anything in unasked.** The Window is **closed by default and
never opens itself.**

| `aperture.distance` | MAIA's relation | May offer | ⛔ May not infer |
|---|---|---|---|
| **close** | immediate text | nothing unless invited; on invitation, reflection on what is shown | that difficulty, flow, or pace means anything; ⛔ no generated prose as the work |
| **gathered** | material within reach, ⛔ not thereby belonging | the provenance of a material — where it came from, when, by whose act | ⛔ that presence implies belonging (`refuseBelonging()` is the only path) |
| **structural** | pattern and relation across the whole | on invitation: observations, gaps, alternatives — **as observations, never as the Work's shape** | ⛔ that entering expresses a purpose (N3) |
| **outward** | the Work in relation to form, audience, medium | ⛔ nothing not asked for | ⛔ that a Work is becoming any particular form |
| **the Window** (any distance) | reflection without authorship | questions; witness; connections among the writer's **own** materials | ⛔ psychological state; ⛔ unsolicited suggestion; ⛔ praise or scoring |

**Two postures, derived — never stored:**

- **Receptive attention** — the writer initiated the inquiry.
- **Adversarial care** — MAIA originated the hypothesis under examination.

---

## 5. Deliverable 5 — Adversarial Care

**Rule.** *When MAIA introduces a hypothesis, she acquires additional responsibility to seek
disconfirming evidence — not additional authority for the hypothesis.*

**Temporal form.** The obligation is **derived from durable provenance**, not stored — and
under R2 it reads only fields the system is permitted to own:

```text
posture := adversarial_care  ⟸  claim.origin == maia
                              ∧ claim.writer_recognition == none
                              ∧ inquiry_active == true
```

Both opposite failures are closed:

- MAIA cannot **forget she originated it** and later meet her own suggestion as independent
  evidence → `origin` is immutable and persists.
- An old idea cannot **keep tugging** → `inquiry_active` is false until a present-tense
  writer act sets it.

**The self-confirmation rule.** Evidence surfaced inside an aperture **MAIA proposed**, in
service of a claim **MAIA originated**, is recorded `independence: non_independent`. MAIA may
not treat it as corroboration — otherwise she confirms herself merely by having directed
attention toward supporting material.

**Longevity contributes nothing.** Three-week-old speculation is speculation. ⛔ No dimension
has a term for age.

**Reactivation.**

```text
THEN   MAIA proposed H · writer authorized inspection · inconclusive
       → no recognition · no decision · inquiry_active := false
NOW    writer: "let's go back to the river thing"
       → provenance restored unchanged · recognition and decision unchanged
       → inquiry_active := true        (writer act, present tense)
       → posture recomputed → adversarial care
       → MAIA's assessment recomputed from evidence, not restored from memory
```

The writer authorizes **renewed attention**, ⛔ never the historical record.
**Epistemic persistence ≠ inquiry activation.**
If MAIA wants it back: **MAIA proposes renewed attention; the writer authorizes.**

---

## 6. Deliverable 3 — Authority transition assessment

| Transition | Cause | Authority | Status after R1–R5 |
|---|---|---|---|
| unseen → observation | evidence | MAIA/system may state a directly-checkable fact **during an active inquiry** | ✅ **ephemeral only.** ⛔ Durable storage would be a system-authored assertion — Guard 3, A2 |
| observation → hypothesis | interpretation | writer **or** MAIA may propose | ✅ **safe** — conditional on `origin` recorded immutably |
| hypothesis → "supported" | evidence | — | 🔴 **not a persisted transition (R2).** Assessment is recomputed while the inquiry is active; it is never the claim's status |
| hypothesis → writer-recognized | explicit writer act | ⛔ **writer only** | ✅ **safe** — enforce like `refuseDeclaration`: explicit act + ownership |
| recognition → decision | — | — | 🔴 **not a transition at all (R5).** Orthogonal dimensions |
| hypothesis → rejected | writer rejection · or evidence | — | ✅ **two separate facts, kept separate.** Writer `disposition: rejected` may coexist with an assessment that says otherwise, and vice versa |
| unresolved → reopened | renewed attention | writer authorization or request | ✅ **safe.** MAIA may *propose* renewed attention; ⛔ may not activate it |
| claim → refined claim | intellectual development | whoever proposes the refinement | ✅ **mints a new claim (R3).** ⛔ The original is never edited |

---

## 7. Threshold matrix — the crossings

| Crossing | May trigger | Must authorize | Carries automatically | Left outside | Authority change | Reversible |
|---|---|---|---|---|---|---|
| close ↔ gathered | writer · MAIA may propose | writer | work identity, focus, open `claim_ref` | the corpus; anything not of this work | ⛔ none | yes |
| close ↔ structural | writer · MAIA may propose | writer | work identity, current position | ⛔ any purpose for entering (N3) | ⛔ none | yes |
| gathered ↔ structural | writer · MAIA may propose | writer | the material's provenance **with** the material | belonging status (unchanged) | ⛔ none | yes |
| structural ↔ Author Studio phase | ⛔ **writer only** | writer | work identity | everything interpretive | ⚠️ environment change, ⛔ not semantic | yes |
| **any → Work belonging** | ⛔ **writer only** | writer | — | — | 🔴 **YES — real semantic authority** | ⚠️ unspecified in canon |
| outward → published artifact | ⛔ **writer only** | writer | — | — | 🔴 **YES — outward-facing** | ⛔ **not governed by this protocol** |

⛔ **The Work-belonging crossing is already implemented and must not be redesigned.**
`refuseBelonging()` / `refuseDeclaration()` in `lib/livingWork/domain.ts` **are** the crossing:
declaration + ownership, `declared_by NOT NULL`, nothing attaches automatically. A new
belonging mechanism is a **stop condition**, not a design.

⚠️ The *first member act* establishing a relationship is **A1 — deliberately unresolved on
canonical.** ⛔ This protocol must not answer it by accretion.

---

## 8. Deliverable 6 — Negative control suite (16)

```text
N1  MAIA proposes motif → writer agrees to inspect
    ⊳ writer_recognition remains `none`; no semantic authority created
N2  writer opens a transcript
    ⊳ no belonging row exists (refuseBelonging never called)
N3  writer enters `structural`
    ⊳ aperture.purpose is null; no field holds a system-authored purpose
N4  MAIA proposes structure → writer explores → writer adopts an edit
    ⊳ decision `adopted` coexists with recognition `none`            (R5)
N5  material surfaced N times
    ⊳ no counter influences carriage; no ordering derived from frequency
N6  system hypothesis retrieved repeatedly
    ⊳ origin stays `maia`; nothing becomes member-known
N7  context crosses a threshold
    ⊳ every carried item still answers "why is this here"; else it did not cross
N8  H stored → retrieved 3 weeks later
    ⊳ nothing moves; no persisted status exists to move                (R2)
N9  H appears across many sessions
    ⊳ repetition contributes to no dimension
N10 writer agrees to reopen H
    ⊳ writer_recognition remains `none`
N11 MAIA finds 6 more supporting instances
    ⊳ recognition remains `none`; the assessment is ephemeral; disconfirming
      search is obligated before it may be shown
N12 MAIA finds disconfirming evidence
    ⊳ original proposal retained verbatim; history not rewritten
N13 old unresolved H exists; writer enters `structural` for an unrelated purpose
    ⊳ H is not surfaced
N14 a parked inquiry
    ⊳ retrievable on request; outside the active aperture otherwise
N15 memory-as-evidence probe
    ⊳ no evidence reference may cite the claim's own persistence or age
N16 H17 refined into H23                                              (R3)
    ⊳ H17 is unchanged and still readable in full; H23 carries its own
      provenance, evidence, and authority history
```

---

## 9. Deliverable 7 — Worked traces

**T1 · writer-initiated close → structural.**
`trigger{type: navigation, source: writer}` · `proposed_by: writer` ·
`authorized_by: writer` · `carry_rule: work_identity_and_position` · `authority_created: none`
· `aperture.purpose: null` · posture derived → **receptive attention**. No claim touched.

**T2 · MAIA-proposed / writer-authorized close → structural.**
`proposed_by: maia` · `authorized_by: writer` · `claim_ref: H17` ·
`authority_created: none` · `writer_recognition: none`. Posture → **adversarial care**.
Evidence surfaced here is flagged `non_independent`.

**T3 · gathered → close with an explicit declaration.**
Two records, deliberately: the crossing (⛔ no authority), then the writer's declaration —
`refuseBelonging()` passes, `declared_by = member`, `declared_at` set. 🔴 The **declaration**
carries the authority; the crossing never does.

**T4 · MAIA hypothesis → inquiry → 3-week gap → reactivation → rejection.**

```text
observation ............. retained          (3 river images occur)
original hypothesis ..... retained verbatim as a historical proposal
origin / proposed_by .... maia                        ⛔ immutable
writer inspected ........ yes
writer recognition ...... none
decision ................ none                        (orthogonal — R5)
disposition ............. rejected                    (writer act)
structural authority .... none
MAIA assessment ......... ⛔ not persisted; recomputed while active   (R2)
lineage ................. H17 —refines_into→ H23, declared            (R3)
```

⛔ The record must **not** compact to `river motif = false`. It *was* a hypothesis that
shaped an inquiry, and that is true. H17 remains historically intact
(`disposition: superseded-for-current-inquiry`); H23 begins with its own provenance.

---

## 10. Deliverable 10 — Studio-specific vs portable

```text
ESTABLISHED FOR STUDIO (ruled canon / shipped code / R1–R5)
  · declaration + ownership as the belonging crossing (refuseBelonging)
  · NEVER_AUTHORED_BY_THE_SYSTEM · CREATION_REQUIRES_A_MEMBER_ACT
  · the Window is closed by default and never opens itself
  · a form is an expression of a Work, not its identity
  · aperture names must not manufacture product rooms          (R1)
  · MAIA's assessment is never the claim's durable status       (R2)
  · refinement mints a claim; provenance is never rewritten     (R3)
  · recognition ⊥ decision                                      (R5)

CANDIDATE PORTABLE PRINCIPLE (⚠️ untested outside the Studio)
  · proposal ≠ truth · attention ≠ agreement · consent to inspect ≠ consent to believe
  · generated salience ≠ authority · system action ≠ human act
  · provenance persists · attention must be reauthorized · posture is recomputed
  · memory may never serve as evidence for what it preserves
  · assessment ⊥ authority · recognition ⊥ decision

UNESTABLISHED OUTSIDE STUDIO
  · the aperture model · the crossing record · the claim record · the event set
  · anything about MAIA's conversational surface, memory atoms, or the anchor lane
```

⛔ **This is not a platform-wide epistemic protocol.** Writer's Studio is the proving ground;
promotion is a separate founder act, and is **not ripe** — no evidence could support it until
the Studio has exercised this.

---

**Continues in:** `WS_HANDOFF_001_FOUNDER_RULINGS_AND_HAZARDS_2026-08-14.md`
(§11 rulings as issued · §12 hazards · §13 stop conditions).
