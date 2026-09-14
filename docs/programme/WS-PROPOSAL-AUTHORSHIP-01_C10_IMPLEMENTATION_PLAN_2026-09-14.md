# C10 · BOUNDED REPAIR — IMPLEMENTATION PLAN (draft for ratification)

> ⭐⭐ **The repair earns itself by making the exact locus ADDRESSABLE — not by making today's
> already-green screenshot green again.**

```text
Authority   FR-W5 · C4 discharged d1b0d9d6 · boundary C10 unchanged
STATUS      ⭐ PLAN ONLY — ⛔ NO CODE · ⛔ NO SCHEMA · ⛔ NO TEST WRITTEN YET
```

```text
⭐ THE DISTINCTION THIS PLAN MUST PRESERVE
   We are NOT proving that a reproducible defect turned green.
   We ARE proving that an ACCIDENTAL PASS has acquired an EXPLICIT CAPABILITY behind it.
```

---

## 1 · Subject and purpose

```text
IMPLEMENTATION SUBJECT
  C10 ONLY — the Whole-view proposal-evidence return seam:
  ProposalEvidenceInWork ↔ WholeManuscriptSurface / renderProposalEvidence

PURPOSE
  Give VOLUNTARY SHOW CHANGE in Whole an EXACT-LOCUS RETURN CAPABILITY.

⛔ NOT PURPOSE
  fix virtualization generally          change Section behaviour
  alter automatic proposal arrival      change passive-scroll behaviour
  redesign proposal presentation
```

---

## 2 · Step 1 — the failing capability test, against UNTOUCHED source

```text
FIXTURE — deliberately HOSTILE TO INCIDENTAL GEOMETRY
  a LONG Whole section
  proposal locus deep enough that a shell-at-start landing CANNOT satisfy the witness

ACT
  first SHOW CHANGE (voluntary asked return)

ASSERT
  the navigation / reveal target IS THE EXACT PROPOSAL LOCUS,
  ⛔ not merely the containing section shell
```

### ⭐ Assert the reveal TARGET, not browser pixel geometry

```text
CURRENT CODE   reveal target = SECTION SHELL      → test RED
AFTER REPAIR   reveal target = EXACT LOCUS        → test GREEN
```

⭐ Deterministic, and it stays **capability-level** provided the assertion reads *"the voluntary
return addresses the exact locus"* — ⛔ **never** *"a particular new ref variable exists"*. Do not
test implementation names.

### ⚠️ Centering is NOT the definition of success

⛔ FR-W5 protects **locus exposure**, not a pixel alignment. `center` may well be the right
implementation choice — and probably should match Section's voluntary-return semantics — but if the
plan proposes it, it is **implementation behaviour that must preserve sovereignty**, never the
success criterion. The original witness already settled this: *centering was not the PASS criterion;
exposure of the affected wording was.*

### ⭐⭐ The RED must be RED FOR THE RIGHT REASON

```text
⛔ A test can go RED because the fixture failed to render, a selector missed, or the
   component threw — and then go GREEN after the repair FOR A DIFFERENT REASON.
   That pair proves nothing.

✅ REQUIRED: the RED run must show the target RESOLVED, and resolved to the SECTION SHELL.
   "element not found" is NOT an acceptable RED.
```

⭐ This is BCS-01A's R2 applied here: *a known-bad state must be shown bad for the stated reason
before its RED counts.*

### The negative case — lethality, proven AFTER green

```text
MUTANT   restore shell-only addressing in the repaired seam, long-section fixture unchanged
EXPECT   ⭐ the capability test FAILS
```

⛔ Proves the test is lethal **to exactly the absence we found**, and guards it against later
refactors quietly making it satisfiable by shell navigation again.

---

## 3 · Step 2 — census before mechanism (⛔ the earlier census is NOT permission)

⛔ **Do not let the C1–C9 census silently become licence to duplicate Section's hook wholesale.**
Read first:

```text
Q1  Who OWNS the Whole locus ref — ProposalEvidenceInWork, its renderer, or the surface?
Q2  Its LIFETIME: when registered, when cleared, what happens when the section UNMOUNTS?
Q3  Can the ALREADY-RENDERED Whole `Locus` take an addressable ref WITHOUT introducing
    another panel or another proposal representation?
Q4  Where exactly can a voluntary-return consumer observe BOTH the member's act AND a
    resolved locus node?
```

### ⚠️ Why Section's hook cannot simply be copied — a real ordering constraint

```text
SECTION   the exact locus is ALWAYS MOUNTED, so useBringIntoView can consume revealToken
          directly, on token change.

WHOLE     ⛔ the locus DOM EXISTS ONLY ONCE ITS SECTION IS MOUNTED, and the asked return is
          what causes that mount:
             setJumpTo → commitWindow → setPendingScroll → layout effect → shell resolved
```

⭐ So a Whole consumer firing on **token change** would run **before the node exists**. The
candidate seam is therefore **the point where the shell is already resolved** — prefer the locus
node when available, fall back to the shell otherwise.

```text
⛔ CANDIDATE ONLY. It stands or falls on Q1-Q4, which are read, not assumed.
```

### ⚠️⚠️ A guard must come WITH the capability — this is not scope widening

The census established (C6) that **Whole does not cross the reveal guard differently — it does not
cross it at all**, because it has no exact-locus reveal path to guard. ⭐ **This repair creates
that path.** Therefore it must also create its guard:

```text
The reveal must fire ONLY on the member's VOLUNTARY act —
⛔ never on re-render, re-mount, window recommit, or ordinary scrolling.
```

⛔ Without it, `passive-scroll sovereignty` — a SEALED PASS in both views — can regress **as a
direct consequence of the repair**. The guard is part of the bounded repair, not an addition to it.

---

## 4 · Acceptance set, in order

```text
1  NEW CAPABILITY FALSIFIER      RED on current source (for the right reason) → GREEN after repair
2  Section reveal tests          unchanged PASS  (proposalRevealBehaviour)
3  Whole navigation/window tests unchanged PASS  (wholeManuscriptSurface: jump → mount → scroll)
4  proposal-work-mode contracts  unchanged PASS  (proposalWorkMode)
5  passive-scroll sovereignty    BOTH views unchanged
6  surface invariants            no detached excerpt · no duplicate proposal panel ·
                                 SHOW CHANGE semantics unchanged · no redesign
7  MUTANT lethality              shell-only mutant → capability test FAILS
8  CLOSING BROWSER WITNESS       one cold Whole / first → expect LOCUS-ADDRESSED
                                 ⭐ appended as a NEW witness
                                 ⛔ historical FAIL REMAINS SEALED
```

### ⭐ What proves the repair, and what does not

```text
✅ THE FAILING TEST proves the capability was ABSENT and is now PRESENT.
⛔ The closing browser witness is CONFIRMATION ONLY — the runtime already passes visually,
   so it cannot discriminate. A green screenshot after the repair would have been green before it.
```

⛔ Project gates (`npm run typecheck` no-regression, `check:no-supabase`) run before any push, as
usual. Repository test debt is pre-existing and is not this repair's to fix.

---

## 5 · Standing

```text
PLAN      ⭐ DRAFTED — awaiting founder ratification
CODE      ⛔ NOT YET
TEST      ⛔ not written · must demonstrate RED (for the right reason) BEFORE implementation
BOUNDARY  C10 unchanged
C4        ✅ discharged
FR-W5     still governs every protected PASS
OLD FAIL  ⭐ sealed · untouched
```
