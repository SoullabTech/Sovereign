# WS2-05B-5HALF-MAIA-STRUCTURE-READER-01 — Lane Charter

> **Lane chartered. Not entered, not executable.** Scope is established here so that when the lane
> opens it is narrow. Per master brief **§A3.1**, a specification does not admit a feature; per the
> Programme Board, **BUILD MODE is CLOSED** until WS-01 is accepted and the freeze releases. §2 names
> both gates.

| Field | Value |
|---|---|
| **Lane ID** | `WS2-05B-5HALF-MAIA-STRUCTURE-READER-01` |
| **Charter ref** | `claude/writers-studio-maia-roadmap-vnby0k` |
| **Censused against** | canonical `55021771` (`origin/clean-main-no-secrets`, 2026-08-30) |
| **Threshold** | 5½ — *MAIA becomes a real reader* |
| **Objective** | Give `interpretStructure` **one** real `StructureReader` implementation, resolve three open rulings, and witness a valid frozen interpretation produced from real Work evidence. Nothing else. |
| **Binding rulings** | master brief **§A1.3** authority chain · **§A1.5** structure ontology · **§A3.1** programme entry · **§A4.9** structural perspective · **§A4.10** writer-controlled meaning · **§28** a check must be shown capable of failing |
| **Entry state** | **BLOCKED** — two gates, §2 |
| **Stop condition** | first valid frozen interpretation witnessed on real Work evidence. **Then stop.** |

---

## 1. Mandate — one sentence

**Turn `StructureEvidence` into a `StructureInterpretation`.**

It does not propose directly. It does not adopt. It does not modify structure. It does not write
manuscript text. It is one implementation behind an existing seam — **not a new architecture.**

```text
StructureEvidence
        ↓
StructureInterpretation   ← this lane, and only this
        ↓
existing StructureProposal machinery
```

---

## 2. Entry gates — why this lane is chartered and not opened

### Gate A — dependency custody on canonical (**§A3.1.2**)

The seam this lane fills is not on canonical. Read tree-wide at `55021771`:

```text
StructureEvidence  0 · StructureInterpretation  0 · StructureProposal  0
interpretStructure 0 · StructureReader          0 · AuthorStructureCommand 0
manuscript_structure_units 0  ·  no migration
```

§A3.1 is explicit: *"A specification living on an unmerged branch is not a programme entry. Custody
on canonical is the entry."* The same sentence applies to an implementation. **05A and 05B-5a/5b/5c
must hold custody on canonical before 5½ has anything to implement against.** Until then this lane
has no `interpretStructure` to give an implementation to, and any work done here would be the
zero-caller pattern the Board exists to prevent.

### Gate B — programme mode

Board, canonical: `BUILD MODE — CLOSED · Canvas / Phase 1 freeze BINDING`, and *"Everything else is
CLOSED until WS-01 is accepted and the freeze releases."* Release requires all three of:

```text
WS-01 ACCEPTED  +  CANVAS FREEZE RELEASED  +  NEXT BUILD UNIT AUTHORIZED
```

⛔ This charter is **not** the third item. Authorization is a founder act recorded on the Board.

**Consequence.** The legitimate work available today is what this file is: scope establishment held
in custody, in the pattern of WS-01's unit definition — *"Do not implement that repair until its
scope is established."*

---

## 3. Scope fence

**In scope**

- One `StructureReader` implementation satisfying the existing interface.
- Resolution of the three rulings in §5 — trigger · bodies · provenance.
- The witness in §7.

**Out of scope — and each of these is a separate lane**

| Excluded | Belongs to |
|---|---|
| Adoption of any reading into authoritative structure | **05B-6** |
| Any write to the structure of record | **05B-6** / 05A |
| Any manuscript-byte mutation | 07 · 08 · Revision |
| Changes to the proposal component or route | 05B-5b, closed |
| Division-scope reading | 06 |
| Import-artifact cleanup encountered while reading | 07A census, never inline |
| Developmental observation, notes, threads | later units |

⛔ **No *"while we're here."*** A reader that also tidies is not a reader.

---

## 4. The constitutional invariant

```text
MAIA result ──────X──────> manuscript structure of record
```

There must never exist an executable path equivalent to:

```text
interpretStructure(...)
INSERT <structure units> ...
```

This lane sits **entirely on the `MAIA MAY NOTICE` arrow** of §A1.3. It does not reach
`WRITER MAY RECOGNIZE`, and it comes nowhere near `WORK MAY CHANGE`. A `StructureInterpretation` is
a **MAIA observation** in the §A1.3 epistemic vocabulary — a distinct object in the data model, never
a styling variant of structure, and never attributable to the writer through repetition.

The negative test is part of the lane, not a nicety: **it must be demonstrable that the reader
cannot write structure** — not merely that it happens not to.

---

## 5. The three rulings owed

These are the lane's actual work. They are stated as open questions, deliberately unanswered here.
⛔ None may be resolved by importing an adoption concern.

### 5.1 Trigger — when is MAIA invited to read?

**Question.** What member act, or system condition, invites a reading? Import completion? An explicit
member request? Re-read after edits? Never automatic?

**Why it is load-bearing.** §A1.3's first arrow is *"may"*. A reading that happens because the system
decided to look is the beginning of interpretation-as-default. §A4.10 requires the member to control
whether an interpretation is even sought.

**A ruling must state:** the invitation act · whether re-reading is permitted and on what · what the
member sees before a reading is formed · what happens to a prior frozen reading when a new one is
invited.

**Failure it prevents.** Ambient structural interpretation the member never asked for.

### 5.2 Bodies — what manuscript material may the reader see?

**Question.** Exactly which text is exposed to the reader: headings only · headings plus openings ·
full section bodies · the whole Work? At what scale, and with what truncation discipline?

**Why it is load-bearing.** This is the source-custody law applied to *reading*. What the reader is
shown determines what it can honestly claim, and an undeclared body scope makes every downstream
interpretation unauditable. It also sets the real cost and latency ceiling on a 200-page Work.

**A ruling must state:** the exact material class exposed · the truncation rule and how truncation is
recorded in the interpretation · whether Materials (as distinct from the Work, §A4.4) are ever in
scope — the presumption is **no** · the behaviour at manuscript scale.

**Failure it prevents.** A reading that appears whole-Work while having seen a fraction, with no
record of which.

### 5.3 Provenance — what identifies the reading?

**Question.** What is recorded such that a frozen interpretation can be attributed later: model
identity · prompt identity · the evidence snapshot it read · timestamp · reader version?

**Why it is load-bearing.** §A4.8 requires memory with provenance, and §A1.3 forbids MAIA-generated
interpretation drifting into writer attribution. An unattributed reading becomes, over months,
indistinguishable from the member's own structural intent. Provenance is also what makes 05B-6's
`adopted_from_id` question answerable rather than guessed.

**A ruling must state:** the provenance fields and where they live · that they are captured at freeze
time, not reconstructed · the class vocabulary, in the pattern WS-01 established with
`artifact_extraction` vs `member_supplied_text` — a reading is never conflated with a member act.

**Failure it prevents.** Provenance manufactured after the fact — the specific defect WS-01 exists to
repair, arriving a second time by a different door.

---

## 6. Host distrust obligations — already ruled, restated so the reader stays small

The surrounding host does the distrust work. The reader is **not** trusted, and is therefore allowed
to be simple. Restated here only to fence the lane's scope, not re-opened:

- the host **validates** the returned reading;
- IDs are **minted outside** the reader;
- `unaccountedSectionIds` is **derived by the host**, never reported by the reader;
- the host **catches the contradiction** — a reading that claims *"no structure"* while returning a
  tree is rejected;
- the frozen reading is **preserved separately** from anything the member later edits.

⛔ The lane may not move any of these obligations into the reader to make the reader look better.

---

## 7. Witness condition — what green means

Green is one witness, on **real Work evidence**, not a fixture:

1. A reading is invited by the ruled trigger (§5.1), from real `StructureEvidence`.
2. The reader returns a reading within the ruled body scope (§5.2).
3. The host validates it, mints IDs, derives `unaccountedSectionIds`, and **freezes** it.
4. The frozen `StructureInterpretation` carries complete provenance (§5.3).
5. The existing proposal machinery renders it unchanged — **no changes to 05B-5b to make it render.**

**And the negative witness, per §28** — a check that cannot fail is not a check:

6. A reader response asserting *"no structure"* while returning a tree is **rejected by the host**.
7. There is **no reachable path** from `interpretStructure` to a structure write. Demonstrated, not
   asserted.

⛔ A green suite is not a witness. Session narration is not a witness. The witness is the frozen
interpretation, on real Work, with its provenance, plus 6 and 7.

---

## 8. Stop condition

**Then stop.**

When §7 is green and explicitly accepted, this lane closes. It does not continue into adoption,
because adoption is where the sovereignty boundary actually lives and it deserves its own lane, its
own rulings, and its own witness.

⛔ 5½ green does **not** authorize:

```text
adoption · structure writes · replacement semantics · re-proposal semantics
adopted_from_id · division reading · import cleanup · developmental threads
```

A separate lane for **05B-6 — sovereign adoption** opens only after this threshold is green and
explicitly accepted, and it carries forward the three questions §2 of the roadmap holds open.

---

## 9. What this charter does not do

- It does not enter the unit into the programme (**§A3.1**).
- It does not change any Programme Board node state.
- It does not lift BUILD MODE, and it is not the *"NEXT BUILD UNIT AUTHORIZED"* signal.
- It does not claim 05A or 05B-5a/5b/5c exist on canonical. §2 Gate A establishes that they do not.
