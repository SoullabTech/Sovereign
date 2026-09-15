# ER-R1.1 + ER-R2 · PRODUCER REGISTRATION AND COGNITION ASSEMBLY

**Date** 2026-09-15 · **Branch** `claude/ws-editorial-runtime-01` · **Canonical base** `53cd18524`
**Authorized** founder, 2026-09-15.

```
ER-R2 assembly witness    38 passed · 0 failed    BEHAVIOURAL, real PostgreSQL
ER-R1 member-act witness  18 passed · 0 failed
ER-F1 … ER-F8             green · 7/7 killed · 0 unclassified
carried seals             145 / 145   (was 144 — the superseded falsifier became two)
targeted typecheck        exit 0
```

⛔ **NO MAIA OUTCOMES. NO ROUTE. NO UI. NO ADOPTION. NO PRODUCTION CHANGE.**

---

## 1 · ER-R1.1 — the duplicated vocabulary

`memberAct.ts` declared its own `MemberActKind = 'discourse' | 'direction'`. It
**agreed** with the carried contract, and that was not enough: two independently
editable answers to *what can a member editorial act be?*, created immediately
after the contract was carried forward precisely so ruled seams would not be
rebuilt. ⛔ Same species as the deleted second succession resolver, at the type
boundary.

`MemberEditorialActInput` now takes the contract's `MemberEditorialAct`
directly. ⛔ **No alias replaces it** — an alias is the same second answer
wearing the first one's name. A comment-stripped scan finds **zero**
declarations; the only textual match is the prose recording what was removed.

Header corrected: *"no `.trim()`"* → *"no NORMALIZING trim"*. The code lawfully
uses `.trim()` **once, as an emptiness predicate** — to ask the question, never
to change the answer that gets stored.

---

## 2 · ER-R2 · the four producers, registered

```
retrieved.writer_editorial_locus    member · retrieved · situate
member.writer_editorial_history     member · retrieved · situate
system.writer_editorial_history     system · retrieved · situate
member.writer_editorial_act         member · declared  · situate

all four:  rooms writers_studio ONLY · mandatory false · scope route
           identity verified · notSanctuary false
```

⛔ **Nothing existing was altered to make them fit.** A new `ER2` registration
marker carries honest provenance (`2026-09-15`,
`WS-EDITORIAL-RUNTIME-01 · ER-R2`) rather than reusing another lane's.

### ⭐ The pre-registration falsifier is SUPERSEDED IN PLACE, not deleted

The old assertion is preserved verbatim in a comment at the same position, with
why it existed and why it is done:

> *it('⛔ [SOURCE] declared, NOT registered — the producer registry is untouched')*

It guarded the window in which the contract existed and no act had registered
its producers — *a contract that quietly registered its own producers would be an
implementation wearing a contract's name.* ER-R2 is that act.

⭐ **The replacement is strictly stronger than an inversion.** Merely flipping
`not.toContain` to `toContain` would have admitted the four ids registered with
**any axes at all**. The replacement pins the frozen axes, asserts the contract's
own declaration and the registry **do not diverge**, and adds a second obligation
for room / mandatory / scope / identity / notSanctuary. The witness adds a third:
⛔ **no fifth `writer_editorial` id crept into the registry.**

---

## 3 · The assembly · `lib/manuscript/editorialRuntime/assembly.ts`

Read-only. Three load-bearing points, each with an obligation behind it.

**1 · `readProposalWork()`, never raw `readChain()`** — the reviewed owner of
read → `validateChain` → `lineage`. Raw `readChain` returns versions
deterministically **by id** for presentation and does not establish succession;
feeding it to cognition would hand MAIA an order nobody authored. Source-pinned
(`D5`).

**2 · ⭐⭐ The current utterance is not history.** ER-R1 persists the member's turn
*before* cognition, so a naive `loadThread()` would return the very words that
are also `encounter.input`. History is bounded **strictly before** the current
`turnIndex` (`<`, not `<=`), and the Direction this act just created — and its
binding — are excluded too. The current act arrives exactly twice and no more:

```
encounter.input                the member's exact words
member.writer_editorial_act    the DECLARED kind, and only that
```

**3 · No generic escape hatch.** No `extraCandidates`, no
`Record<string, unknown>`, no cast. The output is exactly
`EditorialCandidateBlock[]`, whose four producer ids are now registered, so they
enter MIPA as lawful candidates or not at all. Source-pinned (`D4`).

---

## 4 · The witness · `38 passed · 0 failed`

**The central falsifier** — persist a member turn, assemble, and fail if those
same words appear in history:

```
B2   ⭐⭐ the current utterance is ABSENT from member history
B2b  ⭐⭐ and absent from EVERY assembled block
B3   ⭐⭐ the Direction this act created is absent from history too
B4   ⭐ the declared-act block carries the KIND and no second copy of the words
```

**Partition · interleaving · relations** — prior member turn in the member half
and *not* the system half; prior MAIA turn the reverse; ⭐ the **MAIA** Direction
in the **system** half, because *authorship decides, not the room*; interleaving
survives via `turn_index`; Direction→turn relation survives; the invoked-against
predecessor is the head (carried forward to ER-R3).

**Negative obligations** — directive-sounding discourse mints no Direction; and
source-level: no generic conversation history consulted, the assembly writes
nothing, no escape hatch, `readProposalWork` not `readChain`, and no
`conversation_turns` row.

### ⭐⭐ C5 was repaired, and the repair is the finding

`C5` first asserted **text order across the whole assembly** and failed. Neither
reason was a lineage defect:

1. the fixture strings were **prefix-confusable** (`', held'` is a prefix of
   `', held twice'`, so `indexOf` could not discriminate);
2. ⭐ more importantly, **versions are partitioned by authorship**, so a MAIA
   version and the member version succeeding it land in **different blocks**.
   Concatenation order across the partition says nothing about succession.

The contract carries lineage as an **explicit relation** instead — the root is
marked *the first*, the successor names its predecessor **by id** — and that
relation **survives the authorship partition**. `C5a/b/c` now assert exactly
that, including that the two versions really are in different halves so the
relation genuinely crosses it.

⭐ That is the **W4-1.2 law holding in the rendering** — *partitioning provenance
must not partition away relationship* — and it is strictly stronger than the
order test it replaces. *An obligation that fails because it was too weak to see
the real property is worth more than one that passes.*

---

## 5 · Standing

```
WS-EDITORIAL-RUNTIME-01
  falsifier suite        ✅ ER-F1…ER-F8 · 7/7 killed
  ER-CARRY-01            ✅ CLOSED
  ER-R1 + ER-R1.1        ✅ 18/0 · vocabulary authority repaired
  ER-R2                  ✅ 38/0 · four producers registered

ER-R3 MAIA outcomes      ⏭ three durable outcomes + exact predecessor custody
thin route               ⏸
UI · Adopt · legacy      ⛔
production               ⛔ NONE
```

> ***MAIA is given the writer's locus, the two halves of what has been said and
> done, and the kind of act being performed now — and never the current
> utterance twice.***
