# Writer's Studio Phase 1 — Freeze Remedy: status and the blocker

> **Status**: Freeze-remedy unit opened 2026-08-24 under `WRITER-STUDIO-R2`.
> **Outcome: the rerun cannot be executed. Stopped and reported, as instructed.**
>
> This is a **Record**, not a ruling and not an acceptance. It authorizes nothing. The W8
> freeze remains in force. No Phase 3A implementation, no Studio UX change, no `Worktable`
> extension, no #995 merge, no `/book-studio/canvas` work, no migration, no rename.

---

## 1. The instruction, and what was found

The instruction was: establish the exact W8 failure and prescribed remedy from current
canonical, perform only the minimum work necessary to remedy it, then rerun the complete
W1–W8 sequence from W1 without grandfathering earlier evidence — stopping at the first
failure and reporting rather than continuing.

**The three prescribed corrections are already satisfied on canonical.** The rerun is
nonetheless not executable, for a reason that sits above the code: **there is no walk to
run.**

---

## 2. The W8 failure, exactly

From `docs/releases/WRITERS_STUDIO_PHASE1_RELEASE_WALK_2026-08-02.md`:

> **Release walk FAILED at W8.** W9 and all later steps were **not reached.**

The acceptance path W8 was written to prove:

> a member performs a genuine Keep gesture → that Keep becomes available on the Workbench Shelf.

What the product did instead:

| Surface | Behavior |
|---|---|
| "Keep this moment" (the prominent member gesture) | created a **capsule** |
| Workbench Shelf | read `member_memory_atoms` stamped `generated_by='member-gesture'` |
| `/maia/keep-capture` | could mint those atoms — but only from pre-existing developed Idea candidates |

**Consequence:** a member with an ordinary conversation and no developed Idea candidate had
**no reachable gesture** that put anything on the Shelf. Capsules are not atoms.

---

## 3. The three prescribed corrections — verified against canonical today

| # | Correction | Status | Evidence on canonical |
|---|---|---|---|
| 1 | Connect a genuine, generally reachable member Keep act to the Field Object substrate the Shelf consumes — via explicit ruling, never by silently treating capsules as atoms | **Satisfied** | Migration `20260802000002_capsule_field_declaration.sql` adds `'capsule'` to the `source_type` vocabulary; `app/api/psyche/field/declare/route.ts` declares with `sourceType: 'capsule'`; `components/capsules/CaptureSpiritPanel.tsx` carries the explicit **"Keep in my Field"** act (criterion 3) and the renamed **"Save for later"** (criterion 12) |
| 2 | Fix blank WriterField click-to-focus; repeat as a real user action, not programmatic focus | **Satisfied** | `app/press/manuscript/WriterField.tsx` — `.cm-content` carries `minHeight`, with the fix's own reasoning recorded in place: *"without this the whole blank field is a click target that focuses nothing, and writing is only reachable through a programmatic focus() the writer does not have."* A DOM test accompanies it |
| 3 | Replace return-by-position with identity routing | **Satisfied** | `byIdentity()` in `app/writers-studio/canvas/page.tsx` — *"return by identity, never by position"* — with `app/writers-studio/__tests__/canvasParamPin.test.ts` |

**Scope note.** This table records that the *code* the corrections called for exists. It does
**not** claim the corrections were walked, accepted, or verified against the ruling's twelve
pre-registered criteria under a member's own hands. That claim would require the very walk
that cannot presently be run.

---

## 4. The blocker: there is no W1–W8 to rerun

`docs/product/WRITERS_STUDIO_PHASE_1_WALK_SPECIFICATION.md`, on canonical today:

| Field | Value |
|---|---|
| **Status** | `Draft` — and *"`Frozen` … the only executable state"* |
| **Step count** | blank — *"founder-determined"* |
| **Steps** | *"(none authored — this section is intentionally empty)"* |
| **Freeze Record** | every field blank. *"Unfilled means unfrozen. An unfrozen specification cannot be executed."* |
| **Criteria to be authored by** | Kelly |

And the audit that created it, `docs/releases/PHASE1_WALK_DEFINITION_AUDIT_2026-08-02.md`:

> ⛔ **`W1→W16` has no referent on canonical trunk and must not be used as a release gate.**

> The specification … **must not be produced by appending steps to the failed-walk record.**

### Why this is not a technicality

The 2026-08-02 audit found that trunk held **a record of a failed walk and no specification of
the walk itself.** Those are different artifacts. "W1–W8" names the *steps of the run that
failed* — it does not name a specification, because none existed then and none exists now.

So the freeze's own remedy — *re-run the complete walk from W1* — currently has no complete
walk to re-run. **The instruction to rerun W1–W8 inherits the failed run's numbering, which
is exactly the referent the audit ruled out of use.**

### Why I did not author the steps

Authoring W1–W8 criteria myself would:

1. Produce a specification **after** the implementation it judges, **from evidence of a
   failure** — the precise substitution the audit exists to prevent;
2. Violate the specification's own §6 (*"⛔ Not inferred from the failed-walk record, and not
   carried over from any prior numbering"*);
3. Violate its §3.4 (*"never written against a particular implementation"*), since I have
   spent this programme reading that implementation closely;
4. Take an authoring act the document reserves to the founder in two places.

A gate whose criteria are written by the party being gated is ceremony. The founder asked for
the opposite.

---

## 5. What unblocks it

One act, and it is the founder's:

1. **Author the steps** in §6 of the walk specification — the step count, and per step: what
   the member does · what constitutes a pass · what constitutes a fail · whether a fail is
   blocking · admissible evidence · **inadmissible evidence.**

   > The inadmissible-evidence row is not optional. The prior W8 failure turned on exactly
   > this: an endpoint call was not admissible evidence for a missing member path.

2. **Complete the Freeze Record** in §3 — status, version, frozen by, date, reason, and the
   commit SHA of the frozen text. Completing that record *is* the act of freezing.

Then, and only then, this unit can proceed to: assemble a named release candidate by SHA
(§4), record the fixture baseline **before** any mutation (§5), execute the frozen steps in
order from the first, and produce a walk evidence record — a separate artifact from both the
specification and the acceptance decision.

**Two things the founder's own framing already settles**, recorded here so they are not
re-argued at execution time:

- Earlier passing evidence is **not** grandfathered. The prior run's W1–W7 evidence stands as
  history and is inadmissible for a new run against a different candidate.
- **A clean rerun lifts the freeze only.** It does not authorize merging #995 or beginning
  production convergence.

---

## 6. What was and was not done in this unit

**Done:** read the canonical freeze record and its governing audit; established the exact W8
failure; established the three prescribed corrections and verified each against canonical with
named evidence; established that the specification is unfrozen and stepless; stopped.

**Not done, deliberately:** authored no walk steps; assembled no release candidate; touched no
fixture; changed no product code; ran no partial or improvised walk; made no claim that Phase 1
now passes.

**Unchanged:** *FAILED at W8. Founder acceptance unavailable. Deployment unauthorized.*
