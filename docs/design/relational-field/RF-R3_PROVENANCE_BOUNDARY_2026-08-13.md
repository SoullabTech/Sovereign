# RF-R3 — The Provenance Boundary

**Status: ⚖️ RATIFIED — founder, 2026-08-13. Governing design authority.**
Precondition 4 of four is **MET at the design-authority level**.
⛔ Still not an implementation authorization. ⛔ No schema is created by this
document. Building remains closed pending the traffic witness and incorporation
of the six Constitution rulings.

## Governing principle (ratified)

> **A declaration is an event, not a field.**
>
> Declaration standing arises **only** from an authenticated member gesture,
> preserved with the member's **immutable wording** and attached to a **specific
> relationship at creation**. ⛔ No caller-assigned label, inferred value,
> imported passage, or downstream transformation can create that standing.

**Governing:** *RF-R3 does not remove containment; it creates the truthful
representational capacity under which containment can selectively open* —
per attributable assertion, never broadly per relationship.

---

## 0. The rule this object exists to satisfy

> **Provenance cannot merely be a `source` label assigned downstream. It must
> arise from the member's actual declaring gesture and remain attached to the
> assertion through persistence, retrieval, correction, and release.**

Everything below follows from taking that literally.

### Why the current model fails it

`member_relational_signals.source` is a **downstream label**. Any writer sets it
to any permitted value; nothing about the row records that a person did anything.
`persistDetectedSignal` hardcodes `'maia_conversation'` — not because it observed
a conversation, but because a developer typed it. A label a caller chooses is a
**claim about provenance**, not provenance.

That is why `DECLARATION_CAPABLE_SOURCES` is empty and must stay empty: no value
in that column can ever be evidence of authorship, because the column is not
wired to an act.

---

## 1. The central move: a declaration is an EVENT, not a field

⭐ **Eligibility to speak as declaration comes from the existence of a
declaration record, never from the value of a column.**

A **Declaration** is created *only* as the direct product of an authenticated
member gesture. Nothing derives one; nothing upgrades into one. An assertion is
eligible to speak in the member's voice **iff** a Declaration exists for that
exact assertion.

This inverts the current design. Today: write a row, then label its origin.
Proposed: a member act produces a record, and assertions *reference* it.

---

## 2. What a Declaration must carry

Answering the founder's eight requirements at assertion level:

| # | Requirement | Carried as |
|---|---|---|
| 1 | **Who authored the exact assertion** | `member_id` of the authenticated actor — the person whose session performed the gesture, not the row's subject |
| 2 | **The authenticated member action that declared it** | the **gesture witness**: route + method + server-side session/auth event identifier + server timestamp. ⛔ Never client-asserted |
| 3 | **The relationship it applies to** | `relationship_id`, **NOT NULL and required at creation**. ⛔ A declaration with no referent cannot exist — the failure that produced 440 unattached signals is made structurally impossible |
| 4 | **The immutable source wording** | `declared_text` — the member's exact submitted words, **write-once**. ⛔ Never edited, never normalized, never model-rewritten, never summarized |
| 5 | **Whether it remains current** | `affirmed_at` + `superseded_by`. Currentness is a *state of standing*, distinct from truth |
| 6 | **Correction / supersession / withdrawal** | §4 below — each a distinct member act with distinct semantics |
| 7 | **Whether MAIA may retrieve and offer it** | `retrieval_consent` — a member-set gate, defaulting to the member's choice at creation (§5) |
| 8 | **Why promotion is impossible** | §6 — structural, not policy |

⚠️ **`declared_text` is the anchor.** Requirements 1–3 identify the act;
requirement 4 preserves *what was actually said*. Without immutable wording, a
"declaration" degrades into a system paraphrase wearing a member's name — the
same failure as `rupture_state`, one layer up.

---

## 3. What an assertion is, relative to a declaration

An **assertion** is any relational claim the system might hold or speak
("this relationship feels distant", "a boundary was named"). Each assertion is
exactly one of:

| Class | Origin | May speak as member's word? | May MAIA offer it? |
|---|---|---|---|
| **DECLARED** | has a Declaration | ✅ yes, quoting `declared_text` | ✅ subject to consent + currentness |
| **OBSERVED** | MAIA in-conversation, attributed | ⛔ never | ✅ **only attributed to MAIA**, and offered as a question |
| **INFERRED** | classifier / detector output | ⛔ never | ⛔ not until RF-R6, and only member-recognized |
| **IMPORTED** | from another surface or system | ⛔ never | ⛔ requires its own consent act |

⛔ **The classes are disjoint and an assertion never changes class**, except by
§6. This is the ontology `source` was pretending to be.

---

## 4. Correction, supersession, withdrawal — three different acts

⛔ Not synonyms. Conflating them is how relational history gets destroyed to fix
one wrong sentence (the defect found 2026-08-10: the only remedy was archiving
the whole relationship).

| Act | Meaning | Effect on the record |
|---|---|---|
| **Affirm** | *"still true"* | updates `affirmed_at`. Nothing else changes |
| **Correct** | *"that's not what I meant"* | creates a **new Declaration**; the prior one gets `superseded_by`. ⛔ Both are retained. The original wording is never rewritten |
| **Supersede** | *"true then, not now"* | same mechanism, different meaning — the prior remains **historically true**, no longer current |
| **Withdraw** | *"stop using this"* | sets `retrieval_consent = false`. ⛔ Retrieval stops **immediately**; the row is not deleted |
| **Release** | *"remove it"* | member-initiated deletion — the only path that destroys, and only ever member-initiated |

⭐ **Correct and Supersede share a mechanism and differ in meaning** — so the
member's intent must be captured explicitly, not inferred from the edit. A system
that guesses which one happened is authoring meaning again.

⛔ **No system process may perform any of these five acts.** Not decay, not
cleanup, not a migration.

---

## 5. Retrieval eligibility — what MAIA may say

MAIA may retrieve and offer an assertion **iff all hold**:

1. it is **DECLARED** (or **OBSERVED** and offered explicitly as MAIA's own), and
2. `retrieval_consent` is true, and
3. it is **not withdrawn**, and
4. it is current — or, if superseded, offered **as history with its date**, never
   as the present.

The offer must carry its provenance in the utterance itself:

> *"You wrote in June: 'we've stopped calling'. Is that still how it is?"*

⛔ Never: *"Your relationship with X is distant."*

⭐ This is the governing movement made concrete —
**retrieve → attribute → offer → ask → receive correction.**
Note that the member's answer is itself a gesture, and therefore may produce a new
Declaration. The loop closes.

---

## 6. Why promotion is impossible — structural, not policy

The founder's eighth requirement: *why inference, observation, import, or
classification can never be promoted into declaration without a new member act.*

⛔ **Because a Declaration cannot be constructed after the fact.** It requires a
gesture witness (§2, requirement 2) — a server-side authenticated action with its
own timestamp and session identity — and **immutable wording the member actually
submitted**. An inference has neither. There is no function that manufactures a
past authenticated act, and none may be written.

So promotion is not forbidden by a rule that a future developer might forget or
route around. **It is unavailable.** A classifier output can only become a
declaration by a member being shown it and *saying something* — and what they say
is the declaration, with their words, not the classifier's.

⭐ This is the same lesson as the containment chokepoint: **prefer a boundary
whose shape makes the violation impossible over one that forbids it.**

---

## 7. Reuse — what this must not duplicate

- `relationship_entries` with `confidence IS NULL` (**18 rows**) are the closest
  existing member-created analogue. RF-R3 should establish whether these are
  retro-eligible — ⛔ answer expected to be **no**, since no gesture witness or
  immutable wording was captured. They are **UNPROVEN**, not declared.
- `member_relational_signals` remains an **inference** substrate. ⛔ Do not add a
  declaration value to its `source` enum — that would re-create the very
  label-as-provenance error this object exists to end.
- Member consent-gate precedent already exists: atoms' `return_preference`,
  Daily Anchor's `surface_preference`. `retrieval_consent` should follow that
  shape, not invent a third.
- `posture_at_creation` semantics are already ruled: `normal` / `sanctuary` /
  `NULL` = not durably recorded. ⛔ **Never backfilled.** Declarations must carry
  it from creation.
- Sanctuary: ⛔ a sanctuary session may not produce a Declaration. The gesture is
  real, but the containment boundary is absolute.

---

## 8. ⚖️ Founder rulings — 2026-08-13 (all four settled)

### 1. The existing 18 entries are NOT retro-eligible
They remain **UNPROVEN**, not declarations. ⭐ They **may** be presented to
members for new affirmation, correction, or restatement — but any resulting
declaration **begins with that new authenticated act**. ⛔ **It is never
backdated.** So the 18 are a live path forward, not a dead corpus; what they can
never be is silently promoted.

### 2. `retrieval_consent` is FALSE when unanswered
⛔ **Storage does not imply permission to retrieve or offer** the declaration in
conversation. **Silence creates no consent.** Retrieval becomes available only
through an explicit member act.

### 3. OBSERVED assertions are IN-TURN ONLY before RF-R6
They may inform the immediate response; ⛔ they may **not** persist as
member-level relational knowledge.

⚠️⚠️ **Anti-laundering clause:** *operational telemetry must not preserve the
semantic assertion in another guise.* Logging, metrics, agent-run metadata,
debug records — none may become a back door through which an observation
persists. If a store would let the assertion be read back as knowledge about the
relationship, it is persistence, whatever the table is called.

Persistent observed intelligence stays closed until **RF-R6** establishes its
standing, visibility, correction, expiry, and recognition boundaries.

### 4. Declarations receive a DEDICATED table
The constraints are **constitutive, not optional metadata**, and ⛔ must not be
retrofitted onto `relationship_entries`. The table represents **declaration
events and their lineage**: immutable wording · authenticated actor ·
relationship referent · gesture witness · consent state · subsequent acts.

---

## 9. Additional ratifications (2026-08-13)

- `relationship_id` is **required at creation**.
- `declared_text` is **write-once**. ⭐ Correction creates **lineage**; ⛔ it never
  rewrites history.
- **Affirm · Correct · Supersede · Withdraw · Release** remain **distinct member
  acts**, and their meanings must be retained ⛔ without system inference.
- ⭐⭐ **Eligibility is COMPUTED from the declaration event and its subsequent
  lineage — ⛔ never copied into a mutable authority field.** No denormalized
  `is_eligible` / `is_current` flag may become the thing consulted; a cached
  authority bit is how provenance decays back into a label.
- Inference promotion is **structurally unavailable** (§6).
- ⛔ **No declaration value may be added to `member_relational_signals.source`.**

### ⭐ Precision on Release — must remain explicit

> **Release concerns permission for the declaration to remain available for
> relational use. ⛔ It must NOT be interpreted as a statement that the original
> experience was false.**

A member removing something is exercising authority over its use, not recanting
their life. Likewise **withdrawal, correction, and supersession** each retain
distinct meanings, and ⛔ the system may never infer which one a member intended.

---

## Acceptance

Precondition 4 is **MET**. RF-R3 building opens only when the remaining two are
closed: the **traffic-dependent containment witness**, and **incorporation of the
six Constitution rulings**. ⛔ Ratification of this document means the eight
requirements are answered — ⛔ **not** that the schema exists.
