# PENDING-INTENT · census + ruling

```text
Authority   FR-W5 · C10 · follows Q1-Q4 + valid RED (dd0ebffc)
Evidence    FOUNDER-READ · ⛔ Jarvis read no source
CODE        ⛔ STILL NOT YET
```

---

## 1 · Census findings

### ⭐⭐ F-a · Whole does not currently know WHY it scrolled

```text
WholeManuscriptSurface.onScroll  observes only the resulting scrollTop,
                                 recomputes visible sections, commits the window
                                 ⛔ carries NO PROVENANCE for the movement

revealWithin                     writes scrollTop / calls scrollTo
                                 ⭐ therefore produces THE SAME OBSERVABLE SCROLL STREAM
                                    as member movement

wheel · touch · pointer · trusted-input seam   ⛔ NONE in the Whole surface
```

```text
⛔ viewport moved   ≠   member moved viewport
   That distinction is ABSENT FROM THE SUBSTRATE TODAY.
```

⭐ **The self-cancellation hazard is therefore real, not hypothetical:**

```text
GO TO CHANGE → request OWED → commitWindow → shell mounts → revealWithin(shell)
             → scroll event → ???

If "scroll event = member changed intent":  ⛔ THE REQUEST CANCELS ITSELF.
```

```text
⛔ THAT CANCELLATION RULE IS UNLAWFUL.
```

### ⭐⭐ F-b · `jumpTo` has ALREADY collapsed two different acts

```text
GO / SHOW CHANGE   moveToProposal()   → setJumpTo(sectionId)
outline click      outlineSelect(…)   → setJumpTo(sectionId)
```

⛔ By the time `WholeManuscriptSurface` receives `jumpTo`, a **voluntary proposal return** and a
**later member navigation that should supersede it** are the same command-shaped value.

```text
⛔ CANCELLATION CANNOT BE INFERRED DOWNSTREAM FROM jumpTo EITHER.
```

### F-c · Where provenance still exists — upstream, before collapse

```text
RETAINS PROVENANCE (explicit semantic acts)
  SHOW / GO TO CHANGE · outline selection · view change · "Work with this change"
  ⭐ the outline row has explicit onClick and Enter/Space handling BEFORE it becomes
     onSelect(sectionId) — the provenance exists, and is then discarded.

⛔ NO SEMANTIC REPRESENTATION AT ALL
  wheel / trackpad · touch scrolling · keyboard scrolling · scrollbar drag
  Whole sees only their CONSEQUENCE: onScroll.
```

---

## 2 · ⭐⭐ RULING — PENDING RETURN SOVEREIGNTY

```text
A voluntary proposal return REMAINS OWED across MACHINERY REQUIRED TO FULFIL THAT SAME REQUEST.

It is WITHDRAWN only by a SUBSEQUENT MEMBER ACT expressing a CONFLICTING ORIENTATION.

⛔ Viewport movement is NOT sufficient evidence of such an act.
⛔ onScroll may NEVER cancel the request.
⛔ jumpTo may NEVER by itself cancel the request — it does not preserve act provenance.
```

```text
⭐ IMPLEMENTATION CONSEQUENCE, BOUNDED
   The repair must INTRODUCE INTENT PROVENANCE —
   ⛔ not INFER intent from viewport state.
```

### ⭐ The design principle this yields

> **Tag at the source; never classify at the sink.**

⭐ Provenance flows **forward from the act that issued the machinery**, never backward from the
effect. That is what makes *"machinery required to fulfil that same request"* decidable at all: the
request knows what it issued; the scroller never will.

---

## 3 · Q4, one step sharper

```text
BEFORE   no object observes BOTH  "return still owed"  and  "exact locus exists"

NOW      no object observes ALL THREE:
           1. THIS EXACT voluntary return is still owed
           2. NO LATER MEMBER ACT has superseded it
           3. the exact Whole locus NOW EXISTS
```

```text
⭐ That is the observer C10 actually needs.
```

⭐ And since (1) and (2) are known **at the act boundary** while (3) is known **at the renderer**,
the observer's identity must travel from act to locus. ⛔ Candidate only — the seam is not chosen
here.

---

## 4 · Two kinds of cancellation — keep them SEPARATE

```text
EXPLICIT SEMANTIC ACTS
  outline selection · mode change · another proposal action
  ⭐ cancellable AT THEIR EXISTING SOURCE BOUNDARIES — provenance is knowable BEFORE collapse.

DIRECT SCROLLING / MANIPULATION
  ⛔ needs a NEW member-input signal, IF we decide scrolling away withdraws the pending return.
  ⭐ It must be CREATED AT THE INPUT BOUNDARY — wheel / touch / keyboard / pointer —
    ⛔ never RECONSTRUCTED from the later scroll event.
```

⛔ **The exact event implementation is NOT chosen here.** Trackpad, scrollbar drag and keyboard
navigation carry enough edge cases that *"add `onWheel`"* would be premature and incomplete.

---

## 5 · Precedent in the repo — behaviour without mechanism

`StructuredOutline` already states the law in nearly the right form: it reveals the restored active
row **once**, then deliberately refuses to *chase the cursor*, because repeated automatic scrolling
would fight a member who chose to look elsewhere.

```text
⭐ machine orientation may INITIATE movement ONCE
⭐ member orientation after that OWNS THE FIELD
```

⭐ Same property, different substrate. ⛔ It supplies the principle, **not** Whole's mechanism.

---

## 6 · ⭐⭐ The identity-collapse family — consolidated

This lane's most transferable finding. `jumpTo` is the sixth instance:

```text
C1   same control + same top-level handler   different RETURN MECHANISM      across VIEWS
F6   same table name                         different OBJECT                across SCHEMA
—    same movement function                  different ACT (arrival/return)  across TIME
—    same wording nearby                     different HISTORICAL ACT        across THE RECORD
—    same-looking route                      different s= STATE              across ROUTE
⭐   same jumpTo carrier                      different ACT                   across COMMANDS
```

> **Same carrier ≠ same act.**

---

## 7 · Standing

```text
F1              ✅ disposed semantically — GO TO CHANGE
C10 RED         ✅ genuine · sealed
PENDING CENSUS  ✅ complete enough to bound design

ESTABLISHED
  onScroll has no provenance
  the request's own machinery causes scroll
  jumpTo collapses proposal-return and outline-navigation acts
  explicit member controls retain provenance ONLY UPSTREAM
  manual-scroll intent has NO semantic representation today

⛔ NOT AUTHORIZED
  cancel on scroll · cancel on jumpTo · infer member intent from viewport movement
  copy Section's nonce mechanism wholesale

NEXT  design the THREE-PART OBSERVER:
        owed request identity · superseding-member-act identity · exact-locus registration

CODE  ⛔ still not yet
```

> ⭐⭐ **A pending return may survive machine movement, but it may not survive newer member intent —
> and today the substrate preserves neither distinction at the point where the locus exists.**
>
> ⭐ That is now the design problem, rather than *"how do we scroll to a ref."*
