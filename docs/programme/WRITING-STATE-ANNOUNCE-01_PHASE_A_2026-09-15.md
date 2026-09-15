# WRITING-STATE-ANNOUNCE-01 · PHASE A — READ-ONLY FINDINGS

**Canonical** `14efac449`. ⛔ No UI, no conversion change, no workflow, no
migration, no retirement, no deploy. Findings only.

---

## 1 · The actual substrate state

⭐ **One fact decides it**, and it is not a UI name:

```
manuscript_working_drafts.section_addressable_at IS NOT NULL
```

`resolveDraftWriteState()` returns **five** states, not "converted / unconverted":

| state | condition | route |
|---|---|---|
| `section_aware` | addressable **and** `loadEditableSections` succeeded | 200 |
| `indeterminate` | addressable **but sections could not be loaded** | ⭐ **503** — fail closed |
| `continuous` | not addressable, and `classifyDraft` says the breaks are **provable** | 200 |
| `continuous_unprovable` | not addressable, breaks **not** provable, carries a reason | 200 |
| `no_draft` | no working draft row | 404 |

Provability is `classifyDraft(manuscript_sections, draft.content)`:

```
PRISTINE                  byte-identical to the Source's composition   → provable
LEGACY_COMPOSER_VARIANT   older composer, per-line agreement           → provable
EDITED                    provable ONLY if every boundary resolved and
                          otherHeadingDiff === 0
NO_SOURCE / WITHHELD      not provable
```

⚠️ **So "unconverted" is two different member situations**, and the difference is
real: one has an act available, the other does not.

---

## 2 · What the member currently encounters

⭐⭐ **`chooseMount` collapses THREE server states into one mount.** The code
already says so at `CanvasClient.tsx` — *"`worktable` collapses THREE server
states, and only one of them can convert."*

```
continuous             ─┐
continuous_unprovable  ─┼──► mount: 'worktable'      ONE surface, three meanings
no_draft               ─┘
```

The gate for the conversion button is correctly the **write state**, not the
mount — so a member on `continuous_unprovable` is not shown a button that cannot
succeed. That part is right and should not be disturbed.

### ⭐ The announcement already exists, and it is good

`SECTION_BREAKS_COPY` is truthful, names the state, explains the consequence,
and has a **separate sentence for the case with no act on offer**, with a comment
saying it "must not imply an act that is not on offer":

```
title   This Work is not yet navigable.
body    Section breaks were detected when your manuscript came in, but they are
        not yet its structure. Confirming them turns them into the working
        sections you can move between — and they become durable, so what you
        write and what MAIA notices can both point at the same places.
action  Confirm section breaks
—— when conversion is unavailable ——
        Section navigation is not available for this Work yet. Your writing is
        unchanged, and you can keep working here.
```

⭐ **ACT 5's assumption that this state is unexplained was WRONG.** It is
explained. The defect is narrower and more specific.

### ⚠️ THE ACTUAL DEFECT — the explanation is in the wrong room

The notice renders **only inside the Outline panel**, and the Outline panel:

```
outlineOpen = open('outline', sections.length > 0)
                                └─ manuscript_sections — the SOURCE
```

- it is **dismissible**, and dismissing it removes the only explanation;
- it is keyed on the **Source** having sections, while the state being explained
  is about the **draft**;
- ⭐⭐ **the writing field itself says nothing.** `Worktable.tsx` contains no
  state sentence at all.

So a member whose Work has no Source sections — anything **begun in the
Studio** — reaches `no_draft → worktable` with **no outline panel and therefore
no announcement anywhere**. They simply meet a different writing surface than
they met last time, with nothing said.

**That is the concealed product decision.** It is not "the state is unexplained";
it is *"the explanation is attached to a dismissible panel about a different
object."*

---

## 3 · Does the writer need to act at all?

The founder asked this explicitly, and it is the most consequential finding.

⭐ **Conversion is provably lossless.** `convertDraft` **partitions** the
member's existing draft — the characters do not move — and `assertRoundTrip`
throws so the transaction rolls back rather than committing a partition that
loses a character. `planConversion` refuses unless the draft matches the
source-derived partition.

⭐ **And provability is already determined server-side**, before anything is
offered.

> ⚠️ **So for `continuous`, the writer is being asked a question the system can
> already answer.** The act is safe, deterministic, refuses rather than risks,
> and the route's own comment calls this state *"convertible, simply not
> converted yet — almost nothing to say, and this state disappears at
> activation."*

⛔ **But whether conversion should therefore become automatic is NOT Phase A's to
decide, and I am not deciding it.** Two reasons to be careful:

1. `convertDraft`'s header states what it is *not* — *"Not an edit. Not a
   migration of the member's words into a new place."* — which reads as
   deliberate framing of a **member act**, and WS2-04B's own note says
   *"conversion stays an explicit act."*
2. ⭐ Conversion makes structure **durable** and thereby makes MAIA's evidence
   point at named places. That is a change in what the system can say about the
   member's book. Whether that may happen without the member asking is a
   **sovereignty question**, not an ergonomics one.

⛔ **Recommendation deferred to a ruling, not taken here.**

---

## 4 · The smallest truthful announcement — three candidates, ⛔ none chosen

| | what it does | cost |
|---|---|---|
| **A · move the sentence to the field** | the writing field states the Work's state and the one act, if any; the outline keeps its own copy or defers to it | smallest; removes the dismissible-panel dependency; ⛔ does **not** address whether the question should be asked at all |
| **B · A, plus stop asking where the answer is known** | `continuous` converts on arrival (safe, lossless, already determined); the announcement then only exists for `continuous_unprovable`, `indeterminate` and `no_draft` | removes the product question entirely; ⛔ requires the sovereignty ruling in §3 |
| **C · announce nothing, mount nothing** | fail closed like `indeterminate` | ⛔ refused: it would withhold a working surface from a member whose writing is fine |

⭐ **Against ACT 5's acceptance test** — *zero concealed product-navigation
decisions* — only **B** fully passes. **A** removes the concealment but leaves
the member answering a question the system could answer. ⛔ And a banner that
said *"choose Section or Whole"* would fail both, which is why neither candidate
proposes one.

⚠️ **Section vs Whole is NOT in scope and must not be swept in.** Those are two
creative scales inside `section_aware`, and ACT 5 already ruled that a **writing**
decision. The product decision is only the one above.

---

## 5 · What Phase B would need, per candidate

- **A** — one sentence rendered in the field; the existing copy and the existing
  write-state gate reused unchanged. A browser witness that the notice is present
  with the outline **dismissed**, and present for a Work with **no Source
  sections**.
- **B** — A, plus a founder ruling on §3, plus a witness that conversion on
  arrival is idempotent, refuses exactly where `planConversion` refuses, and
  leaves a `continuous_unprovable` draft untouched.

---

## 6 · Standing

**WRITING-STATE-ANNOUNCE-01 · PHASE A COMPLETE · READ-ONLY · ⛔ NO CANDIDATE
CHOSEN · ⛔ NOTHING BUILT · HOLDING FOR FOUNDER READING.**

⚠️ One correction carried into the record: **ACT 5 said this state was
unexplained. It is explained — the explanation is in the wrong room**, and for
Works begun in the Studio it is in no room at all.
