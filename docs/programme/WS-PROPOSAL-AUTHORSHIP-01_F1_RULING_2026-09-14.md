# F1 · FOUNDER RULING — WRONG NAME, NOT WRONG BEHAVIOUR

```text
Disposes   the ORIGINATING COMPLAINT of this lane — "Show Change doesn't open"
Date       2026-09-14 · charter F1 · FR-W5 excluded the rename from C10
STATUS     ⭐ SEMANTICALLY DISPOSED · ⛔ CODE NOT WRITTEN
```

---

## 1 · The ruling

```text
F1 RULING

SHOW CHANGE is MISLABELED.

INTENDED ACT
  voluntary orientation to the exact proposal locus
  — "move my attention to the exact proposed-change locus in my manuscript"

⛔ NOT THE ACT
  expand hidden detail        open a proposal
  enter proposal-work mode    accept / reject / modify anything

MEMBER-FACING LABEL
  ⭐ GO TO CHANGE
```

### Why not make it "open" something

⭐ The architecture **already has a different explicit door**: *"Work with this change"* moves the
writer into the working surface, which is a distinct object with its own semantics. ⛔ Making
`SHOW CHANGE` open something would **collapse those two acts again.**

### Why `GO TO CHANGE` rather than `RETURN TO CHANGE`

⭐ It is **truthful on the first invocation and on every subsequent one.** `SHOW CHANGE` promises
that pressing it will **disclose** something — ⭐⭐ which is exactly why *"it doesn't open"* was a
**reasonable member interpretation, not a misunderstanding.**

---

## 2 · ⛔ C10 does NOT subsume F1 — option C rejected

```text
A perfect exact-locus return does not repair a mislabeled control.
⭐ It only makes the behaviour behind that mislabeled control more RELIABLE.
```

⛔ **And the rename must NOT be smuggled into C10.** FR-W5 explicitly excluded it.

> ⭐ Sneaking it in would make our scope discipline meaningless at the last step.

---

## 3 · Sequence — F1 decided NOW, implemented SEPARATELY

```text
1  F1 SEMANTIC DISPOSITION        ✅ WRONG NAME
     canonical act                  voluntary exact-locus orientation
     canonical label                GO TO CHANGE

2  C10 CAPABILITY REPAIR           RED already genuine
                                   make exact-locus return GUARANTEED
                                   ⛔ label remains UNTOUCHED inside C10

3  C10 GREEN + mutant + invariant set + closing witness

4  F1 MICRO-LANE                   SHOW CHANGE → GO TO CHANGE
                                   label / accessibility ONLY
                                   ⛔ no behavioural rewrite

5  CLOSE THE ORIGINATING COMPLAINT — only when BOTH are true:
     • the control SAYS WHAT IT DOES
     • the control RELIABLY DOES WHAT IT SAYS
```

⭐⭐ **This is not "C10 then think about F1."** F1 is **decided now**, so it can no longer be
outlived by the investigation it started. Only its implementation is sequenced later.

---

## 4 · ⭐ C10's relevance, restated honestly

The relevance audit did not invalidate C10. It changed the story:

```text
⛔ WAS   "we are fixing the member's reported bug"

✅ IS    F1   fixes the reported SEMANTIC / UX defect
         C10  guarantees the CAPABILITY the correctly named control depends on
```

⭐ And the genuine RED gives C10 an **independent reason to exist**:

```text
GO TO CHANGE promises            the exact proposal locus
current substrate guarantees     the containing section shell
C10                              closes that gap
```

⭐⭐ **The label becomes the specification.** Once the control says *go to the change*, "arrives at
the containing section" is no longer an acceptable implementation of its own name — which is
precisely what C10's falsifier asserts.

---

## 5 · Pending-intent — the NEXT C10 design ruling, ⛔ not folded into F1

> **A voluntary return may remain owed across an internal mount boundary, but it may not survive a
> subsequent voluntary member act that supersedes it.**

```text
GO TO CHANGE pressed         → return OWED
internal mount / window work → request REMAINS OWED
exact locus appears          → FULFILL ONCE → CONSUME

BUT
member scrolls elsewhere · navigates elsewhere · chooses another section/view/action
                             → SUPERSEDING INTENT
                             → pending return WITHDRAWN
                             → ⛔ must NEVER fire later
```

### ⚠️⚠️ The hazard this creates — census BEFORE encoding cancellation

```text
THE REQUEST'S OWN MACHINERY MOVES THE VIEWPORT.
  commitWindow · pendingScroll · revealWithin(shell) all change scroll position and
  mounted set — as a DIRECT CONSEQUENCE of the member's act.
```

⛔ So a cancellation rule keyed naively on *"the viewport moved"* or *"a scroll occurred"* would
**cancel the request that caused it** — a self-cancelling repair that would look correct in review
and fail intermittently in use.

```text
⭐ THE CENSUS QUESTION, before any encoding:
   how does this substrate distinguish A MEMBER ACT from MACHINERY CAUSED BY THE REQUEST?
```

⛔ Not answered here. ⭐ Section solves the analogous problem with a nonce it owns
(`seenToken.current`); Whole's answer must be read, not borrowed — the same discipline that ruled
out copying `useBringIntoView`.

---

## 6 · Standing

```text
F1        ✅ DISPOSED SEMANTICALLY — wrong NAME · GO TO CHANGE
F1 CODE   ⛔ separate micro-lane, step 4
C10 RED   ✅ genuine · sealed (dd0ebffc)
C10 CODE  ⛔ next — AFTER the pending-intent design is resolved
OLD FAIL  ⭐ sealed · untouched
Gate B    CLOSED        Gate C  CLOSED
```

> ⭐⭐ **The original report now has an answer:**
> *The button felt like it "didn't open" because its words promised an opening or disclosure action
> it was never designed to perform. The intended action is navigation. We should name it that — and
> separately make that navigation exact and guaranteed.*
