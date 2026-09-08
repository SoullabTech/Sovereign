# WORK-ACT-LINEAGE-01 — DESIGN

```
STATUS              DESIGN OPEN · schema only
MIGRATION           NOT AUTHORIZED
BUILD               NOT AUTHORIZED
CANONICAL MERGE     HOLD
DEPLOY              HOLD
```

Date: 2026-09-08 · Opened by founder act after ratifying **RW-C1..C4**.
Upstream record: `REMOVE-WORK-METADATA-01_DISCOVER_2026-09-08.md`.

> **Deletion may end presence. It may not falsify provenance or rewrite the past.**

## 0. The question, as posed

What is the smallest append-only fact model that can

- **B** — preserve former-Work naming/relationship provenance for retained
  writing without creating a manuscript title;
- **C** — preserve historical acts and their act-time identifying context after
  current Work rows disappear;

while asserting no current Work status, preserving no deleted Work as a live
entity, keeping B and C independently testable, and remaining append-only.

The design must explicitly answer **whether one ledger can lawfully carry both,
or whether two resources are required.**

---

## 1. Exact blast radius of removal (measured, not assumed)

`app/api/sovereign/studio/history/route.ts` composes history as a `UNION ALL`
over six act kinds. Every one of them touches `living_works`, in one of two
ways, and the two have different failure modes.

```
ACT KIND              SOURCE TABLE                  ON WORK REMOVAL
work_begun            living_works (IS the row)     ⛔ ACT VANISHES
expression_declared   living_work_expressions       ⛔ ACT VANISHES (cascade)
material_declared     living_work_materials         ⛔ ACT VANISHES (cascade)
writing_arrived       manuscript_source_arrivals    ⚠️ survives · work_title → NULL
version_kept          working_draft_revisions       ⚠️ survives · work_title → NULL
line_marked           manuscript_keeps              ⚠️ survives · work_title → NULL
```

Three acts **disappear**. Three **survive but are silently rewritten** — the
`work_of` CTE `LEFT JOIN`s `living_works` for the title, so the act remains but
loses the context that made it legible.

Every child table cascades:

```
living_work_expressions              ON DELETE CASCADE
living_work_materials                ON DELETE CASCADE
living_work_material_considerations  ON DELETE CASCADE
living_work_visual                   ON DELETE CASCADE
```

⭐ **Both failure modes are one defect with one cause: history is derived from
current rows.** RW-C1 names the first (an act may not disappear); RW-C2 names
the second (a later act may not rewrite an earlier one through a live join).

---

## 2. ⭐ ONE LEDGER, NOT TWO — and why

**Recommendation: a single append-only act ledger. B is a query over it, not a
second resource.**

The argument:

1. **B's fact is a strict subset of C's facts.** *"This writing was previously
   carried by a Work named X"* is derivable from three C acts — `work_named`,
   `expression_declared`, `work_removed` — all of which C must record anyway.
   A separate `former_work_name` table would store a conclusion C already
   entails, and two stores of the same fact drift.
2. **A dedicated B table would encode a conclusion, not an act.** It would have
   to be written *at removal time* and would answer *"what should we show?"* —
   a presentation question — in the persistence layer. RW-B3 makes presentation
   a surface concern; the store should hold facts and let the surface decide.
3. **The projection objection does not apply.** Deriving B from a log is a
   projection, but over an **immutable** log. The defect in §1 is projection
   over **mutable current rows**. Immutability is the whole difference.

⛔ **Shared carrier is not shared authority.** Per the founder ruling, B and C
keep separate acceptance contracts (§7). B cannot be declared solved because
C's history looks right, and C cannot be declared solved because B's retained
writing is recognizable.

---

## 3. Shape of the fact (schema sketch — NOT ratified, NOT a migration)

```
member_studio_acts
  id            UUID PK
  member_id     UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT
  kind          TEXT NOT NULL            -- closed vocabulary
  occurred_at   TIMESTAMPTZ NOT NULL     -- act time, never row time
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT now()

  -- SUBJECTS: plain UUIDs. ⛔ NO FOREIGN KEY. See §4.
  work_ref        UUID
  manuscript_ref  UUID

  -- ACT-TIME CONTEXT (RW-C2): what these were CALLED when the act happened.
  work_title_at_act        TEXT
  manuscript_title_at_act  TEXT

  detail        TEXT   -- a recorded particular; never a summary
  note          TEXT   -- the member's own sentence, when they wrote one
```

Candidate `kind` vocabulary, drawn from acts that already exist plus the two
removal makes necessary:

```
work_begun · work_named · work_renamed · work_removed
expression_declared · expression_withdrawn
material_declared
```

⛔ `writing_arrived`, `version_kept` and `line_marked` are **deliberately not
migrated into this ledger.** Their own tables are already append-only and
survive removal; duplicating them would create a second source of truth for
acts that never lost one. They need only §5's fix.

---

## 4. ⛔ THE LOAD-BEARING CONSTRAINT: no foreign key to `living_works`

```
work_ref   UUID          ✅  a reference, not a relationship
work_ref   UUID REFERENCES living_works(id)   ⛔ REBUILDS THE DEFECT
```

An FK with `ON DELETE CASCADE` reproduces §1 exactly. An FK with `RESTRICT`
would make Works undeletable. Either way the ledger would be **bound to the
lifecycle of the thing whose disappearance it exists to survive.**

RW-C4 is what licenses the bare UUID: *an immutable historical fact says what
happened; it does not assert that the Work still exists.* A dangling `work_ref`
is therefore **correct**, not an integrity violation — it is the schema saying
*"this once existed."*

Immutability should be enforced by trigger, following the precedent already in
the repo (`working_draft_revisions` — append-only, immutable by trigger, chosen
by the history route precisely because it does not move).

---

## 5. Act-time context, and the three surviving acts

`work_title_at_act` is the direct repair of RW-C2 — the title is **written
into the act**, not joined at read time. A later rename or removal cannot reach
backwards.

For the three surviving acts (`writing_arrived`, `version_kept`,
`line_marked`), the fix is not a new table: it is to stop resolving their Work
title through the `work_of` live join and resolve it instead from the ledger's
act-time context at the same moment. **Design question, not decided:** whether
those three acts gain a denormalized title column of their own, or resolve
against the ledger by `(manuscript_ref, occurred_at)`. The second keeps one
source of truth; the first is simpler to query. Both satisfy RW-C2.

⚠️ **Presentation tension surfaced, not resolved:** under RW-C2 a renamed Work
shows its *old* name on old acts — historically correct, potentially confusing.
The schema must make it *possible* to show both act-time and current name
(hence `work_ref` alongside `work_title_at_act`). Which to show is RW-B3/
presentation territory and is out of scope here.

---

## 6. ⛔ TWO BOUNDARIES THIS DESIGN CANNOT CROSS

### 6.1 The ledger cannot know history it was not present for

A new append-only ledger starts **empty**. Every act performed before it exists
is unrecorded.

- For Works that **still exist**, a backfill is groundable in real recorded
  timestamps (`living_works.created_at`, `living_work_expressions.declared_at`).
  Whether to backfill is a founder question — it manufactures act *rows* from
  state, and the act-time titles would be *current* titles, which for any
  already-renamed Work is exactly the RW-C2 violation the ledger exists to
  prevent.
- For Works **already removed**, nothing survives to backfill from.

⭐ **Consequence, stated plainly: the witness subject's own lineage is
permanently unrecoverable.** No mechanism designed here can restore
*"REMOVE-WORK-WITNESS-d326fc479"* to its retained writing. The repair is
forward-only. Any acceptance test for B must use writing whose Work removal
happens **after** the ledger exists.

### 6.2 ⭐⭐ RW-C1 vs WS-DELETE-01 — OPEN CONSTITUTIONAL QUESTION

```
RW-C1          an act, once recorded, may not be made to disappear
WS-DELETE-01   "It cannot be undone and there is no archive — nothing is kept."
```

When a member uses **Delete Work and writing**, what happens to ledger acts
naming that manuscript?

- Keeping them honours RW-C1 but means *"nothing is kept"* is false — acts
  carry `manuscript_title_at_act`, and `detail` on `line_marked` carries a
  **section heading the member wrote**.
- Deleting them honours the deletion promise but is exactly the disappearance
  RW-C1 forbids.

⛔ **Not resolvable by design choice.** The two rulings govern different acts —
removal (container) versus deletion (writing) — and RW-C3 already distinguishes
them. The plausible reconciliation is that **RW-C1's monotonicity is scoped to
removal, and erasure remains a lawful exception with its own name** — but that
is a founder ruling, not an inference this document may make.

**This question is load-bearing for the schema**, not merely for policy: if
erasure must reach the ledger, acts need a manuscript-scoped erasure path, and
`detail`/`note` become member content subject to the vault erasure discipline
rather than inert metadata.

---

## 7. Separate acceptance contracts (required by ruling)

```
B — RECOGNITION
    b1  a manuscript retained after Work removal is member-recognizable
    b2  member_manuscripts.title is UNCHANGED across removal (still NULL)
    b3  the surface marks the name as prior context, never as the title
    b4  a member title act still sets the title, and it then takes primacy
    b5  a manuscript never carried by a Work shows no lineage and no invention

C — HISTORICAL INTEGRITY
    c1  every act visible before removal is still visible after it
    c2  each act's work title is the title AS AT the act, across a rename
    c3  "removed the Work" appears as its own act
    c4  no surface derives current existence from a historical act
    c5  history is unchanged by a rename of anything
```

⛔ B passing does not discharge C, and C passing does not discharge B. Each
needs its own falsifier set, and each falsifier must be capable of failing
while the other passes.

---

## 8. Not decided here

```
physical schema (names, vocabulary, indexes)     NOT RATIFIED
backfill: whether, and on what grounds           FOUNDER QUESTION (§6.1)
RW-C1 vs WS-DELETE-01 erasure scope              FOUNDER QUESTION (§6.2)
the three surviving acts: column vs resolve      OPEN (§5)
presentation copy                                OUT OF SCOPE (RW-B3)
Finding A ("No writing yet")                     SEPARATE LANE
MIGRATION · BUILD · MERGE · DEPLOY               NOT AUTHORIZED
```

**Sequencing stands as ruled:** design → ratify schema → implement on an
isolated Class B branch → fresh-db reconstruction + gates + acceptance →
founder authorizes merge **and** deploy as one release window → merge → deploy
before unrelated canonical work moves through production. *A migration merge is
latent production authorization, so migration merge and intended deployment
remain coupled.* Any PR stays **draft** until the schema is constitutionally
settled.
